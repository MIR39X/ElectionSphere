export function Header({
  wallet,
  isLoading,
  onConnect,
  onSwitchChain,
  onSupportedChain,
  requiredNetwork,
}) {
  return (
    <header className="shell-header">
      <div>
        <span className="eyebrow">Level 3 Blockchain Voting System</span>
        <h1>ElectionSphere</h1>
        <p className="lede">
          Transparent, role-based blockchain voting with MetaMask access, live tallying,
          and submission-ready deployment assets.
        </p>
      </div>
      <div className="header-actions">
        {wallet ? (
          <div className="wallet-pill">
            <span>Wallet</span>
            <strong>{`${wallet.slice(0, 6)}...${wallet.slice(-4)}`}</strong>
          </div>
        ) : null}
        {!onSupportedChain && wallet ? (
          <button className="secondary-button" onClick={onSwitchChain} disabled={isLoading}>
            Switch to {requiredNetwork}
          </button>
        ) : null}
        <button className="primary-button" onClick={onConnect} disabled={isLoading}>
          {wallet ? "Reconnect MetaMask" : "Connect MetaMask"}
        </button>
      </div>
    </header>
  );
}
