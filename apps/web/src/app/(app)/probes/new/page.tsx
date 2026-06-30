import { prisma } from '@template/db'
import ProbeForm from './ProbeForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ generationId?: string }>
}

async function loadActiveGenerations(): Promise<{ id: string; title: string }[]> {
  return prisma.generation.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  })
}

async function loadParentProbeCandidates(generationId: string): Promise<{ id: string; title: string }[]> {
  return prisma.probe.findMany({
    where: { generationId, status: { in: ['DRAFT', 'READY', 'PUBLISHED'] } },
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  })
}

export default async function NewProbePage({ searchParams }: PageProps) {
  const { generationId } = await searchParams
  const generations = await loadActiveGenerations()
  const parentProbeCandidates = generationId ? await loadParentProbeCandidates(generationId) : []

  return (
    <main>
      <h1>New Probe</h1>
      <ProbeForm
        generations={generations}
        defaultGenerationId={generationId ?? ''}
        parentProbeCandidates={parentProbeCandidates}
      />
    </main>
  )
}
