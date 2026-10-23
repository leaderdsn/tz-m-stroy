import { beforeEach, describe, expect, it } from 'vitest'
import { TreeStore } from '../TreeStore'
import type { TreeItem, TreeItemId } from '@/types/tree'

interface Item extends TreeItem {
  label: string
}

const createItems = (): Item[] => [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cef', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cef', label: 'Айтем 4' },
  { id: 5, parent: '91064cef', label: 'Айтем 5' },
  { id: 6, parent: '91064cef', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

const getIds = (items: TreeItem[]): TreeItemId[] => items.map((item) => item.id)

describe('TreeStore', () => {
  let store: TreeStore<Item>

  beforeEach(() => {
    store = new TreeStore(createItems())
  })

  describe('getAll', () => {
    it('возвращает все элементы', () => {
      expect(getIds(store.getAll())).toEqual([1, '91064cef', 3, 4, 5, 6, 7, 8])
    })

    it('возвращает пустой массив для пустого хранилища', () => {
      expect(new TreeStore([]).getAll()).toEqual([])
    })
  })

  describe('getItem', () => {
    it('возвращает элемент по числовому id', () => {
      expect(store.getItem(7)).toEqual({ id: 7, parent: 4, label: 'Айтем 7' })
    })

    it('возвращает элемент по строковому id', () => {
      expect(store.getItem('91064cef')?.label).toBe('Айтем 2')
    })

    it('возвращает undefined для несуществующего id', () => {
      expect(store.getItem(100)).toBeUndefined()
    })

    it('различает числовой и строковый id', () => {
      expect(store.getItem('1')).toBeUndefined()
    })
  })

  describe('getChildren', () => {
    it('возвращает прямых потомков', () => {
      expect(getIds(store.getChildren('91064cef'))).toEqual([4, 5, 6])
    })

    it('возвращает пустой массив для элемента без потомков', () => {
      expect(store.getChildren(5)).toEqual([])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getChildren(100)).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('возвращает потомков всех уровней', () => {
      const ids = getIds(store.getAllChildren('91064cef'))

      expect(ids).toHaveLength(5)
      expect(ids).toEqual(expect.arrayContaining([4, 5, 6, 7, 8]))
    })

    it('возвращает пустой массив для элемента без потомков', () => {
      expect(store.getAllChildren(8)).toEqual([])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getAllChildren(100)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('возвращает цепочку от элемента до корня', () => {
      expect(getIds(store.getAllParents(7))).toEqual([7, 4, '91064cef', 1])
    })

    it('для корня возвращает только сам элемент', () => {
      expect(getIds(store.getAllParents(1))).toEqual([1])
    })

    it('возвращает пустой массив для несуществующего id', () => {
      expect(store.getAllParents(100)).toEqual([])
    })
  })

  describe('setItems', () => {
    it('полностью заменяет элементы', () => {
      store.setItems([{ id: 'a', parent: null, label: 'Новый' }])

      expect(getIds(store.getAll())).toEqual(['a'])
      expect(store.getItem(1)).toBeUndefined()
      expect(store.getChildren(1)).toEqual([])
    })
  })

  describe('addItem', () => {
    it('добавляет элемент в хранилище и к потомкам родителя', () => {
      store.addItem({ id: 9, parent: 8, label: 'Айтем 9' })

      expect(store.getItem(9)?.label).toBe('Айтем 9')
      expect(getIds(store.getChildren(8))).toEqual([9])
      expect(getIds(store.getAll())).toContain(9)
      expect(getIds(store.getAllParents(9))).toEqual([9, 8, 4, '91064cef', 1])
    })

    it('обновляет элемент, если id уже существует', () => {
      store.addItem({ id: 5, parent: 3, label: 'Айтем 5 (обновлён)' })

      expect(store.getAll()).toHaveLength(8)
      expect(store.getItem(5)?.label).toBe('Айтем 5 (обновлён)')
      expect(getIds(store.getChildren(3))).toEqual([5])
    })
  })

  describe('removeItem', () => {
    it('удаляет элемент вместе со всеми потомками', () => {
      store.removeItem('91064cef')

      expect(getIds(store.getAll())).toEqual([1, 3])
      expect(store.getItem(7)).toBeUndefined()
      expect(store.getChildren(4)).toEqual([])
    })

    it('удаляет элемент из потомков родителя', () => {
      store.removeItem(3)

      expect(getIds(store.getChildren(1))).toEqual(['91064cef'])
    })

    it('ничего не делает для несуществующего id', () => {
      store.removeItem(100)

      expect(store.getAll()).toHaveLength(8)
    })
  })

  describe('updateItem', () => {
    it('обновляет поля элемента', () => {
      store.updateItem({ id: 7, parent: 4, label: 'Айтем 7 (обновлён)' })

      expect(store.getItem(7)?.label).toBe('Айтем 7 (обновлён)')
      expect(store.getAll().find((item) => item.id === 7)?.label).toBe('Айтем 7 (обновлён)')
    })

    it('сохраняет позицию элемента среди соседних', () => {
      store.updateItem({ id: 4, parent: '91064cef', label: 'Айтем 4 (обновлён)' })

      expect(getIds(store.getChildren('91064cef'))).toEqual([4, 5, 6])
    })

    it('переносит элемент к новому родителю', () => {
      store.updateItem({ id: 4, parent: 3, label: 'Айтем 4' })

      expect(getIds(store.getChildren('91064cef'))).toEqual([5, 6])
      expect(getIds(store.getChildren(3))).toEqual([4])
      expect(getIds(store.getAllParents(7))).toEqual([7, 4, 3, 1])
    })

    it('ничего не делает для несуществующего id', () => {
      store.updateItem({ id: 100, parent: 1, label: 'Айтем 100' })

      expect(store.getItem(100)).toBeUndefined()
      expect(store.getAll()).toHaveLength(8)
    })
  })
})
