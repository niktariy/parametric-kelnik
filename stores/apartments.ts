import type {
  Apartment,
  AriaSortValue,
  FilterState,
  RoomType,
  SortField,
  SortState,
} from '~/types'
import { defineStore } from 'pinia'

const MIN_PRICE = 1_000_000
const MAX_PRICE = 100_000_000

const MIN_AREA = 0
const MAX_AREA = 300

export const useApartmentsStore = defineStore('apartments', () => {
  const allApartments = ref<Apartment[]>([])
  const displayedApartments = ref<Apartment[]>([])
  const currentPage = ref<number>(1)
  const initialItemsPerPage = 5
  const loadMoreItemsPerPage = 20
  const isLoading = ref<boolean>(true)

  const filters = ref<FilterState>({
    roomType: [],
    priceRange: {
      min: MIN_PRICE,
      max: MAX_PRICE,
    },
    areaRange: {
      min: MIN_AREA,
      max: MAX_AREA,
    },
  })

  const sortState = ref<SortState>({
    field: null,
    order: 'asc',
  })

  const filteredApartments = computed<Apartment[]>(() => {
    let filtered = allApartments.value.filter((apartment) => {
      const matchesRoomType
        = filters.value.roomType.length === 0
          || filters.value.roomType.includes(String(apartment.rooms) as RoomType)

      const matchesPrice
        = apartment.price >= filters.value.priceRange.min
          && apartment.price <= filters.value.priceRange.max

      const matchesArea
        = apartment.area >= filters.value.areaRange.min
          && apartment.area <= filters.value.areaRange.max

      return matchesRoomType && matchesPrice && matchesArea
    })

    if (sortState.value.field) {
      filtered = [...filtered].sort((a, b) => {
        const field = sortState.value.field!
        const order = sortState.value.order

        let aValue: number
        let bValue: number

        switch (field) {
          case 'area':
            aValue = a.area
            bValue = b.area
            break
          case 'price':
            aValue = a.price
            bValue = b.price
            break
          case 'floor':
            aValue = a.floor
            bValue = b.floor
            break
          default:
            return 0
        }

        const result = aValue - bValue
        return order === 'asc' ? result : -result
      })
    }

    return filtered
  })

  const canLoadMore = computed<boolean>(() => {
    return displayedApartments.value.length < filteredApartments.value.length
  })

  const totalFilteredCount = computed<number>(() => {
    return filteredApartments.value.length
  })

  const getItemsToShow = (): number => {
    if (currentPage.value === 1) {
      return initialItemsPerPage
    }
    return initialItemsPerPage + (currentPage.value - 1) * loadMoreItemsPerPage
  }

  const updateDisplayedApartments = (): void => {
    const itemsToShow = getItemsToShow()
    const newDisplayed = filteredApartments.value.slice(0, itemsToShow)

    if (
      JSON.stringify(displayedApartments.value) !== JSON.stringify(newDisplayed)
    ) {
      displayedApartments.value = newDisplayed
    }
  }

  const loadApartments = async (): Promise<void> => {
    try {
      isLoading.value = true
      const response = await $fetch<Apartment[]>('/data/apartments.json')
      allApartments.value = response

      const prices = response.map(apt => apt.price)
      const areas = response.map(apt => apt.area)
      const dynamicPriceMin = Math.min(...prices)
      const dynamicPriceMax = Math.max(...prices)
      const dynamicAreaMin = Math.min(...areas)
      const dynamicAreaMax = Math.max(...areas)

      if (
        filters.value.priceRange.min === MIN_PRICE
        && filters.value.priceRange.max === MAX_PRICE
      ) {
        filters.value.priceRange = {
          min: dynamicPriceMin,
          max: dynamicPriceMax,
        }
      }

      if (
        filters.value.areaRange.min === MIN_AREA
        && filters.value.areaRange.max === MAX_AREA
      ) {
        filters.value.areaRange = {
          min: dynamicAreaMin,
          max: dynamicAreaMax,
        }
      }

      if (import.meta.dev) {
        const savedFilters = localStorage.getItem('apartmentFilters')
        if (savedFilters) {
          try {
            const parsed = JSON.parse(savedFilters)
            filters.value = {
              ...filters.value,
              ...parsed,
              roomType: (parsed.roomType ?? []).map(String) as RoomType[],
            }
          }
          catch (e) {
            console.warn('Не удалось восстановить фильтры из localStorage', e)
          }
        }

        const savedSort = localStorage.getItem('apartmentSort')
        if (savedSort) {
          try {
            const parsed = JSON.parse(savedSort)
            sortState.value = {
              ...sortState.value,
              ...parsed,
            }
          }
          catch (e) {
            console.warn(
              'Не удалось восстановить сортировку из localStorage',
              e,
            )
          }
        }
      }

      currentPage.value = 1
      updateDisplayedApartments()
    }
    catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const loadMore = async (): Promise<void> => {
    if (isLoading.value || !canLoadMore.value)
      return

    try {
      isLoading.value = true

      await new Promise(resolve => setTimeout(resolve, 500))

      currentPage.value = currentPage.value + 1
      updateDisplayedApartments()
    }
    catch (error) {
      console.error('Ошибка загрузки дополнительных данных:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const updateFilters = async (
    newFilters: Partial<FilterState>,
  ): Promise<void> => {
    isLoading.value = true

    try {
      filters.value = {
        ...filters.value,
        ...newFilters,
      }

      currentPage.value = 1
      updateDisplayedApartments()

      if (import.meta.dev) {
        localStorage.setItem('apartmentFilters', JSON.stringify(filters.value))
      }
    }
    catch (error) {
      console.error('Ошибка при применении фильтров:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const resetFilters = async (): Promise<void> => {
    isLoading.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const prices = allApartments.value.map(apt => apt.price)
      const areas = allApartments.value.map(apt => apt.area)
      const dynamicPriceMin
        = prices.length > 0 ? Math.min(...prices) : MIN_PRICE
      const dynamicPriceMax
        = prices.length > 0 ? Math.max(...prices) : MAX_PRICE
      const dynamicAreaMin = areas.length > 0 ? Math.min(...areas) : MIN_AREA
      const dynamicAreaMax = areas.length > 0 ? Math.max(...areas) : MAX_AREA

      filters.value = {
        roomType: [],
        priceRange: { min: dynamicPriceMin, max: dynamicPriceMax },
        areaRange: { min: dynamicAreaMin, max: dynamicAreaMax },
      }

      if (import.meta.dev) {
        localStorage.setItem('apartmentFilters', JSON.stringify(filters.value))
      }

      currentPage.value = 1
      updateDisplayedApartments()
    }
    catch (error) {
      console.error('Ошибка при сбросе фильтров:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const getSortValue = (field: SortField): AriaSortValue => {
    if (sortState.value.field !== field) {
      return 'none'
    }

    return sortState.value.order === 'asc' ? 'ascending' : 'descending'
  }

  const setSorting = async (field: SortField): Promise<void> => {
    isLoading.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, 200))

      if (sortState.value.field === field) {
        if (sortState.value.order === 'desc') {
          sortState.value.field = null
          sortState.value.order = 'asc'
        }
        else if (sortState.value.order === 'asc') {
          sortState.value.order = 'desc'
        }
      }
      else {
        sortState.value.field = field
        sortState.value.order = 'asc'
      }

      if (import.meta.dev) {
        localStorage.setItem('apartmentSort', JSON.stringify(sortState.value))
      }

      updateDisplayedApartments()
    }
    catch (error) {
      console.error('Ошибка при изменении сортировки:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  const clearSorting = (): void => {
    sortState.value.field = null
    sortState.value.order = 'asc'

    if (import.meta.dev) {
      localStorage.setItem('apartmentSort', JSON.stringify(sortState.value))
    }

    currentPage.value = 1
    updateDisplayedApartments()
  }

  return {
    allApartments,
    displayedApartments,
    filteredApartments,
    filters,
    sortState,
    isLoading,
    canLoadMore,
    totalFilteredCount,
    loadApartments,
    loadMore,
    updateFilters,
    resetFilters,
    setSorting,
    clearSorting,
    getSortValue,
  }
})
