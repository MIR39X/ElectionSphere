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
  onRevokeRegistrar,
  onDeactivateCandidate,
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
        <div className="access-item">
          <span className="live-pill"><span />{wallet ? "Admin Connected" : "Wallet Required"}</span>
          <strong>{shortAddress(wallet)}</strong>
        </div>
        <div className="access-item">
          <span>Role</span>
          <strong>{isAdmin ? "Admin" : isRegistrar ? "Registrar" : "Viewer"}</strong>
        </div>
        <div className="access-item">
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

            <div className="state-flow" aria-label="Election lifecycle">
              {stateLabels.map((label, index) => {
                const isDone = index < election.currentState;
                const isActive = index === election.currentState;
                const isNext = index === nextStateIndex;

                return (
                  <button
                    className={`state-step ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${
                      isNext ? "next" : ""
                    }`}
                    disabled={!isAdmin || !isNext}
                    key={label}
                    onClick={() => onAdvanceState(index)}
                    type="button"
                  >
                    <span>{isDone ? <CheckCircle2 size={15} /> : index + 1}</span>
                    <strong>{label}</strong>
                  </button>
                );
              })}
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

          <article className="admin-card">
            <div className="admin-card-header">
              <span className="section-icon"><ShieldCheck size={20} /></span>
              <div>
                <span className="eyebrow">Access Control</span>
                <h2>Registrar access</h2>
                <p className="section-help">Grant registrar permission to wallets that can manage voter registration.</p>
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
            {!isAdmin ? (
              <p className="permission-note">
                Connect the admin wallet to enable registrar access.
              </p>
            ) : null}
            <div className="entity-list compact-list">
              {trackedRegistrars.length ? (
                <div className="table-heading">
                  <span>Wallet</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
              ) : null}
              {trackedRegistrars.length ? (
                trackedRegistrars.map((registrar) => (
                  <div className="entity-row" key={registrar}>
                    <div>
                      <strong>{shortAddress(registrar)}</strong>
                      <span>Granted this session</span>
                    </div>
                    <div className="row-actions">
                      <span className="status-tag">Registrar</span>
                      <button
                        className="danger-button slim-button"
                        disabled={!isAdmin}
                        onClick={() => {
                          onRevokeRegistrar(registrar);
                          setTrackedRegistrars((items) => items.filter((item) => item !== registrar));
                          setInlineMessage("Registrar revoke submitted.");
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state compact-empty">No registrar wallets added in this session.</p>
              )}
            </div>
          </article>
        </div>

        <div className="admin-right-column">
          <section className="management-panel">
            <div className="admin-card-header">
              <span className="section-icon"><Users size={20} /></span>
              <div>
                <span className="eyebrow">Candidate Management</span>
                <h2>Candidates</h2>
                <p className="section-help">Add nominees and manage their active ballot status.</p>
              </div>
            </div>

            <div className="candidate-management-grid">
              <div className="compact-form add-candidate-form">
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

              <div>
                <div className="list-heading">
                  <strong>Candidates ({candidates.length})</strong>
                  <span>Active nominees</span>
                </div>
                <div className={`entity-list candidate-list ${candidates.length > 3 ? "candidate-list-scroll" : ""}`}>
                  {candidates.map((candidate) => (
                    <div className="entity-row candidate-row" key={candidate.id}>
                      <span className="candidate-avatar">{candidate.name.slice(0, 1)}</span>
                      <div>
                        <strong>{candidate.name}</strong>
                        <span>{candidate.party}</span>
                      </div>
                      <div className="row-actions">
                        <span className={candidate.active ? "status-tag" : "status-tag muted-tag"}>
                          {candidate.active ? "Active" : "Inactive"}
                        </span>
                        <button
                          className="danger-button slim-button"
                          disabled={!canManageCandidates || !candidate.active}
                          onClick={() => {
                            onDeactivateCandidate(candidate);
                            setInlineMessage("Candidate deactivation submitted.");
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="management-panel compact-management">
            <div className="admin-card-header">
              <span className="section-icon"><UserPlus size={20} /></span>
              <div>
                <span className="eyebrow">Voter Management</span>
                <h2>Registry</h2>
                <p className="section-help">Register approved voter wallets before voting closes.</p>
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
                <div className="table-heading">
                  <span>Wallet</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
              ) : null}
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
                <p className="empty-state compact-empty">No voter wallets added in this session.</p>
              )}
            </div>
          </section>

        </div>
      </section>
    </div>
  );
}
