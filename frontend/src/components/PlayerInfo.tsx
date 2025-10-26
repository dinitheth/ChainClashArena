import React from 'react'

const PlayerInfo: React.FC = () => {
  const players = [
    { name: 'Player 1', resources: 100, hp: 100, color: 'blue' },
    { name: 'Player 2', resources: 80, hp: 85, color: 'red' },
  ]

  const currentTurn = 0

  return (
    <div className="space-y-4">
      {players.map((player, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-2 ${
            currentTurn === index
              ? `border-${player.color}-500 bg-${player.color}-50`
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{player.name}</h3>
            {currentTurn === index && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                Your Turn
              </span>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Resources:</span>
              <span className="font-semibold text-yellow-600">💰 {player.resources}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">HP:</span>
              <span className="font-semibold text-red-600">❤️ {player.hp}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-${player.color}-500 h-2 rounded-full transition-all`}
                style={{ width: `${player.hp}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-500">Chain ID: chain_abc123...</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlayerInfo
