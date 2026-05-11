# DeskPet M2A Assets Feature Spec

## Scope

M2A covers one selectable bundled main avatar appearance. It does not cover scenes, paired companion behavior, arbitrary user import, walk/touch behavior, or any automatic focus/distraction detection.

## Affected Entry Points

- Settings appearance selector.
- Pet renderer asset resolution.
- Reminder visual states.
- Manual focus visual state.
- Windows portable/zip packaging resources.
- Git/source-control asset rules.
- Asset/license documentation.

## Roles And Permissions

- User: selects the bundled avatar from Settings and confirms visual quality.
- Developer: integrates approved runtime files and verifies package contents.
- App: loads local bundled assets only. It must not read foreground apps, windows, processes, screenshots, OCR, keyboard input, mouse hooks, telemetry, or hidden network data.

## Main Flow

1. App starts with existing persisted settings.
2. User opens Settings.
3. User selects the M2A main avatar appearance.
4. Pet renderer switches to the selected appearance.
5. Rest, hydration, and manual focus flows resolve assets for their existing M1 states.
6. User drags the pet to the bottom of the display work area.
7. Pet enters `sitting`.
8. If the pet remains in an ambient state with no DeskPet interaction for 10 minutes, it enters `sleeping`.
9. After 10 minutes asleep, the pet returns to `idle`.
10. User quits and restarts the app.
11. The M2A appearance remains selected.

## Failure Flows

- If a non-critical state asset is missing, the app uses the documented fallback.
- If a required fallback is missing, validation fails before packaging.
- If asset license/provenance is not cleared, public distribution is blocked.
- If package inspection finds raw/private/draft files, the M2A package gate fails.
- If safety grep finds active monitoring behavior, M2A fails until removed.
- If a reminder, manual focus, bubble action, click, drag, tray/menu action, or settings update occurs, ambient sleep timing must yield to that explicit DeskPet activity.

## Input Boundaries

Runtime assets must be local files under the approved bundled appearance folder. M2A does not accept user-selected external files.

The current runtime source is the Rourou final spritesheet run:

```text
output/hatch_pet_runs/rourou_from_1_restore/final/spritesheet.webp
```

The source run also includes extracted frame rows under:

```text
output/hatch_pet_runs/rourou_from_1_restore/frames/
```

Only the required 13 runtime animated WebPs are exported into `pet_assets/main_pixel_avatar/`. The spritesheet, decoded rows, source frames, prompts, references, QA videos, and other `output/` files are not committed or packaged.

Current source-row mapping:

| DeskPet state file | Source row |
| --- | --- |
| `idle.webp` | `idle` |
| `sitting.webp` | `jumping` |
| `happy.webp` | `jumping` |
| `sad.webp` | `failed` |
| `sleeping.webp` | `failed` |
| `breakPrompt.webp` | `waving` |
| `breakRunning.webp` | `running-right` |
| `breakDone.webp` | `waving` |
| `hydrationPrompt.webp` | `waving` |
| `drinking.webp` | `review` |
| `hydrationDone.webp` | `jumping` |
| `focusGuard.webp` | `review` |
| `focusDone.webp` | `review` |

Known handoff caveat retained for this candidate: the source sheet does not have exact DeskPet-specific rows for `sitting`, `drinking`, `sleeping`, or `focusDone`, so those states use nearest available source-row subsets and require manual visual approval. A follow-up semantic repair split `happy`, `breakDone`, and `focusDone` into distinct runtime loops instead of reusing the same success pose for all three states.

Current runtime timing follows the earlier line-dog Xiaobai material spec, then applies slower Rourou-specific tuning for the short-frame avatar. Feedback on desktop preview found `drinking.webp` and `focusGuard.webp` too large and too fast, so those two loops now use sparse 5-frame cadence with longer holds and stable bottom-center anchors. A later manual rest-reminder preview found the prompt wave too busy and the break-run motion uncoordinated, so `breakPrompt.webp` and `hydrationPrompt.webp` were reduced to slow 9-frame wave loops with long neutral holds, while `breakRunning.webp` now uses the natural `running-right` frame order without ping-pong reversal. The break-run window movement was also damped to mostly horizontal motion with lower speed, less vertical drift, and longer turn intervals so the mirrored left/right gait does not feel jittery.

