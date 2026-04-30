import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BLOCK_EXPLORER_URL,
  CONTRACT_ADDRESS,
  REQUIRED_CHAIN_ID,
  REQUIRED_CHAIN_NAME,
  connectWallet,
  getElectionContract,
  revokeWalletPermissions,
  switchToRequiredChain,
} from "../lib/contract";
import { candidateSeed, defaultElection, stateLabels } from "../data/mockElection";

function normalizeCandidate(candidate) {
  return {
    id: Number(candidate.id),
    name: candidate.name,
    party: candidate.party,
    manifesto: candidate.manifesto,
    imageUri: candidate.imageUri,
    voteCount: Number(candidate.voteCount),
    active: candidate.active,
  };
}

export function useElectionData() {
  const [wallet, setWallet] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistrar, setIsRegistrar] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasVotedState, setHasVotedState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [election, setElection] = useState(defaultElection);
  const [candidates, setCandidates] = useState(candidateSeed);

  const onSupportedChain = chainId === REQUIRED_CHAIN_ID;
  const usingFallback = !CONTRACT_ADDRESS;

  const totals = useMemo(() => {
    const activeCandidates = candidates.filter((candidate) => candidate.active);
    const leadingCandidate = [...activeCandidates].sort((a, b) => b.voteCount - a.voteCount)[0];
    return {
      turnoutRate: election.registeredVoterCount
        ? Math.round((election.totalVotesCast / election.registeredVoterCount) * 100)
        : 0,
      leadingCandidate,
      activeCandidates,
    };
  }, [candidates, election.registeredVoterCount, election.totalVotesCast]);

  const refreshContractState = useCallback(async (account = wallet) => {
    if (usingFallback || !account) {
      return;
    }

    try {
      const contract = await getElectionContract();
      const [name, description, state, candidateCount, registeredCount, votesCast, allCandidates, adminRole, registrarRole] =
        await Promise.all([
          contract.electionName(),
          contract.electionDescription(),
          contract.currentState(),
          contract.candidateCount(),
          contract.registeredVoterCount(),
          contract.totalVotesCast(),
          contract.getCandidates(),
          contract.ELECTION_ADMIN_ROLE(),
          contract.REGISTRAR_ROLE(),
        ]);

      const [adminStatus, registrarStatus, registeredStatus, votedStatus] = await Promise.all([
        contract.hasRole(adminRole, account),
        contract.hasRole(registrarRole, account),
        contract.registeredVoters(account),
        contract.hasVoted(account),
      ]);

      setElection({
        electionName: name,
        electionDescription: description,
        currentState: Number(state),
        candidateCount: Number(candidateCount),
        registeredVoterCount: Number(registeredCount),
        totalVotesCast: Number(votesCast),
      });
      setCandidates(allCandidates.map(normalizeCandidate));
      setIsAdmin(adminStatus);
      setIsRegistrar(registrarStatus);
      setIsRegistered(registeredStatus);
      setHasVotedState(votedStatus);
      setError("");
    } catch (refreshError) {
      setError(refreshError.message);
    }
  }, [usingFallback, wallet]);

  async function handleConnectWallet() {
    setIsLoading(true);
    setError("");
    setNotice("");

    try {
      const session = await connectWallet();
      setWallet(session.account);
      setChainId(session.chainId);

      if (session.chainId !== REQUIRED_CHAIN_ID) {
        setNotice(`Switch MetaMask to ${REQUIRED_CHAIN_NAME} for live contract actions.`);
      }

      await refreshContractState(session.account);
    } catch (connectError) {
      setError(connectError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSwitchChain() {
    try {
      await switchToRequiredChain();
      setChainId(REQUIRED_CHAIN_ID);
      setNotice(`${REQUIRED_CHAIN_NAME} selected successfully.`);
      await refreshContractState();
    } catch (switchError) {
      setError(switchError.message);
    }
  }

  async function handleDisconnectWallet() {
    await revokeWalletPermissions()
    setWallet("")
    setChainId(null)
    setIsAdmin(false)
    setIsRegistrar(false)
    setIsRegistered(false)
    setHasVotedState(false)
    setNotice("Wallet disconnected. You can connect a different account.")
    setError("")
  }

  async function runWrite(action, successMessage) {
    if (usingFallback) {
      setNotice("Demo mode is active. Deploy contract and set VITE_CONTRACT_ADDRESS for live transactions.");
      return;
    }
    if (!wallet) {
      setError("Connect MetaMask first.");
      return;
    }
    if (!onSupportedChain) {
      setError(`Switch to ${REQUIRED_CHAIN_NAME} before sending transactions.`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const contract = await getElectionContract(true);
      const tx = await action(contract);
      await tx.wait();
      setNotice(successMessage);
      await refreshContractState();
    } catch (txError) {
      setError(txError.shortMessage || txError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = async (accounts) => {
      const nextAccount = accounts[0] || "";
      setWallet(nextAccount);

      if (nextAccount) {
        await refreshContractState(nextAccount);
      }
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [refreshContractState]);

  return {
    wallet,
    chainId,
    isAdmin,
    isRegistrar,
    isRegistered,
    hasVoted: hasVotedState,
    isLoading,
    notice,
    error,
    election,
    candidates,
    totals,
    stateLabels,
    usingFallback,
    onSupportedChain,
    explorerUrl: CONTRACT_ADDRESS ? `${BLOCK_EXPLORER_URL}/address/${CONTRACT_ADDRESS}` : "",
    handleConnectWallet,
    handleDisconnectWallet,
    handleSwitchChain,
    refreshContractState,
    addCandidate: async (payload) =>
      runWrite(
        (contract) => contract.addCandidate(payload.name, payload.party, payload.manifesto, payload.imageUri),
        "Candidate added successfully."
      ),
    deactivateCandidate: async (candidate) =>
      runWrite(
        (contract) =>
          contract.updateCandidate(
            candidate.id,
            candidate.name,
            candidate.party,
            candidate.manifesto,
            candidate.imageUri,
            false
          ),
        "Candidate deactivated successfully."
      ),
    registerVoter: async (voterAddress) =>
      runWrite((contract) => contract.registerVoter(voterAddress), "Voter registered successfully."),
    removeVoter: async (voterAddress) =>
      runWrite((contract) => contract.removeVoter(voterAddress), "Voter removed successfully."),
    grantRegistrar: async (walletAddress) =>
      runWrite((contract) => contract.grantRegistrar(walletAddress), "Registrar access granted."),
    revokeRegistrar: async (walletAddress) =>
      runWrite((contract) => contract.revokeRegistrar(walletAddress), "Registrar access revoked."),
    advanceState: async (nextState) =>
      runWrite((contract) => contract.advanceState(nextState), `Election moved to ${stateLabels[nextState]}.`),
    castVote: async (candidateId) =>
      runWrite((contract) => contract.castVote(candidateId), "Vote submitted on-chain."),
  };
}
