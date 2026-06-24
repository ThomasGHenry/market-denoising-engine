export enum GenerationStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  PUBLISHED = 'PUBLISHED',
  REVIEWED = 'REVIEWED',
  MUTATED = 'MUTATED',
  RETIRED = 'RETIRED',
}

export enum ProbeStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  PUBLISHED = 'PUBLISHED',
  REVIEWED = 'REVIEWED',
  MUTATED = 'MUTATED',
  RETIRED = 'RETIRED',
}

export enum Format {
  SHORT_TEXT = 'SHORT_TEXT',
  STATIC_IMAGE = 'STATIC_IMAGE',
  SHORT_VIDEO = 'SHORT_VIDEO',
  LONGFORM_TEXT = 'LONGFORM_TEXT',
  LONGFORM_VIDEO = 'LONGFORM_VIDEO',
  AUDIO = 'AUDIO',
}

export enum Platform {
  LINKEDIN = 'LINKEDIN',
  X = 'X',
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  BLOG = 'BLOG',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
}

export enum SignalStrength {
  NONE = 'NONE',
  WEAK = 'WEAK',
  PROMISING = 'PROMISING',
  STRONG = 'STRONG',
}

export enum Confidence {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum MutationType {
  HOOK = 'HOOK',
  AUDIENCE = 'AUDIENCE',
  PAIN = 'PAIN',
  PROMISE = 'PROMISE',
  FORMAT = 'FORMAT',
  PLATFORM = 'PLATFORM',
  CTA = 'CTA',
  TONE = 'TONE',
  PROOF = 'PROOF',
  VISUAL = 'VISUAL',
  OTHER = 'OTHER',
}

export enum MutationStatus {
  OPEN = 'OPEN',
  DRAFTED = 'DRAFTED',
  PUBLISHED = 'PUBLISHED',
  DONE = 'DONE',
  SKIPPED = 'SKIPPED',
}
