# DeskPet M0/M1/M2A Project Test Inventory

Scope: M0 Base Validation, M1 Safety-Clean App Shell, and M2A one-pack main avatar asset integration.

Out of scope: full Phase 1, paired companion runtime, scenes, arbitrary user asset import, walk/touch behavior, and automatic focus/distraction detection.

## Source Requirements

| ID | Source | Requirement |
| --- | --- | --- |
| REQ-M0-01 | `.omx/plans/adr-base-selection-deskpet-phase1.md`, `docs/pawpal-source-audit.md` | PawPal base must be imported from `v0.1.3` / `7cb44da708f2488d9587140554c486173145907a`, with MIT source license and asset license risk recorded. |
| REQ-M0-02 | `package.json`, `pnpm-lock.yaml`, `docs/dependency-audit.md` | Dependencies and install scripts must be audited before trusting the base. |
| REQ-M1-01 | `src/main/main.ts`, `src/shared/types.ts`, `src/shared/constants.ts` | Automatic focus/distraction detection must stay removed or hard-disabled. |
| REQ-M1-02 | `src/main/main.ts`, `src/preload/index.ts`, `src/renderer/src/components/SettingsView.tsx` | Manual focus must behave only as a user-started timer. |
| REQ-M1-03 | `src/main/main.ts`, `src/renderer/src/components/PetView.tsx` | Transparent always-on-top pet window must launch on Windows. |
| REQ-M1-04 | `src/main/main.ts`, `src/main/trayIcon.ts` | Tray menu must expose show/hide, manual focus, settings, and quit. |
| REQ-M1-05 | `src/main/main.ts`, `src/renderer/src/components/SettingsView.tsx` | Rest and hydration reminder states must remain usable after safety cleanup. |
| REQ-M1-06 | `package.json`, `build/entitlements.mac.plist`, `.github/workflows/release.yml` | No default auto-start, auto-update, elevation, hidden service, telemetry, input hook, screenshot/OCR, or foreground app/window/process monitoring path may remain. |
| REQ-M1-07 | `specs/deskpet-phase1.md` | M0/M1 entry points, flows, failure paths, verification, and known risks must be documented. |
| REQ-M2A-01 | `src/shared/types.ts`, `src/shared/petAppearances.ts` | `mainPixelAvatar` must be a selectable bundled appearance with mappings for all M1 runtime states. |
| REQ-M2A-02 | `.gitignore`, `pet_assets/main_pixel_avatar/*.webp` | Approved root runtime animated WebP files must be tracked or explicitly staged; raw/draft/private files, `focusAlert`, and paired drafts must stay ignored. |
| REQ-M2A-03 | `package.json`, `scripts/smoke-m1.mjs`, `scripts/smoke-m2a.ps1` | Windows zip/portable package must include only M2A runtime files and exclude rejected draft/private assets. |
| REQ-M2A-04 | `scripts/smoke-m1.mjs`, `scripts/smoke-m2a.ps1` | Packaged renderer must load representative `mainPixelAvatar` images and persist `mainPixelAvatar` after restart. |
| REQ-M2A-05 | `ASSET_LICENSE.md`, `docs/asset-guide.md`, `specs/deskpet-m2a-assets.md` | Draft asset status, license/provenance risk, verification evidence, and manual risks must be documented. |

## Product Entry Inventory

