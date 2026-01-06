import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import Dashboard from './Dashboard'

jest.mock('../services/api', () => {
  return {
    baysAPI: {
      list: jest.fn(async () => []),
      create: jest.fn(async () => ({})),
    },
    toolsAPI: {
      list: jest.fn(async () => []),
      create: jest.fn(async () => ({})),
    },
    bookingsAPI: {
      listForOwner: jest.fn(async () => [
        {
          id: 1,
          bay_id: 10,
          user_id: null,
          guest_name: 'Jane Doe',
          guest_email: 'jane@example.com',
          start_time: '2026-01-05T09:00:00.000Z',
          end_time: '2026-01-05T13:00:00.000Z',
          total_price: '120.0',
          stripe_payment_id: null,
          paid: false,
          status: 'pending',
          payment_status: 'unpaid',
          accepted_at: null,
          declined_at: null,
          bay: { id: 10, description: 'Lift bay', hourly_rate: '30.0' },
          booking_tools: [],
        },
      ]),
      accept: jest.fn(async () => ({ checkout_url: 'https://checkout.test/session', booking: {} })),
      decline: jest.fn(async () => ({})),
    },
  }
})

describe('Dashboard bookings', () => {
  it('opens the bookings modal and shows bookings', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    const button = await screen.findByRole('button', { name: /view bookings/i })
    await userEvent.click(button)

    expect(await screen.findByText('All Bookings')).toBeInTheDocument()
    expect(await screen.findByText('#1')).toBeInTheDocument()
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/jane@example\.com/i)).toBeInTheDocument()
  })
})
