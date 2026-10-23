import type { TreeItem, TreeItemId } from '@/types/tree'

export class TreeStore<T extends TreeItem = TreeItem> {
    private itemsById = new Map<TreeItemId, T>()
    private childrenByParentId = new Map<TreeItemId | null, Map<TreeItemId, T>>()
    private allItemsCache: T[] | null = null

    constructor(items: T[]) {
        this.setItems(items)
    }

    getAll(): T[] {
        this.allItemsCache ??= Array.from(this.itemsById.values())
        return this.allItemsCache
    }

    getItem(id: TreeItemId): T | undefined {
        return this.itemsById.get(id)
    }

    getChildren(id: TreeItemId): T[] {
        const childrenMap = this.childrenByParentId.get(id)
        return childrenMap ? Array.from(childrenMap.values()) : []
    }

    getAllChildren(id: TreeItemId): T[] {
        const result = this.getChildren(id)

        for (const item of result) {
            const children = this.childrenByParentId.get(item.id)
            if (!children) {
                continue
            }
            for (const child of children.values()) {
                result.push(child)
            }
        }

        return result
    }

    getAllParents(id: TreeItemId): T[] {
        const result: T[] = []
        let current = this.itemsById.get(id)

        while (current) {
            result.push(current)
            current = current.parent !== null ? this.itemsById.get(current.parent) : undefined
        }

        return result
    }

    setItems(items: T[]): void {
        this.itemsById.clear()
        this.childrenByParentId.clear()
        this.allItemsCache = null

        for (const item of items) {
            this.itemsById.set(item.id, item)
            this.attachToParent(item)
        }
    }

    addItem(item: T): void {
        if (this.itemsById.has(item.id)) {
            this.updateItem(item)
            return
        }

        this.itemsById.set(item.id, item)
        this.attachToParent(item)
        this.allItemsCache = null
    }

    removeItem(id: TreeItemId): void {
        const item = this.itemsById.get(id)
        if (!item) {
            return
        }

        this.detachFromParent(item)

        const removedItems = this.getAllChildren(id)
        removedItems.push(item)

        for (const removed of removedItems) {
            this.itemsById.delete(removed.id)
            this.childrenByParentId.delete(removed.id)
        }

        this.allItemsCache = null
    }

    updateItem(item: T): void {
        const prevItem = this.itemsById.get(item.id)
        if (!prevItem) {
            return
        }

        if (prevItem.parent !== item.parent) {
            this.detachFromParent(prevItem)
        }

        this.itemsById.set(item.id, item)
        this.attachToParent(item)
        this.allItemsCache = null
    }

    private attachToParent(item: T): void {
        let siblings = this.childrenByParentId.get(item.parent)

        if (!siblings) {
            siblings = new Map()
            this.childrenByParentId.set(item.parent, siblings)
        }

        siblings.set(item.id, item)
    }

    private detachFromParent(item: T): void {
        this.childrenByParentId.get(item.parent)?.delete(item.id)
    }
}
