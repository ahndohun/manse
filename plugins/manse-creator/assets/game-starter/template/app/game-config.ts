export type GameUiLocale = "en" | "ko";

export interface LocalizedText {
  readonly en: string;
  readonly ko: string;
}

export interface GameTheme {
  readonly background: string;
  readonly surface: string;
  readonly accent: string;
  readonly highlight: string;
  readonly text: string;
  readonly muted: string;
}

export interface GameConfig {
  readonly slug: string;
  readonly title: LocalizedText | string;
  readonly summary: LocalizedText | string;
  readonly creator: string;
  readonly sourceUrl: string;
  readonly locale: string;
  readonly hero?: {
    readonly imageUrl?: string | null;
    readonly alt?: Partial<LocalizedText>;
  };
  readonly theme?: Partial<GameTheme>;
}

export const DEFAULT_THEME: GameTheme = {
  background: "#0c1422",
  surface: "#15273a",
  accent: "#ff805f",
  highlight: "#c6ef70",
  text: "#f5f8f2",
  muted: "#bac7c4",
};

const GENERATED_GAME_CONFIG = __GAME_CONFIG_JSON__ as const satisfies GameConfig;
export const GAME_CONFIG: GameConfig = GENERATED_GAME_CONFIG;

export function getInitialUiLocale(locale: string = GAME_CONFIG.locale): GameUiLocale {
  return locale.toLowerCase().startsWith("ko") ? "ko" : "en";
}

export function localize(value: LocalizedText | string, locale: GameUiLocale): string {
  return typeof value === "string" ? value : value[locale] || value.en || value.ko;
}

export function localizeOptional(
  value: Partial<LocalizedText> | undefined,
  locale: GameUiLocale,
): string {
  return value?.[locale] || value?.en || value?.ko || "";
}

export function getThemeColor(name: keyof GameTheme): string {
  const configured = GAME_CONFIG.theme?.[name];
  return typeof configured === "string" && /^#[0-9a-f]{6}$/iu.test(configured)
    ? configured
    : DEFAULT_THEME[name];
}

export function getHeroImageUrl(): string | null {
  const configured = GAME_CONFIG.hero?.imageUrl;
  return typeof configured === "string" && /^\/(?!\/)/u.test(configured) ? configured : null;
}
