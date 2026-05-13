# DeskPet Asset Guide

M0/M1 did not integrate custom DeskPet assets. M2A starts the first bounded asset integration by wiring one draft main avatar pack into the existing safe app shell.

## Current Runtime Assets

The imported PawPal assets remain available only for base validation:

- `pet_assets/line_dog/` equivalent imported PawPal line-dog asset folder.
- `pet_assets/golden_puppy/` equivalent imported PawPal golden-puppy asset folder.
- `pet_assets/main_pixel_avatar/`

The PawPal placeholder assets are not DeskPet's final product identity. Their redistribution rights are not fully proven in this repo, so they should be replaced or separately cleared before public distribution.

The M2A `main_pixel_avatar` files are generated from the final Rourou spritesheet run:

```text
output/hatch_pet_runs/rourou_from_1_restore/final/spritesheet.webp
```

The source run validated successfully as a `1536x1872` RGBA WebP spritesheet. Runtime animated WebPs are exported from the matching `frames/` rows into `256x256` transparent files. They are still local integration assets until the user approves the final visual quality and source/provenance status.

Desktop preview exposed three runtime issues: GIF haloing on the avatar edge, overly frequent idle blinking, and visible idle-frame jitter. The runtime pack now uses animated WebP to preserve multi-level alpha, applies alpha-bleed repair to semi-transparent edge pixels, and keeps `idle` as a standing `3.5s` loop where the body is anchored and only the eye region changes during one blink cluster. Follow-up visual review also found `drinking` and `focusGuard` too large and too fast, so those two runtime loops were reduced to sparse 5-frame WebP animations with longer holds and stable feet/body anchors. A later semantic review found `sitting` and `sleeping` were mapped to the wrong readable poses, and that `happy`, `breakDone`, and `focusDone` were too similar. Those loops now use distinct deterministic subsets of the existing Rourou frames. The 2026-05-10 manual rest-reminder preview then found the prompt wave too busy and break-run motion uncoordinated; `breakPrompt` and `hydrationPrompt` now use slow wave loops with long neutral holds, `breakRunning` uses the natural `running-right` order without ping-pong reversal, and the break-run window movement was damped to reduce drift. The 2026-05-12 tuned preview replaced runtime `idle.webp` from `output/animation_preview/idle_blink_tuned_2026-05-12/export/idle_blink_tuned.webp` and runtime `sitting.webp` from `output/animation_preview/sitting_tuned_2026-05-12/export/sitting_tuned.webp` to test slower blink/breathing loops in the app. The later `generated_states_size_locked_2026-05-12` candidate replaced the non-idle runtime states from its exported WebPs. `idle.webp` intentionally stays on the tuned standing idle because using `02_sitting_edgeRest.webp` would make normal idle look seated and conflict with the bottom-edge sitting trigger. User feedback on 2026-05-13 found `sleeping` too large, animated states not smooth enough, `breakRunning` containing repeated foot frames, and the final meal reminder material not visible in-app; `scripts/repair-m2a-feedback-assets.ps1` rebuilds `sleeping` smaller, rebuilds `breakRunning` from the 8-frame `running-right` source, and wires `mealPrompt.webp` plus the tuned `eating_noodle_stir_2026-05-13` eating loop into the app. A 2026-05-14 review found the synthetic multi-frame repair too fast and visibly ghosted because it used whole-frame alpha blending; the current repair uses only real key frames plus hold cadence, with no blended in-between frames. A follow-up pass fixes the visible `happy` expression by applying the tuned eating smile face patch, clears isolated alpha specks that made `breakPrompt` appear size-unstable, slows and simplifies `breakDone`, rebuilds `focusGuard`, and uses ping-pong cadence for hydration/focus loops. This is a runtime asset cleanup only; it does not change source frames under `output/`.

Current DeskPet runtime mapping:

