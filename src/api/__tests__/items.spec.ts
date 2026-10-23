import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchItems } from '../items'
import type { Item } from '@/types/tree'

const items: Item[] = [{ id: 1, parent: null, label: 'Айтем 1' }]

describe('fetchItems', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(items) }))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('загружает items.json с задержкой 2 секунды', async () => {
    const result = fetchItems()

    await vi.advanceTimersByTimeAsync(1999)
    expect(fetch).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(fetch).toHaveBeenCalledWith('/items.json')
    await expect(result).resolves.toEqual(items)
  })
})
