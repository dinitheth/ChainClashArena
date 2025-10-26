import React, { useState } from 'react'

interface Position {
  x: number
  y: number
}

interface Unit {
  owner: string
  unitType: 'Warrior' | 'Archer' | 'Mage'
  position: Position
  hp: number
}

const GameBoard: React.FC = () => {
  const boardSize = 10
  const [selectedCell, setSelectedCell] = useState<Position | null>(null)
  const [units, setUnits] = useState<Unit[]>([
    { owner: 'player1', unitType: 'Warrior', position: { x: 1, y: 1 }, hp: 100 },
    { owner: 'player2', unitType: 'Archer', position: { x: 8, y: 8 }, hp: 60 },
  ])

  const getUnitAtPosition = (x: number, y: number): Unit | undefined => {
    return units.find(u => u.position.x === x && u.position.y === y)
  }

  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y })
  }

  const getUnitColor = (unitType: string) => {
    switch (unitType) {
      case 'Warrior': return 'bg-red-500'
      case 'Archer': return 'bg-green-500'
      case 'Mage': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getUnitIcon = (unitType: string) => {
    switch (unitType) {
      case 'Warrior': return '⚔️'
      case 'Archer': return '🏹'
      case 'Mage': return '✨'
      default: return '?'
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="grid gap-1 bg-gray-800 p-4 rounded-lg" style={{
        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`
      }}>
        {Array.from({ length: boardSize * boardSize }, (_, index) => {
          const x = index % boardSize
          const y = Math.floor(index / boardSize)
          const unit = getUnitAtPosition(x, y)
          const isSelected = selectedCell?.x === x && selectedCell?.y === y

          return (
            <div
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              className={`
                w-12 h-12 flex items-center justify-center cursor-pointer
                transition-all duration-200 hover:scale-105
                ${(x + y) % 2 === 0 ? 'bg-amber-100' : 'bg-amber-200'}
                ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                ${unit ? 'relative' : ''}
              `}
            >
              {unit && (
                <div className={`w-10 h-10 rounded-full ${getUnitColor(unit.unitType)} 
                  flex items-center justify-center text-white font-bold shadow-lg
                  border-2 ${unit.owner === 'player1' ? 'border-blue-700' : 'border-red-700'}`}
                  title={`${unit.unitType} - HP: ${unit.hp}`}
                >
                  <span className="text-xl">{getUnitIcon(unit.unitType)}</span>
                </div>
              )}
              <span className="absolute bottom-0 right-0 text-xs text-gray-500">
                {x},{y}
              </span>
            </div>
          )
        })}
      </div>

      {selectedCell && (
        <div className="mt-4 p-4 bg-purple-100 rounded-lg">
          <p className="font-semibold">Selected: ({selectedCell.x}, {selectedCell.y})</p>
          {getUnitAtPosition(selectedCell.x, selectedCell.y) && (
            <p className="text-sm mt-1">
              Unit: {getUnitAtPosition(selectedCell.x, selectedCell.y)?.unitType}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default GameBoard
