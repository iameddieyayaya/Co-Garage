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
