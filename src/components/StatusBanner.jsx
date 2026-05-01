import { useState } from "react";

export function StatusBanner({ notice, error, explorerUrl }) {
  const [isNoticeOpen, setNoticeOpen] = useState(false);

  if (!notice && !error && !explorerUrl) {
    return null;
  }

  return (
    <>
      <section className="grid">
        {error ? <div className="banner error">{error}</div> : null}
        {explorerUrl ? (
          <a className="banner link" href={explorerUrl} target="_blank" rel="noreferrer">
            View deployed contract on block explorer
          </a>
        ) : null}
      </section>

      {notice ? (
        <div className={`notice-fab ${isNoticeOpen ? "open" : ""}`}>
          <button
            className="notice-fab-trigger"
            type="button"
            onClick={() => setNoticeOpen((open) => !open)}
            aria-expanded={isNoticeOpen}
            aria-label="Toggle notification"
          >
            Notification
          </button>
          {isNoticeOpen ? <div className="notice-fab-panel">{notice}</div> : null}
        </div>
      ) : null}
    </>
  );
}