After desktop preview found visible GIF haloing, over-frequent blinking, and idle-frame jitter, the runtime pack was rebuilt from the original transparent PNG frames as animated WebP. The WebP export preserves multi-level alpha, applies an alpha-bleed edge repair on semi-transparent boundary pixels, and rewrites `idle` into a stable body loop where only the eye region changes during one slow blink. It does not modify source material under `output/`.

| DeskPet state file | Runtime frames | Loop duration |
| --- | ---: | ---: |
| `idle.webp` | 5 eye-only frames | 3.5s |
| `sitting.webp` | 3 | 4.2s |
| `happy.webp` | 5 | 2.21s |
| `breakPrompt.webp` | 9 | 5.36s |
| `breakRunning.webp` | 8 | 1.28s |
| `breakDone.webp` | 5 | 2.31s |
| `hydrationPrompt.webp` | 9 | 5.36s |
| `drinking.webp` | 5 | 3.5s |
| `hydrationDone.webp` | 18 | 2.52s |
| `focusGuard.webp` | 5 | 3.8s |
| `focusDone.webp` | 5 | 3.08s |
| `sad.webp` | 5 | 3.2s |
| `sleeping.webp` | 4 | 3.8s |

M2A uses the narrow-unignore route for final approved runtime files, because draft asset folders are currently ignored.

Implementation must replace the broad ignore for `pet_assets/main_pixel_avatar/` with narrow rules that track approved root WebP runtime files while continuing to ignore:

- `raw/`
- `cleaned/`
- `*.md`
- `manifest.draft.json`
- `focusAlert.*`
- private prompt logs or reference material

Required runtime states:

```text
idle
sitting
happy
breakPrompt
breakRunning
breakDone
hydrationPrompt
drinking
hydrationDone
focusGuard
focusDone
sad
sleeping
```

Disallowed runtime/package inputs:

- `focusAlert`
- raw generation files
- prompt logs with private references
- contact sheets
- draft notes
- paired companion assets
- scene/background assets

Expected runtime package files:

```text
pet_assets/main_pixel_avatar/idle.webp
pet_assets/main_pixel_avatar/sitting.webp
pet_assets/main_pixel_avatar/happy.webp
pet_assets/main_pixel_avatar/breakPrompt.webp
pet_assets/main_pixel_avatar/breakRunning.webp
pet_assets/main_pixel_avatar/breakDone.webp
pet_assets/main_pixel_avatar/hydrationPrompt.webp
pet_assets/main_pixel_avatar/drinking.webp
pet_assets/main_pixel_avatar/hydrationDone.webp
pet_assets/main_pixel_avatar/focusGuard.webp
pet_assets/main_pixel_avatar/focusDone.webp
pet_assets/main_pixel_avatar/sad.webp
pet_assets/main_pixel_avatar/sleeping.webp
```

## Output Expectations

- A new settings option, for example `Main Pixel Avatar`.
- Existing M1 behavior unchanged.
- The M2A avatar keeps a stable feet/body anchor in the renderer; its animated WebP files provide motion, so the generic CSS state motion is not layered on top of this appearance.
- Portable/zip includes only approved runtime avatar files.
- Portable/zip excludes raw/private/draft material.
- Git tracks approved root runtime WebP files, or they are explicitly staged, while raw/private/draft material remains ignored.
- Docs record source, license/provenance status, and remaining public-release blockers.

## Suggested Automated Scenarios

