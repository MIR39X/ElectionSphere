export const candidateSeed = [
  {
    id: 1,
    name: "Ayesha Noor",
    party: "Unity Front",
    manifesto: "Digital attendance, transparent budgets, and faster grievance support.",
    imageUri: "",
    voteCount: 128,
    active: true,
  },
  {
    id: 2,
    name: "Bilal Khan",
    party: "Progress Bloc",
    manifesto: "Safer transport, more lab hours, and club funding reform.",
    imageUri: "",
    voteCount: 104,
    active: true,
  },
  {
    id: 3,
    name: "Maya Ali",
    party: "Future Voice",
    manifesto: "Merit scholarships, AI learning labs, and student startup grants.",
    imageUri: "",
    voteCount: 87,
    active: true,
  },
];

export const defaultElection = {
  electionName: "Campus Blockchain Election 2026",
  electionDescription:
    "Professional e-voting workflow with on-chain validation, admin controls, and live transparency.",
  currentState: 2,
  candidateCount: candidateSeed.length,
  registeredVoterCount: 402,
  totalVotesCast: 319,
};

export const stateLabels = [
  "Setup",
  "Registration Closed",
  "Voting Open",
  "Voting Closed",
  "Results Published",
];

export const capabilityCards = [
  "Admin panel for secure election operations",
  "Role-based access for admin and registrar",
  "Registered voters only with one wallet one vote",
  "MetaMask connection and wallet verification",
  "Live tally dashboard with visual charts",
  "Test suite and Sepolia deployment support",
];
