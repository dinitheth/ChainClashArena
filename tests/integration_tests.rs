#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_unit_costs() {
        assert_eq!(UnitType::Warrior.cost(), 20);
        assert_eq!(UnitType::Archer.cost(), 30);
        assert_eq!(UnitType::Mage.cost(), 40);
    }

    #[test]
    fn test_unit_stats() {
        assert_eq!(UnitType::Warrior.max_hp(), 100);
        assert_eq!(UnitType::Warrior.attack_power(), 20);
        
        assert_eq!(UnitType::Archer.max_hp(), 60);
        assert_eq!(UnitType::Archer.attack_power(), 30);
        
        assert_eq!(UnitType::Mage.max_hp(), 40);
        assert_eq!(UnitType::Mage.attack_power(), 50);
    }

    #[test]
    fn test_position_distance() {
        let pos1 = Position { x: 0, y: 0 };
        let pos2 = Position { x: 3, y: 4 };
        assert_eq!(pos1.distance_to(pos2), 7);
        
        let pos3 = Position { x: 1, y: 1 };
        let pos4 = Position { x: 1, y: 2 };
        assert_eq!(pos3.distance_to(pos4), 1);
    }

    #[test]
    fn test_board_initialization() {
        let board = Board::new();
        assert_eq!(board.size, 10);
        assert_eq!(board.units.len(), 0);
    }
}
