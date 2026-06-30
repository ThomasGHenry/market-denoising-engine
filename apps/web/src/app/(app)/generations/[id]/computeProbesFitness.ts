import { prisma } from '@template/db'
import { computeFitness, type FitnessResult } from '@template/scoring'
import { aggregateSnapshotsToFitnessInput } from './aggregation'

export interface ProbeWithFitness {
  id: string
  title: string
  format: string
  status: string
  fitnessResult: FitnessResult
}

export async function computeProbesFitness(generationId: string): Promise<ProbeWithFitness[]> {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    select: {
      probes: {
        select: {
          id: true,
          title: true,
          format: true,
          status: true,
          effortMinutes: true,
          createdAt: true,
          platformPosts: {
            select: {
              snapshots: {
                select: {
                  impressions: true,
                  likes: true,
                  comments: true,
                  shares: true,
                  saves: true,
                  follows: true,
                  profileClicks: true,
                  linkClicks: true,
                  leads: true,
                  qualitativeScore: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!generation) return []

  const probesWithFitness = generation.probes.map(function (probe) {
    const allSnapshots = probe.platformPosts.flatMap(function (post) { return post.snapshots })
    const fitnessInput = aggregateSnapshotsToFitnessInput(allSnapshots, probe.effortMinutes)
    const fitnessResult = computeFitness(fitnessInput)
    return {
      id: probe.id,
      title: probe.title,
      format: probe.format,
      status: probe.status,
      createdAt: probe.createdAt,
      fitnessResult,
    }
  })

  return probesWithFitness
    .sort(function (a, b) {
      const scoreDiff = b.fitnessResult.rawScore - a.fitnessResult.rawScore
      if (scoreDiff !== 0) return scoreDiff
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .map(function ({ createdAt: _createdAt, ...rest }) { return rest })
}
