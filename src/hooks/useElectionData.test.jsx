import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { candidates, election, walletAddress } from '../test/fixtures'
import { useElectionData } from './useElectionData'

const contractMocks = vi.hoisted(() => ({
  contractAddress: '',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  requiredChainId: 11155111,
  requiredChainName: 'Sepolia',
  connectWallet: vi.fn(),
  getElectionContract: vi.fn(),
  revokeWalletPermissions: vi.fn(),
  switchToRequiredChain: vi.fn(),
}))

vi.mock('../lib/contract', () => ({
  get CONTRACT_ADDRESS() {
    return contractMocks.contractAddress
  },
  get BLOCK_EXPLORER_URL() {
    return contractMocks.blockExplorerUrl
  },
  get REQUIRED_CHAIN_ID() {
    return contractMocks.requiredChainId
  },
  get REQUIRED_CHAIN_NAME() {
    return contractMocks.requiredChainName
  },
  connectWallet: contractMocks.connectWallet,
  getElectionContract: contractMocks.getElectionContract,
  revokeWalletPermissions: contractMocks.revokeWalletPermissions,
  switchToRequiredChain: contractMocks.switchToRequiredChain,
}))

function createReadContract(overrides = {}) {
  return {
    electionName: vi.fn().mockResolvedValue(election.electionName),
    electionDescription: vi.fn().mockResolvedValue(election.electionDescription),
    currentState: vi.fn().mockResolvedValue(BigInt(election.currentState)),
    candidateCount: vi.fn().mockResolvedValue(BigInt(candidates.length)),
    registeredVoterCount: vi.fn().mockResolvedValue(BigInt(election.registeredVoterCount)),
    totalVotesCast: vi.fn().mockResolvedValue(BigInt(election.totalVotesCast)),
    getCandidates: vi.fn().mockResolvedValue(
      candidates.map((candidate) => ({
        ...candidate,
        id: BigInt(candidate.id),
        voteCount: BigInt(candidate.voteCount),
      }))
    ),
    ELECTION_ADMIN_ROLE: vi.fn().mockResolvedValue('admin-role'),
    REGISTRAR_ROLE: vi.fn().mockResolvedValue('registrar-role'),
    hasRole: vi.fn().mockImplementation((role) => Promise.resolve(role === 'admin-role')),
    registeredVoters: vi.fn().mockResolvedValue(true),
    hasVoted: vi.fn().mockResolvedValue(false),
    ...overrides,
  }
}

describe('useElectionData', () => {
  beforeEach(() => {
    contractMocks.contractAddress = ''
    contractMocks.connectWallet.mockReset()
    contractMocks.getElectionContract.mockReset()
    contractMocks.revokeWalletPermissions.mockReset()
    contractMocks.switchToRequiredChain.mockReset()
    window.ethereum = {
      on: vi.fn(),
      removeListener: vi.fn(),
      request: vi.fn(),
    }
  })

  it('starts with fallback data and blocks writes without a contract address', async () => {
    const { result } = renderHook(() => useElectionData())

    expect(result.current.usingFallback).toBe(true)
    expect(result.current.election.electionName).toBe('ElectionSphere Election')
    expect(result.current.totals.turnoutRate).toBe(0)

    let ok
    await act(async () => {
      ok = await result.current.addCandidate({ name: 'A', party: 'B', manifesto: 'C', imageUri: '' })
    })

    expect(ok).toBe(false)
    expect(result.current.error).toMatch(/contract address is not configured/i)
  })

  it('stores connect wallet errors', async () => {
    contractMocks.connectWallet.mockRejectedValue(new Error('MetaMask rejected'))
    const { result } = renderHook(() => useElectionData())

    await act(async () => {
      await result.current.handleConnectWallet()
    })

    expect(result.current.error).toBe('MetaMask rejected')
    expect(result.current.isLoading).toBe(false)
  })

  it('connects a wallet and refreshes live contract state', async () => {
    contractMocks.contractAddress = '0x0000000000000000000000000000000000000001'
    const readContract = createReadContract()
    contractMocks.connectWallet.mockResolvedValue({
      account: walletAddress,
      chainId: contractMocks.requiredChainId,
    })
    contractMocks.getElectionContract.mockResolvedValue(readContract)

    const { result } = renderHook(() => useElectionData())

    await act(async () => {
      await result.current.handleConnectWallet()
    })

    await waitFor(() => expect(result.current.wallet).toBe(walletAddress))
    expect(result.current.onSupportedChain).toBe(true)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isRegistered).toBe(true)
    expect(result.current.candidates).toHaveLength(3)
    expect(result.current.explorerUrl).toContain(contractMocks.contractAddress)
  })

  it('switches to the required chain and resets local session on disconnect', async () => {
    contractMocks.contractAddress = '0x0000000000000000000000000000000000000001'
    contractMocks.connectWallet.mockResolvedValue({ account: walletAddress, chainId: 1 })
    contractMocks.getElectionContract.mockResolvedValue(createReadContract())

    const { result } = renderHook(() => useElectionData())

    await act(async () => {
      await result.current.handleConnectWallet()
      await result.current.handleSwitchChain()
    })

    expect(contractMocks.switchToRequiredChain).toHaveBeenCalled()
    expect(result.current.notice).toBe('Sepolia selected successfully.')

    await act(async () => {
      await result.current.handleDisconnectWallet()
    })

    expect(contractMocks.revokeWalletPermissions).toHaveBeenCalled()
    expect(result.current.wallet).toBe('')
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.notice).toMatch(/wallet disconnected/i)
  })

  it('runs successful write transactions and refreshes after confirmation', async () => {
    contractMocks.contractAddress = '0x0000000000000000000000000000000000000001'
    const readContract = createReadContract()
    const writeContract = {
      addCandidate: vi.fn().mockResolvedValue({ wait: vi.fn().mockResolvedValue(true) }),
    }
    contractMocks.connectWallet.mockResolvedValue({
      account: walletAddress,
      chainId: contractMocks.requiredChainId,
    })
    contractMocks.getElectionContract.mockImplementation((withSigner = false) =>
      Promise.resolve(withSigner ? writeContract : readContract)
    )

    const { result } = renderHook(() => useElectionData())

    await act(async () => {
      await result.current.handleConnectWallet()
    })

    let ok
    await act(async () => {
      ok = await result.current.addCandidate({
        name: 'New Candidate',
        party: 'New Bloc',
        manifesto: 'More transparency',
        imageUri: '',
      })
    })

    expect(ok).toBe(true)
    expect(writeContract.addCandidate).toHaveBeenCalledWith('New Candidate', 'New Bloc', 'More transparency', '')
    expect(result.current.notice).toBe('Candidate added successfully.')
  })

  it('surfaces write transaction short messages', async () => {
    contractMocks.contractAddress = '0x0000000000000000000000000000000000000001'
    const readContract = createReadContract()
    const writeContract = {
      addCandidate: vi.fn().mockRejectedValue({ shortMessage: 'Candidate name is empty' }),
    }
    contractMocks.connectWallet.mockResolvedValue({
      account: walletAddress,
      chainId: contractMocks.requiredChainId,
    })
    contractMocks.getElectionContract.mockImplementation((withSigner = false) =>
      Promise.resolve(withSigner ? writeContract : readContract)
    )

    const { result } = renderHook(() => useElectionData())

    await act(async () => {
      await result.current.handleConnectWallet()
    })

    let ok
    await act(async () => {
      ok = await result.current.addCandidate({ name: '', party: '', manifesto: '', imageUri: '' })
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('Candidate name is empty')
  })
})
