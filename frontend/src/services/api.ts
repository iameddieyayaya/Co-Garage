import axios from 'axios';
import type { Bay, Booking, PublicBay, PublicShop, PublicTool, Shop, Tool, User } from '../types';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  user: User;
}

export const userApi = {
  signup: async (data: SignupData): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>('/users', {
      user: data,
    });
    return response.data;
  },
};

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: { email: string; password: string; role: string; name?: string }) => {
    const response = await api.post('/auth/register', { user: data });
    return response.data;
  },
  me: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export interface CreateShopData {
  name: string;
  location: string;
  description?: string;
}

export const shopsAPI = {
  current: async (): Promise<Shop> => {
    const response = await api.get('/shops/current');
    return response.data;
  },
  create: async (data: CreateShopData): Promise<Shop> => {
    const response = await api.post('/shops', { shop: data });
    return response.data;
  },
};

export interface CreateBayData {
  description: string
  hourly_rate: number
  available?: boolean
}

export const baysAPI = {
  create: async (data: CreateBayData) => {
    const response = await api.post('/bays', { bay: data })
    return response.data
  },
  list: async (): Promise<Bay[]> => {
    const response = await api.get<Bay[]>('/bays')
    return response.data
  },
}

export interface CreateToolData {
  name: string
  description?: string
  day_rate: number
  available?: boolean
}

export const toolsAPI = {
  create: async (data: CreateToolData) => {
    const response = await api.post('/tools', { tool: data })
    return response.data
  },
  list: async (): Promise<Tool[]> => {
    const response = await api.get<Tool[]>('/tools')
    return response.data
  },
}

export const publicBaysAPI = {
  list: async (shop_id?: number): Promise<PublicBay[]> => {
    const response = await api.get<PublicBay[]>('/public/bays', { params: { shop_id } })
    return response.data
  },
}

export const publicToolsAPI = {
  list: async (shop_id?: number): Promise<PublicTool[]> => {
    const response = await api.get<PublicTool[]>('/public/tools', { params: { shop_id } })
    return response.data
  },
}

export const publicShopsAPI = {
  list: async (): Promise<PublicShop[]> => {
    const response = await api.get<PublicShop[]>('/public/shops')
    return response.data
  },
}

export type BookingDuration = 'half' | 'full'
export type BookingSlot = 'morning' | 'afternoon'

export interface CreateGuestBookingTool {
  tool_id: number
  quantity: number
}

export interface CreateGuestBookingData {
  bay_id: number
  guest_name: string
  guest_email: string
  rental_date: string
  duration: BookingDuration
  slot?: BookingSlot
  tools?: CreateGuestBookingTool[]
}

export const bookingsAPI = {
  createGuest: async (data: CreateGuestBookingData) => {
    const response = await api.post('/bookings', { booking: data })
    return response.data
  },
  listForOwner: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings')
    return response.data
  },
  accept: async (id: number): Promise<{ checkout_url: string; booking: Booking }> => {
    const response = await api.patch<{ checkout_url: string; booking: Booking }>(`/bookings/${id}/accept`)
    return response.data
  },
  decline: async (id: number): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}/decline`)
    return response.data
  },
  resendInvoice: async (id: number): Promise<{ email_sent: boolean }> => {
    const response = await api.patch<{ email_sent: boolean }>(`/bookings/${id}/resend_invoice`)
    return response.data
  },
  cancel: async (id: number): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}/cancel`)
    return response.data
  },
}

export interface StripeConnectStatus {
  stripe_account_id: string | null
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  ready_for_payouts: boolean
  platform_fee_percent: string
}

export const stripeConnectAPI = {
  status: async (): Promise<StripeConnectStatus> => {
    const response = await api.get<StripeConnectStatus>('/stripe_connect/status')
    return response.data
  },
  createAccount: async (): Promise<{ stripe_account_id: string }> => {
    const response = await api.post<{ stripe_account_id: string }>('/stripe_connect/create_account')
    return response.data
  },
  onboardingLink: async (): Promise<{ url: string }> => {
    const response = await api.post<{ url: string }>('/stripe_connect/onboarding_link')
    return response.data
  },
  loginLink: async (): Promise<{ url: string }> => {
    const response = await api.post<{ url: string }>('/stripe_connect/login_link')
    return response.data
  },
}

export default api;
