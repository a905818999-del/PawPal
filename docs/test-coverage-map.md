# DeskPet M0/M1/M2A Test Coverage Map

Coverage scope: M0 Base Validation, M1 Safety-Clean App Shell, and M2A one-pack main avatar asset integration.

## Requirement Coverage

| Requirement | Priority | Covered By | Coverage Status | Evidence |
| --- | --- | --- | --- | --- |
| REQ-M0-01 PawPal source must match `v0.1.3` / `7cb44da708f2488d9587140554c486173145907a`. | P0 | TC-M0-001 | Covered | `docs/pawpal-source-audit.md`. |
| REQ-M0-02 MIT source license and asset license risk must be recorded. | P0 | TC-M0-002, TC-M0-003 | Covered | `LICENSE`, `ASSET_LICENSE.md`, `docs/pawpal-source-audit.md`, `docs/asset-guide.md`. |
| REQ-M0-03 Dependencies and install scripts must be audited. | P0 | TC-M0-004, TC-M0-005 | Covered | `pnpm install --frozen-lockfile`, `pnpm audit --json`, `docs/dependency-audit.md`. |
| REQ-M1-01 Automatic focus/distraction detection must stay removed or hard-disabled. | P0 | TC-M1-001, TC-M1-003 | Covered | `pnpm smoke:m2a` safety scan and snapshot/settings key checks. |
| REQ-M1-02 Manual focus must run only as a timer. | P0 | TC-M1-002, TC-M1-003 | Covered | `pnpm smoke:m2a` confirms `focusGuard`, numeric `focusEndsAt`, and no monitoring fields. |
| REQ-M1-03 Transparent always-on-top pet window must launch on Windows. | P0 | TC-M1-004 | Covered | `pnpm smoke:m2a` observes `DeskPet 220x340 TopMost=True`. |
| REQ-M1-04 Tray menu must be available. | P0 | TC-M1-005 | Covered with manual requirement | Source path exists in `createTray`; full notification-area interaction remains manual-only. |
| REQ-M1-05 Rest, meal, and hydration reminders must remain usable. | P0 | TC-M1-006, TC-M1-007 | Covered | `pnpm smoke:m2a` confirms break, meal, and hydration states plus snooze/confirm return paths. |
| REQ-M1-06 Windows package must prefer portable/zip; NSIS secondary only. | P0 | TC-M1-011, TC-M1-012 | Covered | `package.json` defaults to portable/zip; `pnpm smoke:m2a` checks artifacts, NSIS config, and `elevate.exe` absence. |
| REQ-M1-07 No default auto-start/update/elevation/hidden service/telemetry/input/screenshot/OCR/foreground monitoring path. | P0 | TC-M1-001, TC-M1-012, TC-M1-017 | Covered | Safety scan, dependency audit, NSIS checks, and mac entitlement review. |
| REQ-M1-08 Feature specs must record flows, failures, verification, and risk. | P0 | TC-M1-016, TC-M2A-008 | Covered | `specs/deskpet-phase1.md`, `specs/deskpet-m2a-assets.md`. |
| REQ-M2A-01 `mainPixelAvatar` selectable appearance with all runtime states mapped. | P0 | TC-M2A-001, TC-M2A-003 | Covered | `src/shared/types.ts`, `src/shared/petAppearances.ts`, `pnpm smoke:m2a`. |
| REQ-M2A-02 Approved runtime files tracked/staged; draft/private files ignored. | P0 | TC-M2A-002 | Covered | `pnpm smoke:m2a` source-control asset boundary check; staged 15 runtime WebPs. |
| REQ-M2A-03 Package includes approved M2A runtime files and excludes rejected files. | P0 | TC-M1-014, TC-M2A-005 | Covered | `pnpm smoke:m2a` resource allowlist checks. |
| REQ-M2A-04 Packaged renderer loads representative M2A images and persists setting. | P0 | TC-M2A-004, TC-M2A-006 | Covered | `pnpm smoke:m2a` CDP image-load and restart persistence checks. |
| REQ-M2A-05 Runtime asset status/license/provenance risk documented. | P0 | TC-M0-003, TC-M2A-007, TC-M2A-008 | Covered | `ASSET_LICENSE.md`, `docs/asset-guide.md`, `specs/deskpet-m2a-assets.md` record the Rourou spritesheet source, nearest-row mapping caveat, WebP rebuild, and runtime edge/blink cleanup. |

