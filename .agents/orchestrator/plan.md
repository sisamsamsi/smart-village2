# Project Execution Plan

## Objectives
1. Perform static analysis and run diagnostics of padukuhan-mobile codebase.
2. Resolve TypeScript errors, adjust menu grid in `index.tsx` to 6 buttons, update direct letter templates in `surat/tambah.tsx` to 2 templates, and ensure mock database integration.
3. Conduct audit checks for CRUD flow, UI/UX consistency, and security.
4. Generate `mobile_audit_report.md` in the workspace root.

## Phase 1: Exploration
- Spawn `teamwork_preview_explorer` to analyze padukuhan-mobile.
- Run typecheck checks (`npx tsc --noEmit` or similar).
- Identify menu buttons in `index.tsx`.
- Identify direct letter issuance in `surat/tambah.tsx`.
- Identify mock database file(s) and hooks.

## Phase 2: Implementation
- Spawn `teamwork_preview_worker` to:
  - Fix all TypeScript errors.
  - Set menu grid to exactly 6 buttons.
  - Set templates to "Surat Pengantar RT" and "Surat Keterangan Domisili" (set status to 'selesai', include nomor_surat).
  - Verify mock data integration works.

## Phase 3: Review and Verification
- Spawn `teamwork_preview_reviewer` to review changes.
- Spawn `teamwork_preview_challenger` to verify runtime / mock state.
- Spawn `teamwork_preview_auditor` to perform forensic audit.

## Phase 4: Final Reporting
- Compile findings into `mobile_audit_report.md` in workspace root.
