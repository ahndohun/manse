"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createMansePlayer, type MansePlayer, type PlayerSnapshot, type ProviderKind } from "@manse/runtime-web";
import {
  GAME_CONFIG,
  getHeroImageUrl,
  getInitialUiLocale,
  getThemeColor,
  localize,
  localizeOptional,
  type GameUiLocale,
} from "./game-config";
import { PresentationAudio } from "./feel/audio";
import { applyMissionEvent, createMissionState, resetMissionState } from "./feel/mission";
import { createThemedRendererFactory } from "./feel/themed-renderer";

const PACK_URL = `/packs/${GAME_CONFIG.slug}/manse.pack.json`;
const EMPTY: Pick<PlayerSnapshot, "phase" | "provider" | "tier" | "renderer" | "cameraActive" | "targetProgress" | "caption"> = {
  phase: "idle",
  provider: "simulated",
  tier: "A",
  renderer: null,
  cameraActive: false,
  targetProgress: null,
  caption: null,
};

const UI_COPY = {
  en: {
    independentGame: "Independent Manse game",
    language: "Interface language",
    privacy: "Camera frames stay on this device. No account and no analytics.",
    player: "Game player",
    needsAttention: "Needs attention",
    starting: "Starting",
    complete: "Complete",
    chooseHow: "Choose how to play",
    cameraLocal: "Camera stays on device",
    simulatorLive: "Simulator live",
    localPlay: "Local play · no analytics",
    stage: "Interactive motion game stage",
    startGuide: "Start with the pointer simulator. Camera mode is optional and asks permission only after you choose it.",
    playPointer: "Play with pointer",
    useCamera: "Use my camera",
    privateSpace: "Choose a clear, comfortable play space.",
    waiting: "Waiting",
    restartPointer: "Restart with pointer",
    switchCamera: "Switch to camera",
    viewSource: "View source",
    footer: (creator: string) => `Created by ${creator}. Built with the open Manse engine. Stop whenever movement feels uncomfortable.`,
    startError: "The game could not start.",
  },
  ko: {
    independentGame: "독립 Manse 게임",
    language: "화면 언어",
    privacy: "카메라 영상은 이 기기에만 남습니다. 계정과 분석 도구가 없습니다.",
    player: "게임 플레이어",
    needsAttention: "확인이 필요해요",
    starting: "시작하는 중",
    complete: "완료",
    chooseHow: "플레이 방식 선택",
    cameraLocal: "카메라는 기기 안에서만 작동 중",
    simulatorLive: "시뮬레이터 실행 중",
    localPlay: "기기 안에서 플레이 · 분석 도구 없음",
    stage: "동작 게임 플레이 영역",
    startGuide: "먼저 포인터 시뮬레이터로 시작하세요. 카메라는 선택 사항이며, 카메라를 고른 뒤에만 권한을 요청합니다.",
    playPointer: "포인터로 플레이",
    useCamera: "내 카메라 사용",
    privateSpace: "주변을 정리하고 편안한 공간에서 플레이하세요.",
    waiting: "대기",
    restartPointer: "포인터로 다시 시작",
    switchCamera: "카메라로 전환",
    viewSource: "소스 보기",
    footer: (creator: string) => `${creator} 제작. 오픈 소스 Manse 엔진으로 만들었습니다. 움직임이 불편하면 언제든 멈추세요.`,
    startError: "게임을 시작하지 못했습니다.",
  },
} as const;

const THEME_STYLE = {
  "--game-background": getThemeColor("background"),
  "--game-surface": getThemeColor("surface"),
  "--game-accent": getThemeColor("accent"),
  "--game-highlight": getThemeColor("highlight"),
  "--game-text": getThemeColor("text"),
  "--game-muted": getThemeColor("muted"),
} as CSSProperties;

