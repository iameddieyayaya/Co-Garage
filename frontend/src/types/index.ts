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

export interface PublicShopSummary {
  id: number
  name: string
  location: string
}

export interface PublicShop {
  id: number
  name: string
  location: string
  description: string | null
  available_bays_count: number
  starting_hourly_rate: number | string | null
  available_tools_count: number
}

export interface PublicBay {
  id: number
  shop_id: number
  hourly_rate: number | string | null
  description: string | null
  available: boolean | null
  shop: PublicShopSummary
}

export interface PublicTool {
  id: number
  shop_id: number
  name: string | null
  description: string | null
  day_rate: number | string | null
  available: boolean | null
  shop: PublicShopSummary
}

export interface BookingToolLine {
  quantity: number
  tool: {
    id: number
    name: string | null
    description: string | null
    day_rate: number | string | null
  }
}

export interface Booking {
  id: number
  bay_id: number
  user_id: number | null
  guest_name: string | null
  guest_email: string | null
  start_time: string
  end_time: string
  total_price: number | string | null
  stripe_payment_id: string | null
  stripe_payment_intent_id?: string | null
  stripe_refund_id?: string | null
  paid: boolean
  status: 'pending' | 'accepted' | 'paid' | 'declined' | 'canceled'
  payment_status: 'unpaid' | 'invoice_sent' | 'paid' | 'refunded'
  accepted_at: string | null
  declined_at: string | null
  canceled_at?: string | null
  refunded_at?: string | null
  bay?: {
    id: number
    description: string | null
    hourly_rate: number | string | null
  }
  booking_tools?: BookingToolLine[]
}
