import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost
    ?? requestHeaders.get("host")
    ?? "manse-showcase.ran584000.chatgpt.site";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : host.startsWith("localhost")
      ? "http"
      : "https";
  const origin = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", origin).toString();

  return {
    title: {
      default: "Manse | Open-source active play",
      template: "%s | Manse",
    },
    description:
      "An open-source AR active-game engine, Codex creator plugin, and public Showcase for browser-native motion games.",
    applicationName: "Manse",
    keywords: ["motion games", "open source", "Codex", "ChatGPT Sites", "browser games"],
    openGraph: {
      type: "website",
      siteName: "Manse",
      title: "Manse | Every screen can be a playground",
      description: "Create motion games with Codex, publish with Sites, and play in any camera-equipped browser.",
      images: [{ url: socialImage, width: 1731, height: 909, alt: "Manse | Every screen can be a playground" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Manse | Every screen can be a playground",
      description: "Open-source, browser-native motion games made with Codex and published with Sites.",
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f3ea",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
