export function CandidateGrid({ candidates, onVote, canVote, hasVoted, isLoading }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <span className="eyebrow">Candidates</span>
        <h2>Public Ballot View</h2>
      </div>
      <div className="candidate-grid">
        {candidates.map((candidate) => (
          <article key={candidate.id} className="candidate-card">
            <div className="candidate-badge">{candidate.party}</div>
            <h3>{candidate.name}</h3>
            <p>{candidate.manifesto}</p>
            <div className="candidate-footer">
              <div>
                <span>Votes</span>
                <strong>{candidate.voteCount}</strong>
              </div>
              <button
                className="primary-button"
                disabled={!canVote || hasVoted || isLoading || !candidate.active}
                onClick={() => onVote(candidate.id)}
              >
                {hasVoted ? "Vote Cast" : "Vote"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
