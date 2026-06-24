'use server'

import { prisma } from '@template/db'
import { redirect } from 'next/navigation'

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
