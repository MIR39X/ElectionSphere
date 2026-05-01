import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DashboardView } from './DashboardView'
import { candidates, createHandlers, election, renderWithRouter, stateLabels, totals } from '../test/fixtures'

describe('DashboardView', () => {
  it('renders operational stats and admin quick actions', async () => {
    const user = userEvent.setup()
    const handlers = createHandlers()
    renderWithRouter(
      <DashboardView
        election={election}
        totals={totals}
        stateLabels={stateLabels}
        candidates={candidates}
        isAdmin
        onAdvanceState={handlers.onAdvanceState}
      />
    )

    expect(screen.getByText('Election Status')).toBeInTheDocument()
    expect(screen.getByText('Voting Open')).toBeInTheDocument()
    expect(screen.getByText('Registered Voters')).toBeInTheDocument()
    expect(screen.getByText('Candidate vote distribution')).toBeInTheDocument()
    expect(screen.getByText('Ayesha Noor')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /end voting/i }))

    expect(handlers.onAdvanceState).toHaveBeenCalledWith(3)
  })

  it('hides admin-only quick actions for non-admin users', () => {
    renderWithRouter(
      <DashboardView
        election={election}
        totals={totals}
        stateLabels={stateLabels}
        candidates={candidates}
        isAdmin={false}
        onAdvanceState={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /end voting/i })).not.toBeInTheDocument()
    expect(screen.getByText('Live activity')).toBeInTheDocument()
  })
})
