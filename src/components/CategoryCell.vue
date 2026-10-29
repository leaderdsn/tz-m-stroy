<template>
  <div class="category-cell">
    <span class="category-cell__text">{{ isGroup ? 'Группа' : 'Элемент' }}</span>
    <button
      class="category-cell__button category-cell__button--add"
      type="button"
      title="Добавить дочерний элемент"
      @click="params.onAdd(id)"
    >
      +
    </button>
    <button
      class="category-cell__button category-cell__button--remove"
      type="button"
      title="Удалить"
      @click="params.onRemove(id)"
    >
      x
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ICellRendererParams } from 'ag-grid-community'
import type { Item, TreeItemId } from '@/types/tree'

export interface CategoryCellParams extends ICellRendererParams<Item> {
  isGroup: (item?: Item) => boolean
  onAdd: (id: TreeItemId) => void
  onRemove: (id: TreeItemId) => void
}

const props = defineProps<{
  params: CategoryCellParams
}>()

const id = computed(() => props.params.data!.id)
const isGroup = computed(() => props.params.isGroup(props.params.data))
</script>

<style scoped lang="sass">
.category-cell
  display: flex
  align-items: center
  gap: 8px

.category-cell__text
  min-width: 64px

.category-cell__button
  width: 22px
  height: 22px
  padding: 0
  border: 1px solid #c7c7c7
  border-radius: 4px
  background: #fff
  line-height: 1
  cursor: pointer

  &:hover
    background: #f0f0f0

.category-cell__button--remove:hover
  border-color: #e57373
  color: #d32f2f
</style>
