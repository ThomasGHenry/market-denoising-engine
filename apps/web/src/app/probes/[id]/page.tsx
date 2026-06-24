import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@template/db'
import ProbeStatusControls from './ProbeStatusControls'
import PlatformPostList from './PlatformPostList'
import PlatformPostForm from './PlatformPostForm'

interface PageProps {
  params: Promise<{ id: string }>
}

async function loadProbe(id: string) {
  return prisma.probe.findUnique({
    where: { id },
    include: {
      generation: { select: { id: true, title: true } },
      parentProbe: { select: { id: true, title: true } },
      platformPosts: { include: { snapshots: true }, orderBy: { createdAt: 'asc' } },
      reviews: { orderBy: { reviewedAt: 'desc' } },
      mutations: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export default async function ProbeDetailPage({ params }: PageProps) {
  const { id } = await params
  const probe = await loadProbe(id)

  if (!probe) {
    notFound()
  }

  const fitnessScore = probe.fitnessScore !== null ? probe.fitnessScore.toFixed(2) : '—'

  return (
    <main>
      <h1>{probe.title}</h1>
      <p>Status: {probe.status}</p>
      <p>Format: {probe.format}</p>
      <p>Effort: {probe.effortMinutes} min</p>
      <p>Fitness Score: {fitnessScore}</p>
      <p>Tags: {probe.tags.join(', ') || '—'}</p>
      <p>Generation: <Link href={`/generations/${probe.generation.id}`}>{probe.generation.title}</Link></p>

      {probe.parentProbe && (
        <p>Parent Probe: <Link href={`/probes/${probe.parentProbe.id}`}>{probe.parentProbe.title}</Link></p>
      )}

      <section>
        <h2>Raw Input</h2>
        <p>{probe.rawInput}</p>
      </section>

      {probe.contentText && (
        <section>
          <h2>Content</h2>
          <p>{probe.contentText}</p>
        </section>
      )}

      {probe.reviews.length > 0 && (
        <section>
          <h2>Reviews</h2>
          {probe.reviews.map(function (review) {
            return (
              <div key={review.id}>
                <p>Signal: {review.signal} | Confidence: {review.confidence}</p>
                <p>Observation: {review.observation}</p>
                <p>Interpretation: {review.interpretation}</p>
                {review.decision && <p>Decision: {review.decision}</p>}
              </div>
            )
          })}
        </section>
      )}

      <ProbeStatusControls id={probe.id} status={probe.status} generationId={probe.generation.id} />

      <section>
        <h2>Platform Posts</h2>
        <PlatformPostList posts={probe.platformPosts} />
        <PlatformPostForm probeId={probe.id} />
      </section>
    </main>
  )
}
