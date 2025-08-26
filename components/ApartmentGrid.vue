<script setup lang="ts">
import type { Apartment, SortField } from '~/types'

interface Props {
  data: Apartment[]
}

defineProps<Props>()

const apartmentsStore = useApartmentsStore()
const { setSorting, getSortValue } = apartmentsStore

interface GridCell {
  name: string
  heading: string
  sortable: boolean
  srOnlyHeading?: string
}

const gridCells: GridCell[] = [
  {
    name: 'plan',
    heading: 'Планировка',
    sortable: false,
  },
  {
    name: 'flat',
    heading: 'Квартира',
    sortable: false,
  },
  {
    name: 'square',
    heading: 'S, м²',
    srOnlyHeading: 'Площадь, метр квадратный',
    sortable: true,
  },
  {
    name: 'floor',
    heading: 'Этаж',
    sortable: true,
  },
  {
    name: 'price',
    heading: 'Цена, ₽',
    sortable: true,
  },
]

function handleSort(field: string): void {
  setSorting(field as SortField)
}
</script>

<template>
  <div
    class="apartment-grid"
    role="table"
    :aria-colcount="gridCells.length"
    :aria-rowcount="data.length + 1"
    data-per-page="5"
  >
    <div role="rowgroup">
      <div
        class="apartment-grid__header"
        role="row"
        aria-rowindex="1"
      >
        <span
          v-for="(cell, index) in gridCells"
          :key="`cell-${index}-${cell.name}`"
          role="columnheader"
          :class="`cell-${cell.name}`"
          :aria-sort="cell.sortable ? getSortValue(cell.name as SortField) : undefined"
        >
          <SortButton
            v-if="cell.sortable"
            :label="cell.heading"
            :sort-value="getSortValue(cell.name as SortField)"
            @click="handleSort(cell.name)"
          >
            <template #sortLabel>
              <AccessibleHeading
                :name="cell.name"
                :label="cell.heading"
                :sr-only="cell.srOnlyHeading"
              />
            </template>
          </SortButton>
          <template v-else>
            <AccessibleHeading
              :name="cell.name"
              :label="cell.heading"
              :sr-only="cell.srOnlyHeading"
            />
          </template>
        </span>
      </div>
    </div>
    <div
      role="rowgroup"
      class="apartment-grid__list"
    >
      <ApartmentRow
        v-if="!data.length"
        :row-index="2"
      >
        Квартиры не найдены. Пожалуйста, измените параметры фильтра.
      </ApartmentRow>
      <ApartmentRow
        v-for="(apartment, index) in data"
        v-else
        :key="apartment.id"
        :data="apartment"
        :row-index="index + 2"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .apartment-grid {
  --apartment-gap: 20px;
  --apartment-grid-areas: 'plan title area floor price';
  --apartment-grid-columns: var(--apartment-plan-image-size) minmax(120px, 1fr) repeat(3, minmax(min-content, 120px));
  --apartment-plan-image-size: 80px;
  --header-grid-areas: var(--apartment-grid-areas);
  --header-grid-columns: var(--apartment-grid-columns);
  --layout-gap: 16px;
  --list-gap: 1px;

  display: flex;
  flex-direction: column;
  gap: var(--layout-gap);

  @media (width < $bp-md) {
    --apartment-gap: 16px 20px;
    --apartment-grid-areas: 'title title title plan' 'area floor price plan';
    --apartment-grid-columns: max-content max-content 1fr var(--apartment-plan-image-size);
    --layout-gap: 4px;
    --list-gap: var(--layout-gap);
    --row-gap: 16px;
  }

  @media (width < $bp-sm) {
    --apartment-grid-areas: 'title title plan' 'area floor plan' 'price price plan';
    --apartment-grid-columns: auto auto var(--apartment-plan-image-size);
  }

  &__header {
    display: grid;
    grid-template-areas: var(--header-grid-areas);
    grid-template-columns: var(--header-grid-columns);
    gap: var(--apartment-gap);
    font-size: 0.875rem;

    @media (width < $bp-md) {
      display: flex;
      gap: 0;

      > * {
        padding: 8px 10px;
      }

      .cell-plan,
      .cell-flat {
        display: none;
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--list-gap);
  }
}
</style>
