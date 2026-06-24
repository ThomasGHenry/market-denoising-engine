import { prisma } from '@template/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatusControls from './StatusControls'

interface PageProps {
  params: Promise<{ id: string }>
}

async function loadGeneration(id: string) {
  return prisma.generation.findUnique({
    where: { id },
    include: {
      probes: {
        orderBy: [
          { fitnessScore: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'asc' },
        ],
      },
      parent: {
        select: { id: true, title: true },
      },
    },
  })
}

export default async function GenerationDetailPage({ params }: PageProps) {
  const { id } = await params
  const generation = await loadGeneration(id)

  if (!generation) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{generation.title}</h1>
          <p className="text-gray-500 mt-1">{generation.theme ?? '—'}</p>
        </div>
        <StatusControls id={generation.id} status={generation.status} />
      </div>

      <dl className="grid grid-cols-2 gap-4 mb-8 max-w-lg">
        <dt className="font-medium">Status</dt>
        <dd>{generation.status}</dd>
        <dt className="font-medium">Fitness Function</dt>
        <dd>{generation.fitnessFunction}</dd>
        <dt className="font-medium">Created</dt>
        <dd>{generation.createdAt.toLocaleDateString()}</dd>
        {generation.parent && (
          <>
            <dt className="font-medium">Parent</dt>
            <dd>
              <Link href={`/generations/${generation.parent.id}`} className="text-blue-600 hover:underline">
                {generation.parent.title}
              </Link>
            </dd>
          </>
        )}
      </dl>

      <div className="mb-6">
        <Link
          href={`/generations/new?parentId=${generation.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Next Generation
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Probes</h2>
      {generation.probes.length === 0 ? (
        <p className="text-gray-500">No probes yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4">Title</th>
              <th className="text-left py-2 pr-4">Format</th>
              <th className="text-left py-2 pr-4">Status</th>
              <th className="text-left py-2">Fitness Score</th>
            </tr>
          </thead>
          <tbody>
            {generation.probes.map(function (probe) {
              return (
                <tr key={probe.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4">{probe.title}</td>
                  <td className="py-2 pr-4">{probe.format}</td>
                  <td className="py-2 pr-4">{probe.status}</td>
                  <td className="py-2">
                    {probe.fitnessScore !== null ? probe.fitnessScore.toFixed(2) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
