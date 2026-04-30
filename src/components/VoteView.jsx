import { CheckCircle2, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

function shortWallet(value) {
  return value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Not connected";
}

function getSubmitState({ wallet, isRegistered, hasVoted, electionState, selectedCandidate, onSupportedChain }) {
  if (!selectedCandidate) {
    return { disabled: true, label: "Select Candidate", reason: "Select a candidate first." };
  }
  if (!wallet) {
    return { disabled: true, label: "Connect Wallet", reason: "Connect your wallet to verify eligibility." };
  }
  if (!onSupportedChain) {
    return { disabled: true, label: "Wrong Network", reason: "Switch to Sepolia network to submit your vote." };
  }
  if (!isRegistered) {
    return { disabled: true, label: "Not Registered", reason: "This wallet is not registered to vote." };
  }
  if (hasVoted) {
    return { disabled: true, label: "Vote Submitted", reason: "Vote already submitted from this wallet." };
  }
  if (electionState !== 2) {
    return { disabled: true, label: "Voting Closed", reason: "Voting has ended. View results." };
  }
  if (!selectedCandidate.active) {
    return { disabled: true, label: "Candidate Inactive", reason: "Selected candidate is not active." };
  }
  return { disabled: false, label: "Submit Vote", reason: "Ready to submit your vote." };
}

export function VoteView({
  candidates,
  hasVoted,
  isLoading,
  isRegistered,
  wallet,
  election,
  stateLabels,
  onVote,
  onConnect,
  onSupportedChain,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [partyFilter, setPartyFilter] = useState("all");
  const [detailCandidate, setDetailCandidate] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.id === selectedId) || null,
    [candidates, selectedId]
  );

  const parties = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.party).filter(Boolean))),
    [candidates]
  );

  const enableSearch = candidates.length >= 5;

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        !searchText ||
        candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchText.toLowerCase());
      const matchesParty = partyFilter === "all" || candidate.party === partyFilter;
      return matchesSearch && matchesParty;
    });
  }, [candidates, searchText, partyFilter]);

  const submitState = getSubmitState({
    wallet,
    isRegistered,
    hasVoted,
    electionState: election.currentState,
    selectedCandidate,
    onSupportedChain,
  });

  const statusChips = [
    {
      label: election.currentState === 2 ? "Ballot Open" : "Ballot Closed",
      tone: election.currentState === 2 ? "good" : "blocked",
    },
    {
      label: wallet ? "Wallet Connected" : "Wallet Not Connected",
      tone: wallet ? "good" : "pending",
    },
    {
      label: isRegistered ? "Registered Voter" : "Not Registered",
      tone: isRegistered ? "good" : "blocked",
    },
    {
      label: hasVoted ? "Vote Submitted" : "Vote Not Submitted",
      tone: hasVoted ? "good" : "pending",
    },
  ];

  const checklist = [
    { label: "Candidate selected", done: Boolean(selectedCandidate) },
    { label: "Wallet connected", done: Boolean(wallet) },
    { label: "Registered voter", done: isRegistered },
    { label: "Election open", done: election.currentState === 2 },
    { label: "Vote submitted", done: hasVoted },
  ];

  const primaryAction = !wallet ? "connect" : "submit";

  return (
    <main className="vote-page">
      <section className="vote-status-strip">
        <div className="vote-status-chips">
          {statusChips.map((chip) => (
            <span className={`vote-chip ${chip.tone}`} key={chip.label}>
              {chip.label}
            </span>
          ))}
        </div>
      </section>

      <section className="vote-main-grid">
        <section className="candidate-browser">
          <div className="candidate-browser-header">
            <div>
              <span className="eyebrow">Candidate Browser</span>
              <h2>Select your candidate</h2>
            </div>
          </div>

          {enableSearch ? (
            <div className="candidate-controls">
              <label className="search-input">
                <Search size={15} />
                <input
                  placeholder="Search candidates..."
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
              </label>
              <select value={partyFilter} onChange={(event) => setPartyFilter(event.target.value)}>
                <option value="all">All parties</option>
                {parties.map((party) => (
                  <option value={party} key={party}>
                    {party}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={`candidate-browser-list ${candidates.length >= 7 ? "scrollable" : ""}`}>
            <div className={`vote-candidate-grid ${candidates.length <= 6 ? "two-column" : "one-column"}`}>
              {filteredCandidates.map((candidate) => {
                const selected = selectedId === candidate.id;
                const longManifesto = candidate.manifesto.length > 120;
                return (
                  <article
                    className={`vote-candidate-card ${selected ? "selected" : ""} ${!candidate.active ? "inactive" : ""}`}
                    key={candidate.id}
                    onClick={() => setSelectedId(candidate.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(candidate.id);
                      }
                    }}
                  >
                    <div className="candidate-main">
                      <span className="candidate-avatar">{candidate.name.slice(0, 1)}</span>
                      <div>
                        <strong>{candidate.name}</strong>
                        <span>{candidate.party}</span>
                        <p>{candidate.manifesto}</p>
                        {longManifesto ? (
                          <button
                            className="link-button-text"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDetailCandidate(candidate);
                            }}
                            type="button"
                          >
                            View details
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <button
                      className={`select-tag ${selected ? "selected" : ""}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(candidate.id);
                      }}
                    >
                      {selected ? <><CheckCircle2 size={14} /> Selected</> : "Select"}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="vote-confirm-panel">
          <span className="eyebrow">Your Vote</span>
          <h2>{selectedCandidate ? selectedCandidate.name : "No candidate selected"}</h2>
          <p>{selectedCandidate ? selectedCandidate.party : "Select a candidate to continue."}</p>
          <div className="vote-checklist">
            {checklist.map((item) => (
              <div className="check-row" key={item.label}>
                <span className={item.done ? "done" : "pending"}>{item.done ? "✓" : "✕"}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="vote-panel-status">
            <div>
              <span>Wallet</span>
              <strong>{shortWallet(wallet)}</strong>
            </div>
            <div>
              <span>Eligibility</span>
              <strong>{isRegistered ? "Registered" : "Not registered"}</strong>
            </div>
            <div>
              <span>Election</span>
              <strong>{stateLabels[election.currentState]}</strong>
            </div>
          </div>

          <p className="vote-state-hint">{submitState.reason}</p>
          <p className="vote-safety-note">
            Your vote will be submitted on-chain and cannot be changed after confirmation.
          </p>

          <div className="vote-panel-actions">
            {primaryAction === "connect" ? (
              <button className="primary-button" onClick={onConnect} disabled={isLoading}>
                <Wallet size={16} /> {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            ) : (
              <button
                className="primary-button"
                disabled={submitState.disabled || isLoading}
                onClick={() => setConfirmOpen(true)}
              >
                {hasVoted ? "Vote Submitted" : isLoading ? "Submitting..." : "Submit Vote"}
              </button>
            )}
          </div>
        </aside>
      </section>

      {confirmOpen && selectedCandidate ? (
        <div className="candidate-modal-backdrop" onClick={() => setConfirmOpen(false)} role="presentation">
          <article className="candidate-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="candidate-modal-head">
              <h3>Confirm your vote</h3>
              <button className="secondary-button compact" onClick={() => setConfirmOpen(false)} type="button">
                Cancel
              </button>
            </div>
            <span>You are voting for:</span>
            <p className="confirm-name">{selectedCandidate.name}</p>
            <p className="confirm-party">{selectedCandidate.party}</p>
            <p className="confirm-warning">This action cannot be changed after submission.</p>
            <button
              className="primary-button"
              onClick={() => {
                onVote(selectedCandidate.id);
                setConfirmOpen(false);
              }}
              disabled={submitState.disabled || isLoading}
            >
              {isLoading ? "Submitting..." : "Confirm Vote"}
            </button>
          </article>
        </div>
      ) : null}

      {detailCandidate ? (
        <div className="candidate-modal-backdrop" onClick={() => setDetailCandidate(null)} role="presentation">
          <article className="candidate-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="candidate-modal-head">
              <h3>{detailCandidate.name}</h3>
              <button className="secondary-button compact" onClick={() => setDetailCandidate(null)} type="button">
                Close
              </button>
            </div>
            <span>{detailCandidate.party}</span>
            <p>{detailCandidate.manifesto}</p>
          </article>
        </div>
      ) : null}
    </main>
  );
}
