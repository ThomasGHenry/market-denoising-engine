'use server'

import { prisma } from '@template/db'
import type { Prisma } from '@prisma/client'
import type { Platform } from '@template/domain'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createPlatformPost(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const probeId = formData.get('probeId') as string | null
  const platform = formData.get('platform') as string | null
  const url = formData.get('url') as string | null
  const publishedAt = formData.get('publishedAt') as string | null
  const captionRaw = formData.get('caption') as string | null
  const caption = captionRaw && captionRaw.trim() !== '' ? captionRaw.trim() : null

  const missingError = firstMissingFieldError({ probeId, platform, url, publishedAt })
  if (missingError) {
    return missingError
  }

  const probe = await prisma.probe.findUnique({ where: { id: probeId as string } })
  if (!probe) {
    return 'Probe not found'
  }

  await prisma.$transaction(async function (tx: Prisma.TransactionClient) {
    await transitionProbeToPublished(probe.status, probeId as string, tx)
    await tx.platformPost.create({
      data: {
        probeId: probeId as string,
        platform: platform as Platform,
        url: url as string,
        publishedAt: new Date(publishedAt as string),
        caption,
      },
    })
  })

  revalidatePath('/probes/' + (probeId as string))
  revalidatePath('/generations/' + probe.generationId)
  redirect('/probes/' + (probeId as string))
}

async function transitionProbeToPublished(
  status: string,
  probeId: string,
  tx: Prisma.TransactionClient
): Promise<void> {
  if (status === 'DRAFT') {
    await tx.probe.update({ where: { id: probeId }, data: { status: 'READY' } })
    await tx.probe.update({ where: { id: probeId }, data: { status: 'PUBLISHED' } })
  } else if (status === 'READY') {
    await tx.probe.update({ where: { id: probeId }, data: { status: 'PUBLISHED' } })
  }
}

function firstMissingFieldError(fields: Record<string, string | null>): string | null {
  for (const [name, value] of Object.entries(fields)) {
    if (!value || value.trim() === '') {
      return `${name} is required`
    }
  }
  return null
}
