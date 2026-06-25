## 2026-06-24T06:39:59Z
You are worker_fixes_1.
Your working directory is d:\smart-village\.agents\worker_fixes_1.

Objective: Implement fixes in padukuhan-mobile codebase to solve all compile/runtime bugs, satisfy user requirements, and ensure clean type checking.

Tasks:
1. Double-select crash in `padukuhan-mobile/app/(app)/(tabs)/explore.tsx`:
   Modify the query building. Do not chain `.select()` twice on `wargaQuery`. Build the initial select dynamically or conditionally:
   ```typescript
   let selectFields = 'id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui, rt_id';
   if (role === 'kader_dasawisma' && dasawismaId) {
     selectFields = 'id, tanggal_lahir, jenis_kelamin, status_perkawinan, status_kehamilan, status_menyusui, rumah_tanggas!inner(dasawisma_id)';
   }
   let wargaQuery = supabase
     .from('wargas')
     .select(selectFields)
     .eq('status_warga', 'aktif');
   if (role === 'kader_dasawisma' && dasawismaId) {
     wargaQuery = wargaQuery.eq('rumah_tanggas.dasawisma_id', dasawismaId);
   } else if (role === 'ketua_rt' && rtId) {
     wargaQuery = wargaQuery.eq('rt_id', rtId);
   }
   ```
2. Unchecked null array map in `padukuhan-mobile/hooks/usePkkData.ts`:
   In `useDasawismaList()`, check if `data` is null before mapping: `return (data || []).map(...)` or `if (!data) return [];`.
3. Type comparison warning in `padukuhan-mobile/app/(app)/pkk/[id].tsx`:
   Extract search param `id` safely, e.g., `const idStr = Array.isArray(id) ? id[0] : id;`, and compare `d.id === idStr`. Use `idStr` when passing parameters to hooks.
4. Normalization of status and relationship in `padukuhan-mobile/hooks/useKependudukan.ts`:
   In `useTambahWarga` and `useUpdateWarga`, normalize `status_kawin` and `hubungan_keluarga`/`status_dalam_keluarga` fields into lowercase with underscores (e.g. 'belum_kawin', 'istri', 'anak') before sending them to the Supabase client inserts and updates. For example:
   - status: map BELUM KAWIN -> belum_kawin, KAWIN -> kawin, CERAI HIDUP -> cerai_hidup, CERAI MATI -> cerai_mati.
   - hubungan: map KEPALA KELUARGA -> kepala_keluarga, ISTERI -> istri, ANAK -> anak, MERTUA -> mertua, ORANG TUA -> orang_tua, LAINNYA -> lainnya.
5. In `padukuhan-mobile/app/(app)/kependudukan/[id]/edit.tsx`:
   Ensure the form initializes correctly. Since database returns `status_perkawinan` (which could be lowercase like 'belum_kawin'), map it back to uppercase spaces, e.g.:
   `status_kawin: warga.status_perkawinan?.toUpperCase().replace('_', ' ') || 'BELUM KAWIN'`
6. In `padukuhan-mobile/app/(app)/kependudukan/[id]/index.tsx`:
   Render `warga.pendidikan` instead of `warga.pendidikan_terakhir` on line 213.
7. Unused import in `padukuhan-mobile/app/(app)/surat/tambah.tsx`:
   Remove the unused `useSuratTemplates` import on line 4.
8. Menu grid in `padukuhan-mobile/app/(app)/(tabs)/index.tsx`:
   Remove `disabled={isKader}` from the Mutasi, Surat, and Program buttons to ensure all 6 buttons in the Menu Cepat grid are fully active and clickable.
9. Verification:
   Run typecheck: `npm run typecheck` or `npx tsc --noEmit` inside `padukuhan-mobile` using `run_command` tool.
   Verify it compile successfully with zero errors.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output: Write your detailed handoff report to `d:\smart-village\.agents\worker_fixes_1\handoff.md` with verified `tsc` compiler command output.
