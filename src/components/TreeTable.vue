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
import type {
  ColDef,
  GetRowIdFunc,
  ICellRendererParams,
  ModelUpdatedEvent,
  RowClassRules,
} from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'
import type { TreeStore } from '@/store/TreeStore'
import type { Item } from '@/types/tree'

const props = defineProps<{
  items: Item[]
  loading: boolean
  store: TreeStore<Item>
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
    innerRenderer: (params: ICellRendererParams<Item>) => {
      return isGroup(params.data) ? 'Группа' : 'Элемент'
    },
  },
}

const rowClassRules: RowClassRules<Item> = {
  'tree-table__row--group': (params) => isGroup(params.data),
}

const getRowId: GetRowIdFunc<Item> = (params) => String(params.data.id)

const refreshRowNumbers = (event: ModelUpdatedEvent<Item>): void => {
  event.api.refreshCells({ columns: ['rowNumber'] })
}
</script>

<style scoped lang="sass">
.tree-table
  :deep(.tree-table__row--group)
    font-weight: 600
</style>