export function GameClient() {
  const stageRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MansePlayer | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);
  const [snapshot, setSnapshot] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<GameUiLocale>(() => getInitialUiLocale());
  const browserLocaleAppliedRef = useRef(false);
  const missionRef = useRef(createMissionState(locale));
  const audioRef = useRef(new PresentationAudio());

  const boot = useCallback(async (provider: ProviderKind) => {
    const container = stageRef.current;
    if (container === null) return;
    const runId = ++runIdRef.current;
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    const previousPlayer = playerRef.current;
    playerRef.current = null;
    await previousPlayer?.destroy().catch(() => undefined);
    if (runId !== runIdRef.current) return;
    setSnapshot(EMPTY);
    resetMissionState(missionRef.current, locale);

    const player = createMansePlayer({
      container,
      locale,
      provider,
      captions: true,
      reducedStimulation: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      rendererFactory: createThemedRendererFactory({ mission: missionRef.current, locale }),
      onEvent: (event) => {
        if (runId !== runIdRef.current) return;
        applyMissionEvent(missionRef.current, event, performance.now());
        audioRef.current.onEvent(event, missionRef.current);
        if (event.type === "error") setError(UI_COPY[locale].startError);
      },
    });
    playerRef.current = player;
    unsubscribeRef.current = player.subscribe((next) => {
      if (runId === runIdRef.current) setSnapshot(next);
    });
    try {
      await player.load(PACK_URL);
      if (runId !== runIdRef.current) return;
      await player.setup();
      if (runId !== runIdRef.current) return;
      await player.play();
    } catch {
      if (runId === runIdRef.current) setError(UI_COPY[locale].startError);
    } finally {
      if (runId === runIdRef.current) setBusy(false);
    }
  }, [locale]);

  const changeLocale = useCallback(async (nextLocale: GameUiLocale) => {
    if (nextLocale === locale) return;
    setBusy(true);
    setError(null);
    const runId = ++runIdRef.current;
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    const player = playerRef.current;
    playerRef.current = null;
    await player?.destroy().catch(() => undefined);
    if (runId !== runIdRef.current) return;
    setSnapshot(EMPTY);
    setLocale(nextLocale);
    setBusy(false);
  }, [locale]);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => {
      runIdRef.current += 1;
      unsubscribeRef.current?.();
      void playerRef.current?.destroy();
      playerRef.current = null;
      audioRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (browserLocaleAppliedRef.current) return;
    browserLocaleAppliedRef.current = true;
    const preferred = getInitialUiLocale(navigator.languages[0] ?? navigator.language);
    if (preferred !== locale) void changeLocale(preferred);
  }, [changeLocale, locale]);

  const start = (provider: ProviderKind) => {
    audioRef.current.arm();
    setBusy(true);
    setError(null);
    void boot(provider);
  };

  const movePointer = (clientX: number, clientY: number) => {
    if (busy || snapshot.provider !== "simulated") return;
    const bounds = stageRef.current?.getBoundingClientRect();
    if (bounds === undefined || bounds.width === 0 || bounds.height === 0) return;
    try {
      playerRef.current?.setPointer((clientX - bounds.left) / bounds.width, (clientY - bounds.top) / bounds.height);
    } catch {
      // Mode changes can overlap one final pointer event.
    }
  };

  const progress = snapshot.targetProgress;
  const copy = UI_COPY[locale];
  const title = localize(GAME_CONFIG.title, locale);
  const summary = localize(GAME_CONFIG.summary, locale);
  const heroImageUrl = getHeroImageUrl();
  const status = error !== null
    ? copy.needsAttention
    : busy
      ? copy.starting
      : snapshot.phase === "complete"
        ? copy.complete
        : snapshot.phase === "idle"
          ? copy.chooseHow
          : snapshot.cameraActive
            ? copy.cameraLocal
            : copy.simulatorLive;

  return (
    <main className="game-page" style={THEME_STYLE}>
      <header className="game-hero">
        <div className="hero-copy">
          <div className="hero-topline">
            <p className="kicker">{copy.independentGame}</p>
            <div className="locale-switcher" role="group" aria-label={copy.language}>
              <button type="button" className={locale === "ko" ? "active" : ""} aria-pressed={locale === "ko"} onClick={() => void changeLocale("ko")} disabled={busy}>KO</button>
              <button type="button" className={locale === "en" ? "active" : ""} aria-pressed={locale === "en"} onClick={() => void changeLocale("en")} disabled={busy}>EN</button>
            </div>
          </div>
          <h1>{title}</h1>
          <p className="summary">{summary}</p>
          <p className="privacy-line">{copy.privacy}</p>
        </div>
        <div className={heroImageUrl === null ? "hero-visual hero-fallback" : "hero-visual"} aria-hidden={heroImageUrl === null ? "true" : undefined}>
          {heroImageUrl !== null && (
            <img className="hero-image" src={heroImageUrl} alt={localizeOptional(GAME_CONFIG.hero?.alt, locale)} />
          )}
        </div>
      </header>

      <section className="player-shell" aria-label={copy.player}>
        <div className="player-bar">
          <span><i className={error === null ? "status-dot" : "status-dot status-error"} aria-hidden="true" /> {status}</span>
          <span>{copy.localPlay}</span>
        </div>
        <div
          className="stage"
          ref={stageRef}
          onPointerDown={(event) => {
            // Let clicks on interactive children (start-card buttons) through:
            // capturing the pointer here would retarget pointerup/click to the
            // stage and the button's onClick would never fire.
            if ((event.target as HTMLElement).closest("button, a")) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            movePointer(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => movePointer(event.clientX, event.clientY)}
          aria-label={copy.stage}
        >
          {snapshot.phase === "idle" && (
            <div className="start-card">
              <p>{copy.startGuide}</p>
              <div className="actions">
                <button type="button" onClick={() => start("simulated")} disabled={busy}>{copy.playPointer}</button>
                <button className="secondary" type="button" onClick={() => start("mediapipe")} disabled={busy}>{copy.useCamera}</button>
              </div>
            </div>
          )}
        </div>
        <div className="player-footer" aria-live="polite">
          <span>{error ?? snapshot.caption ?? copy.privateSpace}</span>
          <strong>{progress === null ? copy.waiting : `${progress.completed} / ${progress.total}`}</strong>
        </div>
        {snapshot.phase !== "idle" && (
          <div className="restart-row">
            <button type="button" onClick={() => start("simulated")} disabled={busy}>{copy.restartPointer}</button>
            <button className="text-button" type="button" onClick={() => start("mediapipe")} disabled={busy}>{copy.switchCamera}</button>
          </div>
        )}
      </section>

      <footer>
        <p>{copy.footer(GAME_CONFIG.creator)}</p>
        <a href={GAME_CONFIG.sourceUrl} target="_blank" rel="noreferrer">{copy.viewSource} <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}
