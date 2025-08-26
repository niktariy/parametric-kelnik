<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useApartmentsStore } from '~/stores/apartments'

const apartmentsStore = useApartmentsStore()

const { displayedApartments, isLoading, canLoadMore, totalFilteredCount }
    = storeToRefs(apartmentsStore)

const { loadApartments, loadMore } = apartmentsStore

onMounted(async () => {
  await loadApartments()
})
</script>

<template>
  <main class="main">
    <div class="container">
      <section class="apartments">
        <header class="apartments__header">
          <h1 class="apartments__title">
            Квартиры
          </h1>
        </header>

        <div
          role="complementary"
          class="apartments__filter"
        >
          <ApartmentFilter />
        </div>

        <div class="apartments__content">
          <div
            v-if="isLoading"
            class="apartments__loading-overlay"
          >
            <div class="apartments__loading-spinner" />
            <span>Обновляем данные...</span>
          </div>

          <ApartmentGrid :data="displayedApartments" />
        </div>
        <div
          v-if="canLoadMore"
          class="apartments__pagination"
        >
          <UiButton
            class="apartments__load-more"
            variant="outlined"
            :loading="isLoading"
            @click="loadMore"
          >
            <span class="sr-only">
              Показано {{ displayedApartments.length }} из
              {{ totalFilteredCount }} квартир
            </span>
            Загрузить ещё
          </UiButton>
        </div>
      </section>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.main {
  min-height: 100vh;
  padding-block: 6rem;

  @media (width < $bp-md) {
    padding-block: 3rem;
  }
}

.apartments {
  --col-gap: 5rem;
  --row-gap: 3rem;
  --grid-areas: 'header filter' 'list filter';
  --grid-columns: 1fr minmax(318px, 0.5fr);

  display: grid;
  align-items: start;
  grid-template-areas: var(--grid-areas);
  grid-template-columns: var(--grid-columns);
  grid-template-rows: auto 1fr;
  gap: var(--row-gap) var(--col-gap);

  @media (width < $bp-md) {
    --col-gap: 1.75rem;
    --row-gap: 1.5rem;
  }

  @media (width < $bp-sm) {
    --grid-areas: 'header' 'filter' 'list';
    --grid-columns: 1fr;

    &__load-more {
      width: 100%;
    }
  }

  &__header {
    grid-area: header;
  }

  &__filter {
    grid-area: filter;
  }

  &__content {
    grid-area: list;
    position: relative;
  }

  &__loading {
    text-align: center;
    padding: 2.5rem 0;
  }

  &__loading-overlay {
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
    background: rgba($white, 0.9);
    border-radius: inherit;
    z-index: 10;
    font-size: 0.875rem;
  }

  &__loading-spinner {
    width: 2rem;
    height: 2rem;
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
