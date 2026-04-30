import { BrowserProvider, Contract } from "ethers";

export const CONTRACT_ABI = [
  "function electionName() view returns (string)",
  "function electionDescription() view returns (string)",
  "function currentState() view returns (uint8)",
  "function candidateCount() view returns (uint256)",
  "function registeredVoterCount() view returns (uint256)",
  "function totalVotesCast() view returns (uint256)",
  "function registeredVoters(address) view returns (bool)",
  "function hasVoted(address) view returns (bool)",
  "function getCandidates() view returns ((uint256 id,string name,string party,string manifesto,string imageUri,uint256 voteCount,bool active)[])",
  "function addCandidate(string name,string party,string manifesto,string imageUri)",
  "function updateCandidate(uint256 candidateId,string name,string party,string manifesto,string imageUri,bool active)",
  "function registerVoter(address voter)",
  "function removeVoter(address voter)",
  "function advanceState(uint8 newState)",
  "function castVote(uint256 candidateId)",
  "function grantRegistrar(address account)",
  "function ELECTION_ADMIN_ROLE() view returns (bytes32)",
  "function REGISTRAR_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role,address account) view returns (bool)",
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
export const REQUIRED_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);
export const REQUIRED_CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || "Sepolia";
export const BLOCK_EXPLORER_URL =
  import.meta.env.VITE_BLOCK_EXPLORER || "https://sepolia.etherscan.io";

export async function getEthereum() {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected. Please install the extension.");
  }

  return window.ethereum;
}

export async function connectWallet() {
  const ethereum = await getEthereum();
  const provider = new BrowserProvider(ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();

  return {
    account: accounts[0],
    chainId: Number(network.chainId),
    provider,
  };
}

export async function switchToRequiredChain() {
  const ethereum = await getEthereum();
  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }],
  });
}

export async function getElectionContract(withSigner = false) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("VITE_CONTRACT_ADDRESS is missing. Add deployed contract address in .env.");
  }

  const ethereum = await getEthereum();
  const provider = new BrowserProvider(ethereum);
  const signerOrProvider = withSigner ? await provider.getSigner() : provider;

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}
