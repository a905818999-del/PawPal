# Asset Licensing

PawPal separates source code licensing from pet animation asset licensing.

DeskPet M0/M1 imported PawPal assets only as validation placeholders. These assets are not treated as DeskPet's final product identity.

## Source Code

The application source code is licensed under the MIT License. See `LICENSE`.

## Bundled Runtime Assets

Files under `pet_assets/` are bundled runtime assets used by the app's built-in pet appearances.

These assets are not automatically covered by the MIT License unless a specific asset source explicitly grants MIT-compatible rights. Before redistributing, remixing, or using a pet asset outside this project, verify the original asset source and license.

Current built-in appearances:

- Imported PawPal golden-puppy asset folder.
- Imported PawPal line-dog asset folder.
- `pet_assets/main_pixel_avatar/` M2A Rourou `rourou_from_1_restore` runtime animated WebP exports only.

The M2A `main_pixel_avatar` pack is committed only as a runtime integration pack generated from `output/hatch_pet_runs/rourou_from_1_restore/final/spritesheet.webp`, with later tuned runtime exports such as `output/animation_preview/idle_blink_tuned_2026-05-12/`, `output/animation_preview/sitting_tuned_2026-05-12/`, `output/animation_preview/generated_states_size_locked_2026-05-12/`, and `output/animation_preview/eating_noodle_stir_2026-05-13/`. It must not be represented as public-release-cleared until the final source/provenance decision is recorded. Some DeskPet states still use nearest-row mappings from the source spritesheet, so visual approval remains required.

## Raw Working Assets

Raw source materials live under `_raw_assets/` locally and are intentionally excluded from git.

The raw asset folder may contain generated experiments, upstream packs, original videos, intermediate exports, or other large files. Do not commit `_raw_assets/` to the public repository.

## Contributing Assets

When contributing a new pet appearance or replacing animated assets, include clear source and license information in the pull request. Prefer assets that can be redistributed with the project, and avoid adding files whose rights are unclear.

For M2A, do not commit or package raw generations, contact sheets, prompt logs, private reference material, `manifest.draft.json`, `asset-notes.md`, paired companion drafts, scenes, or `focusAlert`.
