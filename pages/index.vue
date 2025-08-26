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

          <div
            v-if="isLoading && !canLoadMore"
            class="apartments__loading"
          >
            Загрузка...
          </div>
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
  padding-block: 96px;

  @media (width < $bp-md) {
    padding-block: 48px;
  }
}

.apartments {
  --col-gap: 80px;
  --row-gap: 48px;

  display: grid;
  align-items: start;
  grid-template-areas: 'header filter' 'list filter';
  grid-template-columns: 1fr minmax(318px, 0.5fr);
  grid-template-rows: auto 1fr;
  gap: var(--row-gap) var(--col-gap);

  @media (width < $bp-md) {
    --col-gap: 28px;
    --row-gap: 24px;
  }

  @media (width < $bp-sm) {
    --row-gap: 24px;
    grid-template-areas: 'header' 'filter' 'list';
    grid-template-columns: 1fr;

    &__load-more {
      width: 100%;
    }
  }

  &__header {
    grid-area: header;
  }

  &__info {
    margin-top: 0.5rem;
  }

  &__count {
    font-size: 0.875rem;
    color: #666;
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
    padding: 40px 0;
    color: #666;
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
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    z-index: 10;
    font-size: 0.875rem;
    color: #666;
  }

  &__loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid transparent;
    border-top: 3px solid currentColor;
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
