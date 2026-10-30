<template>
  <main class="app">
    <HistoryControls :can-undo="canUndo" :can-redo="canRedo" @undo="undo" @redo="redo" />
    <TreeTable
      :store="store"
      :items="items"
      :loading="isLoading"
      @add="addItem"
      @remove="removeItem"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import HistoryControls from '@/components/HistoryControls.vue'
import TreeTable from '@/components/TreeTable.vue'
import { fetchItems } from '@/api/items'
import { History } from '@/history/History'
import { AddItemCommand, RemoveItemCommand } from '@/history/treeCommands'
import { TreeStore } from '@/store/TreeStore'
import type { Item, TreeItemId } from '@/types/tree'

const store = new TreeStore<Item>([])
const history = new History()
const items = shallowRef<Item[]>([])
const isLoading = ref(true)
const canUndo = ref(false)
const canRedo = ref(false)

const refresh = (): void => {
  items.value = store.getAll()
  canUndo.value = history.canUndo
  canRedo.value = history.canRedo
}

onMounted(async () => {
  store.setItems(await fetchItems())
  items.value = store.getAll()
  isLoading.value = false
})

const addItem = (parentId: TreeItemId): void => {
  const item = { id: crypto.randomUUID(), parent: parentId, label: 'Новый элемент' }
  history.execute(new AddItemCommand(store, item))
  refresh()
}

const removeItem = (id: TreeItemId): void => {
  history.execute(new RemoveItemCommand(store, id))
  refresh()
}

const undo = (): void => {
  history.undo()
  refresh()
}

const redo = (): void => {
  history.redo()
  refresh()
}
</script>

<style scoped lang="sass">
.app
  padding: 24px
</style>
