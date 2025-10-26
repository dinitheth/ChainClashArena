use async_graphql::{Request, Response, SimpleObject};
use linera_sdk::{
    base::{ChainId, Owner, Timestamp},
    views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext},
    Contract, ContractRuntime,
};
use serde::{Deserialize, Serialize};

pub struct GameContract {
    state: GameState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(GameContract);

impl Contract for GameContract {
    type Message = Message;
    type InstantiationArgument = InstantiationArgument;
    type Parameters = ();

    async fn instantiate(&mut self, argument: Self::InstantiationArgument) {
        self.state.players.set(argument.players).await.expect("Failed to set players");
        self.state.turn_index.set(0).await.expect("Failed to set turn");
        self.state.seed.set(argument.seed).await.expect("Failed to set seed");
        self.state.game_result.set(None).await.expect("Failed to set result");
        
        let board = Board::new();
        self.state.board_state.set(serde_json::to_string(&board).expect("Failed to serialize board"))
            .await.expect("Failed to set board");
        
        for player in &argument.players {
            self.state.resources.insert(player, 100).await.expect("Failed to set resources");
            self.state.hp.insert(player, 100).await.expect("Failed to set HP");
        }
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::RequestMatch { tournament_id, params } => {
                self.runtime
                    .prepare_message(Message::JoinGame {
                        player: self.runtime.authenticated_signer().expect("Missing signer"),
                    })
                    .with_authentication()
                    .send_to(tournament_id);
            }
            Operation::MakeMove { game_chain, move_data } => {
                let player = self.runtime.authenticated_signer().expect("Missing signer");
                self.runtime
                    .prepare_message(Message::MoveMessage { player, move_data })
                    .with_authentication()
                    .send_to(game_chain);
            }
            Operation::Surrender { game_chain } => {
                let player = self.runtime.authenticated_signer().expect("Missing signer");
                self.runtime
                    .prepare_message(Message::ResolveGame {
                        result: GameResult::Surrender { loser: player },
                    })
                    .send_to(game_chain);
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        match message {
            Message::JoinGame { player } => {
                let mut players = self.state.players.get().await.expect("Failed to get players");
                if !players.contains(&player) {
                    players.push(player);
                    self.state.players.set(players).await.expect("Failed to update players");
                    self.state.resources.insert(&player, 100).await.expect("Failed to set resources");
                    self.state.hp.insert(&player, 100).await.expect("Failed to set HP");
                }
            }
            Message::MoveMessage { player, move_data } => {
                self.apply_move(player, move_data).await;
            }
            Message::AttackMessage { from, to_chain, attack } => {
                self.apply_attack(from, attack).await;
            }
            Message::ResolveGame { result } => {
                self.state.game_result.set(Some(result)).await.expect("Failed to set result");
            }
        }
    }

    async fn store(&mut self) {}
}

impl GameContract {
    async fn apply_move(&mut self, player: Owner, move_data: Move) {
        let turn = self.state.turn_index.get().await.expect("Failed to get turn");
        let players = self.state.players.get().await.expect("Failed to get players");
        let current_player_idx = (turn as usize) % players.len();
        
        if players.get(current_player_idx) != Some(&player) {
            return;
        }

        let board_str = self.state.board_state.get().await.expect("Failed to get board");
        let mut board: Board = serde_json::from_str(&board_str).expect("Failed to deserialize board");
        
        match move_data {
            Move::Deploy { unit_type, position } => {
                let mut resources = self.state.resources.get(&player).await.expect("Failed to get resources").unwrap_or(0);
                let cost = unit_type.cost();
                if resources >= cost {
                    board.units.push(Unit { owner: player, unit_type, position, hp: unit_type.max_hp() });
                    resources -= cost;
                    self.state.resources.insert(&player, resources).await.expect("Failed to update resources");
                }
            }
            Move::MoveUnit { from, to } => {
                if let Some(unit) = board.units.iter_mut().find(|u| u.position == from && u.owner == player) {
                    if from.distance_to(to) <= 2 {
                        unit.position = to;
                    }
                }
            }
            Move::Attack { from, target } => {
                if let Some(attacker_idx) = board.units.iter().position(|u| u.position == from && u.owner == player) {
                    if let Some(target_idx) = board.units.iter().position(|u| u.position == target) {
                        let damage = board.units[attacker_idx].unit_type.attack_power();
                        if board.units[target_idx].hp > damage {
                            board.units[target_idx].hp -= damage;
                        } else {
                            board.units.remove(target_idx);
                        }
                    }
                }
            }
        }
        
        self.state.board_state.set(serde_json::to_string(&board).expect("Failed to serialize board"))
            .await.expect("Failed to update board");
        self.state.turn_index.set(turn + 1).await.expect("Failed to update turn");
        
        if board.units.iter().filter(|u| u.owner != player).count() == 0 {
            self.state.game_result.set(Some(GameResult::Victory { winner: player }))
                .await.expect("Failed to set result");
        }
    }

