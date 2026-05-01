import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultsView } from './ResultsView'
import { candidates, election, renderWithRouter, totals } from '../test/fixtures'

describe('ResultsView', () => {
  it('renders leader, turnout, vote share, and sorted ranking', () => {
    renderWithRouter(<ResultsView candidates={candidates} election={election} totals={totals} />)

    expect(screen.getByText('Live Results')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('Leading by 3 votes')).toBeInTheDocument()
    expect(screen.getAllByText('Ayesha Noor').length).toBeGreaterThan(0)

    const rankingRows = document.querySelectorAll('.ranking-row')
    expect(within(rankingRows[0]).getByText('Ayesha Noor')).toBeInTheDocument()
    expect(within(rankingRows[1]).getByText('Bilal Khan')).toBeInTheDocument()
  })

  it('handles zero candidates and zero votes without crashing', () => {
    renderWithRouter(
      <ResultsView
        candidates={[]}
        election={{ ...election, totalVotesCast: 0 }}
        totals={{ turnoutRate: 0, leadingCandidate: undefined, activeCandidates: [] }}
      />
    )

    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0)
    expect(screen.getByText('Leading by 0 votes')).toBeInTheDocument()
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
  })
})
