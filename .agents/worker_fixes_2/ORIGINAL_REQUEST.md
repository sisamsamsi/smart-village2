## 2026-06-24T06:47:56Z
You are worker_fixes_2.
Your working directory is d:\smart-village\.agents\worker_fixes_2.

Objective: Fix a mismatched field bug in the resident details screen (padukuhan-mobile/app/(app)/kependudukan/[id]/index.tsx).

Tasks:
1. Open `padukuhan-mobile/app/(app)/kependudukan/[id]/index.tsx`.
2. Locate line 146 and line 199 where relationship status is read. Currently, it accesses `warga.hubungan_keluarga` which does not match the database column name (`status_dalam_keluarga`).
3. Replace them with reading from `warga.status_dalam_keluarga`. Format it cleanly to display as "Kepala Keluarga", "Istri", "Anak", "Orang Tua", "Mertua", "Lainnya", or "Anggota Keluarga" instead of lowercase/underscores. You can define a helper like:
   ```typescript
   const formatHubungan = (val: string | null | undefined) => {
     if (!val) return 'Anggota Keluarga';
     const clean = val.toUpperCase().replace(/_/g, ' ');
     if (clean === 'ISTRI') return 'Istri';
     if (clean === 'ANAK') return 'Anak';
     if (clean === 'KEPALA KELUARGA') return 'Kepala Keluarga';
     if (clean === 'MERTUA') return 'Mertua';
     if (clean === 'ORANG TUA') return 'Orang Tua';
     if (clean === 'LAINNYA') return 'Lainnya';
     return clean.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
   };
   ```
   Apply this helper for displaying relationship status on line 146 and line 199.
4. Run `npm run typecheck` or `npx tsc --noEmit` to verify type checking passes cleanly.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output: Write your handoff report to `d:\smart-village\.agents\worker_fixes_2\handoff.md` with verified compilation checks.
