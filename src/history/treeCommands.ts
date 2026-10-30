import type { Command } from '@/history/History'
import type { TreeStore } from '@/store/TreeStore'
import type { TreeItem, TreeItemId } from '@/types/tree'

export class AddItemCommand<T extends TreeItem> implements Command {
  constructor(
    private store: TreeStore<T>,
    private item: T,
  ) {}

  execute(): void {
    this.store.addItem(this.item)
  }

  undo(): void {
    this.store.removeItem(this.item.id)
  }
}

export class RemoveItemCommand<T extends TreeItem> implements Command {
  private prevItems: T[] = []

  constructor(
    private store: TreeStore<T>,
    private id: TreeItemId,
  ) {}

  execute(): void {
    this.prevItems = this.store.getAll()
    this.store.removeItem(this.id)
  }

  undo(): void {
    // восстанавливаем весь список, а не только удалённые элементы,
    // чтобы строки вернулись на свои места, а не в конец
    this.store.setItems(this.prevItems)
  }
}
