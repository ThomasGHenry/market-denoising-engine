import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@template/db'
import { PageHeader } from '@template/ui'
import MetricSnapshotList from './metric-snapshots/MetricSnapshotList'
import MetricSnapshotForm from './metric-snapshots/MetricSnapshotForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlatformPostDetailPage({ params }: PageProps) {
  const { id } = await params
  const post = await loadPlatformPost(id)
  if (!post) notFound()

  return (
    <div>
      <PageHeader title={post.platform} />
      <p className="text-sm text-gray-500 mb-4">
        <Link href={`/probes/${post.probe.id}`} className="hover:underline">
          ← {post.probe.title}
        </Link>
      </p>
      <p className="mb-4">{post.url}</p>
      <section>
        <h2>Metric Snapshots</h2>
        <MetricSnapshotList snapshots={post.snapshots} />
        <MetricSnapshotForm platformPostId={id} />
      </section>
    </div>
  )
}

async function loadPlatformPost(id: string) {
  return prisma.platformPost.findUnique({
    where: { id },
    include: {
      probe: { select: { id: true, title: true } },
      snapshots: { orderBy: { capturedAt: 'desc' } },
    },
  })
}
