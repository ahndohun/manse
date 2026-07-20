# Supported Platforms

Manse targets camera-equipped phones, tablets, computers, and televisions through
the browser. Compatibility is progressive: the runtime selects the best
available pose and rendering path, reduces work when a device cannot sustain it,
and preserves a simulated path for development and evaluation.

This is a support policy, not a claim that every browser with a camera has been
verified. A device is **supported** only after the exact browser, operating
system, camera path, and representative game workload have passed the tests
described below.

## Baseline requirements

Camera play requires:

- a secure context (`https://` or browser-recognized localhost)
- `navigator.mediaDevices.getUserMedia`
- permission to use a front- or room-facing camera
- modern JavaScript modules and WebAssembly support required by the selected
  pose provider
- enough memory and compute to sustain the provider's lowest supported tier
- a rendering path supported by the Manse web runtime

Public game Sites must work without a Manse or creator account. A camera is not
required for the simulated provider.

## Current platform posture

| Platform class | Intended path | Current claim boundary |
| --- | --- | --- |
| Recent desktop/laptop Chrome or Edge | Camera, on-device pose, WebGL2 | Primary validation target; exact releases must be recorded before a support claim |
| Recent desktop/laptop Safari | Camera, on-device pose, WebGL2 or fallback | Intended; media/Wasm behavior and autoplay policies require Safari-specific verification |
| Recent desktop/laptop Firefox | Camera, on-device pose, WebGL2 or fallback | Intended; provider compatibility must be verified per release |
| Recent Android Chrome | Front/rear camera, adaptive inference and rendering | Primary mobile target; thermal throttling and vendor WebView differences vary |
| Recent iPhone/iPad Safari | Front/rear camera, adaptive inference and rendering | Primary mobile target; camera lifecycle, memory pressure, and audio unlock require device testing |
| Chromium-based tablets and kiosks | Same as Android/desktop according to hardware | Intended when secure camera APIs are exposed |
| Smart-TV browser with a supported camera | Reduced tier and rendering fallback | Experimental; TV browser engines and external-camera support are highly inconsistent |
| Embedded WebView or in-app browser | Host-dependent | Not supported unless that host exposes secure camera, Wasm, and rendering capabilities and is explicitly tested |
| No camera, denied permission, or unsupported pose provider | Simulated provider | Supported for preview, CI, evaluation, and accessibility where a game offers an alternate input path |

No operating-system or browser version in this table should be interpreted as
certified until it appears in a release's measured test matrix.

## Runtime provider controls

The browser runtime supports explicit diagnostics through query parameters:

```text
?provider=simulated
?provider=mediapipe
?tier=S
?tier=A
?tier=B
?tier=C
```

These controls are for preview, testing, and support. A normal published game
should allow automatic selection unless a diagnosed compatibility issue requires
an override. Unsupported or invalid overrides must produce a clear explanation,
not silently claim that camera play succeeded.

Camera access is never a constructor side effect. The player calls its explicit
setup path only after user interaction. This protects privacy and improves
behavior on mobile browsers that require gestures for permission and audio.

## Performance ladder

Manse separates pose inference from visual rendering so each can adapt
independently. The intended degradation order is:

1. Use the highest locally supported pose and rendering configuration that meets
   the stability budget.
2. Reduce pose inference frequency while rendering interpolated/smoothed motion.
3. Select a lighter pose model or lower input resolution.
4. Reduce particles, post-processing, animation density, and other cosmetic work.
5. Fall back from WebGL2 to Canvas2D and then a minimal DOM renderer where the
   runtime supports it.
6. Offer the simulator or an alternate-input mode rather than looping failed
   camera setup.

Tiers `S`, `A`, `B`, and `C` describe performance configurations, not product
quality grades. Pack authors specify mechanics and tunable thresholds; they do
not bypass the runtime's safety and performance controls.

## Performance targets versus guarantees

The product goal is low-latency, stable motion play that feels smooth on a broad
range of hardware. Until a release includes repeatable measurements, statements
such as “buttery smooth,” “console quality,” “works on almost every device,” or
“highly accurate” are goals, not verified facts.

