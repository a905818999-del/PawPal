# DeskPet M2A Assets Feature Spec

## Scope

M2A covers one selectable bundled main avatar appearance. It does not cover scenes, paired companion behavior, arbitrary user import, walk/touch behavior, or any automatic focus/distraction detection.

## Affected Entry Points

- Settings appearance selector.
- Settings test-tools scene-cycler toggle.
- Pet renderer asset resolution.
- Reminder visual states, including fixed daily meal reminders.
- Manual focus visual state.
- Test-only pet scene cycler for local asset review.
- Windows portable/zip packaging resources.
- Git/source-control asset rules.
- Asset/license documentation.

## Roles And Permissions

- User: selects the bundled avatar from Settings and confirms visual quality.
- Developer: integrates approved runtime files and verifies package contents.
- App: loads local bundled assets only. It must not read foreground apps, windows, processes, screenshots, OCR, keyboard input, mouse hooks, telemetry, or hidden network data.
- Debug user: when `DESKPET_DEBUG_SCENE_CYCLER=1` or the unpackaged dev shell is running, clicks the pet to cycle through runtime scenes and reads the on-screen scene label. This is a visual QA aid only and must not change reminder state, stats, or packaged default behavior.

## Main Flow

1. App starts with existing persisted settings.
2. User opens Settings.
3. User selects the M2A main avatar appearance.
4. Pet renderer switches to the selected appearance.
5. Rest, meal, hydration, and manual focus flows resolve assets for their runtime states.
6. User drags the pet to the bottom of the display work area.
7. Pet enters `sitting`.
8. If the pet remains in an ambient state with no DeskPet interaction for 10 minutes, it enters `sleeping`.
9. After 10 minutes asleep, the pet returns to `idle`.
10. At local `12:00` or `18:00`, the meal reminder shows `mealPrompt`.
11. User confirms the meal reminder.
12. Pet plays `eating`, then reuses `hydrationDone` as the shared completion feedback.
13. User quits and restarts the app.
14. The M2A appearance remains selected.

## Test-Only Scene Cycler

The pet renderer can run a debug-only click cycler for asset review. It is enabled automatically in the unpackaged dev shell and can be enabled for a packaged local test run with:

```text
DESKPET_DEBUG_SCENE_CYCLER=1
```

When enabled from Settings test tools, environment variable, or the unpackaged dev shell, a normal pet click advances through the 15 runtime states in order and displays a small `Test Scene` badge with the current scene name and state id. Dragging still uses the normal drag path. The cycler is session-only: it must not update stats, trigger reminder actions, start/stop focus, read external app context, or persist state.

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

Only the required 15 runtime animated WebPs are exported into `pet_assets/main_pixel_avatar/`. The spritesheet, decoded rows, source frames, prompts, references, QA videos, and other `output/` files are not committed or packaged.

Current source-row mapping:

| DeskPet state file | Source row |
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

Known handoff caveat retained for this candidate: the generated size-locked export does not include a true idle loop, and the source sheet does not have exact DeskPet-specific rows for `sitting`, `drinking`, `sleeping`, or `focusDone`, so idle uses the earlier tuned standing loop while those states use nearest available source-row subsets and require manual visual approval. A follow-up semantic repair split `happy`, `breakDone`, and `focusDone` into distinct runtime loops instead of reusing the same success pose for all three states.

Current runtime timing follows the earlier line-dog Xiaobai material spec, then applies slower Rourou-specific tuning for the short-frame avatar. Feedback on desktop preview found `drinking.webp` and `focusGuard.webp` too large and too fast, so those two loops now use sparse 5-frame cadence with longer holds and stable bottom-center anchors. A later manual rest-reminder preview found the prompt wave too busy and the break-run motion uncoordinated, so `breakPrompt.webp` and `hydrationPrompt.webp` were reduced to slow loops with long neutral holds, while `breakRunning.webp` uses the natural `running-right` frame order without ping-pong reversal. The break-run window movement was also damped to mostly horizontal motion with lower speed, less vertical drift, and longer turn intervals so the mirrored left/right gait does not feel jittery. On 2026-05-12, runtime `idle.webp` and `sitting.webp` were replaced from the tuned preview exports under `output/animation_preview/idle_blink_tuned_2026-05-12/` and `output/animation_preview/sitting_tuned_2026-05-12/` to test the latest blink and sitting/breathing loops in-app. The later `output/animation_preview/generated_states_size_locked_2026-05-12/` candidate replaced the non-idle runtime states from its exported WebPs. Because this candidate does not provide a standing idle export, `idle.webp` intentionally stays on `output/animation_preview/idle_blink_tuned_2026-05-12/export/idle_blink_tuned.webp`; using `02_sitting_edgeRest.webp` for idle makes the default state look seated and conflicts with the bottom-edge sitting trigger. On 2026-05-13, `scripts/repair-m2a-feedback-assets.ps1` shrank `sleeping`, rebuilt `breakRunning` from the 8-frame `running-right` source to remove repeated foot frames, and wired meal reminder runtime files. `mealPrompt.webp` comes from the size-locked candidate; `eating.webp` comes from `output/animation_preview/eating_noodle_stir_2026-05-13/`. A 2026-05-14 visual review rejected whole-frame alpha-blended in-between frames because they created ghosted double poses; the repair now uses only real key frames with repeated hold cadence and slower export timing. A follow-up review found `happy` was not visibly smiling, `breakPrompt` appeared to change size between frames, `breakDone` felt too chaotic, and hydration/focus loops were not smooth enough. The repair script now clears isolated alpha specks outside the body box, re-anchors repaired states by projected body bounds, gives `happy` the tuned eating smile face patch, skips the most chaotic `breakDone` frames, rebuilds `focusGuard`, and uses ping-pong cadence for hydration/focus/prompt loops to avoid hard end-to-start jumps.

