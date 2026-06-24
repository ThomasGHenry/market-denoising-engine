import {
  GenerationStatus,
  ProbeStatus,
  Format,
  Platform,
  SignalStrength,
  Confidence,
  MutationType,
  MutationStatus,
} from './enums'

export interface Generation {
  id: string
  title: string
  theme: string | null
  status: GenerationStatus
  fitnessFunction: string
  parentId: string | null
  parent?: Generation | null
  children: Generation[]
  probes: Probe[]
  reviews: GenerationReview[]
  createdAt: Date
  updatedAt: Date
}

export interface Probe {
  id: string
  generationId: string
  generation: Generation
  parentProbeId: string | null
  parentProbe?: Probe | null
  childProbes: Probe[]
  title: string
  rawInput: string
  contentText: string | null
  format: Format
  status: ProbeStatus
  tags: string[]
  effortMinutes: number
  fitnessScore: number | null
  createdAt: Date
  updatedAt: Date
  platformPosts: PlatformPost[]
  reviews: SignalReview[]
  mutations: Mutation[]
}

export interface PlatformPost {
  id: string
  probeId: string
  probe: Probe
  platform: Platform
  url: string | null
  externalId: string | null
  caption: string | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  snapshots: MetricSnapshot[]
}

export interface MetricSnapshot {
  id: string
  platformPostId: string
  platformPost: PlatformPost
  capturedAt: Date
  hoursSincePost: number | null
  impressions: number | null
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  follows: number | null
  profileClicks: number | null
  linkClicks: number | null
  leads: number | null
  qualitativeScore: number | null
  notes: string | null
}

export interface SignalReview {
  id: string
  probeId: string
  probe: Probe
  reviewedAt: Date
  signal: SignalStrength
  confidence: Confidence
  observation: string
  interpretation: string
  decision: string | null
  inferredAudience: string | null
  inferredProblem: string | null
  inferredPromise: string | null
  inferredTags: string[]
  trustAligned: boolean
  shouldMutate: boolean
}

export interface GenerationReview {
  id: string
  generationId: string
  generation: Generation
  reviewedAt: Date
  summary: string
  winnerProbeId: string | null
  rationale: string | null
  nextGenerationPlan: string | null
}

export interface Mutation {
  id: string
  sourceProbeId: string
  sourceProbe: Probe
  description: string
  mutationType: MutationType
  status: MutationStatus
  createdAt: Date
  updatedAt: Date
}
