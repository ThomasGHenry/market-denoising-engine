import { prisma } from '@template/db'
import Link from 'next/link'

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

export default async function GenerationsPage() {
  const generations = await loadGenerationsWithStats()

  if (generations.length === 0) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Generations</h1>
          <Link
            href="/generations/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Generation
          </Link>
        </div>
        <p className="text-gray-500">No generations yet.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Generations</h1>
        <Link
          href="/generations/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Generation
        </Link>
      </div>
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
                <td className="py-2 pr-4">{gen.status}</td>
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