After desktop preview found visible GIF haloing, over-frequent blinking, and idle-frame jitter, the runtime pack was rebuilt from the original transparent PNG frames as animated WebP. The WebP export preserves multi-level alpha and applies an alpha-bleed edge repair on semi-transparent boundary pixels. The tuned `idle` export uses a stable standing body loop where only the eye region changes during one slow blink. It does not modify source material under `output/`.

| DeskPet state file | Runtime frames | Loop duration |
| --- | ---: | ---: |
| `idle.webp` | 5 eye-only standing frames | 3.5s |
| `sitting.webp` | 5 | 3.56s |
| `happy.webp` | 5 key frames plus mirrored cadence | about 2s |
| `breakPrompt.webp` | 5 key frames plus mirrored cadence | about 3.7s |
| `breakRunning.webp` | 8 | 10fps |
| `breakDone.webp` | 3 selected key frames plus hold cadence | about 3.6s |
| `mealPrompt.webp` | 5 key frames plus mirrored cadence | about 3.7s |
| `eating.webp` | 5 key frames plus mirrored cadence | about 3.3s |
| `hydrationPrompt.webp` | 5 key frames plus mirrored cadence | about 3.7s |
| `drinking.webp` | 5 key frames plus mirrored cadence | about 3.3s |
| `hydrationDone.webp` | 5 key frames plus mirrored cadence | about 3.3s |
| `focusGuard.webp` | 5 key frames plus mirrored cadence | about 6.7s |
| `focusDone.webp` | 5 key frames plus mirrored cadence | about 3.3s |
| `sad.webp` | 5 | 3.4s |
| `sleeping.webp` | 5 | 5.6s |

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
mealPrompt
eating
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
pet_assets/main_pixel_avatar/mealPrompt.webp
pet_assets/main_pixel_avatar/eating.webp
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
- Validate meal demo shows `mealPrompt`, confirming the action shows `eating`, then reuses `hydrationDone`.
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

## Meal Reminder Integration

Meal reminder states are now part of the M2A runtime:

- `mealPrompt`: shown at local wall-clock `12:00` and `18:00` every day. It should read as lunch/dinner or eating-time reminder, not as hydration.
- `eating`: shown after the user confirms the meal reminder. The current candidate uses the tuned noodle-stir export.

`hydrationDone.webp` remains the shared completion feedback for both hydration and meal completion. Do not generate a separate `mealDone` asset unless the product requirement changes.

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
- In an unpackaged dev shell, or with `DESKPET_DEBUG_SCENE_CYCLER=1`, click the pet repeatedly and confirm the debug badge and rendered asset advance through all 15 runtime scenes.

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
- Runtime WebP export validation: all 15 files under `pet_assets/main_pixel_avatar/` are non-empty `256x256` transparent animated WebPs.
- Runtime timing validation: `idle.webp` uses the tuned standing idle export at `3.5s`; `breakRunning.webp` is rebuilt as an 8-frame 10fps loop; `sleeping.webp` keeps 5 frames but with smaller content scale; `happy`, `breakPrompt`, `breakDone`, `mealPrompt`, `eating`, `hydrationPrompt`, `drinking`, `hydrationDone`, `focusGuard`, and `focusDone` use real key-frame exports with hold or ping-pong cadence and no alpha-blended in-between frames. The remaining stable ambient loops are `sitting.webp` `3.56s` and `sad.webp` `3.4s`.
- 2026-05-14 feedback repair validation: `scripts/repair-m2a-feedback-assets.ps1` rebuilt `happy`, `breakPrompt`, `breakDone`, `hydrationPrompt`, `drinking`, `hydrationDone`, `focusGuard`, `focusDone`, `mealPrompt`, `eating`, `sleeping`, and `breakRunning`; repaired frame previews show stable bottom-center anchors, with `happy` using the eating smile face patch and `breakDone` using the calmer subset. `pnpm typecheck`, `pnpm smoke:m1`, `pnpm dist:win`, and `pnpm smoke:m2a` passed after stopping stale packaged DeskPet processes that had locked `dist/win-unpacked`.
- Runtime alpha validation: the original source PNG frame has 235 alpha levels, while the old GIF export had only 2; the new WebP runtime files retain multi-level alpha after edge repair.
- Edge cleanup validation: preview artifact `output/program_preview/idle_webp_compare.png` shows old GIF vs new WebP composited on white and dark backgrounds, `output/program_preview/idle_stabilized_frames.png` records the stabilized idle eye-only cadence, `output/program_preview/motion_review/motion_fix_frames_after.png` records the reduced `drinking` and `focusGuard` cadence, `output/program_preview/semantic_asset_review/semantic_fix_frames_after.png` records the `sitting`, `sleeping`, `happy`, `breakDone`, `focusDone`, and `sad` semantic repair, `output/program_preview/manual_qa_repair_2026-05-10/break_prompt_running_after.png` records the slower prompt and break-run loop repair, and `output/animation_preview/*_tuned_2026-05-12/qa/` records the latest `idle` and `sitting` tuned edge checks.
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
- visual quality across monitor/DPI variants still needs manual desktop QA, especially the style match between the tuned standing idle and the size-locked non-idle candidate states;
- SmartScreen/AV behavior for unsigned packages remains environment-specific.
