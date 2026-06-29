'use client'

import { useTransition } from 'react'
import { Button } from '@template/ui'
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
      <Button
        onClick={function () { handleTransition('ACTIVE') }}
        disabled={isPending}
      >
        Activate
      </Button>
    )
  }

  if (status === 'ACTIVE') {
    return (
      <div className="flex gap-2">
        <Button
          onClick={function () { handleTransition('PUBLISHED') }}
          disabled={isPending}
        >
          Publish
        </Button>
        <Button
          variant="outline"
          onClick={function () { handleTransition('RETIRED') }}
          disabled={isPending}
        >
          Retire
        </Button>
      </div>
    )
  }

  if (status === 'PUBLISHED') {
    return (
      <div className="flex gap-2">
        <Button
          onClick={function () { handleTransition('REVIEWED') }}
          disabled={isPending}
        >
          Mark Reviewed
        </Button>
        <Button
          variant="outline"
          onClick={function () { handleTransition('RETIRED') }}
          disabled={isPending}
        >
          Retire
        </Button>
      </div>
    )
  }

  return null
}
