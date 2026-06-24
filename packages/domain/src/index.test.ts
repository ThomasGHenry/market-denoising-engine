import { describe, expect, test } from 'vitest'
import { GenerationStatus } from '@template/domain'

describe('GenerationStatus enum', function () {
  test('DRAFT value equals string DRAFT', function () {
    expect(GenerationStatus.DRAFT).toBe('DRAFT')
  })
})
