import { ArrowRight, CheckCircle2, Menu, MousePointerClick, ShieldCheck, Wallet } from "lucide-react";
import { createElement, useEffect, useRef, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AdminPanel } from "./components/AdminPanel";
import { DashboardView } from "./components/DashboardView";
import { ResultsView } from "./components/ResultsView";
import { VoteView } from "./components/VoteView";
import { useElectionData } from "./hooks/useElectionData";
import logoImage from "./assets/electionsphere-logo.png";

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
        isAdmin={isAdmin}
        isRegistrar={isRegistrar}
        isRegistered={isRegistered}
        isLoading={isLoading}
        onSupportedChain={onSupportedChain}
        notice={notice}
        error={error}
        explorerUrl={explorerUrl}
        onConnect={handleConnectWallet}
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
              wallet={wallet}
              onConnect={handleConnectWallet}
              isLoading={isLoading}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <WalletGate wallet={wallet} onConnect={handleConnectWallet} isLoading={isLoading}>
              <DashboardPage
                election={election}
                totals={totals}
                stateLabels={stateLabels}
                candidates={candidates}
                isAdmin={isAdmin}
                onAdvanceState={advanceState}
              />
            </WalletGate>
          }
        />
        <Route
          path="/vote"
          element={
            <WalletGate wallet={wallet} onConnect={handleConnectWallet} isLoading={isLoading}>
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
            </WalletGate>
          }
        />
        <Route
          path="/admin"
          element={
            <WalletGate wallet={wallet} onConnect={handleConnectWallet} isLoading={isLoading}>
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
            </WalletGate>
          }
        />
        <Route
          path="/results"
          element={
            <WalletGate wallet={wallet} onConnect={handleConnectWallet} isLoading={isLoading}>
              <ResultsPage candidates={candidates} election={election} totals={totals} />
            </WalletGate>
          }
        />
      </Routes>
    </div>
  );
}

