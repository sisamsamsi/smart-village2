# Original User Request

## Initial Request — 2026-06-24T06:32:25Z

Perform a comprehensive code review, manual testing, CRUD verification, UI/UX evaluation, and basic security audit on the mobile application to prepare for subsequent authentication and RLS integration.

Working directory: d:/smart-village/padukuhan-mobile
Integrity mode: development

## Requirements

### R1. CRUD & Data Flow Functional Audit
- Perform a thorough static review of the data flow and CRUD operations (Kependudukan, PKK & Dasawisma, Mutasi, Surat, Program Pembangunan).
- Verify the integration of hooks (`useSurat`, `useKependudukan`, `usePkkData`, etc.) and Supabase calls to ensure data matches parameters.
- Identify and document any broken query parameters or state logic.

### R2. UI/UX & Visual Structure Evaluation
- Check the layout consistency, form inputs, validation feedback (e.g. error alerts on invalid data), and responsiveness of all active components.
- Confirm that role-based items (such as the quick action cards in `QuickActionModal`) display only the appropriate actions for Dukuh, RT, and Kader.
- Confirm the complete removal of the legacy "Laporan Kejadian" (`aktivitas`) tab and "Lainnya" menu.

### R3. Basic Security Check (Excluding RLS)
- Verify inputs for sanitization or boundary issues.
- Check state management for memory/data leaks or insecure client-side profile caching.
- Evaluate the usage of secure storage or asynchronous storage for sensitive state.

## Acceptance Criteria

### Verification and Compliance
- [ ] No TypeScript type errors or syntax issues remain in the entire codebase (`npx tsc --noEmit` must pass cleanly).
- [ ] Direct letter issuance (`surat/tambah.tsx`) only allows two templates ("Surat Pengantar RT" and "Surat Keterangan Domisili") and successfully includes the `nomor_surat` and sets status directly to `'selesai'`.
- [ ] Menu grid in `index.tsx` is strictly composed of exactly 6 active, valid buttons.
- [ ] Verified mock data flow and mock database integration works correctly for CRUD items without runtime crashes.

### Test & Audit Deliverable
- [ ] Create a detailed report `mobile_audit_report.md` in the workspace root summarizing findings, list of resolved/identified bugs, UI/UX recommendations, and a security evaluation.
