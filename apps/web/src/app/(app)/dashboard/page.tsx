import React from 'react'
import { loadDashboardData } from './loadDashboardData'
import { PageHeader } from '@template/ui'
import type { ProbeWithFitness } from '../generations/[id]/computeProbesFitness'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await loadDashboardData()

  return (
    <div>
      <PageHeader title="Dashboard" />
      <ActiveGenerationCard generation={data.activeGeneration} />
      <FitnessRankingCard probes={data.rankedProbes} />
      <OpenMutationsCard count={data.openMutationCount} />
      <NeedsMetricsCard probes={data.needsMetricsProbes} />
      <NeedsReviewCard probes={data.needsReviewProbes} />
    </div>
  )
}

function ActiveGenerationCard({ generation }: { generation: { id: string; title: string; status: string } | null }) {
  return (
    <section>
      <h2>Active Generation</h2>
      {generation ? (
        <p><a href={`/generations/${generation.id}`}>{generation.title}</a> — {generation.status}</p>
      ) : (
        <p>No active generation</p>
      )}
    </section>
  )
}

function FitnessRankingCard({ probes }: { probes: ProbeWithFitness[] }) {
  return (
    <section>
      <h2>Population Fitness Ranking</h2>
      {probes.length === 0 ? (
        <p>No probes in active generation</p>
      ) : (
        <ul>
          {probes.map(function (probe) {
            return (
              <li key={probe.id}>
                {probe.title} — {probe.fitnessResult.rawScore}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function OpenMutationsCard({ count }: { count: number }) {
  return (
    <section>
      <h2>Open Mutations</h2>
      <p><a href="/mutations">{count} open mutations</a></p>
    </section>
  )
}

function NeedsMetricsCard({ probes }: { probes: { id: string; title: string }[] }) {
  return (
    <section>
      <h2>Needs Metrics Capture</h2>
      {probes.length === 0 ? (
        <p>All published probes have metrics</p>
      ) : (
        <ul>
          {probes.map(function (probe) {
            return (
              <li key={probe.id}>
                <a href={`/probes/${probe.id}`}>{probe.title}</a>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function NeedsReviewCard({ probes }: { probes: { id: string; title: string }[] }) {
  return (
    <section>
      <h2>Needs Review</h2>
      {probes.length === 0 ? (
        <p>All published probes have been reviewed</p>
      ) : (
        <ul>
          {probes.map(function (probe) {
            return (
              <li key={probe.id}>
                <a href={`/probes/${probe.id}`}>{probe.title}</a>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
