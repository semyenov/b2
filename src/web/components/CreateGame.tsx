import type { CreateGameBody } from '../lib/client'
import { useCreateGameForm } from '../hooks/useCreateGameForm'

interface CreateGameProps {
  onSubmit: (body: CreateGameBody) => void
  onBack: () => void
}

export function CreateGame({ onSubmit, onBack }: CreateGameProps) {
  const { size, baseWord, error, setSize, setBaseWord, handleSubmit } = useCreateGameForm({ onSubmit })

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">Create New Game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Board Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none"
            >
              <option value="3">3x3</option>
              <option value="4">4x4</option>
              <option value="5">5x5</option>
              <option value="6">6x6</option>
              <option value="7">7x7</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Base Word ({size} Russian letters)
            </label>
            <input
              type="text"
              value={baseWord}
              onChange={(e) => setBaseWord(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-cyan-400 focus:outline-none uppercase text-center text-xl font-bold"
              placeholder={size === '5' ? 'БАЛДА' : 'СЛОВО'}
              maxLength={parseInt(size, 10)}
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold transition"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}