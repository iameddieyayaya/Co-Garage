import '@testing-library/jest-dom'

class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error - test environment polyfill
globalThis.ResizeObserver = globalThis.ResizeObserver || NoopResizeObserver

// @ts-expect-error - test environment polyfill
globalThis.matchMedia =
  globalThis.matchMedia ||
  (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))

const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === 'string' ? args[0] : ''
    if (first.includes('ReactDOMTestUtils.act` is deprecated')) return
    if (first.includes('inside a test was not wrapped in act')) return
    originalConsoleError(...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
})
