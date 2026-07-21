// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://manse-showcase.ran584000.chatgpt.site",
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  build: {
    // The landing is a single page: inlining removes the render-blocking CSS request.
    inlineStylesheets: "always",
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: ["300 900"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-geist-mono",
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
    },
  ],
  integrations: [
    react(),
    starlight({
      title: "Manse",
      description:
        "Install Manse Creator, understand the open game contract, and publish a motion game with Codex and Sites.",
      logo: {
        src: "./src/assets/brand/manse-mark-nav-alpha.png",
        alt: "Manse",
      },
      favicon: "/favicon.png",
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/ahndohun/manse" },
      ],
      sidebar: [
        {
          label: "Start here",
          items: ["create/install", "create/first-game"],
        },
        {
          label: "Reference",
          items: ["reference/game-contract", "reference/runtime", "reference/privacy"],
        },
        {
          label: "Showcase",
          items: ["showcase/submit"],
        },
      ],
      customCss: ["./src/styles/starlight-theme.css"],
    }),
  ],
});
