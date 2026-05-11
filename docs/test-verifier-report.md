# DeskPet M0/M1/M2A Test Verifier Report

Verdict: 不通过

Real gate result: fail

Scenario coverage score: 89 / 100

Review date: 2026-05-11

Scope reviewed:

- `specs/project-test-inventory.md`
- `specs/test-cases.md`
- `docs/test-coverage-map.md`
- `docs/test-risk-log.md`
- `docs/test-verifier-report.md`
- `docs/manual-qa-m2a-2026-05-10.md`
- `.gstack/qa-reports/qa-report-deskpet-m2a-2026-05-11.md`
- `.gstack/qa-reports/baseline.json`
- `scripts/smoke-m1.mjs`
- `scripts/smoke-m2a.ps1`
- `package.json`

This report is a `$test-case-system` verifier final gate. It checks the test-case system schema and traceability, not only whether the current app smoke test passes.

## Real Gate Result

The product-level M2A runtime/package smoke path is currently healthy, but the test-case system final gate fails because the required deliverables do not yet follow the `$test-case-system` schema.

| Gate | Result | Evidence |
| --- | --- | --- |
| Required deliverables exist. | Pass | All five required files exist: `specs/project-test-inventory.md`, `specs/test-cases.md`, `docs/test-coverage-map.md`, `docs/test-risk-log.md`, and this verifier report. |
| Inventory uses required source schema. | Fail | `specs/project-test-inventory.md` uses `ID / Source / Requirement` and `Entry ID / Entry / Source / Priority / Observed Evidence`; required columns are `source_id`, `source_type`, `path_or_route`, `entry_name`, `actor_or_role`, `data_written_or_read`, `expected_output`, `current_test_refs`, and `risk_notes`. |
| Test cases use required case schema. | Fail | `specs/test-cases.md` uses the old columns and lacks required `source_id`, `automation_ref`, `last_run_status`, `gate_result`, `evidence_ref`, `linked_risk_ids`, and `assumptions_or_product_gaps` fields. |
| Automation status values are valid. | Fail | `specs/test-cases.md` uses `automated`, `manual`, `not suitable`, and `future automation`; required values are `existing-automated`, `unverified-existing-test`, `automation-candidate`, `manual-only`, `not-covered`, and `blocked-by-product-decision`. |
| P0/P1 cases have real gate results. | Fail | Current case rows do not have `last_run_status` or `gate_result`, so P0/P1 cases cannot formally satisfy the verifier gate even when corresponding smoke evidence exists elsewhere. |
| Risk log uses required risk schema. | Fail | `docs/test-risk-log.md` uses `Risk ID / Priority / Risk / Impact / Linked Cases / Current Mitigation / Status`; required columns are `risk_id`, `severity`, `source_id`, `failure_mode`, `user_or_business_impact`, `linked_case_ids`, `mitigation_or_non_coverage_reason`, and `owner_decision_needed`. |
| Coverage map includes required sections. | Fail | `docs/test-coverage-map.md` has useful requirement and entry coverage, but lacks the required source-to-case matrix by `source_id`, P0/P1 gate summary, raw coverage note, and explicit false-pass scan summary sections. |
| Latest run evidence is current. | Partial | 2026-05-11 `/gstack-qa` evidence is current: portable `100979679` bytes, zip `151082429` bytes, unpacked exe `210890752` bytes, and `pnpm smoke:m2a` passed. Older report evidence used portable `100979678` bytes. |
| P0 product behavior has supporting smoke evidence. | Pass | `pnpm smoke:m2a` passed on 2026-05-11 and checked safety scan, M2A asset boundary, package allowlist, zip audit, renderer image loads, settings update, restart persistence, and process cleanup. |
| False-pass scan completed. | Partial | Searched for `expect(true)`, `|| true`, `count >= 0`, conditional skip patterns, and test skip markers in `scripts`, `src`, `specs`, `docs`, and `.gstack/qa-reports`. No obvious test false-pass assertion was found; normal application guard clauses such as `if (!session) return` were observed and not counted as test false-pass patterns. |

## Scenario Coverage Score

Score: 89 / 100.

Scoring rationale:

- Start: 100.
- `-4`: test-case matrix lacks required gate fields for P0/P1 cases.
- `-3`: automation status vocabulary does not match the required schema, so automated closure cannot be machine-verified.
- `-2`: inventory and risk log lack required `source_id` linkage fields.
- `-1`: coverage map does not have the required false-pass scan and raw coverage sections.
- `-1`: verifier evidence had to be refreshed because 2026-05-10 artifact sizes were stale after the 2026-05-11 package rebuild.

The score is below the required 95 threshold, so the `$test-case-system` final gate fails.

This score is not the same as the `/gstack-qa` product health score. The 2026-05-11 product QA report recorded internal M2A QA health as `94/100`, while this verifier score measures traceability and formal gate readiness.

## Latest Command Evidence

Fresh evidence from 2026-05-11:

- `pnpm typecheck`: passed.
- `node --check scripts\smoke-m1.mjs`: passed.
- `git diff --check`: passed with LF-to-CRLF warnings only.
- `pnpm dist:win`: exceeded the 184s command wrapper while `7za.exe` was still writing the zip; after builder idle, artifacts were present and non-empty.
- `pnpm smoke:m2a`: passed.
- CDP screenshot QA: passed; screenshots captured `idle`, `focusGuard`, `breakPrompt`, and `hydrationPrompt`; no `Runtime.exceptionThrown` or `Log.entryAdded` events were captured.

