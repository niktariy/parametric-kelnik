<script setup lang="ts">
import type { RoomType } from '~/types'
import { storeToRefs } from 'pinia'
import { useApartmentsStore } from '~/stores/apartments'
import { roomTypeList } from '~/types'

const apartmentsStore = useApartmentsStore()
const { allApartments, filters, isLoading } = storeToRefs(apartmentsStore)

const absolutePriceValues = computed(() => {
  if (allApartments.value.length === 0)
    return { min: 0, max: 100000000 }

  const min = Math.min(...allApartments.value.map(apt => apt.price))
  const max = Math.max(...allApartments.value.map(apt => apt.price))
  return { min, max }
})

const absoluteAreaValues = computed(() => {
  if (allApartments.value.length === 0)
    return { min: 10, max: 300 }

  const min = Math.min(...allApartments.value.map(apt => apt.area))
  const max = Math.max(...allApartments.value.map(apt => apt.area))
  return { min, max }
})

async function updatePriceRange(range: { min: number, max: number }) {
  await apartmentsStore.updateFilters({
    priceRange: range,
  })
}

async function updateAreaRange(range: { min: number, max: number }) {
  await apartmentsStore.updateFilters({
    areaRange: range,
  })
}
function getMatchingRoomCounts() {
  const { roomType: _ignore, ...restFilters } = filters.value

  return allApartments.value
    .filter((apt) => {
      return (
        apt.price >= restFilters.priceRange.min
        && apt.price <= restFilters.priceRange.max
        && apt.area >= restFilters.areaRange.min
        && apt.area <= restFilters.areaRange.max
      )
    })
    .reduce((acc, apt) => {
      acc[apt.rooms] = (acc[apt.rooms] || 0) + 1
      return acc
    }, {} as Record<RoomType, number>)
}

const roomTypes = computed(() => {
  const roomCounts = getMatchingRoomCounts()

  return roomTypeList.map(value => ({
    value,
    label: `${value}к`,
    disabled: !roomCounts[value],
  }))
})

const selectedRooms = computed<RoomType[]>({
  get: () => filters.value.roomType ?? [],
  set: async (val) => {
    await apartmentsStore.updateFilters({ roomType: val })
  },
})

const hasActiveFilters = computed(() => {
  const hasRoomTypeFilter = filters.value.roomType.length > 0

  const hasPriceFilter
      = filters.value.priceRange.min !== absolutePriceValues.value.min
        || filters.value.priceRange.max !== absolutePriceValues.value.max

  const hasAreaFilter
      = filters.value.areaRange.min !== absoluteAreaValues.value.min
        || filters.value.areaRange.max !== absoluteAreaValues.value.max

  return hasRoomTypeFilter || hasPriceFilter || hasAreaFilter
})

async function resetFilters() {
  await apartmentsStore.resetFilters()
}
</script>

<template>
  <form
    class="apartment-filter"
    aria-label="Фильтры квартир"
  >
    <fieldset
      class="apartment-filter__room-types"
      :disabled="isLoading"
    >
      <legend class="sr-only">
        Количество комнат
      </legend>

      <ControlCheckbox
        v-for="roomType in roomTypes"
        :key="roomType.value"
        v-model="selectedRooms"
        :control-value="roomType.value"
        :label="roomType.label"
        :disabled="roomType.disabled || isLoading"
      />
    </fieldset>

    <ControlRange
      label="Стоимость квартиры, ₽"
      :min-value="filters.priceRange.min"
      :max-value="filters.priceRange.max"
      :absolute-min="absolutePriceValues.min"
      :absolute-max="absolutePriceValues.max"
      :step="50000"
      :format-as-price="true"
      :disabled="isLoading"
      @update:range="updatePriceRange"
    />

    <ControlRange
      label="Площадь, м²"
      :min-value="filters.areaRange.min"
      :max-value="filters.areaRange.max"
      :absolute-min="absoluteAreaValues.min"
      :absolute-max="absoluteAreaValues.max"
      :step="1"
      :disabled="isLoading"
      @update:range="updateAreaRange"
    />

    <UiButton
      v-if="hasActiveFilters"
      class="apartment-filter__reset"
      variant="text"
      size="small"
      :disabled="isLoading"
      @click="resetFilters"
    >
      <template #trailingIcon>
        <Icon
          name="mingcute:close-fill"
          style="color: currentColor"
        />
      </template>
      Сбросить параметры
    </UiButton>

    <div
      v-if="isLoading"
      class="apartment-filter__loading"
    >
      <div class="apartment-filter__loading-spinner" />
      <span>Применяем фильтры...</span>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  .apartment-filter {
  --filter-padding: 2.5rem;

  display: flex;
  flex-direction: column;
  align-items: start;
  padding: var(--filter-padding);
  gap: 1.5rem;
  flex-shrink: 0;
  position: relative;

  background: $filter-background;
  border-radius: $filter-radius;

  @media (width < $bp-md) {
    --filter-padding: 1.25rem;
  }

  &__section {
    width: 100%;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__room-types {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;

    &:disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }

  &__reset {
    @media (width < $bp-sm) {
      width: 100%;
    }
  }

  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: rgba($white, 0.7);
    border-radius: $filter-radius;
    z-index: 10;
    font-size: 0.875rem;
    color: $main-font-color;
  }

  &__loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