- Validate every M1 state resolves to an existing path.
- Validate settings can be updated to the new appearance and survives restart.
- Validate packaged renderer image-load success for `idle`, `breakPrompt`, `hydrationPrompt`, and `focusGuard`.
- Validate the packaged M2A renderer disables generic shell `animation` and `transform` on the pet button.
- Validate bottom drag switches to `sitting` and loads `sitting.webp`.
- Validate manual focus can override `sitting` and load `focusGuard.webp`.
- Validate dragging away from the bottom switches `sitting` back to `idle`.
- Validate local no-interaction timing switches to `sleeping`, loads `sleeping.webp`, then returns to `idle`.
- Validate packaged zip includes approved avatar runtime files.
- Validate packaged zip excludes `raw`, `cleaned`, `contact-sheet`, `manifest.draft.json`, `asset-notes.md`, `paired_pixel_avatar`, and `focusAlert`.
- Validate NSIS config disables `elevate.exe` packaging, portable packaging tolerates the ignored no-elevate helper warning, and final portable/zip artifacts do not contain `elevate.exe`.
- Validate approved runtime files are tracked by `git ls-files` or explicitly staged, while draft/private files are ignored.
- Re-run M1 safety grep and smoke checks.

## Smoke Semantics

`pnpm smoke:m1` remains the M1 baseline. M2A should add `pnpm smoke:m2a` or an explicit M2A asset mode that reuses M1 safety checks while replacing pre-M2 package assertions with M2A inclusion/exclusion assertions.

M2A smoke must prove settings persistence, packaged renderer image-load success, package inclusion/exclusion, and preserved M1 safety checks.

## M2B Compatibility

Future manifest loading should normalize any bundled JSON manifest into the existing appearance contract used by the renderer:

- `id`
- `label`
- `fallback`
- `states`

Renderer APIs should stay stable: `getPetAsset`, `getPetAssetVariantCount`, `petAppearanceOptions`, and `resolvePetAppearanceId`.

## Next Asset Regeneration Target

The next DeskPet-specific regeneration should keep the current 13 runtime states and add two meal-reminder states:

- `mealPrompt`: meal reminder prompt shown at local wall-clock `12:00` and `18:00` every day. It should read as lunch/dinner or eating-time reminder, not as hydration.
- `eating`: eating-in-progress action after the user confirms the meal reminder. A small food prop is allowed, but the pose should keep the same character identity and desktop-pet scale.

`hydrationDone.webp` remains the shared completion feedback for both hydration and meal completion. Do not generate a separate `mealDone` asset unless the product requirement changes.

This meal flow is not wired in the current M2A runtime yet. Code integration will require new states, fixed daily meal scheduling, bubble actions, QA/demo trigger coverage, and package checks for `mealPrompt.webp` and `eating.webp`.

## Visual Backlog Outside M2A

These are approved as future asset-production references, but they are not part of the M2A runtime/package gate:

- `bigLaugh`: relaxed big laugh, stronger expression than `happy`, fallback to `happy`.
- `slackOff`: playful slacking-off glance, manual/fun state only, fallback to `idle`.

The reference photos should be used only for expression/action anchors. Do not copy chat text, restaurant/background details, exact clothes, or bind `slackOff` to automatic monitoring.

## Manual-Only Scenarios

- Confirm likeness and style approval.
- Check desktop transparency and edge cleanliness.
- Check animation anchor stability.
- Check reminder bubble overlap.
- Check visual scale at normal Windows desktop size.

## Known Untested Risks

- Final user likeness cannot be proven by automation.
- Unsigned Windows package may still trigger SmartScreen or AV warnings.
- Multi-monitor/DPI visual quality remains manual unless future automation is added.
- If final assets arrive with different dimensions, the package can pass path checks while still needing visual corrections.

## Completion Gate

M2A is complete only after:

- `pnpm typecheck` passes;
- Windows package build passes;
- M2A asset/package smoke check passes;
- M1 safety grep still passes;
- source-control asset boundary is verified with tracked or explicitly staged runtime files;
- packaged renderer image-load success is verified;
- manual visual QA is recorded;
- license/provenance risk is documented honestly.

## M2A Implementation Evidence

Automated checks run during M2A development:

