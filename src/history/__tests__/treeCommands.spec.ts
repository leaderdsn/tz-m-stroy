import { beforeEach, describe, expect, it } from 'vitest'
import { AddItemCommand, RemoveItemCommand } from '../treeCommands'
import { TreeStore } from '@/store/TreeStore'
import type { Item, TreeItem, TreeItemId } from '@/types/tree'

const createItems = (): Item[] => [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: 2, parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 2, label: 'Айтем 3' },
  { id: 4, parent: 1, label: 'Айтем 4' },
]

const getIds = (items: TreeItem[]): TreeItemId[] => items.map((item) => item.id)

describe('treeCommands', () => {
  let store: TreeStore<Item>

  beforeEach(() => {
    store = new TreeStore(createItems())
  })

  describe('AddItemCommand', () => {
    const item: Item = { id: 5, parent: 2, label: 'Айтем 5' }

    it('добавляет элемент', () => {
      new AddItemCommand(store, item).execute()

      expect(store.getItem(5)).toBe(item)
      expect(getIds(store.getChildren(2))).toEqual([3, 5])
    })

    it('при отмене удаляет добавленный элемент', () => {
      const command = new AddItemCommand(store, item)
      command.execute()
      command.undo()

      expect(store.getItem(5)).toBeUndefined()
      expect(getIds(store.getAll())).toEqual([1, 2, 3, 4])
    })
  })

  describe('RemoveItemCommand', () => {
    it('удаляет элемент вместе с дочерними', () => {
      new RemoveItemCommand(store, 2).execute()

      expect(getIds(store.getAll())).toEqual([1, 4])
    })

    it('при отмене возвращает элементы на прежние места', () => {
      const command = new RemoveItemCommand(store, 2)
      command.execute()
      command.undo()

      expect(getIds(store.getAll())).toEqual([1, 2, 3, 4])
      expect(getIds(store.getChildren(1))).toEqual([2, 4])
      expect(getIds(store.getChildren(2))).toEqual([3])
    })

    it('повторно удаляет элемент после отмены', () => {
      const command = new RemoveItemCommand(store, 2)
      command.execute()
      command.undo()
      command.execute()

      expect(getIds(store.getAll())).toEqual([1, 4])
    })
  })
})
