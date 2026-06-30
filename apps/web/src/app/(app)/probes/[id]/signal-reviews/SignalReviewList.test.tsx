import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import React from 'react'
import SignalReviewList from './SignalReviewList'
import type { SignalReview } from '@prisma/client'

function makeReview(overrides: Partial<SignalReview> = {}): SignalReview {
  return {
    id: 'review-1',
    probeId: 'probe-1',
    reviewedAt: new Date('2024-03-01T12:00:00Z'),
    signal: 'PROMISING',
    confidence: 'MEDIUM',
    observation: 'Post reached 2k people',
    interpretation: 'Audience responds to pain framing',
    decision: null,
    inferredAudience: null,
    inferredProblem: null,
    inferredPromise: null,
    inferredTags: [],
    trustAligned: true,
    shouldMutate: false,
    ...overrides,
  }
}

afterEach(cleanup)

describe('SignalReviewList', function () {
  it('renders empty-state message when no reviews', function () {
    render(<SignalReviewList reviews={[]} />)

    expect(screen.getByText('No reviews yet.')).toBeTruthy()
  })

  it('renders observation as a separate labeled field', function () {
    const reviews = [makeReview({ observation: 'Post reached 2k people' })]

    render(<SignalReviewList reviews={reviews} />)

    expect(screen.getByText('Observation:')).toBeTruthy()
    expect(screen.getByText('Post reached 2k people')).toBeTruthy()
  })

  it('renders interpretation as a separate labeled field', function () {
    const reviews = [makeReview({ interpretation: 'Audience responds to pain framing' })]

    render(<SignalReviewList reviews={reviews} />)

    expect(screen.getByText('Interpretation:')).toBeTruthy()
    expect(screen.getByText('Audience responds to pain framing')).toBeTruthy()
  })

  it('renders decision as a separate labeled field when present', function () {
    const reviews = [makeReview({ decision: 'Run a variant with stronger CTA' })]

    render(<SignalReviewList reviews={reviews} />)

    expect(screen.getByText('Decision:')).toBeTruthy()
    expect(screen.getByText('Run a variant with stronger CTA')).toBeTruthy()
  })

  it('does not render decision label when decision is null', function () {
    const reviews = [makeReview({ decision: null })]

    render(<SignalReviewList reviews={reviews} />)

    expect(screen.queryByText('Decision:')).toBeNull()
  })

  it('renders signal and confidence for each review', function () {
    const reviews = [makeReview({ signal: 'STRONG', confidence: 'HIGH' })]

    render(<SignalReviewList reviews={reviews} />)

    expect(screen.getByText(/STRONG/)).toBeTruthy()
    expect(screen.getByText(/HIGH/)).toBeTruthy()
  })

  it('renders multiple reviews', function () {
    const reviews = [
      makeReview({ id: 'review-1', observation: 'First observation' }),
      makeReview({ id: 'review-2', observation: 'Second observation' }),
    ]

    render(<SignalReviewList reviews={reviews} />)

    expect(screen.getByText('First observation')).toBeTruthy()
    expect(screen.getByText('Second observation')).toBeTruthy()
  })
})
