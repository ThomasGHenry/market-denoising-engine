export interface FitnessInput {
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  follows?: number | null;
  profileClicks?: number | null;
  linkClicks?: number | null;
  leads?: number | null;
  qualitativeScore?: number | null;
  effortMinutes?: number | null;
  impressions?: number | null;
}

export interface FitnessResult {
  rawScore: number;
  scorePerEffortMinute: number | null;
  scorePerImpression: number | null;
  formulaVersion: 'default_v0';
}

export function computeFitness(input: FitnessInput): FitnessResult {
  const rawScore = metric(input.likes, 1)
    + metric(input.comments, 5)
    + metric(input.shares, 4)
    + metric(input.saves, 4)
    + metric(input.follows, 8)
    + metric(input.profileClicks, 4)
    + metric(input.linkClicks, 6)
    + metric(input.leads, 20)
    + metric(input.qualitativeScore, 10);

  return {
    rawScore,
    scorePerEffortMinute: divide(rawScore, input.effortMinutes),
    scorePerImpression: divide(rawScore, input.impressions),
    formulaVersion: 'default_v0',
  };
}

function metric(value: number | null | undefined, weight: number): number {
  return (value ?? 0) * weight;
}

function divide(numerator: number, denominator: number | null | undefined): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}
