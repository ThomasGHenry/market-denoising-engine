'use server'

import { prisma } from '@template/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createMetricSnapshot(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const platformPostId = formData.get('platformPostId') as string
  const capturedAt = formData.get('capturedAt') as string

  if (!platformPostId) return 'Platform post ID is required'
  if (!capturedAt) return 'Captured at is required'

  const parseOptionalInt = function (key: string): number | undefined {
    const val = formData.get(key)
    if (val === null || val === '') return undefined
    const n = parseInt(val as string, 10)
    return isNaN(n) ? undefined : n
  }

  await prisma.metricSnapshot.create({
    data: {
      platformPostId,
      capturedAt: new Date(capturedAt),
      hoursSincePost: parseOptionalInt('hoursSincePost'),
      impressions: parseOptionalInt('impressions'),
      views: parseOptionalInt('views'),
      likes: parseOptionalInt('likes'),
      comments: parseOptionalInt('comments'),
      shares: parseOptionalInt('shares'),
      saves: parseOptionalInt('saves'),
      follows: parseOptionalInt('follows'),
      profileClicks: parseOptionalInt('profileClicks'),
      linkClicks: parseOptionalInt('linkClicks'),
      leads: parseOptionalInt('leads'),
      qualitativeScore: parseOptionalInt('qualitativeScore'),
      notes: (formData.get('notes') as string) || undefined,
    },
  })

  revalidatePath('/platform-posts/' + platformPostId)
  redirect('/platform-posts/' + platformPostId)
}

export async function updateMetricSnapshot(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const id = formData.get('id') as string
  const platformPostId = formData.get('platformPostId') as string
  const capturedAt = formData.get('capturedAt') as string

  if (!id) return 'Snapshot ID is required'
  if (!platformPostId) return 'Platform post ID is required'
  if (!capturedAt) return 'Captured at is required'

  const parseOptionalInt = function (key: string): number | null {
    const val = formData.get(key)
    if (val === null || val === '') return null
    const n = parseInt(val as string, 10)
    return isNaN(n) ? null : n
  }

  await prisma.metricSnapshot.update({
    where: { id },
    data: {
      capturedAt: new Date(capturedAt),
      hoursSincePost: parseOptionalInt('hoursSincePost'),
      impressions: parseOptionalInt('impressions'),
      views: parseOptionalInt('views'),
      likes: parseOptionalInt('likes'),
      comments: parseOptionalInt('comments'),
      shares: parseOptionalInt('shares'),
      saves: parseOptionalInt('saves'),
      follows: parseOptionalInt('follows'),
      profileClicks: parseOptionalInt('profileClicks'),
      linkClicks: parseOptionalInt('linkClicks'),
      leads: parseOptionalInt('leads'),
      qualitativeScore: parseOptionalInt('qualitativeScore'),
      notes: (formData.get('notes') as string) || null,
    },
  })

  revalidatePath('/platform-posts/' + platformPostId)
  return null
}

export async function deleteMetricSnapshot(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const id = formData.get('id') as string
  const platformPostId = formData.get('platformPostId') as string

  if (!id) return 'Snapshot ID is required'
  if (!platformPostId) return 'Platform post ID is required'

  await prisma.metricSnapshot.delete({ where: { id } })

  revalidatePath('/platform-posts/' + platformPostId)
  return null
}
