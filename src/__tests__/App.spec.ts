import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import App from '../App.vue'
import { fetchItems } from '@/api/items'
import type { Item } from '@/types/tree'

vi.mock('@/api/items', () => ({
  fetchItems: vi.fn(),
}))

const items: Item[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: 2, parent: 1, label: 'Айтем 2' },
]

enableAutoUnmount(afterEach)

describe('App', () => {
  it('показывает загрузку, пока данные не получены, а затем строки таблицы', async () => {
    let resolveItems: (value: Item[]) => void = () => {}
    vi.mocked(fetchItems).mockReturnValue(new Promise((resolve) => (resolveItems = resolve)))

    mount(App, { attachTo: document.body })

    await vi.waitFor(() => {
      expect(document.querySelector('.ag-overlay')?.textContent).toContain('Loading')
    })

    resolveItems(items)

    await vi.waitFor(() => {
      const labels = [...document.querySelectorAll('.ag-cell[col-id="label"]')].map(
        (cell) => cell.textContent,
      )
      expect(labels).toEqual(['Айтем 1', 'Айтем 2'])
      expect(document.querySelector('.ag-overlay')?.textContent ?? '').not.toContain('Loading')
    })
  })
})