| Entry ID | Entry | Source | Priority | Observed Evidence |
| --- | --- | --- | --- | --- |
| ENTRY-CLI-01 | Install dependencies | `package.json`, `pnpm-lock.yaml` | P0 | `pnpm install --frozen-lockfile` passes; lockfile is up to date. |
| ENTRY-CLI-02 | Audit dependency advisories | `pnpm-lock.yaml` | P0 | `pnpm audit --json` reports 0 vulnerabilities across 431 dependencies. |
| ENTRY-CLI-03 | Type/build/package check | `package.json` scripts | P0 | `pnpm typecheck` and `pnpm dist:win` are current build gates. |
| ENTRY-CLI-04 | Current packaged smoke | `scripts/smoke-m2a.ps1`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m2a` runs shared M1 safety checks plus M2A asset/package/image checks. |
| ENTRY-CLI-05 | Safety scan over source/config | `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m2a` logs `Safety scan passed for source/config paths.` |
| ENTRY-WIN-01 | Packaged runtime launch | `dist/win-unpacked/DeskPet.exe`, `scripts/smoke-m1.mjs` | P0 | `pnpm smoke:m2a` launches packaged app and checks pet window `220x340 TopMost=True`. |
| ENTRY-UI-01 | Pet click/context menu/drag surface | `src/renderer/src/components/PetView.tsx`, `src/main/main.ts` | P1 | Context menu and drag IPC paths exist; full mouse drag remains manual-only. |
| ENTRY-UI-02 | Settings view and appearance picker | `src/renderer/src/components/SettingsView.tsx`, `src/shared/petAppearances.ts` | P0 | Settings reads `petAppearanceOptions`; `mainPixelAvatar` is in the source mapping and persists through smoke. |
| ENTRY-STATE-01 | Rest reminder | `triggerBreakReminder`, `scripts/smoke-m1.mjs` | P0 | M2A smoke produces `breakPrompt` and verifies image load for `breakPrompt.webp`. |
| ENTRY-STATE-02 | Hydration reminder | `triggerHydrationReminder`, `scripts/smoke-m1.mjs` | P0 | M2A smoke produces `hydrationPrompt` and verifies image load for `hydrationPrompt.webp`. |
| ENTRY-STATE-03 | Manual focus timer | `startFocusMode`, `stopFocusMode`, `scripts/smoke-m1.mjs` | P0 | M2A smoke verifies `focusGuard`, numeric `focusEndsAt`, and image load for `focusGuard.webp`. |
| ENTRY-STATE-04 | Local settings and stats | `electron-store`, `src/main/main.ts`, `scripts/smoke-m1.mjs` | P0 | M2A smoke writes `mainPixelAvatar`, restarts with same isolated userData, and verifies persistence. |
| ENTRY-STATE-05 | Bottom sitting scene | `startPetDrag`, `stopPetDrag`, `scripts/smoke-m1.mjs` | P1 | M2A smoke moves the cursor to the bottom work-area edge, verifies `sitting.webp`, verifies manual focus can override sitting, and verifies drag-away returns to `idle`. |
| ENTRY-STATE-06 | Ambient sleeping scene | `src/main/main.ts`, `scripts/smoke-m1.mjs` | P1 | Production timers are 10 minutes idle plus 10 minutes asleep; smoke shortens them through local env vars and verifies `sleeping.webp` then return to `idle`. |
| ENTRY-ASSET-01 | M2A appearance manifest | `src/shared/petAppearances.ts` | P0 | Source maps 13 M1 runtime states to `pet_assets/main_pixel_avatar/*.webp`. |
| ENTRY-ASSET-02 | M2A runtime files | `pet_assets/main_pixel_avatar/*.webp` | P0 | 13 runtime WebP files are staged/tracked candidates exported from `output/hatch_pet_runs/rourou_from_1_restore/frames/`; `git ls-files` sees 13 files after staging. |
| ENTRY-ASSET-03 | Draft/private asset boundary | `.gitignore` | P0 | `focusAlert`, `raw`, `cleaned`, notes, non-runtime draft files, and `paired_pixel_avatar` remain ignored. |
| ENTRY-PKG-01 | Portable executable | `package.json` build target | P0 | `dist/DeskPet 0.1.0-m2a.exe` exists after `pnpm dist:win`; smoke checks it has no `elevate.exe` marker. |
| ENTRY-PKG-02 | Zip package | `package.json` build target | P0 | `dist/DeskPet-0.1.0-m2a-win.zip` exists after `pnpm dist:win`; smoke checks no `elevate.exe`. |
| ENTRY-PKG-03 | M2A resource allowlist | `package.json`, `scripts/smoke-m1.mjs` | P0 | M2A smoke checks each expected runtime file is packaged and rejected fragments are absent. |
| ENTRY-DOC-01 | Source and license record | `docs/pawpal-source-audit.md`, `ASSET_LICENSE.md` | P0 | Source repo, tag, SHA, MIT license, PawPal asset risk, and M2A draft asset risk are documented. |
| ENTRY-DOC-02 | Feature specs | `specs/deskpet-phase1.md`, `specs/deskpet-m2a-assets.md` | P0 | Specs record entries, flows, failure paths, checks, verification evidence, and risks. |

## Existing Test Surface

| Surface | Real File / Command | Current Status | Notes |
| --- | --- | --- | --- |
| TypeScript compile check | `pnpm typecheck` | Existing command, passing | Proves type safety, not runtime behavior. |
| Production build and Windows package | `pnpm dist:win` | Existing command, passing | Produces `0.1.0-m2a` zip and portable artifacts. |
| M2A packaged smoke | `pnpm smoke:m2a` | Committed command, passing | Current automated runtime/package gate. |
| Shared M1 safety scan | `scripts/smoke-m1.mjs` inside `pnpm smoke:m2a` | Committed check, passing | Checks no forbidden monitoring/updater/elevation terms in source/config. |
| Dependency audit | `pnpm audit --json` | Existing command, passing | Advisory scan only; not a full supply-chain proof. |
| Source-control boundary check | `scripts/smoke-m1.mjs` M2A mode | Committed check, passing | Validates runtime WebPs are tracked/staged and draft/private paths are ignored. |
| Packaged image-load check | `scripts/smoke-m1.mjs` M2A mode | Committed check, passing | Uses CDP against packaged renderer for `idle`, `sitting`, `sleeping`, `focusGuard`, `breakPrompt`, and `hydrationPrompt`. |

## Product Gaps And Assumptions

| Gap ID | Gap / Assumption | Impact | Linked Cases |
| --- | --- | --- | --- |
| GAP-01 | No full desktop UI/E2E runner exists yet. | Tray, visual, drag, and DPI checks still need manual QA or future desktop automation. | TC-M1-005, TC-M1-013, TC-M2A-010 |
| GAP-02 | Tray icon click behavior cannot be fully proven through CDP alone. | Requires Windows desktop observation. | TC-M1-005 |
| GAP-03 | General mouse drag, multi-monitor, and DPI behavior are not fully covered by deterministic tests. | Pet may position poorly on some desktops. | TC-M1-013 |
| GAP-04 | PawPal bundled GIF redistribution rights are not fully proven. | Public distribution remains blocked until assets are replaced or cleared. | TC-M0-003 |
| GAP-05 | M2A `main_pixel_avatar` is an integration pack from the Rourou final spritesheet but is not public-release-cleared yet. Some DeskPet states use nearest source-row mappings. | Public release remains blocked until user approves likeness, nearest-row behavior, and source/provenance. | TC-M2A-009, TC-M2A-010 |
| GAP-06 | `dist/win-unpacked` staging includes Electron builder helper files and should not be the green distributable by itself. | Use zip/portable as distribution candidates; re-review before publishing unpacked directory. | TC-M1-012, TC-M2A-005 |
