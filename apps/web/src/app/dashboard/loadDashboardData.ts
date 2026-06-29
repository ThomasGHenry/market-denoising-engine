import { prisma } from '@template/db'
import { computeProbesFitness, type ProbeWithFitness } from '../generations/[id]/computeProbesFitness'

export interface DashboardData {
  activeGeneration: { id: string; title: string; status: string } | null
  rankedProbes: ProbeWithFitness[]
  openMutationCount: number
  needsMetricsProbes: { id: string; title: string }[]
  needsReviewProbes: { id: string; title: string }[]
}

async function fetchActiveGeneration(): Promise<{ id: string; title: string; status: string } | null> {
  const active = await prisma.generation.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true },
  })
  if (active) return active
  return prisma.generation.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, status: true },
  })
}

async function fetchOpenMutationCount(): Promise<number> {
  return prisma.mutation.count({ where: { status: 'OPEN' } })
}

async function fetchNeedsMetricsProbes(): Promise<{ id: string; title: string }[]> {
  return prisma.probe.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { platformPosts: { none: {} } },
        { platformPosts: { some: { snapshots: { none: {} } } } },
      ],
    },
    select: { id: true, title: true },
  })
}

async function fetchNeedsReviewProbes(): Promise<{ id: string; title: string }[]> {
  return prisma.probe.findMany({
    where: { status: 'PUBLISHED', reviews: { none: {} } },
    select: { id: true, title: true },
  })
}

export async function loadDashboardData(): Promise<DashboardData> {
  const activeGeneration = await fetchActiveGeneration()

  const [rankedProbes, openMutationCount, needsMetricsProbes, needsReviewProbes] = await Promise.all([
    activeGeneration ? computeProbesFitness(activeGeneration.id) : Promise.resolve([]),
    fetchOpenMutationCount(),
    fetchNeedsMetricsProbes(),
    fetchNeedsReviewProbes(),
  ])

  return {
    activeGeneration,
    rankedProbes,
    openMutationCount,
    needsMetricsProbes,
    needsReviewProbes,
  }
}
