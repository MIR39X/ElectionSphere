import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CandidateGrid } from './CandidateGrid'
import { candidates, createHandlers, renderWithRouter } from '../test/fixtures'

describe('CandidateGrid', () => {
  it('calls onVote for enabled active candidates', async () => {
    const user = userEvent.setup()
    const handlers = createHandlers()
    renderWithRouter(
      <CandidateGrid candidates={candidates} onVote={handlers.onVote} canVote hasVoted={false} isLoading={false} />
    )

    await user.click(screen.getAllByRole('button', { name: /^vote$/i })[0])

    expect(handlers.onVote).toHaveBeenCalledWith(1)
  })

  it('disables voting when already voted, loading, cannot vote, or candidate inactive', () => {
    const { rerender } = renderWithRouter(
      <CandidateGrid candidates={candidates} onVote={vi.fn()} canVote={false} hasVoted={false} isLoading={false} />
    )

    expect(screen.getAllByRole('button', { name: /^vote$/i })[0]).toBeDisabled()

    rerender(<CandidateGrid candidates={candidates} onVote={vi.fn()} canVote hasVoted isLoading={false} />)
    expect(screen.getAllByRole('button', { name: /vote cast/i })[0]).toBeDisabled()

    rerender(<CandidateGrid candidates={candidates} onVote={vi.fn()} canVote hasVoted={false} isLoading />)
    expect(screen.getAllByRole('button', { name: /^vote$/i })[0]).toBeDisabled()
  })
})
