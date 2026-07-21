"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

const words = ["playground", "firehouse", "dance floor", "museum"] as const;
const FIRE_HOSE_URL = "https://fire-hose-hero.ran584000.chatgpt.site/";

export function LandingHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [hasRotated, setHasRotated] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = window.setInterval(() => {
      if (reducedMotion) {
        setWordIndex((current) => (current + 1) % words.length);
        return;
      }
      setLeaving(true);
      window.setTimeout(() => {
        setWordIndex((current) => (current + 1) % words.length);
        setHasRotated(true);
        setLeaving(false);
      }, 190);
    }, 2700);
    return () => window.clearInterval(interval);
  }, []);

  const word = words[wordIndex];

  return (
    <section className="hero">
      <div className="shell hero-proof-grid">
        <div className="hero-proof-copy">
          <p className="eyebrow eyebrow-coral"><span aria-hidden="true" /> Open motion-game platform</p>
          <h1>
            Every screen<br />can be a{" "}
            <span className="rotate-pill">
              <span className={`rotate-word${leaving ? " out" : hasRotated ? " animate" : ""}`}>
                {[...word].map((letter, index) => (
                  <span className="rl" key={`${word}-${index}`} style={{ "--d": `${index * 34}ms` } as CSSProperties}>
                    {letter === " " ? "\u00a0" : letter}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          <p className="hero-lede">
            Aim, jump, dodge, and freeze in browser-native games. Then use the Manse Creator plugin in Codex to author and publish your own.
          </p>
          <div className="button-row hero-ctas">
            <a className="button button-coral button-large" href={FIRE_HOSE_URL} target="_blank" rel="noreferrer">Play Fire Hose Hero <span aria-hidden="true">↗</span></a>
            <Link className="button button-ghost button-large" href="/docs#install">Build with Codex <span aria-hidden="true">↗</span></Link>
          </div>
          <ul className="hero-proof-facts" aria-label="Fire Hose Hero mission facts">
            <li><strong>3</strong><span>alarm zones</span></li>
            <li><strong>12</strong><span>reactive fires</span></li>
            <li><strong>90s</strong><span>complete mission</span></li>
          </ul>
        </div>
        <a className="hero-game-proof" href={FIRE_HOSE_URL} target="_blank" rel="noreferrer" aria-label="Play the Fire Hose Hero flagship mission">
          <div className="proof-topbar"><span><i aria-hidden="true" /> Flagship game · live</span><b>Camera or pointer</b></div>
          <Image
            src="/featured/fire-hose-hero-gameplay.png"
            alt="Fire Hose Hero gameplay with a water stream, score, timer, and reactive fire characters"
            width={1236}
            height={761}
            priority
          />
          <div className="proof-caption"><div><span>Fire Hose Hero</span><strong>Put out every flame.</strong></div><em>Play ↗</em></div>
        </a>
      </div>
    </section>
  );
}
