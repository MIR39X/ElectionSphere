import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

vi.mock('recharts', async () => {
  const React = await import('react')

  function ChartShell({ children, data, 'data-testid': testId = 'recharts-chart' }) {
    return (
      <div data-testid={testId}>
        {Array.isArray(data)
          ? data.map((item) => (
              <span key={`${item.id || item.name}-${item.voteCount}`}>{item.name || item.voteLabel}</span>
            ))
          : null}
        {children}
      </div>
    )
  }

  return {
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ChartShell,
    Bar: ({ children }) => <div data-testid="bar-series">{children}</div>,
    CartesianGrid: () => null,
    Cell: () => null,
    LabelList: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
  }
})
