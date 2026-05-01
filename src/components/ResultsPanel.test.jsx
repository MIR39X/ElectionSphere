import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultsPanel } from './ResultsPanel'
import { candidates, election, renderWithRouter, totals } from '../test/fixtures'

describe('ResultsPanel', () => {
  it('renders live tally and operational snapshot', () => {
    renderWithRouter(<ResultsPanel candidates={candidates} election={election} totals={totals} />)

    expect(screen.getByText('Real-Time Vote Distribution')).toBeInTheDocument()
    expect(screen.getByText('Operational Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Registered voters')).toBeInTheDocument()
    expect(screen.getAllByText('Ayesha Noor').length).toBeGreaterThan(0)
  })
})
