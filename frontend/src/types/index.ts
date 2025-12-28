export type UserRole = '' | 'shop_owner'

export interface User {
  id: number
  email: string
  role: UserRole
  name?: string
}

