import { notFound } from 'next/navigation'
import { prisma } from '@template/db'
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
    <main>
      <h1>{post.url}</h1>
      <p>Probe: {post.probe.title}</p>
      <section>
        <h2>Metric Snapshots</h2>
        <MetricSnapshotList snapshots={post.snapshots} />
        <MetricSnapshotForm platformPostId={id} />
      </section>
    </main>
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
