import React from 'react'
import Link from 'next/link'
import { PageHeader, StatusBadge } from '@template/ui'
import { listMutations } from './actions'

export const dynamic = 'force-dynamic'

export default async function MutationsPage() {
  const mutations = await listMutations()

  if (mutations.length === 0) {
    return (
      <div>
        <PageHeader title="Open Mutations" />
        <p>No open mutations.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Open Mutations" />
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4">Source Probe</th>
            <th className="text-left py-2 pr-4">Type</th>
            <th className="text-left py-2 pr-4">Description</th>
            <th className="text-left py-2 pr-4">Status</th>
            <th className="text-left py-2 pr-4">Created</th>
            <th className="text-left py-2 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {mutations.map(function (mutation) {
            return (
              <tr key={mutation.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <Link href={`/probes/${mutation.sourceProbe.id}`}>
                    {mutation.sourceProbe.title}
                  </Link>
                </td>
                <td className="py-2 pr-4">{mutation.mutationType}</td>
                <td className="py-2 pr-4">{mutation.description}</td>
                <td className="py-2 pr-4"><StatusBadge status={mutation.status} /></td>
                <td className="py-2 pr-4">{mutation.createdAt.toISOString()}</td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/probes/new?rawInput=${encodeURIComponent(mutation.description)}&parentProbeId=${mutation.sourceProbe.id}`}
                  >
                    Create probe from mutation
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
