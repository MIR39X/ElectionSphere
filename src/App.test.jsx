import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useElectionData } from './hooks/useElectionData'
import {
  candidates,
  createHandlers,
  election,
  renderWithRouter,
  stateLabels,
  totals,
  walletAddress,
} from './test/fixtures'

vi.mock('./hooks/useElectionData', () => ({
  useElectionData: vi.fn(),
}))

function mockElectionData(overrides = {}) {
  const handlers = createHandlers()
  useElectionData.mockReturnValue({
    wallet: '',
    chainId: null,
    isAdmin: false,
    isRegistrar: false,
    isRegistered: false,
    hasVoted: false,
    isLoading: false,
    notice: '',
    error: '',
    election,
    candidates,
    totals,
    stateLabels,
    usingFallback: false,
    onSupportedChain: true,
    explorerUrl: '',
    handleConnectWallet: handlers.onConnect,
    handleDisconnectWallet: vi.fn().mockResolvedValue(true),
    handleSwitchChain: vi.fn().mockResolvedValue(true),
    addCandidate: handlers.onAddCandidate,
    registerVoter: handlers.onRegisterVoter,
    removeVoter: handlers.onRemoveVoter,
    grantRegistrar: handlers.onGrantRegistrar,
    revokeRegistrar: handlers.onRevokeRegistrar,
    deactivateCandidate: handlers.onDeactivateCandidate,
    advanceState: handlers.onAdvanceState,
    castVote: handlers.onVote,
    ...overrides,
  })

  return handlers
}

describe('App shell and routing', () => {
  beforeEach(() => {
    mockElectionData()
  })

  it('renders the landing page and dismissible wallet popup', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />)

    expect(screen.getByRole('heading', { name: /transparent voting/i })).toBeInTheDocument()
    expect(screen.getByText('University Election')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /connect metamask/i })).toBeInTheDocument()

    await user.click(screen.getByLabelText(/close wallet popup/i))

    expect(screen.queryByRole('dialog', { name: /connect metamask/i })).not.toBeInTheDocument()
  })

  it('renders routed dashboard content from navigation paths', () => {
    mockElectionData({ wallet: walletAddress, isAdmin: true })
    renderWithRouter(<App />, { route: '/dashboard' })

    expect(screen.getByRole('heading', { name: /candidate vote distribution/i })).toBeInTheDocument()
    expect(screen.getByText('Registered Voters')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /full results/i })).toBeInTheDocument()
  })

  it('blocks the admin route for a connected non-admin wallet', () => {
    mockElectionData({ wallet: walletAddress, isAdmin: false, isRegistrar: false })
    renderWithRouter(<App />, { route: '/admin' })

    expect(screen.getByRole('dialog', { name: /access restricted/i })).toBeInTheDocument()
    expect(screen.getByText(/not allowed to access the admin portal/i)).toBeInTheDocument()
  })
})
