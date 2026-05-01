import { beforeEach, describe, expect, it, vi } from 'vitest'

const ethersMocks = vi.hoisted(() => ({
  send: vi.fn(),
  getNetwork: vi.fn(),
  getSigner: vi.fn(),
  contract: vi.fn(),
  browserProvider: vi.fn(),
}))

vi.mock('ethers', () => ({
  BrowserProvider: ethersMocks.browserProvider,
  Contract: ethersMocks.contract,
}))

describe('contract helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    ethersMocks.send.mockReset()
    ethersMocks.getNetwork.mockReset()
    ethersMocks.getSigner.mockReset()
    ethersMocks.contract.mockReset()
    ethersMocks.browserProvider.mockReset()
    ethersMocks.browserProvider.mockImplementation(function BrowserProviderMock() {
      return {
      send: ethersMocks.send,
      getNetwork: ethersMocks.getNetwork,
      getSigner: ethersMocks.getSigner,
      }
    })
    window.ethereum = {
      request: vi.fn().mockResolvedValue(true),
    }
    vi.unstubAllEnvs()
  })

  it('throws a clear error when MetaMask is missing', async () => {
    window.ethereum = undefined
    const { getEthereum } = await import('./contract')

    await expect(getEthereum()).rejects.toThrow(/metamask not detected/i)
  })

  it('connects wallet and returns account, chain id, and provider', async () => {
    ethersMocks.send.mockResolvedValue(['0xabc'])
    ethersMocks.getNetwork.mockResolvedValue({ chainId: 11155111n })
    const { connectWallet } = await import('./contract')

    const session = await connectWallet()

    expect(ethersMocks.browserProvider).toHaveBeenCalledWith(window.ethereum)
    expect(ethersMocks.send).toHaveBeenCalledWith('eth_requestAccounts', [])
    expect(session.account).toBe('0xabc')
    expect(session.chainId).toBe(11155111)
    expect(session.provider).toBeDefined()
  })

  it('requests a switch to the configured chain', async () => {
    const { switchToRequiredChain } = await import('./contract')

    await switchToRequiredChain()

    expect(window.ethereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    })
  })

  it('guards contract creation when the address is missing', async () => {
    vi.stubEnv('VITE_CONTRACT_ADDRESS', '')
    const { getElectionContract } = await import('./contract')

    await expect(getElectionContract()).rejects.toThrow(/vite_contract_address is missing/i)
  })
})
