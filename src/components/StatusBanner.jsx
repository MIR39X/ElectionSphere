export function StatusBanner({ notice, error, explorerUrl }) {
  if (!notice && !error) {
    return null;
  }

  return (
    <section className="grid">
      {error ? <div className="banner error">{error}</div> : null}
      {notice ? <div className="banner notice">{notice}</div> : null}
      {explorerUrl ? (
        <a className="banner link" href={explorerUrl} target="_blank" rel="noreferrer">
          View deployed contract on block explorer
        </a>
      ) : null}
    </section>
  );
}
