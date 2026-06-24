import { describe, expect, test } from 'vitest'
import {
  Confidence,
  Format,
  Generation,
  GenerationReview,
  GenerationStatus,
  isValidGenerationTransition,
  isValidProbeTransition,
  MetricSnapshot,
  Mutation,
  MutationStatus,
  MutationType,
  Platform,
  PlatformPost,
  Probe,
  ProbeStatus,
  SignalReview,
  SignalStrength,
} from './index'

function makeGeneration(): Generation {
  return {
    id: 'g1',
    title: 'gen',
    theme: null,
    status: GenerationStatus.DRAFT,
    fitnessFunction: 'default_v0',
    parentId: null,
    children: [],
    probes: [],
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function makeProbe(gen: Generation): Probe {
  return {
    id: 'p1',
    generationId: gen.id,
    generation: gen,
    parentProbeId: null,
    childProbes: [],
    title: 'title',
    rawInput: 'raw',
    contentText: null,
    format: Format.SHORT_TEXT,
    status: ProbeStatus.DRAFT,
    tags: [],
    effortMinutes: 10,
    fitnessScore: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    platformPosts: [],
    reviews: [],
    mutations: [],
  }
}

function makePlatformPost(probe: Probe): PlatformPost {
  return {
    id: 'pp1',
    probeId: probe.id,
    probe,
    platform: Platform.LINKEDIN,
    url: null,
    externalId: null,
    caption: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    snapshots: [],
  }
}

describe('GenerationStatus enum', function () {
  test('DRAFT value equals string DRAFT', function () {
    expect(GenerationStatus.DRAFT).toBe('DRAFT')
  })
})

describe('Generation interface', function () {
  test('Generation shape has a status field', function () {
    const gen = makeGeneration()
    expect(gen.status).toBe(GenerationStatus.DRAFT)
  })
})

describe('Probe interface', function () {
  test('Probe shape has a format field', function () {
    const probe = makeProbe(makeGeneration())
    expect(probe.format).toBe(Format.SHORT_TEXT)
  })
})

describe('PlatformPost interface', function () {
  test('PlatformPost shape has a platform field', function () {
    const post = makePlatformPost(makeProbe(makeGeneration()))
    expect(post.platform).toBe(Platform.LINKEDIN)
  })
})

describe('MetricSnapshot interface', function () {
  test('MetricSnapshot shape has an impressions field', function () {
    const post = makePlatformPost(makeProbe(makeGeneration()))
    const snapshot: MetricSnapshot = {
      id: 's1',
      platformPostId: post.id,
      platformPost: post,
      capturedAt: new Date(),
      hoursSincePost: null,
      impressions: 1000,
      views: null,
      likes: null,
      comments: null,
      shares: null,
      saves: null,
      follows: null,
      profileClicks: null,
      linkClicks: null,
      leads: null,
      qualitativeScore: null,
      notes: null,
    }
    expect(snapshot.impressions).toBe(1000)
  })
})

describe('SignalReview interface', function () {
  test('SignalReview has separate observation, interpretation, and decision fields', function () {
    const probe = makeProbe(makeGeneration())
    const review: SignalReview = {
      id: 'sr1',
      probeId: probe.id,
      probe,
      reviewedAt: new Date(),
      signal: SignalStrength.STRONG,
      confidence: Confidence.HIGH,
      observation: 'views doubled',
      interpretation: 'audience resonated with hook',
      decision: null,
      inferredAudience: null,
      inferredProblem: null,
      inferredPromise: null,
      inferredTags: [],
      trustAligned: true,
      shouldMutate: false,
    }
    expect(review.observation).toBe('views doubled')
    expect(review.interpretation).toBe('audience resonated with hook')
    expect(review.decision).toBeNull()
  })
})

describe('GenerationReview interface', function () {
  test('GenerationReview shape has a summary field', function () {
    const gen = makeGeneration()
    const gr: GenerationReview = {
      id: 'gr1',
      generationId: gen.id,
      generation: gen,
      reviewedAt: new Date(),
      summary: 'strong performance',
      winnerProbeId: null,
      rationale: null,
      nextGenerationPlan: null,
    }
    expect(gr.summary).toBe('strong performance')
  })
})

describe('Mutation interface', function () {
  test('Mutation shape has a mutationType field', function () {
    const probe = makeProbe(makeGeneration())
    const mutation: Mutation = {
      id: 'm1',
      sourceProbeId: probe.id,
      sourceProbe: probe,
      description: 'change hook',
      mutationType: MutationType.HOOK,
      status: MutationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(mutation.mutationType).toBe(MutationType.HOOK)
  })
})

describe('isValidGenerationTransition', function () {
  test('DRAFT to ACTIVE is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.DRAFT, GenerationStatus.ACTIVE)).toBe(true)
  })

  test('ACTIVE to DRAFT is invalid', function () {
    expect(isValidGenerationTransition(GenerationStatus.ACTIVE, GenerationStatus.DRAFT)).toBe(false)
  })

  test('ACTIVE to PUBLISHED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.ACTIVE, GenerationStatus.PUBLISHED)).toBe(true)
  })

  test('PUBLISHED to REVIEWED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.PUBLISHED, GenerationStatus.REVIEWED)).toBe(true)
  })

  test('REVIEWED to MUTATED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.REVIEWED, GenerationStatus.MUTATED)).toBe(true)
  })

  test('DRAFT to RETIRED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.DRAFT, GenerationStatus.RETIRED)).toBe(true)
  })

  test('ACTIVE to RETIRED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.ACTIVE, GenerationStatus.RETIRED)).toBe(true)
  })

  test('PUBLISHED to RETIRED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.PUBLISHED, GenerationStatus.RETIRED)).toBe(true)
  })

  test('REVIEWED to RETIRED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.REVIEWED, GenerationStatus.RETIRED)).toBe(true)
  })

  test('MUTATED to RETIRED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.MUTATED, GenerationStatus.RETIRED)).toBe(true)
  })

  test('RETIRED to RETIRED is valid', function () {
    expect(isValidGenerationTransition(GenerationStatus.RETIRED, GenerationStatus.RETIRED)).toBe(true)
  })

  test('RETIRED to ACTIVE is invalid', function () {
    expect(isValidGenerationTransition(GenerationStatus.RETIRED, GenerationStatus.ACTIVE)).toBe(false)
  })

  test('DRAFT to PUBLISHED forward-skip is invalid', function () {
    expect(isValidGenerationTransition(GenerationStatus.DRAFT, GenerationStatus.PUBLISHED)).toBe(false)
  })

  test('PUBLISHED to DRAFT backward is invalid', function () {
    expect(isValidGenerationTransition(GenerationStatus.PUBLISHED, GenerationStatus.DRAFT)).toBe(false)
  })

  test('MUTATED to ACTIVE is invalid', function () {
    expect(isValidGenerationTransition(GenerationStatus.MUTATED, GenerationStatus.ACTIVE)).toBe(false)
  })
})

