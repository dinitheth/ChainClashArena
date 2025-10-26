import React, { useState } from 'react'

const Controls: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>('deploy')
  const [selectedUnit, setSelectedUnit] = useState<string>('Warrior')

  const units = [
    { type: 'Warrior', cost: 20, icon: '⚔️', hp: 100, attack: 20 },
    { type: 'Archer', cost: 30, icon: '🏹', hp: 60, attack: 30 },
    { type: 'Mage', cost: 40, icon: '✨', hp: 40, attack: 50 },
  ]

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
        <div className="grid grid-cols-3 gap-2">
          {['deploy', 'move', 'attack'].map((action) => (
            <button
              key={action}
              onClick={() => setSelectedAction(action)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedAction === action
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {selectedAction === 'deploy' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Unit</label>
          <div className="space-y-2">
            {units.map((unit) => (
              <button
                key={unit.type}
                onClick={() => setSelectedUnit(unit.type)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedUnit === unit.type
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{unit.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{unit.type}</p>
                      <p className="text-xs text-gray-500">
                        HP: {unit.hp} | ATK: {unit.attack}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">💰 {unit.cost}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => handleAction('submit')}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          Submit Move
        </button>

        <button
          onClick={() => handleAction('surrender')}
          className="w-full py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
        >
          Surrender
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Moves are submitted as cross-chain messages to the game microchain.
          Each action creates a new block on your personal chain.
        </p>
      </div>
    </div>
  )
}

export default Controls
