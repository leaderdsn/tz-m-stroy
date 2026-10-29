<template>
  <main class="app">
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
import TreeTable from '@/components/TreeTable.vue'
import { fetchItems } from '@/api/items'
import { TreeStore } from '@/store/TreeStore'
import type { Item, TreeItemId } from '@/types/tree'

const store = new TreeStore<Item>([])
const items = shallowRef<Item[]>([])
const isLoading = ref(true)

onMounted(async () => {
  store.setItems(await fetchItems())
  items.value = store.getAll()
  isLoading.value = false
})

const addItem = (parentId: TreeItemId): void => {
  store.addItem({ id: crypto.randomUUID(), parent: parentId, label: 'Новый элемент' })
  items.value = store.getAll()
}

const removeItem = (id: TreeItemId): void => {
  store.removeItem(id)
  items.value = store.getAll()
}
</script>

<style scoped lang="sass">
.app
  padding: 24px
</style>
