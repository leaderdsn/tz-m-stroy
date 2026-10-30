<template>
  <div class="history-controls">
    <button
      class="history-controls__button history-controls__button--undo"
      type="button"
      title="Отменить"
      :disabled="!canUndo"
      @click="emit('undo')"
    >
      ↶
    </button>
    <button
      class="history-controls__button history-controls__button--redo"
      type="button"
      title="Повторить"
      :disabled="!canRedo"
      @click="emit('redo')"
    >
      ↷
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  undo: []
  redo: []
}>()
</script>

<style scoped lang="sass">
.history-controls
  display: flex
  gap: 8px
  margin-bottom: 12px

.history-controls__button
  width: 32px
  height: 32px
  padding: 0
  border: 1px solid #c7c7c7
  border-radius: 4px
  background: #fff
  color: #1976d2
  font-size: 18px
  line-height: 1
  cursor: pointer

  &:hover:not(:disabled)
    background: #f0f0f0

  &:disabled
    color: #c7c7c7
    cursor: default
</style>
