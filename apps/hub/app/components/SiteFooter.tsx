import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer" href="/" aria-label="Manse home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>manse</span>
          </Link>
          <p className="footer-note">
            Open-source active play for every camera-equipped screen.
          </p>
        </div>

        <div className="footer-links" aria-label="Platform links">
          <p>Platform</p>
          <Link href="/playground">Engine playground</Link>
          <Link href="/#games">Explore games</Link>
          <Link href="/#platform">How it works</Link>
          <Link href="/docs">Documentation</Link>
        </div>

        <div className="footer-links" aria-label="Creator links">
          <p>Creators</p>
          <Link href="/docs#install">Install plugin</Link>
          <Link href="/docs#game-contract">Game contract</Link>
          <Link href="/submit">Submit a game</Link>
        </div>

        <div className="footer-links" aria-label="Open source links">
          <p>Open source</p>
          <a href="https://github.com/ahndohun/manse" target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://github.com/ahndohun/manse/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
          >
            MIT license <span aria-hidden="true">↗</span>
          </a>
          <Link href="/docs#privacy">Privacy</Link>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© 2026 Manse contributors.</span>
        <span>Built in the open. Played in the browser.</span>
      </div>
    </footer>
  );
}