- `pnpm install --frozen-lockfile`: passed; lockfile was already up to date.
- `pnpm typecheck`: passed.
- `node --check scripts\smoke-m1.mjs`: passed.
- `pnpm dist:win`: passed and produced `dist\DeskPet 0.1.0-m2a.exe` plus `dist\DeskPet-0.1.0-m2a-win.zip`.
- `pnpm smoke:m2a`: passed.
- Follow-up anchor-stability check after the shell-motion fix: `pnpm typecheck` passed; `node --check scripts\smoke-m1.mjs` passed; `pnpm smoke:m2a` passed and reported `M2A shell motion disabled` for `idle`, `sitting`, `sleeping`, `focusGuard`, `breakPrompt`, and `hydrationPrompt` in the packaged renderer.
- Rourou final spritesheet validation: `final/validation.json` reports `ok=true`, `format=WEBP`, `mode=RGBA`, `1536x1872`, no errors or warnings.
- Runtime WebP export validation: all 13 files under `pet_assets/main_pixel_avatar/` are non-empty `256x256` transparent animated WebPs.
- Runtime timing validation: `idle.webp` encodes a `3.5s` loop with one slow blink cluster and stable body anchor; `breakPrompt.webp` and `hydrationPrompt.webp` use sparse `9`-frame `5.36s` wave loops with long neutral holds; `breakRunning.webp` uses the natural `running-right` order as an `8`-frame `1.28s` loop; `drinking.webp` uses a sparse `5`-frame `3.5s` sip loop; `focusGuard.webp` uses a sparse `5`-frame `3.8s` guard loop; `sitting.webp`, `sleeping.webp`, `happy.webp`, `breakDone.webp`, `focusDone.webp`, and `sad.webp` were rebuilt from distinct state-specific source subsets after semantic visual review.
- Runtime alpha validation: the original source PNG frame has 235 alpha levels, while the old GIF export had only 2; the new WebP runtime files retain multi-level alpha after edge repair.
- Edge cleanup validation: preview artifact `output/program_preview/idle_webp_compare.png` shows old GIF vs new WebP composited on white and dark backgrounds, `output/program_preview/idle_stabilized_frames.png` records the stabilized idle eye-only cadence, `output/program_preview/motion_review/motion_fix_frames_after.png` records the reduced `drinking` and `focusGuard` cadence, `output/program_preview/semantic_asset_review/semantic_fix_frames_after.png` records the `sitting`, `sleeping`, `happy`, `breakDone`, `focusDone`, and `sad` semantic repair, and `output/program_preview/manual_qa_repair_2026-05-10/break_prompt_running_after.png` records the slower prompt and break-run loop repair.
- 2026-05-10 rest-reminder repair validation: `pnpm typecheck`, `node --check scripts\smoke-m1.mjs`, `pnpm dist:win`, and `pnpm smoke:m2a` passed after rebuilding `breakPrompt.webp`, `hydrationPrompt.webp`, and `breakRunning.webp`, then dampening break-run window motion; `pnpm smoke:m2a` reported packaged renderer image-load success for `breakPrompt` and `hydrationPrompt`.

`pnpm smoke:m2a` evidence:

- safety scan passed for source/config paths;
- M2A source-control asset boundary checks passed;
- M2A appearance source mapping checks passed;
- zip audit passed with no `elevate.exe`;
- package inclusion/exclusion checks passed;
- packaged renderer loaded `idle`, `sitting`, `sleeping`, `focusGuard`, `breakPrompt`, and `hydrationPrompt` WebP images at `256x256`;
- bottom drag produced `sitting`; manual focus overrode `sitting` with `focusGuard`; dragging away from the bottom returned to `idle`; shortened smoke-only no-interaction timers produced `sleeping` and then returned to `idle`;
- settings update and restart persistence passed for `mainPixelAvatar`;
- process tree cleaned.

Remaining manual-only risks:

- final likeness approval is still manual;
- draft asset provenance/license is not public-release-cleared;
- visual quality across monitor/DPI variants still needs manual desktop QA, even though the first observed GIF halo and rapid-blink artifact has been addressed in the runtime WebPs;
- SmartScreen/AV behavior for unsigned packages remains environment-specific.
