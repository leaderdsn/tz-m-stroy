<template>
  <main class="app">
    <TreeTable :store="store" :items="items" :loading="isLoading" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue'
import TreeTable from '@/components/TreeTable.vue'
import { fetchItems } from '@/api/items'
import { TreeStore } from '@/store/TreeStore'
import type { Item } from '@/types/tree'

const store = new TreeStore<Item>([])
const items = shallowRef<Item[]>([])
const isLoading = ref(true)

onMounted(async () => {
  store.setItems(await fetchItems())
  items.value = store.getAll()
  isLoading.value = false
})
</script>

<style scoped lang="sass">
.app
  padding: 24px
</style>