| DeskPet runtime WebP | Rourou source row |
| --- | --- |
| `idle.webp` | `idle_blink_tuned` standing idle |
| `sitting.webp` | `jumping` |
| `happy.webp` | `generated_states_size_locked_2026-05-12` happy body plus `eating_noodle_stir_2026-05-13` smile face patch |
| `sad.webp` | `failed` |
| `sleeping.webp` | `failed` |
| `breakPrompt.webp` | `generated_states_size_locked_2026-05-12` break prompt |
| `breakRunning.webp` | `running-right` |
| `breakDone.webp` | `generated_states_size_locked_2026-05-12` break done calm subset |
| `mealPrompt.webp` | `generated_states_size_locked_2026-05-12` meal prompt |
| `eating.webp` | `eating_noodle_stir_2026-05-13` |
| `hydrationPrompt.webp` | `generated_states_size_locked_2026-05-12` hydration prompt |
| `drinking.webp` | `generated_states_size_locked_2026-05-12` drinking |
| `hydrationDone.webp` | `generated_states_size_locked_2026-05-12` hydration done |
| `focusGuard.webp` | `generated_states_size_locked_2026-05-12` focus guard |
| `focusDone.webp` | `generated_states_size_locked_2026-05-12` focus done |

Known current caveat: the generated size-locked candidate does not contain a true `idle` export, and the Rourou run does not contain exact DeskPet-specific rows for `sitting`, `drinking`, `sleeping`, or `focusDone`, so idle uses the earlier tuned standing loop while those states use nearest available source-row subsets and still need human visual approval.

## States Used In M1/M2A

Active reminder and shell states:

- `idle`
- `sitting`
- `happy`
- `breakPrompt`
- `breakRunning`
- `breakDone`
- `mealPrompt`
- `eating`
- `hydrationPrompt`
- `drinking`
- `hydrationDone`
- `focusGuard`
- `focusDone`
- `sad`
- `sleeping`

Scene triggers currently wired in code:

- `sitting`: user drags the pet to the bottom edge of the current display work area.
- Dragging the pet away from the bottom edge returns the ambient state to `idle`.
- `sleeping`: pet stays in an ambient state with no DeskPet interaction for 10 minutes, then returns to `idle` after 10 minutes asleep.
- `mealPrompt`: appears at local wall-clock `12:00` and `18:00` every day as an eating reminder.
- `eating`: plays after the user confirms the meal reminder.
- Meal completion reuses `hydrationDone`; there is no separate `mealDone` asset.

The old PawPal `focusAlert` warning state is not part of M1/M2A runtime state and is excluded from default package resources.

## M2A Runtime Boundary

M2A integrates only the root runtime files needed by the M1 state machine:

- `pet_assets/main_pixel_avatar/idle.webp`
- `pet_assets/main_pixel_avatar/sitting.webp`
- `pet_assets/main_pixel_avatar/happy.webp`
- `pet_assets/main_pixel_avatar/breakPrompt.webp`
- `pet_assets/main_pixel_avatar/breakRunning.webp`
- `pet_assets/main_pixel_avatar/breakDone.webp`
- `pet_assets/main_pixel_avatar/mealPrompt.webp`
- `pet_assets/main_pixel_avatar/eating.webp`
- `pet_assets/main_pixel_avatar/hydrationPrompt.webp`
- `pet_assets/main_pixel_avatar/drinking.webp`
- `pet_assets/main_pixel_avatar/hydrationDone.webp`
- `pet_assets/main_pixel_avatar/focusGuard.webp`
- `pet_assets/main_pixel_avatar/focusDone.webp`
- `pet_assets/main_pixel_avatar/sad.webp`
- `pet_assets/main_pixel_avatar/sleeping.webp`

These draft/production paths stay excluded from git and packages:

- `pet_assets/main_pixel_avatar/raw/`
- `pet_assets/main_pixel_avatar/cleaned/`
- `pet_assets/main_pixel_avatar/*.md`
- `pet_assets/main_pixel_avatar/manifest.draft.json`
- `pet_assets/main_pixel_avatar/focusAlert.*`
- `pet_assets/paired_pixel_avatar/`

`focusAlert` remains out of runtime because automatic focus/distraction detection is not part of the safe M1/M2A app.
