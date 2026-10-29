<template>
  <AgGridVue
    class="tree-table"
    :modules="modules"
    :row-data="items"
    :column-defs="columnDefs"
    :auto-group-column-def="autoGroupColumnDef"
    :get-row-id="getRowId"
    :row-class-rules="rowClassRules"
    :loading="loading"
    :group-default-expanded="-1"
    tree-data
    tree-data-parent-id-field="parent"
    dom-layout="autoHeight"
    @model-updated="refreshRowNumbers"
  />
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule } from 'ag-grid-community'
import type { ColDef, GetRowIdFunc, ModelUpdatedEvent, RowClassRules } from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import CategoryCell from '@/components/CategoryCell.vue'
import type { CategoryCellParams } from '@/components/CategoryCell.vue'
import type { TreeStore } from '@/store/TreeStore'
import type { Item, TreeItemId } from '@/types/tree'

const props = defineProps<{
  items: Item[]
  loading: boolean
  store: TreeStore<Item>
}>()

const emit = defineEmits<{
  add: [parentId: TreeItemId]
  remove: [id: TreeItemId]
}>()

const modules = [AllCommunityModule, TreeDataModule]

const isGroup = (item?: Item): boolean => {
  return !!item && props.store.getChildren(item.id).length > 0
}

const columnDefs: ColDef<Item>[] = [
  {
    colId: 'rowNumber',
    headerName: '№ п\\п',
    width: 90,
    pinned: 'left',
    valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
  },
  {
    field: 'label',
    headerName: 'Наименование',
    flex: 1,
  },
]

const autoGroupColumnDef: ColDef<Item> = {
  headerName: 'Категория',
  flex: 1,
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: CategoryCell,
    innerRendererParams: {
      isGroup,
      onAdd: (id) => emit('add', id),
      onRemove: (id) => emit('remove', id),
    } satisfies Partial<CategoryCellParams>,
  },
}

const rowClassRules: RowClassRules<Item> = {
  'tree-table__row--group': (params) => isGroup(params.data),
}

const getRowId: GetRowIdFunc<Item> = (params) => String(params.data.id)

const refreshRowNumbers = (event: ModelUpdatedEvent<Item>): void => {
  // категория и выделение группы зависят от потомков, а не от данных самой строки
  event.api.refreshCells({ columns: ['rowNumber', 'ag-Grid-AutoColumn'], force: true })
}
</script>

<style scoped lang="sass">
.tree-table
  :deep(.tree-table__row--group)
    font-weight: 600
</style>
