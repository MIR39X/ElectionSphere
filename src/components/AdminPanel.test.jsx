import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AdminPanel } from './AdminPanel'
import {
  candidates,
  createHandlers,
  election,
  renderWithRouter,
  stateLabels,
  voterAddress,
  walletAddress,
} from '../test/fixtures'

function renderAdminPanel(props = {}) {
  const handlers = createHandlers()
  renderWithRouter(
    <AdminPanel
      election={{ ...election, currentState: 1 }}
      stateLabels={stateLabels}
      candidates={candidates}
      wallet={walletAddress}
      isAdmin
      isRegistrar={false}
      {...handlers}
      {...props}
    />
  )
  return handlers
}

describe('AdminPanel', () => {
  it('submits candidate, registrar, voter, deactivate, and state actions for admins', async () => {
    const user = userEvent.setup()
    const handlers = renderAdminPanel()

    await user.type(screen.getByPlaceholderText(/candidate name/i), 'New Candidate')
    await user.type(screen.getByPlaceholderText(/party or group/i), 'New Bloc')
    await user.type(screen.getByPlaceholderText(/manifesto/i), 'Better voting transparency')
    await user.type(screen.getByPlaceholderText(/image uri/i), 'ipfs://new')
    await user.click(screen.getByRole('button', { name: /add candidate/i }))

    expect(handlers.onAddCandidate).toHaveBeenCalledWith({
      name: 'New Candidate',
      party: 'New Bloc',
      manifesto: 'Better voting transparency',
      imageUri: 'ipfs://new',
    })

    await user.type(screen.getByPlaceholderText(/registrar wallet/i), walletAddress)
    await user.click(screen.getByRole('button', { name: /^grant$/i }))
    expect(handlers.onGrantRegistrar).toHaveBeenCalledWith(walletAddress)
    expect(screen.getByText(/granted this session/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^revoke$/i }))
    expect(handlers.onRevokeRegistrar).toHaveBeenCalledWith(walletAddress)

    await user.type(screen.getByPlaceholderText(/voter wallet/i), voterAddress)
    await user.click(screen.getByRole('button', { name: /^register$/i }))
    expect(handlers.onRegisterVoter).toHaveBeenCalledWith(voterAddress)
    expect(screen.getByText(/registered this session/i)).toBeInTheDocument()

    const candidateRow = screen.getByText('Ayesha Noor').closest('.entity-row')
    await user.click(within(candidateRow).getByRole('button', { name: /remove candidate/i }))
    expect(handlers.onDeactivateCandidate).toHaveBeenCalledWith(candidates[0])

    await user.click(screen.getByRole('button', { name: /open voting/i }))
    expect(handlers.onAdvanceState).toHaveBeenCalledWith(2)
  })

  it('disables protected controls when the wallet lacks permission', () => {
    renderAdminPanel({ isAdmin: false, isRegistrar: false, wallet: '' })

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /only admin can add candidates/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^grant$/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^register$/i })).toBeDisabled()
    expect(screen.getByText(/connect the admin wallet/i)).toBeInTheDocument()
  })
})
