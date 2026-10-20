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
        {
          id: 2,
          name: 'Budget Auto',
          location: 'Austin, TX',
          available_bays_count: 0,
          starting_hourly_rate: '10',
          available_tools_count: 0,
        },
        {
          id: 3,
          name: 'Premium Motors',
          location: 'San Diego, CA',
          available_bays_count: 1,
          starting_hourly_rate: '45.50',
          available_tools_count: 2,
        },
        {
          id: 4,
          name: 'Community Workshop',
          location: 'Portland, OR',
          available_bays_count: 1,
          starting_hourly_rate: null,
          available_tools_count: 0,
        },
        {
          id: 5,
          name: 'Unknown Rate Garage',
          location: 'Austin, TX',
          available_bays_count: 1,
          starting_hourly_rate: '20oops',
          available_tools_count: 0,
        },
        {
          id: 6,
          name: 'Free Workshop',
          location: 'Portland, OR',
          available_bays_count: 1,
          starting_hourly_rate: 0,
          available_tools_count: 0,
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

    await userEvent.click(screen.getAllByRole('button', { name: /request booking/i })[0])

    await waitFor(() => {
      expect(screen.getByText(/Request booking — Alice's Garage/i)).toBeInTheDocument()
    })
    expect(await screen.findByText('Lift bay ($20/hr)')).toBeInTheDocument()
    expect(await screen.findByText('Torque Wrench')).toBeInTheDocument()
  })

  const allShops = ["Alice's Garage", 'Budget Auto', 'Premium Motors', 'Community Workshop', 'Unknown Rate Garage', 'Free Workshop']
  const shopNames = () => screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
  const renderShops = async () => {
    render(<ToastProvider><Booking /></ToastProvider>)
    await screen.findByRole('heading', { name: "Alice's Garage" })
  }

  it('matches trimmed, case-insensitive names and locations and preserves API order', async () => {
    await renderShops()
    const search = screen.getByRole('searchbox', { name: 'Search shops' })
    await userEvent.type(search, '  aLiCe  ')
    expect(shopNames()).toEqual(["Alice's Garage"])
    await userEvent.clear(search)
    await userEvent.type(search, 'sAN dIEGo')
    expect(shopNames()).toEqual(["Alice's Garage", 'Premium Motors'])
    await userEvent.clear(search)
    await userEvent.type(search, '   ')
    expect(shopNames()).toEqual(allShops)
  })

  it('applies an inclusive maximum, excluding missing and malformed rates only while active', async () => {
    await renderShops()
    const maximum = screen.getByRole('spinbutton', { name: 'Maximum starting rate ($/hr)' })
    await userEvent.type(maximum, '20')
    expect(shopNames()).toEqual(["Alice's Garage", 'Budget Auto', 'Free Workshop'])
    await userEvent.clear(maximum)
    await userEvent.type(maximum, '45.50')
    expect(shopNames()).toEqual(["Alice's Garage", 'Budget Auto', 'Premium Motors', 'Free Workshop'])
    await userEvent.clear(maximum)
    await userEvent.type(maximum, '0')
    expect(shopNames()).toEqual(['Free Workshop'])
    await userEvent.clear(maximum)
    await userEvent.type(maximum, '-1')
    expect(shopNames()).toEqual(allShops)
    await userEvent.clear(maximum)
    expect(shopNames()).toEqual(allShops)
  })

  it('hides shops without available bays only when requested', async () => {
    await renderShops()
    expect(screen.getByRole('button', { name: 'No bays available' })).toBeDisabled()
    const available = screen.getByRole('checkbox', { name: 'Available bays only' })
    await userEvent.click(available)
    expect(shopNames()).toEqual(allShops.filter((name) => name !== 'Budget Auto'))
    await userEvent.click(available)
    expect(shopNames()).toEqual(allShops)
    expect(screen.getByRole('button', { name: 'No bays available' })).toBeDisabled()
  })

  it('combines all filters and resets all controls after no matches', async () => {
    await renderShops()
    const search = screen.getByRole('searchbox', { name: 'Search shops' })
    const maximum = screen.getByRole('spinbutton', { name: 'Maximum starting rate ($/hr)' })
    const available = screen.getByRole('checkbox', { name: 'Available bays only' })
    await userEvent.type(maximum, '20')
    await userEvent.click(available)
    await userEvent.type(search, 'san diego')
    expect(shopNames()).toEqual(["Alice's Garage"])
    await userEvent.clear(search)
    await userEvent.type(search, 'austin')
    expect(shopNames()).toEqual([])
    expect(screen.getByRole('status')).toHaveTextContent('No shops match your filters.')
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(search).toHaveValue('')
    expect(maximum).toHaveValue(null)
    expect(available).not.toBeChecked()
    expect(shopNames()).toEqual(allShops)
    expect(screen.queryByText('No shops match your filters.')).not.toBeInTheDocument()
  })
})
