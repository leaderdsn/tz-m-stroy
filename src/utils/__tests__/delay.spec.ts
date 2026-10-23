import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { delay } from '../delay'

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('завершается через указанное время', async () => {
    const onDone = vi.fn()
    delay(1000).then(onDone)

    await vi.advanceTimersByTimeAsync(999)
    expect(onDone).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(onDone).toHaveBeenCalled()
  })
})
