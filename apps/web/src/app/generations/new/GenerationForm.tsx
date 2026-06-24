'use client'

import { useActionState } from 'react'
import { createGeneration } from '../actions'

interface ParentOption {
  id: string
  title: string
}

interface GenerationFormProps {
  parents: ParentOption[]
}

export default function GenerationForm({ parents }: GenerationFormProps) {
  const [error, formAction, isPending] = useActionState(createGeneration, null)

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="theme" className="block text-sm font-medium mb-1">
          Theme
        </label>
        <input
          id="theme"
          name="theme"
          type="text"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="fitnessFunction" className="block text-sm font-medium mb-1">
          Fitness Function
        </label>
        <select
          id="fitnessFunction"
          name="fitnessFunction"
          className="w-full border rounded px-3 py-2"
        >
          <option value="default_v0">default_v0</option>
        </select>
      </div>
      {parents.length > 0 && (
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium mb-1">
            Parent Generation (optional)
          </label>
          <select
            id="parentId"
            name="parentId"
            className="w-full border rounded px-3 py-2"
          >
            <option value="">None</option>
            {parents.map(function (parent) {
              return (
                <option key={parent.id} value={parent.id}>
                  {parent.title}
                </option>
              )
            })}
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Generation'}
      </button>
    </form>
  )
}
