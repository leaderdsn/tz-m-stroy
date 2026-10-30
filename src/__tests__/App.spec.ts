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

const getRowIndex = (cell: Element): number => {
  return Number(cell.closest('.ag-row')?.getAttribute('row-index'))
}

const getTexts = (selector: string): string[] => {
  return [...document.querySelectorAll(selector)]
    .sort((a, b) => getRowIndex(a) - getRowIndex(b))
    .map((cell) => cell.textContent ?? '')
}

const getLabels = () => getTexts('.ag-row .ag-cell[col-id="label"]')
const getCategories = () => getTexts('.ag-row .category-cell__text')

const getRowButton = (rowIndex: number, button: 'add' | 'remove'): HTMLButtonElement | null => {
  return document.querySelector(
    `.ag-row[row-index="${rowIndex}"] .category-cell__button--${button}`,
  )
}

const getHistoryButton = (button: 'undo' | 'redo'): HTMLButtonElement => {
  return document.querySelector(`.history-controls__button--${button}`)!
}

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

  it('добавляет дочернюю строку, и элемент становится группой', async () => {
    vi.mocked(fetchItems).mockResolvedValue(items)
    mount(App, { attachTo: document.body })

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 1', 'Айтем 2'])
    })
    getRowButton(1, 'add')!.click()

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 1', 'Айтем 2', 'Новый элемент'])
      expect(getCategories()).toEqual(['Группа', 'Группа', 'Элемент'])
    })
  })

  it('удаляет строку вместе с дочерними', async () => {
    vi.mocked(fetchItems).mockResolvedValue([...items, { id: 3, parent: null, label: 'Айтем 3' }])
    mount(App, { attachTo: document.body })

    await vi.waitFor(() => {
      expect(getLabels()).toHaveLength(3)
    })
    getRowButton(0, 'remove')!.click()

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 3'])
    })
  })

  it('отменяет и повторяет удаление', async () => {
    vi.mocked(fetchItems).mockResolvedValue([...items, { id: 3, parent: null, label: 'Айтем 3' }])
    mount(App, { attachTo: document.body })

    await vi.waitFor(() => {
      expect(getLabels()).toHaveLength(3)
    })
    getRowButton(0, 'remove')!.click()

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 3'])
    })
    getHistoryButton('undo').click()

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 1', 'Айтем 2', 'Айтем 3'])
    })
    getHistoryButton('redo').click()

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 3'])
    })
  })

  it('отменяет добавление', async () => {
    vi.mocked(fetchItems).mockResolvedValue(items)
    mount(App, { attachTo: document.body })

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 1', 'Айтем 2'])
    })
    getRowButton(1, 'add')!.click()

    await vi.waitFor(() => {
      expect(getLabels()).toHaveLength(3)
    })
    getHistoryButton('undo').click()

    await vi.waitFor(() => {
      expect(getLabels()).toEqual(['Айтем 1', 'Айтем 2'])
      expect(getCategories()).toEqual(['Группа', 'Элемент'])
    })
  })

  it('блокирует кнопки истории, пока нечего отменять или повторять', async () => {
    vi.mocked(fetchItems).mockResolvedValue(items)
    mount(App, { attachTo: document.body })

    expect(getHistoryButton('undo').disabled).toBe(true)
    expect(getHistoryButton('redo').disabled).toBe(true)

    await vi.waitFor(() => {
      expect(getLabels()).toHaveLength(2)
    })
    getRowButton(1, 'remove')!.click()

    await vi.waitFor(() => {
      expect(getHistoryButton('undo').disabled).toBe(false)
      expect(getHistoryButton('redo').disabled).toBe(true)
    })
  })
})
