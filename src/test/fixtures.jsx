import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

export const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
export const registrarAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
export const voterAddress = '0x9999999999999999999999999999999999999999'

export const stateLabels = [
  'Setup',
  'Registration Closed',
  'Voting Open',
  'Voting Closed',
  'Results Published',
]

export const candidates = [
  {
    id: 1,
    name: 'Ayesha Noor',
    party: 'Unity Front',
    manifesto: 'Digital campus services and transparent student support.',
    imageUri: 'ipfs://candidate-1',
    voteCount: 7,
    active: true,
  },
  {
    id: 2,
    name: 'Bilal Khan',
    party: 'Progress Bloc',
    manifesto: 'Transport and safety improvements for every department.',
    imageUri: 'ipfs://candidate-2',
    voteCount: 4,
    active: true,
  },
  {
    id: 3,
    name: 'Maya Ali',
    party: 'Future Voice',
    manifesto:
      'Scholarship reform, student labs, accessible events, better communication, and a long roadmap for campus services.',
    imageUri: 'ipfs://candidate-3',
    voteCount: 1,
    active: false,
  },
]

export const manyCandidates = [
  ...candidates,
  {
    id: 4,
    name: 'Hamza Malik',
    party: 'Unity Front',
    manifesto: 'Library access reform.',
    imageUri: '',
    voteCount: 2,
    active: true,
  },
  {
    id: 5,
    name: 'Sara Iqbal',
    party: 'Campus First',
    manifesto: 'Better events and student representation.',
    imageUri: '',
    voteCount: 3,
    active: true,
  },
]

export const election = {
  electionName: 'University Election',
  electionDescription: 'Blockchain secured campus election',
  currentState: 2,
  candidateCount: candidates.length,
  registeredVoterCount: 20,
  totalVotesCast: 12,
}

export const totals = {
  turnoutRate: 60,
  leadingCandidate: candidates[0],
  activeCandidates: candidates.filter((candidate) => candidate.active),
}

export function createHandlers() {
  return {
    onAddCandidate: vi.fn().mockResolvedValue(true),
    onRegisterVoter: vi.fn().mockResolvedValue(true),
    onRemoveVoter: vi.fn().mockResolvedValue(true),
    onGrantRegistrar: vi.fn().mockResolvedValue(true),
    onRevokeRegistrar: vi.fn().mockResolvedValue(true),
    onDeactivateCandidate: vi.fn().mockResolvedValue(true),
    onAdvanceState: vi.fn().mockResolvedValue(true),
    onConnect: vi.fn().mockResolvedValue(true),
    onVote: vi.fn().mockResolvedValue(true),
  }
}

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
