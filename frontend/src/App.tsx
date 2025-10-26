import React, { useState, useEffect } from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, useMutation } from '@apollo/client'
import GameBoard from './components/GameBoard'
import PlayerInfo from './components/PlayerInfo'
import Controls from './components/Controls'

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql'

const client = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
})

function GameContainer() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Chain Clash</h1>
          <p className="text-xl text-purple-200">Turn-based PvP Strategy Arena on Linera Microchains</p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-purple-300">
            <span>⛓️ Microchains</span>
            <span>📨 Cross-chain Messaging</span>
            <span>🔄 Real-time Updates</span>
            <span>🤖 AI Opponents</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-2xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Board</h2>
              <GameBoard />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Players</h2>
              <PlayerInfo />
            </div>

            <div className="bg-white rounded-lg shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Actions</h2>
              <Controls />
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Linera Features Used</h3>
              <ul className="text-sm space-y-2">
                <li>✓ Personal player microchains</li>
                <li>✓ Temporary game microchains</li>
                <li>✓ Tournament app chain</li>
                <li>✓ Cross-chain messages</li>
                <li>✓ Views (RegisterView, MapView)</li>
                <li>✓ GraphQL service API</li>
                <li>✓ Real-time notifications</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-purple-200 text-sm">
          <p>Built with Linera SDK 0.15.3 | Rust + WASM + React + GraphQL</p>
          <p className="mt-2">Demonstrating horizontal scaling with microchains architecture</p>
        </footer>
      </div>
    </div>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <GameContainer />
    </ApolloProvider>
  )
}

export default App
