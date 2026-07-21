import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../components/PageShell";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Install Manse Creator, understand the open game contract, and publish a motion game with Codex and Sites.",
};

const pluginSkills = [
  ["create-game", "Turn a natural-language brief into a complete Manse game Site."],
  ["generate-assets", "Create original art and keep its provenance and license metadata."],
  ["preview-game", "Run the simulator and a local browser preview before using a camera."],
  ["validate-game", "Check the pack, public manifest, assets, accessibility, and compatibility."],
  ["remix-game", "Create an attributed variation from a compatible open game."],
  ["publish-game", "Publish through Sites and verify the public deployment contract."],
  ["submit-to-showcase", "Prepare the small catalog contribution for maintainer review."],
] as const;

export default function DocsPage() {
  return (
    <PageShell>
      <header className="docs-hero">
        <div className="shell docs-hero-grid">
          <div>
            <p className="eyebrow eyebrow-coral">Manse documentation · v0.1</p>
            <h1>Build active games in plain language.</h1>
            <p>Manse Creator gives Codex the engine contract, deterministic checks, publishing workflow, and reusable design patterns it needs to build a standalone motion game Site.</p>
            <div className="button-row"><a className="button button-coral button-large" href="#install">Install the plugin <span aria-hidden="true">↓</span></a><a className="button button-ghost button-large" href="https://github.com/ahndohun/manse" target="_blank" rel="noreferrer">Browse source <span aria-hidden="true">↗</span></a></div>
          </div>
          <aside className="docs-map" aria-label="Documentation contents">
            <p>On this page</p>
            <a href="#install"><span>01</span> Install Manse Creator</a>
            <a href="#first-game"><span>02</span> Create your first game</a>
            <a href="#game-contract"><span>03</span> Game Site contract</a>
            <a href="#runtime"><span>04</span> Runtime and devices</a>
            <a href="#privacy"><span>05</span> Privacy and safety</a>
          </aside>
        </div>
      </header>

      <div className="shell docs-layout">
        <aside className="docs-sidebar" aria-label="Documentation navigation">
          <strong>Start here</strong><a href="#install">Install</a><a href="#first-game">First game</a><strong>Reference</strong><a href="#game-contract">Game contract</a><a href="#runtime">Runtime</a><a href="#privacy">Privacy</a><Link href="/submit">Showcase listing</Link>
        </aside>

        <article className="docs-content">
          <section id="install" className="docs-section">
            <p className="docs-kicker">01 · Install</p>
            <h2>Add Manse Creator to Codex.</h2>
            <p>The plugin is distributed from the open Manse repository marketplace. It runs inside Codex and does not require an OpenAI API key, Manse account, or publishing token.</p>
            <ol className="instruction-list">
              <li><span>1</span><div><h3>Open Plugins in Codex</h3><p>Use the Codex app&apos;s plugin manager and choose to add a repository marketplace.</p></div></li>
              <li><span>2</span><div><h3>Add the Manse repository</h3><p>Use <code>https://github.com/ahndohun/manse</code> as the marketplace source.</p></div></li>
              <li><span>3</span><div><h3>Install Manse Creator</h3><p>Select <strong>Manse Creator</strong>, then begin with “Create a Manse game about…”</p></div></li>
            </ol>
            <div className="callout"><strong>Creator promise</strong><p>You should be able to describe, preview, validate, and publish a game without manually editing source code.</p></div>
          </section>

          <section id="first-game" className="docs-section">
            <p className="docs-kicker">02 · Create</p>
            <h2>Use one conversation from idea to Site.</h2>
            <div className="prompt-card"><span>Example prompt</span><p>“Create a gentle ocean rescue motion game for ages 6–9, playable while seated or standing, in English and Korean.”</p></div>
            <p>Codex selects the right Manse Creator skills as the project moves through the workflow:</p>
            <div className="skill-list">{pluginSkills.map(([name, description]) => <div key={name}><code>{name}</code><p>{description}</p></div>)}</div>
            <p>The plugin pauses for meaningful creative choices and performs deterministic validation before it proposes publishing.</p>
          </section>

          <section id="game-contract" className="docs-section">
            <p className="docs-kicker">03 · Contract</p>
            <h2>Every published game stands on its own.</h2>
            <p>A Manse game is an independent public Site. Its runtime, packs, generated assets, and offline resources are bundled with the deployment—there is no runtime CDN or hosted AI dependency.</p>
            <div className="contract-grid">
              <div><span>Public manifest</span><code>/.well-known/manse-game.json</code><p>Identity, URLs, engine compatibility, locales, movement, accessibility, license, and provenance.</p></div>
              <div><span>Portable pack</span><code>/packs/&lt;game&gt;/manse.pack.json</code><p>Strict declarative scenes, challenges, localized narration, assets, and adaptation data.</p></div>
            </div>
            <h3>Version 1 safety boundary</h3>
            <ul className="check-list"><li>No arbitrary JavaScript, HTML, or executable WebAssembly in packs.</li><li>All assets use relative in-Site paths and declare origin and license.</li><li>Unknown fields, broken references, and paths escaping the pack root fail validation.</li><li>Permissions are explicit; v0.1 permits camera and device-local storage only.</li></ul>
          </section>

          <section id="runtime" className="docs-section">
            <p className="docs-kicker">04 · Runtime</p>
            <h2>Target the browser, adapt to the device.</h2>
            <p>The engine keeps pose inference and rendering independent so each can scale without slowing the other. Quality tiers can adjust model complexity, inference cadence, effects, and resolution while preserving the game rules.</p>
            <div className="info-table" role="table" aria-label="Supported platform goals"><div role="row"><strong role="columnheader">Device</strong><strong role="columnheader">Experience</strong></div><div role="row"><span role="cell">Phone and tablet</span><span role="cell">Front or rear camera, touch-friendly setup, responsive layout</span></div><div role="row"><span role="cell">Laptop and desktop</span><span role="cell">Webcam play, keyboard-accessible setup, simulator fallback</span></div><div role="row"><span role="cell">Camera-equipped smart TV</span><span role="cell">Large-display layout with device capability detection</span></div></div>
            <div className="callout callout-neutral"><strong>Honest compatibility</strong><p>Individual game manifests disclose their supported inputs and access features. The engine selects a device tier at startup, but creators must still test every device class they claim.</p></div>
          </section>

          <section id="privacy" className="docs-section">
            <p className="docs-kicker">05 · Privacy</p>
            <h2>Camera access is local input, not uploaded content.</h2>
            <p>Manse processes camera frames on the playing device. The platform does not transmit frames, collect child data, create player accounts, or add behavioral analytics. Creator-owned Sites must preserve this boundary to qualify for the official Showcase.</p>
            <ul className="check-list"><li>Ask for camera permission only in direct response to the player.</li><li>Explain the camera purpose before the browser prompt appears.</li><li>Keep captions, reduced stimulation, seated alternatives, and input fallbacks discoverable.</li><li>Declare asset sources, licenses, and generated-asset provenance.</li></ul>
          </section>

          <section className="docs-next"><p className="eyebrow">Next step</p><h2>Published already?</h2><p>Verify the public manifest and learn how the lightweight Showcase review works.</p><Link className="button button-ink" href="/submit">List your game <span aria-hidden="true">→</span></Link></section>
        </article>
      </div>
    </PageShell>
  );
}
