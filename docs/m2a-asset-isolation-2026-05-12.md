# M2A Asset Isolation - 2026-05-12

## Purpose

This note records the asset isolation done before rebuilding M2A materials.

Goal: keep the current runnable M2A package stable while giving new asset work a separate inbox, so drafts, raw frames, notes, and rejected experiments do not pollute `pet_assets/main_pixel_avatar`.

## Current Runtime Directory

Keep this directory clean:

```text
pet_assets/main_pixel_avatar/
```

It should contain only the 13 runtime WebP files used by the app:

```text
idle.webp
sitting.webp
happy.webp
breakPrompt.webp
breakRunning.webp
breakDone.webp
hydrationPrompt.webp
drinking.webp
hydrationDone.webp
focusGuard.webp
focusDone.webp
sad.webp
sleeping.webp
```

Do not put raw source images, draft manifests, notes, contact sheets, temporary GIFs, or rejected candidates in this directory.

## Frozen Current Assets

The current runtime files were copied to:

```text
output/asset_quarantine/m2a-current-2026-05-12/runtime-freeze/
```

The local draft/source files that used to live under `pet_assets/main_pixel_avatar` were moved to:

```text
output/asset_quarantine/m2a-current-2026-05-12/legacy-local-files/main_pixel_avatar/
```

The manifest with byte sizes and SHA-256 hashes is:

```text
output/asset_quarantine/m2a-current-2026-05-12/manifest.json
```

`output/` is ignored by Git, so this is a local quarantine/workbench snapshot, not a release artifact.

## New Asset Workspace

Put new material work here first:

```text
_raw_assets/m2a-next/
```

Suggested folders:

```text
_raw_assets/m2a-next/inbox/              # raw incoming source files
_raw_assets/m2a-next/working/            # intermediate edits and experiments
_raw_assets/m2a-next/exports-candidate/  # candidate 13-state runtime WebP export
_raw_assets/m2a-next/rejected/           # failed or superseded attempts
```

`_raw_assets/` is ignored by Git. When a new pack is approved, copy only the final 13 runtime WebP files into `pet_assets/main_pixel_avatar/`, then run the normal gates.

## Replacement Gate

After replacing runtime files, run:

```text
pnpm typecheck
node --check scripts\smoke-m1.mjs
pnpm dist:win
pnpm smoke:m2a
```

Then update:

```text
docs/asset-guide.md
specs/deskpet-m2a-assets.md
docs/manual-qa-m2a-2026-05-10.md
```

Keep public-release wording blocked until asset source, likeness, SmartScreen/AV, and manual visual QA are closed.
