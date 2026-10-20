import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import GarageOwnerSignup from './GarageOwnerSignup'

jest.mock('../contexts/AuthContext', () => ({ useAuth: jest.fn() }))

const mockedUseAuth = useAuth as jest.Mock

describe('GarageOwnerSignup', () => {
  it('registers an authenticated owner and sends them to shop onboarding', async () => {
    const register = jest.fn().mockResolvedValue(undefined)
    mockedUseAuth.mockReturnValue({ register })

    render(
      <MemoryRouter initialEntries={['/owners/signup']}>
        <Routes>
          <Route path="/owners/signup" element={<GarageOwnerSignup />} />
          <Route path="/onboarding/shop" element={<div>Shop onboarding reached</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('Owner / Business Name'), 'Jane Owner')
    await userEvent.type(screen.getByPlaceholderText('Business Email'), 'jane@example.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create Owner Account' }))

    expect(register).toHaveBeenCalledWith('jane@example.com', 'password123', 'shop_owner', 'Jane Owner')
    expect(await screen.findByText('Shop onboarding reached')).toBeInTheDocument()
  })

  it('shows a registration failure and stays on signup', async () => {
    const register = jest.fn().mockRejectedValue(new Error('network unavailable'))
    mockedUseAuth.mockReturnValue({ register })

    render(
      <MemoryRouter initialEntries={['/owners/signup']}>
        <Routes>
          <Route path="/owners/signup" element={<GarageOwnerSignup />} />
          <Route path="/onboarding/shop" element={<div>Shop onboarding reached</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByPlaceholderText('Owner / Business Name'), 'Jane Owner')
    await userEvent.type(screen.getByPlaceholderText('Business Email'), 'jane@example.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Create Owner Account' }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
    expect(screen.queryByText('Shop onboarding reached')).not.toBeInTheDocument()
  })
})
