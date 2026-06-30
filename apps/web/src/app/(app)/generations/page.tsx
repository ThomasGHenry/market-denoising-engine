import { prisma } from '@template/db'
import Link from 'next/link'
import { PageHeader, Button, StatusBadge } from '@template/ui'

export const dynamic = 'force-dynamic'

async function loadGenerationsWithStats() {
  return prisma.generation.findMany({
    include: {
      probes: {
        select: { fitnessScore: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

function computeTopFitness(scores: Array<{ fitnessScore: number | null }>): number | null {
  const valid = scores.map(p => p.fitnessScore).filter((s): s is number => s !== null)
  if (valid.length === 0) return null
  return Math.max(...valid)
}

function CreateGenerationButton() {
  return (
    <Link href="/generations/new">
      <Button type="button">Create Generation</Button>
    </Link>
  )
}

export default async function GenerationsPage() {
  const generations = await loadGenerationsWithStats()

  if (generations.length === 0) {
    return (
      <div>
        <PageHeader title="Generations" action={<CreateGenerationButton />} />
        <p className="text-gray-500">No generations yet.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Generations" action={<CreateGenerationButton />} />
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 pr-4">Title</th>
            <th className="text-left py-2 pr-4">Status</th>
            <th className="text-left py-2 pr-4">Theme</th>
            <th className="text-left py-2 pr-4">Probes</th>
            <th className="text-left py-2 pr-4">Top Fitness</th>
            <th className="text-left py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {generations.map(function (gen) {
            const topFitness = computeTopFitness(gen.probes)
            return (
              <tr key={gen.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <Link href={`/generations/${gen.id}`} className="text-blue-600 hover:underline">
                    {gen.title}
                  </Link>
                </td>
                <td className="py-2 pr-4"><StatusBadge status={gen.status} /></td>
                <td className="py-2 pr-4">{gen.theme ?? '—'}</td>
                <td className="py-2 pr-4">{gen.probes.length}</td>
                <td className="py-2 pr-4">{topFitness !== null ? topFitness.toFixed(2) : '—'}</td>
                <td className="py-2">{gen.createdAt.toLocaleDateString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
