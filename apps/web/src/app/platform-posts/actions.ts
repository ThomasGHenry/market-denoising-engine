'use server'

import { prisma } from '@template/db'
import type { Platform } from '@template/domain'
import { redirect } from 'next/navigation'

export async function createPlatformPost(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const probeId = formData.get('probeId') as string | null
  const platform = formData.get('platform') as string | null
  const url = formData.get('url') as string | null
  const publishedAt = formData.get('publishedAt') as string | null

  const missingError = firstMissingFieldError({ probeId, platform, url, publishedAt })
  if (missingError) {
    return missingError
  }

  const probe = await prisma.probe.findUnique({ where: { id: probeId as string } })

  await transitionProbeToPublished(probe?.status ?? null, probeId as string)

  await prisma.platformPost.create({
    data: {
      probeId: probeId as string,
      platform: platform as Platform,
      url: url as string,
      publishedAt: new Date(publishedAt as string),
    },
  })

  redirect('/probes/' + (probeId as string))
}

async function transitionProbeToPublished(status: string | null, probeId: string): Promise<void> {
  if (status === 'DRAFT') {
    await prisma.probe.update({ where: { id: probeId }, data: { status: 'READY' } })
    await prisma.probe.update({ where: { id: probeId }, data: { status: 'PUBLISHED' } })
  } else if (status === 'READY') {
    await prisma.probe.update({ where: { id: probeId }, data: { status: 'PUBLISHED' } })
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
