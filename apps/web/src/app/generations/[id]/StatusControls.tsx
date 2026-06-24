'use client'

import { useTransition } from 'react'
import { updateGenerationStatus } from '../actions'

interface StatusControlsProps {
  id: string
  status: string
}

export default function StatusControls({ id, status }: StatusControlsProps) {
  const [isPending, startTransition] = useTransition()

  function handleTransition(newStatus: string) {
    startTransition(async function () {
      await updateGenerationStatus(id, status, newStatus)
    })
  }

  if (status === 'DRAFT') {
    return (
      <button
        onClick={function () { handleTransition('ACTIVE') }}
        disabled={isPending}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        Activate
      </button>
    )
  }

  if (status === 'ACTIVE') {
    return (
      <div className="flex gap-2">
        <button
          onClick={function () { handleTransition('ARCHIVED') }}
          disabled={isPending}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          Archive
        </button>
        <button
          onClick={function () { handleTransition('RETIRED') }}
          disabled={isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Retire
        </button>
      </div>
    )
  }

  return null
}
