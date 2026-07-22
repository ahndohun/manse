# SkillOpt research plan for the Manse creator harness

Status: research proposal, not an enabled training service.

## Recommendation

Use SkillOpt's explicit benchmark workflow first. Do not begin with unattended
SkillOpt-Sleep over real creator sessions.

The trainable artifact should be a small strategy reference consumed by the
Manse Creator `create-game` skill, not the product specification, safety rules,
pack contract, validator, or the full skill document. Product invariants remain
immutable inputs to every rollout. A candidate strategy is accepted only when
it improves a held-out score and passes every hard release gate.

This is a good architectural fit because SkillOpt:

- optimizes a compact Markdown skill while leaving the target model frozen;
- derives bounded edits from complete scored trajectories;
- accepts a candidate only through a held-out validation gate; and
- supports `codex_exec` as an execution harness, so a rollout can create and
  validate a real workspace instead of answering a synthetic chat question.

SkillOpt's custom benchmark contract requires a split data loader, rollout and
scoring helper, environment adapter, and YAML configuration. Rollouts must save
both `hard` and `soft` scores plus a non-empty
`predictions/<id>/conversation.json` trajectory for reflection.

Primary references:

- [SkillOpt repository](https://github.com/microsoft/SkillOpt)
- [Custom benchmark guide](https://github.com/microsoft/SkillOpt/blob/main/docs/guide/new-benchmark.md)
- [Codex integration](https://github.com/microsoft/SkillOpt/blob/main/plugins/codex/README.md)
- [SkillOpt-Sleep data boundary](https://github.com/microsoft/SkillOpt/blob/main/docs/sleep/README.md)
- [SkillOpt paper](https://arxiv.org/abs/2605.23904)

Research was performed against upstream commit
`61735e3922efc2b90c6d6cab561e62e98452ca90` (SkillOpt 0.2.0 source tree).

## Trainable and protected layers

| Layer | Role | SkillOpt may edit it? |
| --- | --- | --- |
| `docs/PLATFORM-SPEC.md` and repository rules | Product, privacy, and architecture policy | No |
| Pack schema, validator, runtime loader | Executable contract and enforcement | No |
| Release and quality gates | Ground-truth evaluators | No |
| Creator workflow `SKILL.md` | Stable orchestration and safety boundary | Not initially |
| `references/optimized-creator-strategy.md` | Compact procedural game-making strategy | Yes |

Separating the strategy from policy prevents an optimizer from earning a higher
score by weakening a requirement, disabling a test, changing a fixture, or
editing the grader. The rollout workspace should mount evaluators read-only and
allow writes only inside a disposable generated-game directory.

## Proposed `manse_gamegen` benchmark

### Dataset

Start with 48 authored briefs and deterministic split seed 42:

- 24 train briefs;
- 12 selection briefs used only by the validation gate; and
- 12 sealed test briefs used only for periodic reporting.

Stratify every split across age band, locale, input mechanic, energy level,
visual world, camera framing, accessibility need, device width, and failure
mode. Include adversarial briefs that request arbitrary JavaScript, analytics,
remote camera upload, runtime CDN assets, missing provenance, or account gates.
The correct trajectory must refuse or safely reshape those requirements.

Do not train on the six Showcase games. Keep them as a frozen regression suite.
Add nearby but distinct briefs such as shadow matching, constellation reach,
animal balance, cooperative color lanes, seated conducting, and slow-motion
statue play.

### Rollout

Each episode should:

1. create a clean temporary workspace from the published starter;
2. invoke Codex with the candidate strategy and one brief;
3. preserve the full agent trajectory;
4. build the generated Site;
5. validate valid and intentionally invalid pack fixtures;
6. run deterministic replay and real pointer-provider tests;
7. render desktop and mobile screenshots at authored checkpoints; and
8. emit a machine-readable scorecard and artifact manifest.

No episode may deploy a Site, use a real camera, access creator credentials, or
make the generated game public.

### Hard score

`hard = 1` only when all of these pass:

- pack schema and manifest contract;
- declarative data-only pack restriction;
- camera/privacy and no-analytics boundary;
- bundled same-origin runtime assets;
- complete provenance and compatible licenses;
- typecheck, tests, production build, and dependency audit;
- valid fixture accepted and invalid fixtures rejected;
- simulator starts, makes real progress, reaches the terminal outcome, and
  restarts;
- camera provider remains the default production path;
- public-page semantics do not require an account;
- English repository copy plus Korean locale coverage;
- compact Manse platform shell and exact Showcase return URL;
- desktop and mobile no-overflow checks; and
- evaluator and gate files are unchanged.

This binary score prevents visual gains from compensating for broken gameplay,
privacy, or portability.

### Soft score

Compute `soft` only after `hard = 1`:

| Dimension | Weight | Evidence |
| --- | ---: | --- |
| Gameplay reliability and feedback | 0.25 | completion timing, progress, restart, reaction-state assertions |
| Visual authorship | 0.25 | screenshot rubric, full-bleed world, themed entities, no placeholder primitives |
| Input truthfulness | 0.15 | camera and pointer adapter parity, mechanic-specific pose tests |
| Accessibility and family safety | 0.15 | keyboard, reduced motion, captions, contrast, safety copy, mobile layout |
| Creator maintainability | 0.10 | configuration coverage, pack clarity, bounded custom renderer surface |
| Performance and packaging | 0.10 | artifact size, local assets, route errors, LCP proxy, audit |

The visual rubric must combine deterministic checks with a frozen vision judge
and periodic human pairwise review. Never let the same optimizer model both
write the strategy and serve as the only aesthetic judge. Store judge prompts,
model identifiers, raw scores, screenshots, and disagreements as evidence.

## Optimization policy

Recommended first experiment:

```yaml
train:
  num_epochs: 3
  batch_size: 6
  seed: 42
gradient:
  minibatch_size: 3
  merge_batch_size: 3
  failure_only: false
optimizer:
  learning_rate: 2
  min_learning_rate: 1
  lr_scheduler: cosine
  skill_update_mode: patch
  use_slow_update: true
  use_meta_skill: true
evaluation:
  use_gate: true
env:
  name: manse_gamegen
  exec_timeout: 900
```

Use a strong optimizer at training time when budget permits. SkillOpt's paper
reports that a stronger optimizer improved the static deployed skill without
adding inference-time calls. Keep the edit budget at two for Manse initially;
small patches are easier to audit and less likely to erase protected behavior.

Acceptance must be stricter than SkillOpt's default aggregate improvement:

1. every hard gate remains at 100 percent on selection tasks;
2. the lower confidence bound of the soft score improves;
3. no protected regression-suite game loses a gate;
4. at least one target-model repeat with a different seed confirms the gain;
5. a maintainer reviews the exact Markdown diff and trajectory evidence; and
6. adoption happens through a normal pull request, never automatically.

Rejected edits and failure clusters should remain available to the optimizer,
but no transcript, screenshot, or generated artifact should enter the deployed
plugin package.

## Why SkillOpt-Sleep comes later

SkillOpt-Sleep can harvest Codex transcripts, mine recurring tasks, replay them,
and stage a gated proposal for human adoption. Upstream explicitly warns that a
real backend sends transcript-derived excerpts to the selected provider and
that outbound prompts are not guaranteed to be secret-free. Its evidence log
also contains redacted but sensitive prompt and reply material.

For Manse, a future Sleep pilot must therefore:

- use only opted-in archived sessions;
- run `harvest` first and require manual redaction plus `reviewed: true`;
- exclude tool arguments, outputs, credentials, camera data, and child data;
- disable automatic scheduling and adoption during the pilot;
- set a short local retention period for tasks and `evidence.jsonl`;
- target only the optimizable strategy reference; and
- replay in empty disposable workspaces with network and deployment disabled.

The first pilot should use the mock backend to validate the data path. A real
Codex-backed dry run comes only after the harvested task JSON is inspected.

## Delivery phases

### Phase A: evaluator before optimizer

- Extract the existing release checks into one read-only JSON scorecard.
- Add deterministic screenshot checkpoints for desktop, mobile, mid-play,
  terminal outcome, restart, and reduced motion.
- Build the 48-brief dataset and publish only non-sensitive synthetic briefs.
- Establish baseline variance across three target runs per sealed task.

### Phase B: adapter prototype

- Pin SkillOpt by commit in a separate Python environment.
- Implement `skillopt/envs/manse_gamegen/` outside the production runtime.
- Use `codex_exec` with network disabled and an isolated writeable workspace.
- Optimize only `optimized-creator-strategy.md` for one epoch and two edits.

### Phase C: shadow adoption

- Generate a candidate strategy and replay all six Showcase regression games.
- Produce an HTML or Markdown comparison report with score deltas and evidence.
- Let maintainers accept or reject the candidate without changing the plugin.

### Phase D: controlled continuous improvement

- Run weekly or after a minimum batch of new reviewed failures, not after every
  creator session.
- Keep a champion strategy and one challenger; promote only through the gate.
- Track accepted skill version, evaluator version, dataset hash, model IDs,
  token cost, seeds, and rollback commit.
- Re-run the sealed test suite after promotion and before publishing a plugin
  cachebuster.

## Stop conditions

Pause optimization when any of these occurs:

- a privacy, data-only pack, public-access, or creator-ownership regression;
- a candidate changes evaluator files or generated fixtures;
- held-out gains disappear across seeds;
- vision-judge gains conflict with human pairwise review;
- average build or rollout cost exceeds the agreed budget;
- the candidate grows beyond 2,000 tokens without a measured benefit; or
- failures cluster in runtime capability rather than creator strategy.

The last condition matters. SkillOpt can improve procedural instructions, but
it cannot compensate for a missing renderer API, unsupported pose primitive,
or broken publisher. Those failures should become engine work, not more prompt
text.
