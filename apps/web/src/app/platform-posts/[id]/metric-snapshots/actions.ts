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
  if (isNaN(new Date(capturedAt).getTime())) return 'capturedAt must be a valid date'

  await prisma.metricSnapshot.create({
    data: {
      platformPostId,
      capturedAt: new Date(capturedAt),
      hoursSincePost: parseOptionalInt(formData, 'hoursSincePost'),
      impressions: parseOptionalInt(formData, 'impressions'),
      views: parseOptionalInt(formData, 'views'),
      likes: parseOptionalInt(formData, 'likes'),
      comments: parseOptionalInt(formData, 'comments'),
      shares: parseOptionalInt(formData, 'shares'),
      saves: parseOptionalInt(formData, 'saves'),
      follows: parseOptionalInt(formData, 'follows'),
      profileClicks: parseOptionalInt(formData, 'profileClicks'),
      linkClicks: parseOptionalInt(formData, 'linkClicks'),
      leads: parseOptionalInt(formData, 'leads'),
      qualitativeScore: parseOptionalInt(formData, 'qualitativeScore'),
      notes: (formData.get('notes') as string) || null,
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

  await prisma.metricSnapshot.update({
    where: { id, platformPostId },
    data: {
      capturedAt: new Date(capturedAt),
      hoursSincePost: parseOptionalInt(formData, 'hoursSincePost'),
      impressions: parseOptionalInt(formData, 'impressions'),
      views: parseOptionalInt(formData, 'views'),
      likes: parseOptionalInt(formData, 'likes'),
      comments: parseOptionalInt(formData, 'comments'),
      shares: parseOptionalInt(formData, 'shares'),
      saves: parseOptionalInt(formData, 'saves'),
      follows: parseOptionalInt(formData, 'follows'),
      profileClicks: parseOptionalInt(formData, 'profileClicks'),
      linkClicks: parseOptionalInt(formData, 'linkClicks'),
      leads: parseOptionalInt(formData, 'leads'),
      qualitativeScore: parseOptionalInt(formData, 'qualitativeScore'),
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

  await prisma.metricSnapshot.delete({ where: { id, platformPostId } })

  revalidatePath('/platform-posts/' + platformPostId)
  return null
}

function parseOptionalInt(formData: FormData, key: string): number | null {
  const val = formData.get(key)
  if (val === null || val === '') return null
  const n = parseInt(val as string, 10)
  return isNaN(n) ? null : n
}
