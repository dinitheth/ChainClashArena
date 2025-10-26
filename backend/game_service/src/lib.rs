use async_graphql::{EmptySubscription, Object, Request, Response, Schema, SimpleObject};
use linera_sdk::{
    base::{ChainId, Owner},
    views::View,
    Service, ServiceRuntime,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

pub struct GameService {
    state: Arc<GameState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(GameService);

impl Service for GameService {
    type Parameters = ();

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(QueryRoot::default(), MutationRoot, EmptySubscription)
            .data(self.state.clone())
            .data(self.runtime.clone())
            .finish();
        schema.execute(request).await
    }
}

#[derive(Default)]
struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn game_state(&self, ctx: &async_graphql::Context<'_>) -> GameStateResponse {
        let state = ctx.data::<Arc<GameState>>().expect("State not found");
        
        let players = state.players.get().await.expect("Failed to get players");
        let turn_index = state.turn_index.get().await.expect("Failed to get turn");
        let board_str = state.board_state.get().await.expect("Failed to get board");
        let board: Board = serde_json::from_str(&board_str).expect("Failed to parse board");
        let result = state.game_result.get().await.expect("Failed to get result");

        GameStateResponse {
            players,
            turn_index,
            board,
            result,
        }
    }

    async fn resources(&self, ctx: &async_graphql::Context<'_>, player: String) -> u64 {
        let state = ctx.data::<Arc<GameState>>().expect("State not found");
        let owner: Owner = player.parse().expect("Invalid owner format");
        state.resources.get(&owner).await.expect("Failed to get resources").unwrap_or(0)
    }

    async fn hp(&self, ctx: &async_graphql::Context<'_>, player: String) -> u64 {
        let state = ctx.data::<Arc<GameState>>().expect("State not found");
        let owner: Owner = player.parse().expect("Invalid owner format");
        state.hp.get(&owner).await.expect("Failed to get HP").unwrap_or(0)
    }
}

struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn submit_move(
        &self,
        ctx: &async_graphql::Context<'_>,
        move_data: MoveInput,
    ) -> String {
        format!("Move submitted: {:?}", move_data)
    }

    async fn create_match(
        &self,
        ctx: &async_graphql::Context<'_>,
        params: MatchParamsInput,
    ) -> String {
        format!("Match created with params: {:?}", params)
    }
}

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
pub struct GameStateResponse {
    pub players: Vec<Owner>,
    pub turn_index: u8,
    pub board: Board,
    pub result: Option<GameResult>,
}

#[derive(Clone, Debug, Deserialize, Serialize, async_graphql::InputObject)]
pub struct MoveInput {
    pub move_type: String,
    pub from_x: Option<u8>,
    pub from_y: Option<u8>,
    pub to_x: Option<u8>,
    pub to_y: Option<u8>,
    pub unit_type: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize, async_graphql::InputObject)]
pub struct MatchParamsInput {
    pub max_players: u8,
    pub board_size: u8,
}

use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};

#[derive(Clone, Debug, RootView, SimpleObject)]
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

#[derive(Clone, Copy, Debug, Deserialize, Serialize, SimpleObject)]
pub enum UnitType {
    Warrior,
    Archer,
    Mage,
}

#[derive(Clone, Copy, Debug, Deserialize, Serialize, SimpleObject)]
pub struct Position {
    pub x: u8,
    pub y: u8,
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

#[derive(Clone, Debug, Deserialize, Serialize, SimpleObject)]
#[serde(tag = "type")]
pub enum GameResult {
    Victory { winner: Owner },
    Surrender { loser: Owner },
    Draw,
}
