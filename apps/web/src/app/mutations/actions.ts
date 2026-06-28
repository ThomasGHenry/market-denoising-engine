'use server'

import { prisma } from '@template/db'
import { MutationType, MutationStatus } from '@template/domain'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createMutation(prevState: string | null, formData: FormData): Promise<string | null> {
  const sourceProbeId = formData.get('sourceProbeId') as string | null
  if (!sourceProbeId) return 'Source probe ID is required'

  const mutationType = formData.get('mutationType') as string | null
  if (!mutationType || !Object.values(MutationType).includes(mutationType as MutationType)) {
    return 'Mutation type is required and must be a valid type'
  }

  const description = (formData.get('description') as string | null)?.trim()
  if (!description) return 'Description is required'

  try {
    await prisma.mutation.create({
      data: {
        sourceProbeId,
        mutationType: mutationType as MutationType,
        description,
        status: MutationStatus.OPEN,
      },
    })
  } catch (err) {
    return 'Failed to create mutation'
  }

  revalidatePath('/mutations')
  revalidatePath('/probes/' + sourceProbeId)
  redirect('/probes/' + sourceProbeId)
}

export async function listMutations() {
  return prisma.mutation.findMany({
    where: { status: MutationStatus.OPEN },
    include: { sourceProbe: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateMutationStatus(id: string, newStatus: string): Promise<string | null> {
  if (!id) return 'ID is required'
  if (!Object.values(MutationStatus).includes(newStatus as MutationStatus)) {
    return 'Status must be a valid mutation status'
  }

  try {
    const mutation = await prisma.mutation.update({
      where: { id },
      data: { status: newStatus as MutationStatus },
      select: { sourceProbeId: true },
    })
    revalidatePath('/mutations')
    revalidatePath('/probes/' + mutation.sourceProbeId)
  } catch {
  }

  return null
}
