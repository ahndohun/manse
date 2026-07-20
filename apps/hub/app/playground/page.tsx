import type { Metadata } from "next";
import { PageShell } from "../components/PageShell";
import { PlaygroundClient } from "./PlaygroundClient";

export const metadata: Metadata = {
  title: "Engine playground",
  description: "Try Manse's browser motion engine in seconds with a pointer simulator or an on-device camera.",
};

export default function PlaygroundPage() {
  return (
    <PageShell>
      <section className="playground-hero">
        <div className="shell playground-heading">
          <div>
            <p className="eyebrow eyebrow-coral"><span aria-hidden="true" /> No camera needed</p>
            <h1>Try the engine in <em>30 seconds.</em></h1>
          </div>
          <p>
            This is a content-neutral Manse engine playground, not a sample game. Move your pointer or finger through the targets to test the same declarative runtime creators publish with the Codex plugin.
          </p>
        </div>
      </section>
      <PlaygroundClient />
    </PageShell>
  );
}
