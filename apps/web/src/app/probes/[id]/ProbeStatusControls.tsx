'use client'

import { useTransition } from 'react'
import { updateProbeStatus } from '../actions'

interface ProbeStatusControlsProps {
  id: string
  status: string
}

type StatusButton = { label: string; nextStatus: string }

function buttonsForStatus(status: string): StatusButton[] {
  const map: Record<string, StatusButton[]> = {
    DRAFT: [
      { label: 'Mark Ready', nextStatus: 'READY' },
      { label: 'Retire', nextStatus: 'RETIRED' },
    ],
    READY: [
      { label: 'Publish', nextStatus: 'PUBLISHED' },
      { label: 'Retire', nextStatus: 'RETIRED' },
    ],
    PUBLISHED: [
      { label: 'Mark Reviewed', nextStatus: 'REVIEWED' },
      { label: 'Retire', nextStatus: 'RETIRED' },
    ],
    REVIEWED: [
      { label: 'Mark Mutated', nextStatus: 'MUTATED' },
      { label: 'Retire', nextStatus: 'RETIRED' },
    ],
    MUTATED: [{ label: 'Retire', nextStatus: 'RETIRED' }],
    RETIRED: [],
  }
  return map[status] ?? []
}

export default function ProbeStatusControls({ id, status }: ProbeStatusControlsProps) {
  const [isPending, startTransition] = useTransition()
  const buttons = buttonsForStatus(status)

  if (buttons.length === 0) {
    return null
  }

  function handleClick(nextStatus: string) {
    startTransition(async function () {
      await updateProbeStatus(id, status, nextStatus)
    })
  }

  return (
    <div>
      {buttons.map(function (btn) {
        return (
          <button key={btn.nextStatus} onClick={function () { handleClick(btn.nextStatus) }} disabled={isPending}>
            {btn.label}
          </button>
        )
      })}
    </div>
  )
}
