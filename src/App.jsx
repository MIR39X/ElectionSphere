import { CheckCircle2, MousePointerClick, ShieldCheck, Wallet } from "lucide-react";
import { createElement } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { AdminPanel } from "./components/AdminPanel";
import { DashboardView } from "./components/DashboardView";
import { ResultsView } from "./components/ResultsView";
import { StatusBanner } from "./components/StatusBanner";
import { VoteView } from "./components/VoteView";
import { useElectionData } from "./hooks/useElectionData";

function App() {
  const electionData = useElectionData();
  const {
    wallet,
    isAdmin,
    isRegistrar,
    isRegistered,
    hasVoted,
    isLoading,
    notice,
    error,
    election,
    candidates,
    totals,
    stateLabels,
    usingFallback,
    onSupportedChain,
    explorerUrl,
    handleConnectWallet,
    handleDisconnectWallet,
    handleSwitchChain,
    addCandidate,
    registerVoter,
    removeVoter,
    grantRegistrar,
    revokeRegistrar,
    deactivateCandidate,
    advanceState,
    castVote,
  } = electionData;

  return (
    <div className="app-shell">
      <Navbar
        wallet={wallet}
        isLoading={isLoading}
        onSupportedChain={onSupportedChain}
        onDisconnect={handleDisconnectWallet}
        onSwitchChain={handleSwitchChain}
      />

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              election={election}
              totals={totals}
              stateLabels={stateLabels}
              usingFallback={usingFallback}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <WithStatus notice={notice} error={error} usingFallback={usingFallback} explorerUrl={explorerUrl}>
              <DashboardPage
                election={election}
                totals={totals}
                stateLabels={stateLabels}
                candidates={candidates}
                isAdmin={isAdmin}
                onAdvanceState={advanceState}
              />
            </WithStatus>
          }
        />
        <Route
          path="/vote"
          element={
            <WithStatus notice={notice} error={error} usingFallback={usingFallback} explorerUrl={explorerUrl}>
              <VoteView
                candidates={candidates}
                hasVoted={hasVoted}
                isLoading={isLoading}
                isRegistered={isRegistered}
                wallet={wallet}
                election={election}
                stateLabels={stateLabels}
                onVote={castVote}
                onConnect={handleConnectWallet}
                onSupportedChain={onSupportedChain}
              />
            </WithStatus>
          }
        />
        <Route
          path="/admin"
          element={
            <WithStatus notice={notice} error={error} usingFallback={usingFallback} explorerUrl={explorerUrl}>
              <AdminPage
                election={election}
                stateLabels={stateLabels}
                isAdmin={isAdmin}
                isRegistrar={isRegistrar}
                candidates={candidates}
                onAddCandidate={addCandidate}
                onRegisterVoter={registerVoter}
                onRemoveVoter={removeVoter}
                onGrantRegistrar={grantRegistrar}
                onRevokeRegistrar={revokeRegistrar}
                onDeactivateCandidate={deactivateCandidate}
                onAdvanceState={advanceState}
                onConnect={handleConnectWallet}
                wallet={wallet}
              />
            </WithStatus>
          }
        />
        <Route
          path="/results"
          element={
            <WithStatus notice={notice} error={error} usingFallback={usingFallback} explorerUrl={explorerUrl}>
              <ResultsPage candidates={candidates} election={election} totals={totals} />
            </WithStatus>
          }
        />
        <Route
          path="/setup"
          element={
            <SetupPage
              wallet={wallet}
              isAdmin={isAdmin}
              isRegistrar={isRegistrar}
              isRegistered={isRegistered}
              hasVoted={hasVoted}
              election={election}
              stateLabels={stateLabels}
              usingFallback={usingFallback}
              onSupportedChain={onSupportedChain}
            />
          }
        />
      </Routes>
    </div>
  );
}

function Navbar({ wallet, isLoading, onSupportedChain, onDisconnect, onSwitchChain }) {
  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">ES</span>
        <span>
          <strong>ElectionSphere</strong>
          <small>Blockchain voting</small>
        </span>
      </NavLink>

      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/admin">Admin</NavLink>
        <NavLink to="/results">Results</NavLink>
        <NavLink to="/vote" className="nav-cta">Vote</NavLink>
      </nav>

      <div className="topbar-actions">
        {wallet ? <span className="wallet-chip">{`${wallet.slice(0, 6)}...${wallet.slice(-4)}`}</span> : null}
        {!onSupportedChain && wallet ? (
          <button className="secondary-button compact" onClick={onSwitchChain} disabled={isLoading}>
            Switch Network
          </button>
        ) : null}
        {wallet ? (
          <button className="secondary-button compact" onClick={onDisconnect} disabled={isLoading}>
            Disconnect
          </button>
        ) : null}
      </div>
    </header>
  );
}

