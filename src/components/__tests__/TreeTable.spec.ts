import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import TreeTable from '../TreeTable.vue'
import { TreeStore } from '@/store/TreeStore'
import type { Item } from '@/types/tree'

const items: Item[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
  { id: 5, parent: '91064cef', label: 'Айтем 5' },
  { id: 6, parent: '91064cef', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

const getRowIndex = (cell: Element): number => {
  return Number(cell.closest('.ag-row')?.getAttribute('row-index'))
}

const getColumnTexts = (colId: string): string[] => {
  return [...document.querySelectorAll(`.ag-row .ag-cell[col-id="${colId}"]`)]
    .sort((a, b) => getRowIndex(a) - getRowIndex(b))
    .map((cell) => cell.textContent?.trim() ?? '')
}

const getCategories = (): string[] => {
  return [...document.querySelectorAll('.ag-row .category-cell__text')]
    .sort((a, b) => getRowIndex(a) - getRowIndex(b))
    .map((cell) => cell.textContent ?? '')
}

const getRowButton = (rowIndex: number, button: 'add' | 'remove'): HTMLButtonElement | null => {
  return document.querySelector(
    `.ag-row[row-index="${rowIndex}"] .category-cell__button--${button}`,
  )
}

const mountTable = (props: { items: Item[]; loading: boolean }) => {
  const store = new TreeStore<Item>(props.items)

  return mount(TreeTable, {
    props: { store, ...props },
    attachTo: document.body,
  })
}

enableAutoUnmount(afterEach)

describe('TreeTable', () => {
  it('показывает индикатор загрузки', async () => {
    mountTable({ items: [], loading: true })

    await vi.waitFor(() => {
      expect(document.querySelector('.ag-overlay')?.textContent).toContain('Loading')
    })
  })

  it('выводит колонки в нужном порядке', async () => {
    mountTable({ items, loading: false })

    await vi.waitFor(() => {
      const headers = [...document.querySelectorAll('.ag-header-cell-text')].map(
        (header) => header.textContent,
      )
      expect(headers).toEqual(['№ п\\п', 'Категория', 'Наименование'])
    })
  })

  it('выводит строки в виде развёрнутого дерева', async () => {
    mountTable({ items, loading: false })

    await vi.waitFor(() => {
      expect(getColumnTexts('label')).toEqual([
        'Айтем 1',
        'Айтем 2',
        'Айтем 4',
        'Айтем 7',
        'Айтем 8',
        'Айтем 5',
        'Айтем 6',
        'Айтем 3',
      ])
    })
  })

  it('нумерует строки по порядку', async () => {
    mountTable({ items, loading: false })

    await vi.waitFor(() => {
      expect(getColumnTexts('rowNumber')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
    })
  })

  it('определяет категорию по наличию потомков', async () => {
    mountTable({ items, loading: false })

    await vi.waitFor(() => {
      expect(getCategories()).toEqual([
        'Группа',
        'Группа',
        'Группа',
        'Элемент',
        'Элемент',
        'Элемент',
        'Элемент',
        'Элемент',
      ])
    })
  })

  it('выделяет строки групп', async () => {
    mountTable({ items, loading: false })

    await vi.waitFor(() => {
      const groupLabels = [...document.querySelectorAll('.tree-table__row--group [col-id="label"]')]
        .sort((a, b) => getRowIndex(a) - getRowIndex(b))
        .map((cell) => cell.textContent)

      expect(groupLabels).toEqual(['Айтем 1', 'Айтем 2', 'Айтем 4'])
    })
  })

  it('обновляет строки при изменении items', async () => {
    const wrapper = mountTable({ items: [], loading: true })

    await wrapper.setProps({ items, loading: false })

    await vi.waitFor(() => {
      expect(getColumnTexts('label')).toHaveLength(8)
    })
  })

  it('по кнопке "+" отправляет событие add с id строки', async () => {
    const wrapper = mountTable({ items, loading: false })

    await vi.waitFor(() => {
      expect(getRowButton(1, 'add')).not.toBeNull()
    })
    getRowButton(1, 'add')!.click()

    expect(wrapper.emitted('add')).toEqual([['91064cef']])
  })

  it('по кнопке "x" отправляет событие remove с id строки', async () => {
    const wrapper = mountTable({ items, loading: false })

    await vi.waitFor(() => {
      expect(getRowButton(7, 'remove')).not.toBeNull()
    })
    getRowButton(7, 'remove')!.click()

    expect(wrapper.emitted('remove')).toEqual([[3]])
  })
})
