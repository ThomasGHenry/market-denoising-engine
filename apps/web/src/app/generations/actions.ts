'use server'

import { prisma } from '@template/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['ARCHIVED', 'RETIRED'],
}

function isValidTransition(from: string, to: string): boolean {
  return (VALID_TRANSITIONS[from] ?? []).includes(to)
}

export async function createGeneration(prevState: unknown, formData: FormData): Promise<string | null> {
  const title = formData.get('title') as string
  const theme = formData.get('theme') as string
  const fitnessFunction = formData.get('fitnessFunction') as string
  const parentIdRaw = formData.get('parentId') as string | null

  if (!title || title.trim() === '') {
    return 'Title is required'
  }
  if (!theme || theme.trim() === '') {
    return 'Theme is required'
  }

  await prisma.generation.create({
    data: {
      title: title.trim(),
      theme: theme.trim(),
      fitnessFunction,
      status: 'DRAFT',
      parentId: parentIdRaw || null,
    },
  })

  redirect('/generations')
}

export async function updateGenerationStatus(
  id: string,
  currentStatus: string,
  newStatus: string,
): Promise<string | null> {
  if (!isValidTransition(currentStatus, newStatus)) {
    return 'Invalid status transition'
  }

  await prisma.generation.update({
    where: { id },
    data: { status: newStatus as any },
  })

  revalidatePath('/generations')
  revalidatePath(`/generations/${id}`)
  return null
}
