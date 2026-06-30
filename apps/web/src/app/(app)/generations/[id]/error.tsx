'use client'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function GenerationDetailError({ error, reset }: ErrorProps) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}
