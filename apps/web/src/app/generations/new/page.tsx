import { prisma } from '@template/db'
import GenerationForm from './GenerationForm'

async function loadEligibleParents() {
  return prisma.generation.findMany({
    where: {
      status: { in: ['ACTIVE', 'ARCHIVED'] },
    },
    select: { id: true, title: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function NewGenerationPage() {
  const parents = await loadEligibleParents()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create Generation</h1>
      <GenerationForm parents={parents} />
    </div>
  )
}
