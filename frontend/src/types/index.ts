export type UserRole = '' | 'shop_owner'

export interface User {
  id: number
  email: string
  role: UserRole
  name?: string
}

export interface Shop {
  id: number
  owner_id: number
  name: string
  location: string
  description?: string | null
  active?: boolean | null
}

export interface Bay {
  id: number
  shop_id: number
  hourly_rate: number | string | null
  description: string | null
  available: boolean | null
}

export interface Tool {
  id: number
  shop_id: number
  name: string | null
  description: string | null
  day_rate: number | string | null
  available: boolean | null
}
