import { GenerationStatus, ProbeStatus } from './enums'

const GENERATION_TRANSITIONS = new Set([
  'DRAFT:ACTIVE',
  'ACTIVE:PUBLISHED',
  'PUBLISHED:REVIEWED',
  'REVIEWED:MUTATED',
  'DRAFT:RETIRED',
  'ACTIVE:RETIRED',
  'PUBLISHED:RETIRED',
  'REVIEWED:RETIRED',
  'MUTATED:RETIRED',
  'RETIRED:RETIRED',
])

const PROBE_TRANSITIONS = new Set([
  'DRAFT:READY',
  'READY:PUBLISHED',
  'PUBLISHED:REVIEWED',
  'REVIEWED:MUTATED',
  'DRAFT:RETIRED',
  'READY:RETIRED',
  'PUBLISHED:RETIRED',
  'REVIEWED:RETIRED',
  'MUTATED:RETIRED',
  'RETIRED:RETIRED',
])

export function isValidGenerationTransition(
  from: GenerationStatus,
  to: GenerationStatus,
): boolean {
  return GENERATION_TRANSITIONS.has(`${from}:${to}`)
}

export function isValidProbeTransition(
  from: ProbeStatus,
  to: ProbeStatus,
): boolean {
  return PROBE_TRANSITIONS.has(`${from}:${to}`)
}