describe('isValidProbeTransition', function () {
  test('DRAFT to READY is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.DRAFT, ProbeStatus.READY)).toBe(true)
  })

  test('READY to PUBLISHED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.READY, ProbeStatus.PUBLISHED)).toBe(true)
  })

  test('PUBLISHED to REVIEWED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.PUBLISHED, ProbeStatus.REVIEWED)).toBe(true)
  })

  test('REVIEWED to MUTATED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.REVIEWED, ProbeStatus.MUTATED)).toBe(true)
  })

  test('DRAFT to RETIRED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.DRAFT, ProbeStatus.RETIRED)).toBe(true)
  })

  test('READY to RETIRED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.READY, ProbeStatus.RETIRED)).toBe(true)
  })

  test('PUBLISHED to RETIRED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.PUBLISHED, ProbeStatus.RETIRED)).toBe(true)
  })

  test('REVIEWED to RETIRED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.REVIEWED, ProbeStatus.RETIRED)).toBe(true)
  })

  test('MUTATED to RETIRED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.MUTATED, ProbeStatus.RETIRED)).toBe(true)
  })

  test('RETIRED to RETIRED is valid', function () {
    expect(isValidProbeTransition(ProbeStatus.RETIRED, ProbeStatus.RETIRED)).toBe(true)
  })

  test('READY to DRAFT is invalid', function () {
    expect(isValidProbeTransition(ProbeStatus.READY, ProbeStatus.DRAFT)).toBe(false)
  })

  test('RETIRED to READY is invalid', function () {
    expect(isValidProbeTransition(ProbeStatus.RETIRED, ProbeStatus.READY)).toBe(false)
  })

  test('DRAFT to PUBLISHED forward-skip is invalid', function () {
    expect(isValidProbeTransition(ProbeStatus.DRAFT, ProbeStatus.PUBLISHED)).toBe(false)
  })

  test('PUBLISHED to DRAFT backward is invalid', function () {
    expect(isValidProbeTransition(ProbeStatus.PUBLISHED, ProbeStatus.DRAFT)).toBe(false)
  })

  test('MUTATED to READY is invalid', function () {
    expect(isValidProbeTransition(ProbeStatus.MUTATED, ProbeStatus.READY)).toBe(false)
  })
})