Release evidence should report at least:

- device model and year
- operating system and browser version
- camera resolution and orientation
- selected pose provider, model, and tier
- median and low-percentile render FPS
- inference frequency and end-to-end response latency
- session duration, thermal behavior, and dropped-frame observations
- lighting, player distance, and whether the full body remained visible
- challenge-specific false positives and missed detections

Average FPS alone is not sufficient. A release should distinguish rendering
smoothness from pose inference frequency and input accuracy.

## Required verification matrix

Before a configuration is advertised as supported, run:

1. **Clean open:** public HTTPS URL loads without authentication or cached build
   artifacts.
2. **Simulator:** representative packs reach their terminal scenes without a
   camera.
3. **Permission states:** allow, deny, dismiss, revoke, switch camera, background,
   foreground, and stop all produce understandable behavior.
4. **Pose setup:** framing and confidence indicators recover from briefly losing
   the player.
5. **Sustained play:** a representative session completes without runaway memory,
   thermal collapse, or progressively increasing latency.
6. **Renderer fallback:** the forced tier/fallback remains usable and communicates
   unavailable effects honestly.
7. **Accessibility:** captions, reduced stimulation, reduced movement or
   alternate input declared by the game work on the target device.
8. **Offline replay:** after the initial successful load, the bundled runtime and
   selected game assets work according to the Site's documented offline policy.
9. **Privacy:** network inspection shows no camera frames, pose landmarks, or
   gameplay telemetry leaving the device.

Testing must use both valid and intentionally invalid packs. A passing simulator
does not prove camera recognition quality.

## Smart TVs and large screens

Smart TVs are an important direction but the least uniform web target. Many TV
browsers omit `getUserMedia`, expose only vendor camera APIs, ship old browser
engines, or cannot use a USB camera from a webpage. Casting or mirroring a phone
does not automatically provide the phone's camera to the TV browser.

Treat a TV as camera-capable only after testing the exact model and browser. Good
alternatives include:

- run the game on a phone, tablet, mini PC, or laptop connected to the display
- use the computing device's camera while the display acts only as a screen
- offer a non-camera or simulated mode when the game design permits it

Do not label “smart TV” as generally supported based on desktop Chromium results.

## Environment guidance

Recognition quality depends on conditions outside the software:

- place the camera where the required joints remain visible
- use even front lighting; avoid a bright window directly behind the player
- clear enough floor space for the game's declared movements
- avoid loose objects, pets, or other people crossing the pose area
- prefer a stable stand over a handheld camera
- on mobile, prevent the device from sliding or falling during play

Games should calibrate to the player and camera rather than hard-code pixel
positions or a single body size.

## Troubleshooting

### The browser never asks for camera permission

- Confirm the page uses HTTPS or localhost.
- Check site permission settings and operating-system camera permission.
- Confirm another application is not exclusively using the camera.
- Start camera setup from the game's explicit button, not an automatic page load.
- Try `?provider=simulated` to separate player/runtime issues from camera issues.

### Camera works but no pose appears

- Keep the movement-relevant body parts in frame.
- Improve front lighting and contrast between player and background.
- Try a lower tier or lighter provider configuration.
- Inspect diagnostic status rather than interpreting a blank renderer as success.

### Motion is delayed or choppy

- Close camera-heavy tabs and background applications.
- Lower the tier and compare inference rate separately from render FPS.
- Allow a warm device to cool and disable battery-saver constraints for testing.
- Test the same URL in a primary browser instead of an embedded WebView.

### Mobile audio is silent

Mobile browsers often require a player gesture before starting audio. Enter
through the game's setup/start control and confirm the device is not muted.

## Reporting compatibility results

File compatibility issues in the source repository at `<REPOSITORY_URL>`. Include
the test matrix fields above, the public game or playground URL, the selected
provider and tier, and a description of whether the simulator succeeds. Do not
attach camera footage or personal information unless it is essential and you
have a safe private reporting channel.
