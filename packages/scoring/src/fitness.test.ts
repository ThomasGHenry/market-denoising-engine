import { describe, expect, it } from 'vitest';
import { computeFitness } from './fitness';

describe('computeFitness', function () {
  it('returns rawScore 0 when all inputs are null', function () {
    const result = computeFitness({});
    expect(result.rawScore).toBe(0);
    expect(result.scorePerEffortMinute).toBeNull();
    expect(result.scorePerImpression).toBeNull();
    expect(result.formulaVersion).toBe('default_v0');
  });

  it('computes correct weighted sum for all metrics', function () {
    const result = computeFitness({
      likes: 10,
      comments: 2,
      shares: 3,
      saves: 4,
      follows: 1,
      profileClicks: 5,
      linkClicks: 2,
      leads: 1,
      qualitativeScore: 3,
    });
    const expected = 10*1 + 2*5 + 3*4 + 4*4 + 1*8 + 5*4 + 2*6 + 1*20 + 3*10;
    expect(result.rawScore).toBe(expected);
  });

  it('treats partial inputs as zero for missing metrics', function () {
    const result = computeFitness({ likes: 5, leads: 2 });
    expect(result.rawScore).toBe(5*1 + 2*20);
  });

  it('returns scorePerEffortMinute null when effortMinutes is 0', function () {
    const result = computeFitness({ likes: 10, effortMinutes: 0 });
    expect(result.scorePerEffortMinute).toBeNull();
  });

  it('returns scorePerEffortMinute null when effortMinutes is absent', function () {
    const result = computeFitness({ likes: 10 });
    expect(result.scorePerEffortMinute).toBeNull();
  });

  it('computes scorePerEffortMinute when effortMinutes is positive', function () {
    const result = computeFitness({ likes: 20, effortMinutes: 10 });
    expect(result.scorePerEffortMinute).toBe(20 / 10);
  });

  it('returns scorePerImpression null when impressions is 0', function () {
    const result = computeFitness({ likes: 10, impressions: 0 });
    expect(result.scorePerImpression).toBeNull();
  });

  it('returns scorePerImpression null when impressions is absent', function () {
    const result = computeFitness({ likes: 10 });
    expect(result.scorePerImpression).toBeNull();
  });

  it('computes scorePerImpression when impressions is positive', function () {
    const result = computeFitness({ likes: 10, impressions: 100 });
    expect(result.scorePerImpression).toBe(10 / 100);
  });

  it('formulaVersion is default_v0 on every result', function () {
    expect(computeFitness({}).formulaVersion).toBe('default_v0');
    expect(computeFitness({ likes: 99 }).formulaVersion).toBe('default_v0');
  });
});
