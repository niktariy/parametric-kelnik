export const roomTypeList = ['1', '2', '3', '4'] as const
export type RoomType = (typeof roomTypeList)[number]

export interface Apartment {
  id: number
  rooms: RoomType
  number: string
  area: number
  floor: number
  totalFloors: number
  price: number
  planImage: string
}

export interface PriceRange {
  min: number
  max: number
}

export interface AreaRange {
  min: number
  max: number
}

export type SortOrder = 'asc' | 'desc' | 'none'
export type AriaSortValue = 'ascending' | 'descending' | 'none' | 'other'

export type SortField = 'area' | 'price' | 'floor'

export interface SortState {
  field: SortField | null
  order: SortOrder
}

export interface FilterState {
  roomType: RoomType[]
  priceRange: PriceRange
  areaRange: AreaRange
}
