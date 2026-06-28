import React from 'react'
import type { SignalReview } from '@prisma/client'

interface SignalReviewListProps {
  reviews: SignalReview[]
}

export default function SignalReviewList({ reviews }: SignalReviewListProps) {
  if (reviews.length === 0) {
    return <p>No reviews yet.</p>
  }

  return (
    <ul>
      {reviews.map(renderReview)}
    </ul>
  )
}

function renderReview(review: SignalReview) {
  return (
    <li key={review.id}>
      <p>Signal: {review.signal} | Confidence: {review.confidence}</p>
      <p><strong>Observation:</strong> {review.observation}</p>
      <p><strong>Interpretation:</strong> {review.interpretation}</p>
      {review.decision && <p><strong>Decision:</strong> {review.decision}</p>}
    </li>
  )
}
