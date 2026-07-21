#!/bin/zsh
# Generate voiceover WAVs for each scene from the demo script.
set -e
cd "$(dirname "$0")/public/audio"

typeset -A VO
VO[1]="This is Manse: an open-source engine and publishing ecosystem for camera-based active games. A normal link turns a phone, computer, tablet, or compatible display into the play surface."
VO[2]="Closed motion-game platforms own the format and storefront. Manse opens the engine, declarative game format, creator tools, and catalog. Players need no Manse account, controller, subscription, or runtime AI service."
VO[3]="For creators, Codex is the studio. I describe a game in plain language. The Manse Creator plugin uses GPT 5.6 to plan movement, accessibility, original assets, and a versioned project before it writes files."
VO[4]="The output is not opaque code from a central service. It is a creator-owned Site, a strict data-only pack, and auditable provenance. Seven workflows cover creation, assets, preview, validation, remixing, publishing, and Showcase submission."
VO[5]="The simulator is the fastest judge path and uses the same engine session as camera play. The public catalog includes touch, dodge, freeze, squat, and jump games. Camera permission starts only after an explicit action, and Manse never transmits camera frames or pose data."
VO[6]="One contract drives the schema, validator, runtime loader, starter, publisher, and catalog. Validation checks paths, accessibility, licenses, provenance, tests, types, and the production build, and intentionally invalid packs must fail."
VO[7]="With my approval, Codex packages the self-contained game and publishes an independent public Site. Runtime code, models, WebAssembly, packs, and media are bundled; play needs no API key or external runtime CDN."
VO[8]="The Showcase receives only a public manifest URL. C I validates it, a maintainer approves it, and the catalog links to the creator's Site. Manse never uploads, proxies, iframes, or executes that third-party game."
VO[9]="Codex and GPT 5.6 built the platform and power the creator workflow: GPT 5.6 is the factory; the browser is the product. Manse is MIT licensed, self-hostable, privacy-first, and ready for creators to extend."

for i in 1 2 3 4 5 6 7 8 9; do
  say -v Samantha -r 180 -o "scene-$i.aiff" "${VO[$i]}"
  afconvert -f WAVE -d LEI16@44100 "scene-$i.aiff" "scene-$i.wav"
  rm "scene-$i.aiff"
done

echo "--- durations (seconds) ---"
for i in 1 2 3 4 5 6 7 8 9; do
  d=$(afinfo "scene-$i.wav" | awk '/estimated duration/ {print $3}')
  echo "scene-$i: $d"
done
