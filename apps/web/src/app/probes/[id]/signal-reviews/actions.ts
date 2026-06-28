'use server'

import { prisma } from '@template/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SignalStrength, Confidence } from '@template/domain'

export async function createSignalReview(
  prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const probeId = formData.get('probeId') as string
  const signal = formData.get('signal') as SignalStrength
  const confidence = formData.get('confidence') as Confidence
  const observation = formData.get('observation') as string
  const interpretation = formData.get('interpretation') as string
  const decision = (formData.get('decision') as string) || null

  if (!probeId) return 'Probe ID is required'
  if (!signal) return 'Signal strength is required'
  if (!confidence) return 'Confidence is required'
  if (!observation) return 'Observation is required'
  if (!interpretation) return 'Interpretation is required'

  await prisma.signalReview.create({
    data: { probeId, signal, confidence, observation, interpretation, decision },
  })

  revalidatePath('/probes/' + probeId)
  redirect('/probes/' + probeId)
}
