import { Activity, BarChart3, Crown, Gauge, Pause, Settings, Square, Users, Vote } from "lucide-react";
import { createElement } from "react";
import { NavLink } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function StatCard({ icon: Icon, label, value, tone = "default" }) {
  return (
    <article className={`dashboard-card stat-card ${tone}`}>
      <span className="stat-icon">
        {createElement(Icon, { size: 20, strokeWidth: 2.3 })}
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export function DashboardView({ election, totals, stateLabels, candidates, isAdmin, onAdvanceState }) {
  const leadingCandidate = totals.leadingCandidate;
  const lastVoteLabel = election.totalVotesCast > 0 ? "Demo live" : "No votes yet";
  const statusLabel = stateLabels[election.currentState];

  const activity = [
    "Voting window is active",
    "Ballot station ready for registered wallets",
    "Results chart synced with election data",
  ];

  return (
    <main className="dashboard-page">
      <section className="status-strip">
        <div className="status-strip-left">
          <span className="live-pill"><span />{statusLabel}</span>
          <span>Last update: {lastVoteLabel}</span>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <StatCard icon={Gauge} label="Election Status" value={statusLabel} tone="success" />
        <StatCard icon={Users} label="Registered Voters" value={election.registeredVoterCount} />
        <StatCard icon={Vote} label="Votes Cast" value={election.totalVotesCast} />
        <StatCard icon={BarChart3} label="Turnout" value={`${totals.turnoutRate}%`} />
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-card chart-card">
          <div className="dashboard-section-header">
            <div>
              <span className="eyebrow">Live voting activity</span>
              <h2>Candidate vote distribution</h2>
            </div>
          </div>
          <div className="dashboard-chart">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={candidates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7edf4" />
                <XAxis dataKey="name" stroke="#617086" tickLine={false} axisLine={false} />
                <YAxis stroke="#617086" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(31, 143, 106, 0.08)" }}
                  contentStyle={{
                    borderRadius: 12,
                    background: "#ffffff",
                    border: "0",
                    boxShadow: "0 12px 30px rgba(22,32,51,0.12)",
                  }}
                />
                <Bar dataKey="voteCount" radius={[10, 10, 0, 0]} animationDuration={900}>
                  {candidates.map((candidate) => (
                    <Cell
                      key={candidate.id}
                      fill={candidate.id === leadingCandidate?.id ? "#1f8f6a" : "#9eb0c6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <aside className="dashboard-card activity-card">
          <div className="dashboard-section-header">
            <div>
              <span className="eyebrow">Feed</span>
              <h2>Live activity</h2>
            </div>
            <Activity size={20} />
          </div>
          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-item" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {isAdmin ? (
        <section className="dashboard-card quick-actions-card">
          <div className="dashboard-section-header">
            <div>
              <span className="eyebrow">Admin</span>
              <h2>Quick actions</h2>
            </div>
          </div>
          <div className="quick-actions">
            <button className="secondary-button" disabled={election.currentState >= 3} onClick={() => onAdvanceState(3)}>
              <Pause size={17} /> End Voting
            </button>
            <button className="secondary-button" disabled={election.currentState >= 4} onClick={() => onAdvanceState(4)}>
              <Square size={17} /> Publish Results
            </button>
            <NavLink className="secondary-button" to="/results">
              <Crown size={17} /> View Full Results
            </NavLink>
            <NavLink className="secondary-button" to="/admin">
              <Settings size={17} /> Manage Candidates
            </NavLink>
          </div>
        </section>
      ) : null}
    </main>
  );
}
