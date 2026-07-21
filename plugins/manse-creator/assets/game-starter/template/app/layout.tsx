import type { Metadata, Viewport } from "next";
import { GAME_CONFIG, getInitialUiLocale, getThemeColor, localize } from "./game-config";
import "./globals.css";

const initialLocale = getInitialUiLocale();
const initialTitle = localize(GAME_CONFIG.title, initialLocale);
const initialSummary = localize(GAME_CONFIG.summary, initialLocale);

export const metadata: Metadata = {
  title: initialTitle,
  description: initialSummary,
  openGraph: {
    title: initialTitle,
    description: initialSummary,
    images: [{ url: "/thumbnail.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: getThemeColor("background"),
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={initialLocale}>
      <body>{children}</body>
    </html>
  );
}
