"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const words = ["playground", "dance floor", "trampoline", "dojo", "stage"] as const;

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

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
        setLeaving(false);
      }, 190);
    }, 2700);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) {
      return;
    }

    const items = Array.from(section.querySelectorAll<HTMLElement>(".float-item")).map((element) => ({
      element,
      depth: Number(element.dataset.depth ?? 1),
    }));
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX / window.innerWidth - 0.5;
      targetY = event.clientY / window.innerHeight - 0.5;
    };
    const animate = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      for (const { element, depth } of items) {
        element.style.transform = `translate3d(${currentX * depth * -46}px, ${currentY * depth * -34}px, 0)`;
      }
      frame = window.requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const word = words[wordIndex];

  return (
    <section className="hero" ref={sectionRef}>
      <div className="hero-float-field" aria-hidden="true">
        <div className="float-item float-a" data-depth="1.15"><span className="sticker sticker-coral">Jump!</span></div>
        <div className="float-item float-b" data-depth="0.85"><span className="sticker sticker-blue">Dodge</span></div>
        <div className="float-item float-c" data-depth="0.7"><span className="sticker sticker-lime">Stretch</span></div>
        <div className="float-item float-d" data-depth="1.3"><span className="sticker sticker-yellow">Wave</span></div>
        <div className="float-item float-chip" data-depth="0.65">
          <span className="hero-chip"><span className="chip-dot" /> camera on · frames stay on device</span>
        </div>
      </div>

      <div className="shell hero-stack">
        <h1>
          Every screen<br />can be a{" "}
          <span className="rotate-pill">
            <span className={`rotate-word${leaving ? " out" : ""}`}>
              {[...word].map((letter, index) => (
                <span className="rl" key={`${word}-${index}`} style={{ "--d": `${index * 34}ms` } as CSSProperties}>
                  {letter === " " ? "\u00a0" : letter}
                </span>
              ))}
            </span>
          </span>
        </h1>
        <p className="hero-lede">
          Manse turns any camera-equipped browser into a motion game console. Anyone can make and
          publish their own games with Codex.
        </p>
        <div className="button-row hero-ctas">
          <Link className="button button-coral button-large" href="/playground">Try the engine <span aria-hidden="true">↗</span></Link>
          <Link className="button button-ghost button-large" href="/docs#install">Get Manse Creator <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
