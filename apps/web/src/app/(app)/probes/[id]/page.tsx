import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@template/db'
import { PageHeader } from '@template/ui'
import ProbeStatusControls from './ProbeStatusControls'
import PlatformPostList from './PlatformPostList'
import PlatformPostForm from './PlatformPostForm'
import SignalReviewList from './signal-reviews/SignalReviewList'
import SignalReviewForm from './signal-reviews/SignalReviewForm'
import MutationForm from './MutationForm'

export const dynamic = 'force-dynamic'

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
    <div>
      <PageHeader title={probe.title} action={<ProbeStatusControls id={probe.id} status={probe.status} generationId={probe.generation.id} />} />

      <p className="text-sm text-gray-500 mb-4">
        <Link href={`/generations/${probe.generation.id}`} className="hover:underline">
          ← {probe.generation.title}
        </Link>
      </p>

      <p>Status: {probe.status}</p>
      <p>Format: {probe.format}</p>
      <p>Effort: {probe.effortMinutes} min</p>
      <p>Fitness Score: {fitnessScore}</p>
      <p>Tags: {probe.tags.join(', ') || '—'}</p>

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

      <section>
        <h2>Signal Reviews</h2>
        <SignalReviewList reviews={probe.reviews} />
        <SignalReviewForm probeId={probe.id} />
      </section>

      <section>
        <h2>Platform Posts</h2>
        <PlatformPostList posts={probe.platformPosts} />
        <PlatformPostForm probeId={probe.id} />
      </section>

      <section>
        <h2>Mutations</h2>
        {probe.mutations.map(function (mutation) {
          return (
            <div key={mutation.id}>
              <p>{mutation.mutationType} — {mutation.description} ({mutation.status})</p>
              <Link
                href={`/probes/new?rawInput=${encodeURIComponent(mutation.description)}&parentProbeId=${mutation.sourceProbeId}`}
              >
                Create probe from mutation
              </Link>
            </div>
          )
        })}
        <MutationForm probeId={probe.id} />
      </section>
    </div>
  )
}
