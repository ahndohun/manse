import Image from "next/image";
import Link from "next/link";
import logo from "../../../landing/src/assets/brand/manse-logo-trim.png";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer" href="/" aria-label="Manse home">
            <Image className="brand-image" src={logo} alt="Manse" />
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
        <span>MIT licensed. Built in the open.</span>
        <span>Manse is an independent open-source project.</span>
      </div>
    </footer>
  );
}
