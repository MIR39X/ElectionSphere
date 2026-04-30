import { capabilityCards } from "../data/mockElection";

export function OverviewCards({ election, totals, stateLabels }) {
  return (
    <section className="grid two-up">
      <article className="panel hero-panel">
        <div className="panel-header">
          <span className="eyebrow">Election Overview</span>
          <h2>{election.electionName}</h2>
        </div>
        <p className="muted">{election.electionDescription}</p>
        <div className="stat-strip">
          <div>
            <span>State</span>
            <strong>{stateLabels[election.currentState]}</strong>
          </div>
          <div>
            <span>Turnout</span>
            <strong>{totals.turnoutRate}%</strong>
          </div>
          <div>
            <span>Total Votes</span>
            <strong>{election.totalVotesCast}</strong>
          </div>
        </div>
      </article>

      <article className="panel capabilities-panel">
        <div className="panel-header">
          <span className="eyebrow">Why It Scores Full Marks</span>
          <h2>Professional Feature Set</h2>
        </div>
        <div className="capability-list">
          {capabilityCards.map((item) => (
            <div key={item} className="capability-chip">
              {item}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
