'use server'

import { prisma } from '@template/db'
import { isValidProbeTransition } from '@template/domain'
import type { Format, ProbeStatus } from '@template/domain'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProbe(prevState: unknown, formData: FormData): Promise<string | null> {
  const generationId = formData.get('generationId') as string
  const title = formData.get('title') as string
  const rawInput = formData.get('rawInput') as string
  const contentTextRaw = formData.get('contentText') as string | null
  const format = formData.get('format') as string
  const tagsRaw = formData.get('tags') as string | null
  const effortMinutesRaw = formData.get('effortMinutes') as string | null
  const parentProbeIdRaw = formData.get('parentProbeId') as string | null

  if (!generationId || generationId.trim() === '') {
    return 'Generation is required'
  }
  if (!title || title.trim() === '') {
    return 'Title is required'
  }
  if (!rawInput || rawInput.trim() === '') {
    return 'Raw input is required'
  }

  const tags = tagsRaw
    ? tagsRaw.split(',').map(function (t) { return t.trim() }).filter(function (t) { return t !== '' })
    : []

  const effortMinutes = parseInt(effortMinutesRaw ?? '') || 10
  const contentText = contentTextRaw && contentTextRaw.trim() !== '' ? contentTextRaw.trim() : null
  const parentProbeId = parentProbeIdRaw && parentProbeIdRaw.trim() !== '' ? parentProbeIdRaw.trim() : null

  await prisma.probe.create({
    data: {
      generationId,
      title: title.trim(),
      rawInput: rawInput.trim(),
      contentText,
      format: format as Format,
      status: 'DRAFT' as ProbeStatus,
      tags,
      effortMinutes,
      parentProbeId,
    },
  })

  redirect('/generations/' + generationId)
}

export async function updateProbeStatus(id: string, currentStatus: string, newStatus: string): Promise<string | null> {
  if (!isValidProbeTransition(currentStatus as ProbeStatus, newStatus as ProbeStatus)) {
    return 'Invalid status transition'
  }

  await prisma.probe.update({
    where: { id },
    data: { status: newStatus as ProbeStatus },
  })

  revalidatePath('/probes/' + id)
  return null
}