function Navbar({
  wallet,
  isAdmin,
  isRegistrar,
  isRegistered,
  isLoading,
  onSupportedChain,
  notice,
  error,
  explorerUrl,
  onConnect,
  onDisconnect,
  onSwitchChain,
}) {
  const location = useLocation();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0, opacity: 0 });
  const navRef = useRef(null);
  const dashboardRef = useRef(null);
  const adminRef = useRef(null);
  const resultsRef = useRef(null);
  const voteRef = useRef(null);
  const roleLabel = isAdmin ? "Admin" : isRegistrar ? "Registrar" : isRegistered ? "Registered Voter" : "Viewer";
  const hasNotification = Boolean(notice || error || explorerUrl);

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) {
      return;
    }

    const refMap = {
      "/dashboard": dashboardRef,
      "/admin": adminRef,
      "/results": resultsRef,
      "/vote": voteRef,
      "/": dashboardRef,
    };

    const syncSlider = () => {
      const activeRef = refMap[location.pathname] || dashboardRef;
      const activeElement = activeRef.current;
      if (!activeElement) {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const navRect = navElement.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      setSliderStyle({
        width: activeRect.width,
        left: activeRect.left - navRect.left,
        opacity: 1,
      });
    };

    syncSlider();
    window.addEventListener("resize", syncSlider);
    return () => window.removeEventListener("resize", syncSlider);
  }, [location.pathname]);

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">
          <img src={logoImage} alt="ElectionSphere logo" />
        </span>
        <span className="brand-text">
          <strong className="brand-title">ElectionSphere</strong>
          <small className="brand-subtitle">Blockchain voting</small>
        </span>
      </NavLink>

      <nav className="nav-links" aria-label="Primary navigation" ref={navRef}>
        <span className="nav-active-slider" style={sliderStyle} aria-hidden="true" />
        <NavLink ref={dashboardRef} to="/dashboard" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Dashboard</NavLink>
        <NavLink ref={adminRef} to="/admin" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Admin</NavLink>
        <NavLink ref={resultsRef} to="/results" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>Results</NavLink>
        <NavLink ref={voteRef} to="/vote" className={({ isActive }) => `nav-link nav-cta vote-btn${isActive ? " active" : ""}`}>Vote</NavLink>
      </nav>

      <div className="topbar-actions">
        <div className="notification-wrap">
          <button
            className={`notification-button ${hasNotification ? "has-notification" : ""}`}
            onClick={() => setNotificationOpen((open) => !open)}
            aria-label="Open notifications"
            aria-expanded={notificationOpen}
            type="button"
          >
            <Menu size={17} />
          </button>
          {notificationOpen ? (
            <div className="notification-menu">
              <div className="notification-wallet-head">
                <span className="notification-wallet-label">Wallet</span>
                <strong className="notification-wallet-state">{wallet ? "Connected" : "Disconnected"}</strong>
              </div>
              {wallet ? (
                <>
                  <div className="notification-item wallet">{wallet}</div>
                  <div className="notification-item notification-role-row">
                    <span>Role</span>
                    <strong>{roleLabel}</strong>
                  </div>
                  {!onSupportedChain ? (
                    <button className="secondary-button compact notification-action" onClick={onSwitchChain} disabled={isLoading}>
                      Switch Network
                    </button>
                  ) : null}
                  <button
                    className="secondary-button compact disconnect-btn notification-action"
                    onClick={async () => {
                      setNotificationOpen(false);
                      await onDisconnect();
                    }}
                    disabled={isLoading}
                  >
                    Disconnect Wallet
                  </button>
                </>
              ) : (
                <button className="primary-button notification-action" onClick={onConnect} disabled={isLoading}>
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
              {error ? <div className="notification-item error">{error}</div> : null}
              {notice ? <div className="notification-item notice">{notice}</div> : null}
              {explorerUrl ? (
                <a className="notification-item link" href={explorerUrl} target="_blank" rel="noreferrer">
                  View deployed contract on block explorer
                </a>
              ) : null}
              {!error && !notice && !explorerUrl ? <div className="notification-item muted">No notifications</div> : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function LandingPage({ election, totals, stateLabels, wallet, onConnect, isLoading }) {
  const landingRef = useRef(null);
  const confidenceSignals = ["Powered by Ethereum wallets", "Verifiable results", "Tamper-proof voting"];
  const howItWorks = [
    { title: "Connect wallet", text: "Use MetaMask to identify the voter wallet.", Icon: Wallet },
    { title: "Cast vote", text: "Choose one candidate and confirm the transaction.", Icon: MousePointerClick },
    { title: "Results update live", text: "On-chain counts appear in the results view.", Icon: CheckCircle2 },
  ];

  useEffect(() => {
    const root = landingRef.current;
    if (!root) {
      return;
    }
    const revealNodes = Array.from(root.querySelectorAll(".reveal-on-scroll"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="landing-page" ref={landingRef}>
      <section className="landing-hero">
        <div className="hero-copy reveal-on-scroll reveal-up is-visible">
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
            {confidenceSignals.map((signal, index) => (
              <span key={signal} className="reveal-on-scroll reveal-pop" style={{ transitionDelay: `${120 + index * 90}ms` }}>
                <ShieldCheck size={16} strokeWidth={2.3} />
                {signal}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-status election-card reveal-on-scroll reveal-right is-visible">
          <h2>{election.electionName}</h2>
          {!wallet ? (
            <div className="wallet-required-card">
              <p>Wallet disconnected. Connect wallet to view election stats.</p>
              <button className="primary-button compact" onClick={onConnect} disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          ) : (
            <>
              <div className="live-status-list">
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
            </>
          )}
        </aside>
      </section>

      <section className="how-it-works-section reveal-on-scroll reveal-up">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Three steps from wallet to verified result</h2>
        </div>
        <div className="steps-grid">
          {howItWorks.map(({ title, text, Icon }, index) => (
            <article className="step-card reveal-on-scroll reveal-up" style={{ transitionDelay: `${160 + index * 100}ms` }} key={title}>
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
  return <DashboardView election={election} totals={totals} stateLabels={stateLabels} candidates={candidates} isAdmin={isAdmin} onAdvanceState={onAdvanceState} />;
}

function AdminPage({ wallet, onConnect, ...props }) {
  const canAccessAdmin = props.isAdmin || props.isRegistrar;
  if (!canAccessAdmin) {
    const roleLabel = props.isRegistered ? "Registered voter" : "Viewer";
    const deniedMessage = wallet
      ? "You are not allowed to access the Admin portal with this wallet. Connect an Admin or Registrar wallet."
      : "Connect MetaMask with an Admin or Registrar wallet to access the Admin portal.";

    return (
      <main className="admin-page">
        <div className="admin-guard-backdrop" role="presentation">
          <article className="admin-guard-popup" role="dialog" aria-modal="true" aria-labelledby="admin-guard-title">
            <div className="admin-guard-title-row">
              <h2 id="admin-guard-title">Access restricted</h2>
              {wallet ? (
                <div className="admin-guard-meta">
                  <span>Connected as</span>
                  <strong>{roleLabel}</strong>
                </div>
              ) : null}
            </div>
            <p>{deniedMessage}</p>
            <div className="admin-guard-actions">
              {!wallet ? (
                <button className="primary-button" onClick={onConnect}>
                  Connect MetaMask
                </button>
              ) : null}
              <NavLink className="secondary-button admin-guard-link" to="/dashboard">
                <span>Back to Dashboard</span>
                <ArrowRight size={16} />
              </NavLink>
            </div>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <AdminPanel {...props} wallet={wallet} onConnect={onConnect} />
    </main>
  );
}

function ResultsPage({ candidates, election, totals }) {
  return <ResultsView candidates={candidates} election={election} totals={totals} />;
}

function LiveStatRow({ label, value, highlighted = false }) {
  return (
    <div className="live-stat-row">
      <span>{label}</span>
      {highlighted ? <strong className="status-badge">{value}</strong> : <strong>{value}</strong>}
    </div>
  );
}

function WalletGate({ wallet, onConnect, isLoading, children }) {
  if (wallet) {
    return children;
  }
  return (
    <main className="admin-page">
      <div className="admin-guard-backdrop" role="presentation">
        <article className="admin-guard-popup" role="dialog" aria-modal="true" aria-labelledby="wallet-gate-title">
          <h2 id="wallet-gate-title">Access restricted</h2>
          <p>Please connect your wallet to show information.</p>
          <div className="admin-guard-actions">
            <button className="primary-button" onClick={onConnect} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </button>
            <NavLink className="secondary-button admin-guard-link" to="/">
              <span>Back to Home</span>
              <ArrowRight size={16} />
            </NavLink>
          </div>
        </article>
      </div>
    </main>
  );
}

export default App;
