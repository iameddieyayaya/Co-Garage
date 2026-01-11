import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Booking from './Booking'
import { ToastProvider } from '../components/ToastProvider'

jest.mock('../services/api', () => {
  return {
    publicShopsAPI: {
      list: jest.fn(async () => [
        {
          id: 1,
          name: "Alice's Garage",
          location: 'San Diego, CA',
          description: 'DIY garage',
          available_bays_count: 2,
          starting_hourly_rate: 20,
          available_tools_count: 3,
        },
      ]),
    },
    publicBaysAPI: {
      list: jest.fn(async () => [
        {
          id: 11,
          shop_id: 1,
          hourly_rate: 20,
          description: 'Lift bay',
          available: true,
          shop: { id: 1, name: "Alice's Garage", location: 'San Diego, CA' },
        },
      ]),
    },
    publicToolsAPI: {
      list: jest.fn(async () => [
        {
          id: 21,
          shop_id: 1,
          name: 'Torque Wrench',
          description: 'Precision',
          day_rate: 10,
          available: true,
          shop: { id: 1, name: "Alice's Garage", location: 'San Diego, CA' },
        },
      ]),
    },
    bookingsAPI: {
      createGuest: jest.fn(async () => ({ id: 999 })),
    },
  }
})

describe('Booking page', () => {
  it('lists shops and opens booking modal', async () => {
    render(
      <ToastProvider>
        <Booking />
      </ToastProvider>
    )

    expect(await screen.findByText("Alice's Garage")).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /request booking/i }))

    await waitFor(() => {
      expect(screen.getByText(/Request booking — Alice's Garage/i)).toBeInTheDocument()
    })
    expect(await screen.findByText('Lift bay ($20/hr)')).toBeInTheDocument()
    expect(await screen.findByText('Torque Wrench')).toBeInTheDocument()
  })
})