    async fn apply_attack(&mut self, from: Owner, attack: AttackPayload) {
        let mut hp = self.state.hp.get(&from).await.expect("Failed to get HP").unwrap_or(0);
        if hp > attack.damage {
            hp -= attack.damage;
        } else {
            hp = 0;
            self.state.game_result.set(Some(GameResult::Victory { winner: attack.attacker }))
                .await.expect("Failed to set result");
        }
        self.state.hp.insert(&from, hp).await.expect("Failed to update HP");
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, RootView, SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct GameState {
    pub players: RegisterView<Vec<Owner>>,
    pub turn_index: RegisterView<u8>,
    pub board_state: RegisterView<String>,
    pub seed: RegisterView<u64>,
    pub game_result: RegisterView<Option<GameResult>>,
    pub resources: MapView<Owner, u64>,
    pub hp: MapView<Owner, u64>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct InstantiationArgument {
    pub players: Vec<Owner>,
    pub seed: u64,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Operation {
    RequestMatch { tournament_id: ChainId, params: MatchParams },
    MakeMove { game_chain: ChainId, move_data: Move },
    Surrender { game_chain: ChainId },
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MatchParams {
    pub max_players: u8,
    pub board_size: u8,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub enum Message {
    JoinGame { player: Owner },
    MoveMessage { player: Owner, move_data: Move },
    AttackMessage { from: Owner, to_chain: ChainId, attack: AttackPayload },
    ResolveGame { result: GameResult },
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Move {
    #[serde(flatten)]
    pub kind: MoveKind,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "type")]
pub enum MoveKind {
    Deploy { unit_type: UnitType, position: Position },
    MoveUnit { from: Position, to: Position },
    Attack { from: Position, target: Position },
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct AttackPayload {
    pub attacker: Owner,
    pub damage: u64,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, SimpleObject)]
pub enum UnitType {
    Warrior,
    Archer,
    Mage,
}

impl UnitType {
    pub fn cost(&self) -> u64 {
        match self {
            UnitType::Warrior => 20,
            UnitType::Archer => 30,
            UnitType::Mage => 40,
        }
    }

    pub fn max_hp(&self) -> u64 {
        match self {
            UnitType::Warrior => 100,
            UnitType::Archer => 60,
            UnitType::Mage => 40,
        }
    }

    pub fn attack_power(&self) -> u64 {
        match self {
            UnitType::Warrior => 20,
            UnitType::Archer => 30,
            UnitType::Mage => 50,
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Position {
    pub x: u8,
    pub y: u8,
}

impl Position {
    pub fn distance_to(&self, other: Position) -> u8 {
        ((self.x as i16 - other.x as i16).abs() + (self.y as i16 - other.y as i16).abs()) as u8
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Unit {
    pub owner: Owner,
    pub unit_type: UnitType,
    pub position: Position,
    pub hp: u64,
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Board {
    pub units: Vec<Unit>,
    pub size: u8,
}

impl Board {
    pub fn new() -> Self {
        Board {
            units: Vec::new(),
            size: 10,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
#[serde(tag = "type")]
pub enum GameResult {
    Victory { winner: Owner },
    Surrender { loser: Owner },
    Draw,
}
