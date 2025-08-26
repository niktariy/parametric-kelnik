<script setup lang="ts">
import type { AriaSortValue } from '~/types'

interface SortButtonProps {
  label?: string
  sortValue: AriaSortValue | undefined
}

const props = defineProps<SortButtonProps>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const isSortActive = computed(() => {
  return props.sortValue && props.sortValue !== 'none'
})

function handleClick(event: MouseEvent) {
  event.preventDefault()
  emit('click', event)
}
</script>

<template>
  <button
    class="sort-button"
    :class="isSortActive && 'is-active'"
    type="button"
    @click="handleClick"
  >
    <slot name="sortLabel">
      {{ label }}
    </slot>
    <span
      class="sort-button__indicator"
      aria-hidden="true"
    >
      <Icon
        name="mingcute:up-line"
        class="sort-button__icon sort-button__icon--asc"
      />
      <Icon
        name="mingcute:down-line"
        class="sort-button__icon sort-button__icon--desc"
      />
    </span>
  </button>
</template>

<style lang="scss" scoped>
  .sort-button {
    display: flex;
    gap: 0.5rem;
    height: 1.25rem;
    font-weight: inherit;
    color: inherit;
    background-color: transparent;
    border: none;
    cursor: pointer;

    &.is-active {
      color: $sort-actvie-color;
    }

    &__indicator {
      display: flex;
      flex-direction: column;
    }

    &__icon {
      color: rgba($main-font-color, 0.4);
      transition: color 0.2s ease;
      transform: scale(1.25);

      :where([aria-sort='ascending']) &--asc,
      :where([aria-sort='descending']) &--desc {
        color: currentColor;
      }
    }
  }
</style>
