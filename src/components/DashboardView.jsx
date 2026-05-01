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
  const statusLabel = stateLabels[election.currentState];

  const activity = [
    "Voting window is active",
    "Ballot station ready for registered wallets",
    "Results chart synced with election data",
  ];

  return (
    <main className="dashboard-page">
      <section className="dashboard-top-strip dashboard-card">
        {isAdmin ? (
          <div className="quick-actions quick-actions-top">
            <button className="secondary-button compact" disabled={election.currentState >= 3} onClick={() => onAdvanceState(3)}>
              <Pause size={16} /> End Voting
            </button>
            <button className="secondary-button compact" disabled={election.currentState >= 4} onClick={() => onAdvanceState(4)}>
              <Square size={16} /> Publish Results
            </button>
            <NavLink className="secondary-button compact" to="/results">
              <Crown size={16} /> Full Results
            </NavLink>
            <NavLink className="secondary-button compact" to="/admin">
              <Settings size={16} /> Candidates
            </NavLink>
          </div>
        ) : null}

        <div className="dashboard-stats-grid">
          <StatCard icon={Gauge} label="Election Status" value={statusLabel} tone="success" />
          <StatCard icon={Users} label="Registered Voters" value={election.registeredVoterCount} />
          <StatCard icon={Vote} label="Votes Cast" value={election.totalVotesCast} />
          <StatCard icon={BarChart3} label="Turnout" value={`${totals.turnoutRate}%`} />
        </div>
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

    </main>
  );
}
