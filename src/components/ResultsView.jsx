import { Award, BarChart3, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function getPercentage(votes, totalVotes) {
  if (!totalVotes) {
    return 0;
  }
  return Math.round((votes / totalVotes) * 100);
}

export function ResultsView({ candidates, election, totals }) {
  const totalVotes = election.totalVotesCast;
  const rankedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const winner = rankedCandidates[0];
  const runnerUp = rankedCandidates[1];
  const winningGap = winner && runnerUp ? winner.voteCount - runnerUp.voteCount : 0;
  const chartData = rankedCandidates.map((candidate) => ({
    ...candidate,
    percentage: getPercentage(candidate.voteCount, totalVotes),
    voteLabel: `${candidate.voteCount} votes`,
  }));

  return (
    <main className="results-dashboard">
      <section className="results-summary-strip">
        <div>
          <span>Results Status</span>
          <strong>Live Results</strong>
        </div>
        <div>
          <span>Total votes</span>
          <strong>{totalVotes}</strong>
        </div>
        <div>
          <span>Turnout</span>
          <strong>{totals.turnoutRate}%</strong>
        </div>
        <div>
          <span>Leading</span>
          <strong>{winner?.name || "Not available"}</strong>
        </div>
      </section>

      <section className="results-main-grid">
        <article className="results-card results-chart-card">
          <div className="results-section-header">
            <div>
              <span className="eyebrow">Vote Distribution</span>
              <h2>Candidate results</h2>
            </div>
            <BarChart3 size={22} />
          </div>
          <div className="results-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 42, bottom: 8, left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7edf4" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={112} tickLine={false} axisLine={false} stroke="#617086" />
                <Tooltip
                  cursor={{ fill: "rgba(31, 143, 106, 0.07)" }}
                  contentStyle={{
                    borderRadius: 12,
                    background: "#ffffff",
                    border: "0",
                    boxShadow: "0 12px 30px rgba(22,32,51,0.12)",
                  }}
                  formatter={(value, name, item) => [`${value} votes (${item.payload.percentage}%)`, "Votes"]}
                />
                <Bar dataKey="voteCount" radius={[0, 10, 10, 0]} animationDuration={900}>
                  {chartData.map((candidate, index) => (
                    <Cell key={candidate.id} fill={index === 0 ? "#1f8f6a" : "#9eb0c6"} />
                  ))}
                  <LabelList
                    dataKey="voteLabel"
                    position="right"
                    fill="#162033"
                    fontSize={13}
                    fontWeight={800}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <aside className="results-side-panel">
          <article className="results-card winner-card">
            <div className="winner-topline">
              <span className="winner-icon"><Trophy size={22} /></span>
              <span className="winner-badge">Leading Candidate</span>
            </div>
            <h2>{winner?.name || "Not available"}</h2>
            <p>{winner?.party || "No party available"}</p>
            <span className="winner-lead-text">Leading by {winningGap} votes</span>
            <div className="winner-metrics">
              <div>
                <span>Votes</span>
                <strong>{winner?.voteCount || 0}</strong>
              </div>
              <div>
                <span>Share</span>
                <strong>{winner ? getPercentage(winner.voteCount, totalVotes) : 0}%</strong>
              </div>
            </div>
            <div className="winner-progress" aria-label="Leader vote share">
              <span style={{ width: `${winner ? getPercentage(winner.voteCount, totalVotes) : 0}%` }} />
            </div>
          </article>

          <article className="results-card ranking-card">
            <div className="results-section-header compact">
              <div>
                <span className="eyebrow">Ranking</span>
                <h2>Candidate order</h2>
              </div>
              <Award size={20} />
            </div>
            <div className="ranking-list">
              {rankedCandidates.map((candidate, index) => (
                <div className={`ranking-row ${index === 0 ? "winner-rank" : ""}`} key={candidate.id}>
                  <span className="rank-number">{index + 1}</span>
                  <div>
                    <strong>
                      {candidate.name}
                      {index === 0 ? <small className="winner-label">Leading</small> : null}
                    </strong>
                    <small>{candidate.party}</small>
                    <div className="rank-progress">
                      <span style={{ width: `${getPercentage(candidate.voteCount, totalVotes)}%` }} />
                    </div>
                  </div>
                  <strong className="rank-votes">
                    {candidate.voteCount}
                    <small>{getPercentage(candidate.voteCount, totalVotes)}%</small>
                  </strong>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

    </main>
  );
}
