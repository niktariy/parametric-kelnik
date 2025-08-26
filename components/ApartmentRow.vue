<script setup lang="ts">
import type { Apartment } from '~/types'

interface Props {
  data?: Apartment
  rowIndex: number
}

const props = defineProps<Props>()

const apartment = props.data

const formattedPrice = computed(() => {
  return apartment?.price.toLocaleString('ru-RU')
})

const apartmentTitle = computed(() => {
  return `${apartment?.rooms.toString()}-комнатная №${apartment?.number}`
})
</script>

<template>
  <div
    class="apartment"
    :class="{ 'apartment--empty': !apartment }"
    role="row"
    :aria-rowindex="rowIndex"
  >
    <template v-if="apartment">
      <span
        class="apartment__plan"
        role="cell"
      >
        <img
          :src="apartment.planImage"
          alt=""
          fetchpriority="high"
          loading="eager"
          width="80"
          height="80"
        >
      </span>
      <span
        class="apartment__title"
        role="cell"
      >
        {{ apartmentTitle }}
      </span>
      <span
        class="apartment__area"
        role="cell"
        aria-describedby="square_aria_label"
      >
        {{ apartment.area }}<span class="hide-md-up">&nbsp;м²</span>
      </span>
      <span
        class="apartment__floor"
        role="cell"
      >
        <span class="apartment__floor-current">
          {{ apartment.floor }}
        </span>
        <span class="apartment__floor-total">
          из&nbsp;{{ apartment.totalFloors }}
          <span class="hide-md-up">этаж</span>
        </span>
      </span>
      <span
        class="apartment__price"
        role="cell"
      >
        {{ formattedPrice }}
        <span class="hide-md-up">&nbsp;₽</span>
      </span>
    </template>
    <span
      v-else
      class="no-data"
    >Квартиры не найдены. Пожалуйста, измените параметры фильтра.</span>
  </div>
</template>

<style lang="scss" scoped>
  .apartment {
  --card-border-width: 1px 0 0 0;
  --card-fsz: 1rem;
  --card-padding-block: 1rem 1.5rem;
  --card-padding-inline: 0;

  display: grid;
  grid-template-areas: var(--apartment-grid-areas);
  grid-template-columns: var(--apartment-grid-columns);
  gap: var(--apartment-gap);
  padding-inline: var(--card-padding-inline);
  padding-block: var(--card-padding-block);
  border: $card-border;
  border-width: var(--card-border-width);
  font-size: var(--card-fsz);
  line-height: 1.25rem;

  &--empty {
    display: flex;
  }

  &:last-child {
    border-bottom-width: 1px;
  }

  @media (width < $bp-md) {
    --card-border-width: 1px;
    --card-fsz: 0.875rem;
    --card-padding-block: 1rem;
    --card-padding-inline: 1.5rem;

    border-radius: $card-radius;
    font-weight: 500;
  }

  &__plan {
    grid-area: plan;

    img {
      display: block;
      aspect-ratio: 1/1;
      width: 100%;
      max-width: var(--apartment-plan-image-size);
      max-height: var(--apartment-plan-image-size);
      object-fit: contain;
    }
  }

  &__title {
    grid-area: title;
    font-weight: 500;
  }

  &__area {
    grid-area: area;
  }

  &__floor {
    grid-area: floor;
  }

  &__floor-total {
    opacity: 0.5;
    font-weight: 400;
  }

  &__price {
    grid-area: price;
  }
}
</style>
