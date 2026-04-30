import { CheckCircle2, ShieldCheck, UserPlus, Users, Vote } from "lucide-react";
import { useMemo, useState } from "react";

const initialCandidate = {
  name: "",
  party: "",
  manifesto: "",
  imageUri: "",
};

export function AdminPanel({
  election,
  stateLabels,
  candidates,
  wallet,
  isAdmin,
  isRegistrar,
  onAddCandidate,
  onRegisterVoter,
  onRemoveVoter,
  onGrantRegistrar,
  onAdvanceState,
  onConnect,
}) {
  const [candidateForm, setCandidateForm] = useState(initialCandidate);
  const [voterAddress, setVoterAddress] = useState("");
  const [registrarAddress, setRegistrarAddress] = useState("");
  const [trackedVoters, setTrackedVoters] = useState([]);
  const [trackedRegistrars, setTrackedRegistrars] = useState([]);
  const [inlineMessage, setInlineMessage] = useState("");

  const canManageCandidates = isAdmin;
  const canManageVoters = isAdmin || isRegistrar;
  const currentStateLabel = stateLabels[election.currentState];
  const nextStateIndex = election.currentState + 1;
  const nextStateLabel = stateLabels[nextStateIndex];

  const stateActionLabel = useMemo(() => {
    if (!nextStateLabel) {
      return "Election Complete";
    }
    if (nextStateLabel === "Registration Closed") {
      return "Close Registration";
    }
    if (nextStateLabel === "Voting Open") {
      return "Open Voting";
    }
    if (nextStateLabel === "Voting Closed") {
      return "Close Voting";
    }
    return "Publish Results";
  }, [nextStateLabel]);

  function shortAddress(address) {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";
  }

  function trackUnique(list, value) {
    const cleanValue = value.trim();
    if (!cleanValue || list.some((item) => item.toLowerCase() === cleanValue.toLowerCase())) {
      return list;
    }
    return [cleanValue, ...list];
  }

  return (
    <div className="admin-console">
      <section className="admin-status-strip">
        <div>
          <span className="live-pill"><span />{wallet ? "Admin Connected" : "Wallet Required"}</span>
          <strong>{shortAddress(wallet)}</strong>
        </div>
        <div>
          <span>Role</span>
          <strong>{isAdmin ? "Admin" : isRegistrar ? "Registrar" : "Viewer"}</strong>
        </div>
        <div>
          <span>Election State</span>
          <strong>{currentStateLabel}</strong>
        </div>
        {!wallet ? (
          <button className="primary-button compact" onClick={onConnect}>
            Connect Wallet
          </button>
        ) : null}
      </section>

      {inlineMessage ? <div className="admin-inline-message">{inlineMessage}</div> : null}

      <section className="admin-layout">
        <div className="admin-left-column">
          <article className="admin-card control-card">
            <div className="admin-card-header">
              <span className="section-icon"><Vote size={20} /></span>
              <div>
                <span className="eyebrow">Election Control</span>
                <h2>Lifecycle manager</h2>
              </div>
            </div>

            <div className="state-flow">
              {stateLabels.map((label, index) => (
                <div
                  className={`state-step ${index === election.currentState ? "active" : ""} ${
                    index < election.currentState ? "done" : ""
                  }`}
                  key={label}
                >
                  <span>{index < election.currentState ? <CheckCircle2 size={15} /> : index + 1}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>

            <div className="next-action-box">
              <span>Current State</span>
              <strong>{currentStateLabel}</strong>
              <button
                className="primary-button"
                disabled={!isAdmin || !nextStateLabel}
                onClick={() => onAdvanceState(nextStateIndex)}
              >
                {stateActionLabel}
              </button>
            </div>
          </article>

          <article className="admin-card summary-card">
            <div className="summary-item">
              <span>Total candidates</span>
              <strong>{election.candidateCount}</strong>
            </div>
            <div className="summary-item">
              <span>Total voters</span>
              <strong>{election.registeredVoterCount}</strong>
            </div>
            <div className="summary-item">
              <span>Current phase</span>
              <strong>{currentStateLabel}</strong>
            </div>
          </article>
        </div>

        <div className="admin-right-column">
          <article className="admin-card">
            <div className="admin-card-header">
              <span className="section-icon"><Users size={20} /></span>
              <div>
                <span className="eyebrow">Candidate Management</span>
                <h2>Add candidate</h2>
              </div>
            </div>
            <div className="form-grid compact-form">
              <input
                placeholder="Candidate name"
                value={candidateForm.name}
                onChange={(event) => setCandidateForm({ ...candidateForm, name: event.target.value })}
              />
              <input
                placeholder="Party or group"
                value={candidateForm.party}
                onChange={(event) => setCandidateForm({ ...candidateForm, party: event.target.value })}
              />
              <textarea
                placeholder="Manifesto"
                value={candidateForm.manifesto}
                onChange={(event) => setCandidateForm({ ...candidateForm, manifesto: event.target.value })}
              />
              <input
                placeholder="Image URI (optional)"
                value={candidateForm.imageUri}
                onChange={(event) => setCandidateForm({ ...candidateForm, imageUri: event.target.value })}
              />
              <button
                className="primary-button"
                disabled={!canManageCandidates}
                onClick={() => {
                  onAddCandidate(candidateForm);
                  setCandidateForm(initialCandidate);
                  setInlineMessage("Candidate submission sent.");
                }}
              >
                Add Candidate
              </button>
            </div>
            <div className="entity-list">
              {candidates.map((candidate) => (
                <div className="entity-row" key={candidate.id}>
                  <div>
                    <strong>{candidate.name}</strong>
                    <span>{candidate.party}</span>
                  </div>
                  <span className={candidate.active ? "status-tag" : "status-tag muted-tag"}>
                    {candidate.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="admin-card">
            <div className="admin-card-header">
              <span className="section-icon"><UserPlus size={20} /></span>
              <div>
                <span className="eyebrow">Voter Management</span>
                <h2>Registry</h2>
              </div>
            </div>
            <div className="inline-form">
              <input
                placeholder="0x voter wallet"
                value={voterAddress}
                onChange={(event) => setVoterAddress(event.target.value)}
              />
              <button
                className="primary-button"
                disabled={!canManageVoters}
                onClick={() => {
                  onRegisterVoter(voterAddress);
                  setTrackedVoters((items) => trackUnique(items, voterAddress));
                  setInlineMessage("Voter registration submitted.");
                }}
              >
                Register
              </button>
            </div>
            <div className="entity-list compact-list">
              {trackedVoters.length ? (
                trackedVoters.map((voter) => (
                  <div className="entity-row" key={voter}>
                    <div>
                      <strong>{shortAddress(voter)}</strong>
                      <span>Registered this session</span>
                    </div>
                    <button
                      className="danger-button"
                      disabled={!canManageVoters}
                      onClick={() => {
                        onRemoveVoter(voter);
                        setTrackedVoters((items) => items.filter((item) => item !== voter));
                        setInlineMessage("Voter removal submitted.");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-state">Registered voters will appear here after you add them in this session.</p>
              )}
            </div>
          </article>

          <article className="admin-card">
            <div className="admin-card-header">
              <span className="section-icon"><ShieldCheck size={20} /></span>
              <div>
                <span className="eyebrow">Access Control</span>
                <h2>Registrar access</h2>
              </div>
            </div>
            <div className="inline-form">
              <input
                placeholder="0x registrar wallet"
                value={registrarAddress}
                onChange={(event) => setRegistrarAddress(event.target.value)}
              />
              <button
                className="primary-button"
                disabled={!isAdmin}
                onClick={() => {
                  onGrantRegistrar(registrarAddress);
                  setTrackedRegistrars((items) => trackUnique(items, registrarAddress));
                  setInlineMessage("Registrar access submitted.");
                }}
              >
                Grant
              </button>
            </div>
            <div className="entity-list compact-list">
              {trackedRegistrars.length ? (
                trackedRegistrars.map((registrar) => (
                  <div className="entity-row" key={registrar}>
                    <div>
                      <strong>{shortAddress(registrar)}</strong>
                      <span>Granted this session</span>
                    </div>
                    <span className="status-tag">Registrar</span>
                  </div>
                ))
              ) : (
                <p className="empty-state">Granted registrar wallets will appear here during this session.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