## Entry Coverage

| Entry ID | Case IDs | Status |
| --- | --- | --- |
| ENTRY-CLI-01 | TC-M0-004 | Covered |
| ENTRY-CLI-02 | TC-M0-005 | Covered |
| ENTRY-CLI-03 | TC-M1-011 | Covered by `pnpm dist:win` and `pnpm smoke:m2a` |
| ENTRY-CLI-04 | TC-M1-001, TC-M2A-002, TC-M2A-005, TC-M2A-006 | Covered by `pnpm smoke:m2a` |
| ENTRY-CLI-05 | TC-M1-001 | Covered by `pnpm smoke:m2a` |
| ENTRY-WIN-01 | TC-M1-002, TC-M1-004, TC-M1-006, TC-M1-007, TC-M2A-006 | Covered by `pnpm smoke:m2a` |
| ENTRY-UI-01 | TC-M1-013 | Manual-only |
| ENTRY-UI-02 | TC-M1-008, TC-M2A-003, TC-M2A-004, manual QA ID 03 | Covered by source mapping and `pnpm smoke:m2a` persistence; repeated settings-window recall passed manual QA on 2026-05-12 |
| ENTRY-STATE-01 | TC-M1-006, TC-M2A-006 | Covered by `pnpm smoke:m2a` |
| ENTRY-STATE-02 | TC-M1-007, TC-M2A-006 | Covered by `pnpm smoke:m2a` |
| ENTRY-STATE-02A | TC-M1-007, TC-M2A-006 | Covered by `pnpm smoke:m2a` |
| ENTRY-STATE-03 | TC-M1-002, TC-M2A-006 | Covered by `pnpm smoke:m2a` |
| ENTRY-STATE-04 | TC-M1-008, TC-M2A-004 | Covered by `pnpm smoke:m2a` |
| ENTRY-STATE-05 | TC-M2A-011 | Covered by `pnpm smoke:m2a` |
| ENTRY-STATE-06 | TC-M2A-011 | Covered by `pnpm smoke:m2a` |
| ENTRY-ASSET-01 | TC-M2A-001 | Covered |
| ENTRY-ASSET-02 | TC-M2A-002 | Covered |
| ENTRY-ASSET-03 | TC-M2A-002, TC-M2A-005 | Covered |
| ENTRY-PKG-01 | TC-M1-011 | Covered |
| ENTRY-PKG-02 | TC-M1-011 | Covered |
| ENTRY-PKG-03 | TC-M2A-005 | Covered |
| ENTRY-DOC-01 | TC-M0-001, TC-M0-002, TC-M0-003, TC-M2A-007 | Covered |
| ENTRY-DOC-02 | TC-M1-016, TC-M2A-008 | Covered |

## Coverage Score

2026-05-11 `$test-case-system` verifier note: the score below is the legacy scenario narrative score for the current M2A scope. It is not a passing formal final gate result until `specs/project-test-inventory.md`, `specs/test-cases.md`, `docs/test-risk-log.md`, and this coverage map are converted to the required `$test-case-system` schema. See `docs/test-verifier-report.md`.

Scoring method:

- P0 requirement covered: 82 points possible, 82 earned.
- P1 important edge/manual-risk coverage: 18 points possible, 16 earned.
- Deducted 2 points for manual-only tray, general drag/multi-monitor/DPI, Rourou nearest-row visual approval, and SmartScreen/AV checks.

Coverage score: 98 / 100.

Automated cases marked in `specs/test-cases.md` include a real test file and a named checkpoint/assertion title. Manual, future-automation, and audit-only cases are not counted as automated closure.

The project can continue M2A development and internal validation. It should not claim full release readiness until manual visual/likeness QA, nearest-row state approval, and environment-specific SmartScreen/AV checks are complete.
