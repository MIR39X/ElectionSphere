import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ResultsPanel({ candidates, election, totals }) {
  return (
    <section className="grid two-up">
      <article className="panel">
        <div className="panel-header">
          <span className="eyebrow">Live Tally</span>
          <h2>Real-Time Vote Distribution</h2>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={candidates}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#8ca4b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#8ca4b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  background: "#0d1a28",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <Bar dataKey="voteCount" fill="url(#voteGradient)" radius={[10, 10, 0, 0]} />
              <defs>
                <linearGradient id="voteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffcf5c" />
                  <stop offset="100%" stopColor="#ff7d52" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <span className="eyebrow">Election Health</span>
          <h2>Operational Snapshot</h2>
        </div>
        <div className="metric-stack">
          <div className="metric-card">
            <span>Registered voters</span>
            <strong>{election.registeredVoterCount}</strong>
          </div>
          <div className="metric-card">
            <span>Total votes cast</span>
            <strong>{election.totalVotesCast}</strong>
          </div>
          <div className="metric-card">
            <span>Leading candidate</span>
            <strong>{totals.leadingCandidate?.name || "Not available"}</strong>
          </div>
        </div>
      </article>
    </section>
  );
}
