# Project: Padukuhan Mobile Audit and Fixes

## Architecture
- React Native / Expo application located in `padukuhan-mobile`.
- Supabase hooks integration for data flow.
- Mock database fallbacks/mock data logic to allow offline/mock CRUD verification.

## Code Layout
- Root directory of mobile app: `d:\smart-village\padukuhan-mobile`
- Components: `padukuhan-mobile\components`
- Screens / Pages: `padukuhan-mobile\app`
- Hooks: `padukuhan-mobile\hooks`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Static Audit | Scan codebase for TS errors, menu grid configuration, direct letter logic, and mock database | None | DONE |
| 2 | Implementation of Fixes | Resolve TS errors, set menu grid to 6 buttons, configure 2 direct letter templates, mock database check | 1 | DONE |
| 3 | Functional Review & Audit | Verify correctness of changes with reviewers, challenger, and forensic auditor | 2 | IN_PROGRESS (addressing display mismatch via worker_2) |
| 4 | Mobile Audit Report | Generate the comprehensive `mobile_audit_report.md` in project root | 3 | PLANNED |

## Interface Contracts
- Direct Letter Template: Should support selection of exactly two template options ("Surat Pengantar RT" and "Surat Keterangan Domisili"). Output object should direct status to `'selesai'` and generate/include `nomor_surat`.
- Menu Grid: strictly 6 active buttons, corresponding screens must exist and render without crash.
