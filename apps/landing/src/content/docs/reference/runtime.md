---
title: Runtime and devices
description: The engine targets the browser and adapts quality to the device without changing game rules.
---

The engine keeps pose inference and rendering independent so each can scale without slowing the other. Quality tiers can adjust model complexity, inference cadence, effects, and resolution while preserving the game rules.

| Device | Experience |
| --- | --- |
| Phone and tablet | Front or rear camera, touch-friendly setup, responsive layout |
| Laptop and desktop | Webcam play, keyboard-accessible setup, simulator fallback |
| Camera-equipped smart TV | Large-display layout with device capability detection |

:::note[Honest compatibility]
Individual game manifests disclose their supported inputs and access features. The engine selects a device tier at startup, but creators must still test every device class they claim.
:::
