import React from 'react'
import Link from 'next/link'
import { listMutations } from './actions'

export const dynamic = 'force-dynamic'

export default async function MutationsPage() {
  const mutations = await listMutations()

  if (mutations.length === 0) {
    return (
      <main>
        <h1>Open Mutations</h1>
        <p>No open mutations.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Open Mutations</h1>
      <table>
        <thead>
          <tr>
            <th>Source Probe</th>
            <th>Type</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {mutations.map(function (mutation) {
            return (
              <tr key={mutation.id}>
                <td>
                  <Link href={`/probes/${mutation.sourceProbe.id}`}>
                    {mutation.sourceProbe.title}
                  </Link>
                </td>
                <td>{mutation.mutationType}</td>
                <td>{mutation.description}</td>
                <td>{mutation.status}</td>
                <td>{mutation.createdAt.toISOString()}</td>
                <td>
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
    </main>
  )
}