function LandingPage({ election, totals, stateLabels, usingFallback }) {
  const confidenceSignals = ["Powered by Ethereum wallets", "Verifiable results", "Tamper-proof voting"];
  const howItWorks = [
    { title: "Connect wallet", text: "Use MetaMask to identify the voter wallet.", Icon: Wallet },
    { title: "Cast vote", text: "Choose one candidate and confirm the transaction.", Icon: MousePointerClick },
    { title: "Results update live", text: "On-chain counts appear in the results view.", Icon: CheckCircle2 },
  ];

  return (
    <main>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Secure campus elections</span>
          <h1>Transparent voting for campus elections.</h1>
          <p>
            ElectionSphere gives admins a controlled election workflow and gives voters a simple, verifiable ballot
            experience powered by Ethereum wallets.
          </p>
          <div className="hero-actions">
            <NavLink className="primary-button link-button" to="/vote">
              Open Ballot
            </NavLink>
            <NavLink className="secondary-button link-button" to="/dashboard">
              View Dashboard
            </NavLink>
          </div>
          <p className="cta-note">Takes less than 30 seconds to open the ballot.</p>
          <div className="confidence-row">
            {confidenceSignals.map((signal) => (
              <span key={signal}>
                <ShieldCheck size={16} strokeWidth={2.3} />
                {signal}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-status election-card">
          <div className="live-card-topline">
            <span className="eyebrow">Current election</span>
            <span className="live-pill"><span />Live</span>
          </div>
          <h2>{election.electionName}</h2>
          <div className="live-status-list">
            <LiveStatRow label="Mode" value={usingFallback ? "Demo data" : "Live contract"} />
            <LiveStatRow label="State" value={stateLabels[election.currentState]} highlighted />
            <LiveStatRow label="Turnout" value={`${totals.turnoutRate}%`} highlighted />
            <LiveStatRow label="Votes cast" value={election.totalVotesCast} />
          </div>
          <div className="turnout-progress" aria-label={`Turnout ${totals.turnoutRate}%`}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(totals.turnoutRate, 100)}%` }} />
            </div>
            <span>{totals.turnoutRate}% turnout</span>
          </div>
        </aside>
      </section>

      <section className="how-it-works-section">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Three steps from wallet to verified result</h2>
        </div>
        <div className="steps-grid">
          {howItWorks.map(({ title, text, Icon }) => (
            <article className="step-card" key={title}>
              <span className="step-icon">{createElement(Icon, { size: 22, strokeWidth: 2.3 })}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function DashboardPage({ election, totals, stateLabels, candidates, isAdmin, onAdvanceState }) {
  return (
    <DashboardView
      election={election}
      totals={totals}
      stateLabels={stateLabels}
      candidates={candidates}
      isAdmin={isAdmin}
      onAdvanceState={onAdvanceState}
    />
  );
}

function AdminPage({ wallet, onConnect, ...props }) {
  return (
    <main className="admin-page">
      <AdminPanel {...props} wallet={wallet} onConnect={onConnect} />
    </main>
  );
}

function ResultsPage({ candidates, election, totals }) {
  return <ResultsView candidates={candidates} election={election} totals={totals} />;
}

function SetupPage({ wallet, isAdmin, isRegistrar, isRegistered, hasVoted, election, stateLabels, usingFallback, onSupportedChain }) {
  return (
    <main className="page-stack">
      <PageHeading
        eyebrow="Setup"
        title="How to run the project"
        text="Use this page as the checklist for demo mode, local testing, and live Sepolia deployment."
      />
      <section className="grid two-up">
        <article className="panel">
          <div className="panel-header">
            <span className="eyebrow">Current session</span>
            <h2>Connection summary</h2>
          </div>
          <div className="status-list">
            <StatusItem label="Wallet" value={wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Not connected"} />
            <StatusItem label="Network" value={onSupportedChain ? "Supported" : "Needs Sepolia"} />
            <StatusItem label="Data source" value={usingFallback ? "Demo fallback" : "Smart contract"} />
            <StatusItem label="Election state" value={stateLabels[election.currentState]} />
            <StatusItem label="Admin" value={isAdmin ? "Yes" : "No"} />
            <StatusItem label="Registrar" value={isRegistrar ? "Yes" : "No"} />
            <StatusItem label="Registered voter" value={isRegistered ? "Yes" : "No"} />
            <StatusItem label="Already voted" value={hasVoted ? "Yes" : "No"} />
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <span className="eyebrow">Commands</span>
            <h2>Local workflow</h2>
          </div>
          <div className="command-list">
            <code>npm install</code>
            <code>npm run dev</code>
            <code>npm run compile</code>
            <code>npm test</code>
            <code>npm run deploy:sepolia</code>
          </div>
        </article>
      </section>
    </main>
  );
}

function PageHeading({ eyebrow, title, text }) {
  return (
    <section className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

function StatusItem({ label, value }) {
  return (
    <div className="status-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LiveStatRow({ label, value, highlighted = false }) {
  return (
    <div className="live-stat-row">
      <span>{label}</span>
      {highlighted ? <strong className="status-badge">{value}</strong> : <strong>{value}</strong>}
    </div>
  );
}

function WithStatus({ children, notice, error, usingFallback, explorerUrl }) {
  return (
    <>
      <StatusBanner notice={notice} error={error} usingFallback={usingFallback} explorerUrl={explorerUrl} />
      {children}
    </>
  );
}

export default App;
