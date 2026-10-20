import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './Navbar'
import Home from '../pages/Home'

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, logout: jest.fn() }),
}))

const LocationDisplay = () => {
  const { pathname, hash } = useLocation()
  return <output aria-label="Current location">{pathname}{hash}</output>
}

describe('Navbar section navigation', () => {
  const scrollIntoView = jest.fn()
  let originalScrollIntoView: PropertyDescriptor | undefined

  beforeEach(() => {
    originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    scrollIntoView.mockClear()
  })

  afterEach(() => {
    if (originalScrollIntoView) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView)
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
    }
  })

  it.each([
    ['Features', 'features'],
    ['How It Works', 'how-it-works'],
  ])('navigates from booking to the %s section', async (label, sectionId) => {
    render(
      <MemoryRouter initialEntries={['/book']}>
        <Navbar />
        <LocationDisplay />
        <Routes>
          <Route path="/book" element={<h1>Book a bay</h1>} />
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Book a bay' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: label, exact: true }))

    expect(screen.getByRole('heading', { name: 'Own Your Garage Experience' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Book a bay' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Current location')).toHaveTextContent(`/#${sectionId}`)
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(scrollIntoView.mock.instances).toContain(document.getElementById(sectionId))
  })
})
