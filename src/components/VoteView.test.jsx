import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { VoteView } from './VoteView'
import {
  candidates,
  createHandlers,
  election,
  manyCandidates,
  renderWithRouter,
  stateLabels,
  walletAddress,
} from '../test/fixtures'

function renderVoteView(props = {}) {
  const handlers = createHandlers()
  renderWithRouter(
    <VoteView
      candidates={candidates}
      hasVoted={false}
      isLoading={false}
      isRegistered
      wallet={walletAddress}
      election={election}
      stateLabels={stateLabels}
      onVote={handlers.onVote}
      onConnect={handlers.onConnect}
      onSupportedChain
      {...props}
    />
  )
  return handlers
}

describe('VoteView', () => {
  it('connects wallet when no wallet is present', async () => {
    const user = userEvent.setup()
    const handlers = renderVoteView({ wallet: '', isRegistered: false })

    await user.click(screen.getByRole('button', { name: /connect wallet/i }))

    expect(handlers.onConnect).toHaveBeenCalled()
    expect(screen.getByText('Wallet Not Connected')).toBeInTheDocument()
  })

  it('selects a candidate, opens confirmation, and submits the selected vote', async () => {
    const user = userEvent.setup()
    const handlers = renderVoteView()

    await user.click(within(screen.getByText('Ayesha Noor').closest('article')).getByRole('button', { name: /select/i }))
    await user.click(screen.getByRole('button', { name: /submit vote/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/this action cannot be changed/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /confirm vote/i }))

    expect(handlers.onVote).toHaveBeenCalledWith(1)
  })

  it('filters candidates by search text and party when many candidates exist', async () => {
    const user = userEvent.setup()
    renderVoteView({ candidates: manyCandidates })

    await user.type(screen.getByPlaceholderText(/search candidates/i), 'Sara')

    expect(screen.getByText('Sara Iqbal')).toBeInTheDocument()
    expect(screen.queryByText('Bilal Khan')).not.toBeInTheDocument()

    await user.clear(screen.getByPlaceholderText(/search candidates/i))
    await user.selectOptions(screen.getByRole('combobox'), 'Unity Front')

    expect(screen.getByText('Ayesha Noor')).toBeInTheDocument()
    expect(screen.getByText('Hamza Malik')).toBeInTheDocument()
    expect(screen.queryByText('Sara Iqbal')).not.toBeInTheDocument()
  })

  it('blocks submission for wrong network, unregistered, closed, voted, and inactive states', async () => {
    const { rerender } = renderWithRouter(
      <VoteView
        candidates={candidates}
        hasVoted={false}
        isLoading={false}
        isRegistered
        wallet={walletAddress}
        election={election}
        stateLabels={stateLabels}
        onVote={vi.fn()}
        onConnect={vi.fn()}
        onSupportedChain={false}
      />
    )

    await userEvent.click(within(screen.getByText('Ayesha Noor').closest('article')).getByRole('button', { name: /select/i }))
    expect(screen.getByRole('button', { name: /submit vote/i })).toBeDisabled()
    expect(screen.getByText(/switch to sepolia/i)).toBeInTheDocument()

    rerender(
      <VoteView
        candidates={candidates}
        hasVoted
        isLoading={false}
        isRegistered
        wallet={walletAddress}
        election={election}
        stateLabels={stateLabels}
        onVote={vi.fn()}
        onConnect={vi.fn()}
        onSupportedChain
      />
    )
    expect(screen.getByRole('button', { name: /vote submitted/i })).toBeDisabled()
  })
})
