import { bench, describe } from 'vitest'
import { TreeStore } from '../TreeStore'
import type { TreeItem } from '@/types/tree'

const ITEMS_COUNT = 100_000
const CHILDREN_PER_ITEM = 3

const getParentId = (id: number): number => Math.floor((id - 1) / CHILDREN_PER_ITEM)

const createTree = (count: number): TreeItem[] => {
  const items: TreeItem[] = [{ id: 0, parent: null }]

  for (let id = 1; id < count; id++) {
    items.push({ id, parent: getParentId(id) })
  }

  return items
}

const items = createTree(ITEMS_COUNT)
const lastId = ITEMS_COUNT - 1

describe(`TreeStore (${ITEMS_COUNT} элементов)`, () => {
  const store = new TreeStore(items)

  bench('setItems', () => {
    store.setItems(items)
  })

  bench('getAll', () => {
    store.getAll()
  })

  bench('getItem', () => {
    store.getItem(lastId)
  })

  bench('getChildren', () => {
    store.getChildren(1)
  })

  bench('getAllChildren (от корня)', () => {
    store.getAllChildren(0)
  })

  bench('getAllParents (от самого глубокого элемента)', () => {
    store.getAllParents(lastId)
  })

  bench('updateItem', () => {
    store.updateItem({ id: lastId, parent: getParentId(lastId) })
  })

  bench('addItem + removeItem', () => {
    store.addItem({ id: ITEMS_COUNT, parent: 0 })
    store.removeItem(ITEMS_COUNT)
  })
})