Current artifact evidence:

| Artifact | Size |
| --- | ---: |
| `dist\DeskPet 0.1.0-m2a.exe` | 100979679 bytes |
| `dist\DeskPet-0.1.0-m2a-win.zip` | 151082429 bytes |
| `dist\win-unpacked\DeskPet.exe` | 210890752 bytes |

Screenshot evidence:

- `.gstack\qa-reports\screenshots\m2a-idle.png`
- `.gstack\qa-reports\screenshots\m2a-focusGuard.png`
- `.gstack\qa-reports\screenshots\m2a-breakPrompt.png`
- `.gstack\qa-reports\screenshots\m2a-hydrationPrompt.png`

## Raw Code Coverage

No raw line/branch/function coverage report is available for this Electron project in the current workflow.

Raw coverage is supporting evidence only. It cannot override the failed real gate above.

## P0 Gaps

| Gap | Why It Blocks The Test-System Gate | Repair |
| --- | --- | --- |
| Required source IDs are missing. | The inventory uses `REQ-*` and `ENTRY-*`, but the schema requires `SRC-*` source rows with product/code entry fields. | Convert `specs/project-test-inventory.md` to the required `source_id` table, or add a schema-compliant source table while preserving existing requirement notes. |
| P0 cases lack formal gate fields. | Existing P0 rows have useful evidence, but no `last_run_status`, `gate_result`, `evidence_ref`, or `linked_risk_ids`. | Convert `specs/test-cases.md` to the required columns and set every P0 row to `pass`, `fail`, `blocked`, or `not-run` based on real evidence. |
| Existing automated cases are not marked with allowed statuses. | `automated` is not an allowed `$test-case-system` status, so automated P0 closure cannot be accepted. | Replace valid automated rows with `existing-automated` and add `automation_ref` in the required `file :: checkpoint/title` format plus `last_run_status`. |
| Risk rows lack `source_id`. | P0 risk-to-source traceability cannot be proven from the required schema. | Convert `docs/test-risk-log.md` to include `source_id`, `failure_mode`, and `owner_decision_needed`. |
| RISK-015 remains open. | `docs/test-risk-log.md` now records the schema/gate-field mismatch as an open test-system blocker. | Close it only after the required deliverables are converted and this final gate passes. |

## P1 Gaps

These are already known and mostly product/manual QA gaps, not new app failures:

| Gap | Linked Existing Cases / Risks | Current Status |
| --- | --- | --- |
| Tray menu behavior needs human Windows tray observation. | TC-M1-005, RISK-007 | Manual-only. |
| Settings-window repeated-open behavior has fresh manual evidence. | TC-M1-005, TC-M1-008, TC-M2A-003, RISK-014, manual QA ID 03 | Code mitigation exists; 2026-05-12 manual QA ID 03 passed. Keep broad tray menu observation separate under RISK-007. |
| General mouse drag, multi-monitor, and DPI are not fully deterministic. | TC-M1-013, RISK-008 | Manual-only except bottom-edge sitting smoke path. |
| Rourou nearest-row visual quality needs human judgment. | TC-M2A-009, RISK-010 | Manual-only. |
| SmartScreen/AV behavior is environment-specific. | TC-M2A-010, RISK-011 | Manual-only. |

## False Coverage / False-Pass Risks

- The current documents call many cases `automated`, but the schema cannot verify them until each row has `existing-automated`, `automation_ref`, `last_run_status`, `gate_result`, and `evidence_ref`.
- The old `Coverage score: 98 / 100` in `docs/test-coverage-map.md` is useful as a narrative score, but it cannot pass the final gate until the schema and gate fields are repaired.
- Documentation/audit cases such as source license, asset provenance, and feature spec review should stay audit gates, not be converted into fake runtime automation.
- M2A renderer image-load checks are representative; visual likeness and nearest-row semantic fit remain manual-only and must not be counted as automated closure.
- `pnpm dist:win` can outlive a 180s wrapper on this machine; a wrapper timeout alone must not be treated as product failure if builder child processes are still writing artifacts and later pass smoke.

## Cases To Add Or Repair

Repair existing deliverables before claiming the full test-case system is complete:

1. Convert `specs/project-test-inventory.md` to the required `source_id` schema.
2. Convert `specs/test-cases.md` to the required case schema.
3. Convert `docs/test-risk-log.md` to the required risk schema.
4. Add required sections to `docs/test-coverage-map.md`: source-to-case matrix, P0/P1 gate summary, raw coverage note, and false-pass scan summary.
5. Re-run final gate after conversion and keep 2026-05-11 artifact sizes as the current evidence unless a newer build is produced.

Suggested automation candidates after schema repair:

- Native settings-window repeated-open check from tray and pet menu, if a reliable Electron/Windows harness is selected.
- Asset protocol traversal integration test.
- Visual screenshot regression after Rourou state mappings are approved.

## Manual-Only Checks

- Windows tray menu interaction.
- General drag behavior across multi-monitor and DPI setups.
- Rourou likeness, visual quality, transparency edges, anchor stability, bubble overlap, and nearest-row state fit.
- SmartScreen/antivirus behavior for unsigned portable/zip artifacts.

## Automation Phase Decision

The project should not enter a formal automation-closure phase as “test system complete” yet.

It can continue internal M2A validation because the current `pnpm smoke:m2a` and `/gstack-qa` evidence are healthy. The next testing-system step should be schema repair and final gate rerun, not more coverage-driven automation.
