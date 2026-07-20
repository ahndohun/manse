import type { Metadata } from "next";
import Link from "next/link";
import { catalogSnapshot } from "./catalog/catalog";
import { CatalogExplorer } from "./components/CatalogExplorer";
import { PageShell } from "./components/PageShell";

export const metadata: Metadata = {
  title: "Every screen can be a playground",
  description: "Discover open-source browser motion games, or use Codex to create and publish your own with Manse.",
};

const creatorSteps = [
  ["01", "Install Manse Creator", "Add the open-source plugin to Codex. No Manse account or API key is required."],
  ["02", "Describe your game", "Turn an idea into a motion game with original assets, accessible defaults, and a live preview."],
  ["03", "Publish with Sites", "Ship a standalone, creator-owned game Site with its engine and assets bundled."],
  ["04", "Join the Showcase", "Submit its public manifest. Automated checks and maintainer review keep listings dependable."],
] as const;

const platformLayers = [
  ["Engine", "Camera-native play", "Pose input, responsive rendering, challenge primitives, captions, audio, and adaptive play.", "coral"],
  ["Open format", "Games as portable data", "A strict versioned contract keeps games inspectable, remixable, and free of uploaded code.", "blue"],
  ["Codex plugin", "A studio for everyone", "Create, generate, preview, validate, remix, publish, and submit without hand-editing source.", "lime"],
  ["Showcase", "Discovery, not a gate", "The catalog links to independent creator Sites and never embeds third-party game code.", "yellow"],
] as const;

export default function Home() {
  return (
    <PageShell>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-coral"><span aria-hidden="true" /> Open-source active play</p>
            <h1>Every screen can be a <em>playground.</em></h1>
            <p className="hero-lede">Manse turns a camera-equipped browser into a motion game console—and gives anyone a Codex-powered path to create and publish games of their own.</p>
            <div className="button-row">
              <a className="button button-coral button-large" href="#games">Explore games <span aria-hidden="true">↓</span></a>
              <Link className="button button-ghost button-large" href="/docs#install">Create a game <span aria-hidden="true">↗</span></Link>
            </div>
            <ul className="hero-proof" aria-label="Platform promises">
              <li><span aria-hidden="true">✓</span> No player account</li>
              <li><span aria-hidden="true">✓</span> On-device camera</li>
              <li><span aria-hidden="true">✓</span> MIT licensed</li>
            </ul>
          </div>
          <div className="hero-demo" aria-label="Illustration of a Manse motion game">
            <div className="demo-window">
              <div className="demo-topbar"><span><i aria-hidden="true" /> LIVE MOTION</span><b>On device</b></div>
              <div className="demo-playfield">
                <span className="target target-left" aria-hidden="true" /><span className="target target-right" aria-hidden="true" /><span className="target target-top" aria-hidden="true" />
                <div className="pose-person" aria-hidden="true"><span className="pose-head" /><span className="pose-body" /><span className="pose-arm pose-arm-left" /><span className="pose-arm pose-arm-right" /><span className="pose-leg pose-leg-left" /><span className="pose-leg pose-leg-right" /></div>
                <div className="demo-prompt"><span>Reach up</span><strong>3</strong></div>
              </div>
              <div className="demo-bottombar"><span>Private</span><span>Adaptive</span><span>Browser native</span></div>
            </div>
            <div className="floating-card floating-card-device"><span>PLAY ON</span>Phone · PC · Tablet · TV</div>
            <div className="floating-card floating-card-open"><strong>100%</strong> open source</div>
          </div>
        </div>
      </section>

      <section className="catalog-section section" id="games">
        <div className="shell">
          <div className="section-heading split-heading"><div><p className="eyebrow">Community showcase</p><h2>Play something that moves you.</h2></div><p>Every listing is a reviewed link to an independent, creator-owned ChatGPT Site. Games open directly—never in an iframe.</p></div>
          <CatalogExplorer games={catalogSnapshot.games} />
        </div>
      </section>

      <section className="creator-section section" id="create">
        <div className="shell creator-grid">
          <div className="creator-intro"><p className="eyebrow eyebrow-light">Made with Codex. Owned by you.</p><h2>From an idea to a public game Site.</h2><p>Manse Creator turns Codex into a motion game studio. You keep the source, Site, assets, and deployment history.</p><Link className="button button-light button-large" href="/docs#install">Start creating <span aria-hidden="true">↗</span></Link></div>
          <ol className="creator-steps">{creatorSteps.map(([number, title, body]) => <li key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
        </div>
      </section>

      <section className="platform-section section" id="platform">
        <div className="shell">
          <div className="section-heading centered-heading"><p className="eyebrow">The open active-game layer</p><h2>One platform. Four pieces that fit.</h2><p>Build on the engine, publish through Sites, and stay compatible through a small public contract.</p></div>
          <div className="platform-grid">{platformLayers.map(([label, title, body, accent], index) => <article className={`platform-card accent-${accent}`} key={label}><div className="platform-card-top"><span>{label}</span><span aria-hidden="true">0{index + 1}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section className="performance-section section">
        <div className="shell performance-grid">
          <div className="performance-visual" aria-hidden="true"><div className="perf-ring perf-ring-a" /><div className="perf-ring perf-ring-b" /><div className="perf-core">MOVE</div><span className="perf-chip chip-one">Pose input</span><span className="perf-chip chip-two">Smooth render</span><span className="perf-chip chip-three">Auto quality</span></div>
          <div className="performance-copy"><p className="eyebrow">Performance that adapts</p><h2>Designed to feel responsive across real-world devices.</h2><p>Manse separates pose inference from rendering, smooths motion without hiding intent, and adjusts quality to the device instead of assuming flagship hardware.</p><dl className="performance-list"><div><dt>Local pose processing</dt><dd>Camera frames stay in the player&apos;s browser.</dd></div><div><dt>Adaptive quality tiers</dt><dd>Model, inference cadence, and effects scale independently.</dd></div><div><dt>Graceful input paths</dt><dd>Simulator and accessible alternatives keep games inclusive.</dd></div></dl><div className="device-row" aria-label="Target devices"><span>Phones</span><span>Tablets</span><span>Computers</span><span>Smart TVs</span></div></div>
        </div>
      </section>

      <section className="privacy-section"><div className="shell privacy-grid"><div><p className="eyebrow eyebrow-light">Private by architecture</p><h2>Your room stays in your room.</h2></div><div className="privacy-points"><div><span aria-hidden="true">01</span><p>Camera frames are processed on the playing device and never uploaded by Manse.</p></div><div><span aria-hidden="true">02</span><p>No player login, behavioral analytics, central profile, or child-data collection.</p></div><div><span aria-hidden="true">03</span><p>Open source makes the runtime and permissions inspectable before anyone plays.</p></div></div></div></section>

      <section className="final-cta section"><div className="shell final-cta-card"><div><p className="eyebrow">Ready when you are</p><h2>Make the game you wish existed.</h2><p>Describe it in Codex. Preview it with Manse. Publish it with Sites.</p></div><div className="button-row"><Link className="button button-coral button-large" href="/docs#install">Get Manse Creator <span aria-hidden="true">↗</span></Link><a className="button button-ghost button-large" href="https://github.com/ahndohun/manse" target="_blank" rel="noreferrer">View source <span aria-hidden="true">↗</span></a></div></div></section>
    </PageShell>
  );
}
