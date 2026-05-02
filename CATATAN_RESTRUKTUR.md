# Catatan Restruktur Workspace — Smart Village / Padukuhan Mandingan

**Tanggal:** 2 Mei 2026  
**Acuan:** `BLUEPRINT_SISTEM_PADUKUHAN.md`, `FITUR_SISTEM_PADUKUHAN.md`

---

## Ringkasan

Workspace diselaraskan dengan blueprint: dua aplikasi terpisah (`padukuhan-web`, `padukuhan-mobile`) tetap di root (sesuai opsi blueprint “2 repo”. Penamaan folder mengikuti konvensi blueprint (`stores`, grup `(auth)` / `(app)`, modul `kependudukan`, portal PWA `/warga`).

---

## padukuhan-web (Next.js)

### Yang berubah

| Item | Sebelum | Sesudah |
|------|---------|---------|
| Auth store | `src/store/authStore.ts` | `src/stores/authStore.ts` (+ interface `UserProfile`) |
| Login | `src/app/login/` | `src/app/(auth)/login/` — URL tetap `/login` |
| Surat (dashboard) | `src/app/surat/` (tanpa layout sidebar) | `src/app/(dashboard)/surat/` — ikut layout dashboard |
| Halaman modul | Sebagian belum ada di grup dashboard | Placeholder di `(dashboard)/`: `kependudukan`, `pkk`, `program`, `pengumuman`, `kegiatan`, `keamanan`, `masukan`, `pengaturan` |
| Portal warga (PWA) | Belum terstruktur | `src/app/warga/` — layout, beranda, submenu, `warga/rt/[nomor]` |
| Middleware publik | `/login`, `/auth` | Ditambah **`/warga`** agar portal warga tidak dipaksa login |

### Komponen baru

- `src/components/dashboard/ModulePlaceholder.tsx` — placeholder modul sampai implementasi penuh.

### Verifikasi

- `npm run build` — **sukses** (setelah penyesuaian tipe `UserProfile`).

---

## padukuhan-mobile (Expo)

### Yang berubah

| Item | Sebelum | Sesudah |
|------|---------|---------|
| Tab utama | `(tabs)/` | `(app)/` — sesuai grup “app utuh” di blueprint |
| Login | `app/login.tsx` | `app/(auth)/login.tsx` |
| Store auth | `store/useAuthStore.ts` | `stores/authStore.ts` (+ `UserProfile`) |
| Kependudukan | Tab `warga.tsx` + route `app/warga/*` | `(app)/kependudukan/` — stack: `index`, `[id]/index`, `[id]/edit`, `tambah` |
| Root layout | Stack `(tabs)` | Stack `(auth)` + `(app)` |
| Anchor unstable_settings | `'(tabs)'` | `'(app)'` |
| Redirect setelah login | `/(tabs)` | `/(app)` |

### Route navigasi (contoh)

- Daftar: `/kependudukan`
- Detail: `/kependudukan/[id]`
- Tambah: `/kependudukan/tambah`
- Edit (placeholder): `/kependudukan/[id]/edit`

### Pembersihan

- Folder `app/warga` dan `store/` dihapus setelah migrasi ke struktur baru.

### Verifikasi

- `npx tsc --noEmit` — **sukses**.

---

## Yang belum / berikutnya (urutan kerja logis)

1. **Web:** Mengisi halaman placeholder dengan query Supabase + TanStack Query sesuai pola blueprint.
2. **Web:** Memisahkan dengan jelas UI **dashboard dukuh/RT** vs **form PWA warga** untuk surat (alur Modul 3).
3. **Mobile:** Menambah route modul lain (`pkk`, `surat`, dll.) dan tab berbasis role (§8 blueprint).
4. **PWA:** `manifest.json`, `next-pwa`, ikon — checklist Fase 3 blueprint.
5. **Opsional monorepo:** `apps/web`, `apps/mobile`, `packages/shared` — hanya jika tim memutuskan menyatukan repo.

---

## File dokumen terkait di repo

- `BLUEPRINT_SISTEM_PADUKUHAN.md` — sumber kebenaran teknis.
- `FITUR_SISTEM_PADUKUHAN.md` — spesifikasi fitur.

---

## Handoff untuk developer AI (Gemini Flash, dll.) — melanjutkan pekerjaan

**Baca urutan ini sebelum mengubah kode:**

1. **`BLUEPRINT_SISTEM_PADUKUHAN.md` lengkap** — folder structure, konvensi TS, Supabase, auth store helper (`isDukuh`, `isKetuaRT`, `isKader`), TanStack Query keys, urutan prioritas web (§12), checklist §16.
2. **`FITUR_SISTEM_PADUKUHAN.md`** — batasan modul dan aturan bisnis (pengumuman sekat RT, masukan anonim, dll.).

### Posisi proyek (ringkas)

| Aspek | Status |
|--------|--------|
| **Checklist blueprint §16** | Fase 1 **fondasi: sebagian** (stack & routing sudah; belum semua butir checklist centang). |
| **Fase 2 modul** | **Belum** selesai; banyak halaman web masih `ModulePlaceholder`. |
| **Modul 1 (kependudukan)** | Mobile: daftar / detail / tambah + edit placeholder. Web: **placeholder** saja. |
| **Modul 2–9** | Sebagian besar **belum** diisi logika; surat di web ada kode awal, perlu diselaraskan peran dukuh/RT vs PWA. |

Jangan menganggap schema Supabase, RLS, atau migrasi SQLite sudah selesai kecuali tim sudah konfirmasi di environment masing-masing.

### Struktur folder root (jangan asingkan)

```
smart-village/
├── BLUEPRINT_SISTEM_PADUKUHAN.md
├── FITUR_SISTEM_PADUKUHAN.md
├── CATATAN_RESTRUKTUR.md          ← file ini
├── padukuhan-web/                 # Next.js — dashboard + PWA di bawah /warga
└── padukuhan-mobile/              # Expo — peran petugas/RT/kader
```

- **Web path alias:** `@/*` → `padukuhan-web/src/*`
- **Mobile path alias:** `@/*` → root `padukuhan-mobile/*`
- **Auth store web:** `padukuhan-web/src/stores/authStore.ts` — interface `UserProfile` sudah ada; perlu diselaraskan dengan field `user_profiles` Supabase sebenarnya.
- **Auth store mobile:** `padukuhan-mobile/stores/authStore.ts`

### Route penting (setelah restruktur)

| Platform | Jalur | Keterangan |
|----------|-------|------------|
| Web | `/login` | `(auth)/login` — tetap publik |
| Web | `/`, `/kependudukan`, … | `(dashboard)/*` — butuh sesi login |
| Web | `/warga`, `/warga/*` | Portal publik — **middleware tidak redirect ke login** |
| Mobile | `/(auth)/login` | URL `/login` |
| Mobile | `/(app)/*` | Area utama setelah login; kependudukan di `(app)/kependudukan/` |

### Konvensi yang harus dipertahankan (dari blueprint)

- **TypeScript** di mana-mana; hindari `any` untuk props/kontrak baru.
- **Server state** → TanStack Query; **global auth/UI ringan** → Zustand; **form** → React Hook Form + Zod.
- **Teks UI** bahasa Indonesia.
- **Middleware web:** jika menambah rute publik baru, update `padukuhan-web/src/lib/supabase/middleware.ts` agar tidak memaksa login (seperti pola `/warga`).

### Prioritas lanjutan (disarankan urut ini)

1. ~~Helper role di `authStore` (`isDukuh`, `isKetuaRT`, `isKader`)~~ — **sudah** (web + mobile). Berikutnya: **proteksi rute per halaman** dan **tab mobile berbasis role** (§8).
2. **Web:** modul sisanya — PKK, program, pengumuman, … (ganti placeholder); lanjutkan urutan §12 blueprint.
3. **Portal PWA:** implementasi form **`/warga/surat`** memakai `surat_pengajuan_publik` / alur tanpa login — terpisah dari dashboard `/surat` (RT/Dukuh).
4. **Mobile:** tambah folder route modul (`pkk`, `surat`, …) mengikuti pohon file blueprint §3.

### Pembersihan & penjajaran (sesi „codebase berantakan”)

**Target:** fondasi konsisten + **Modul 1** (kependudukan) dan **Modul 3** (surat, jalur dashboard) bisa dilanjutkan tanpa reset besar.

| Bagian | Perbaikan utama |
|--------|------------------|
| **Auth** | `types/auth.ts` (web + mobile); store dengan helper blueprint; **hydrasi Zustand** setelah refresh (`AuthStoreHydrator` di layout dashboard). |
| **Dashboard web** | Statistik dari Supabase (`useDashboardStats`), bukan angka statis; mutasi dibaca toleran jika RLS mutasi belum dibuka. |
| **Kependudukan web** | List + filter per RLS (`useWargasList`), halaman detail `/kependudukan/[id]`. |
| **Surat dashboard** | Daftar pengajuan per **Dukuh / Ketua RT** (bukan filter `warga_id` pribadi). **`/surat/baru`** = **Ketua RT** saja (selaras RLS INSERT); Dukuh hanya melihat/menindak dari daftar. |
| **Surat — enum DB** | `jenis_surat`: hanya `pengantar_rt` \| `domisili` (schema). |
| **Mobile** | Query RT memakai `nomor_rt`; profil bertipe `UserProfile`. |

**Setelah titik ini**, tim bisa mulai **modul baru dengan baseline bersih** untuk: PKK (2), Program (4), Pengumuman (5), … tanpa mengoreksi lagi pola auth/surat/dashboard dasar — kecuali revisi produk.

### Verifikasi cepat setelah mengubah kode

```bash
# Web (dari folder padukuhan-web)
npm run build

# Mobile (dari folder padukuhan-mobile)
npx tsc --noEmit
```

### Yang tidak perlu dilakukan tanpa permintaan eksplisit

- Mengubah menjadi monorepo `apps/` / `packages/` — opsional saja.
- Menghapus placeholder modul sebelum pengganti siap — lebih baik swap bertahap per route.

---

*Dokumen ini dibuat untuk kontinuitas pengembangan bila konteks chat atau developer berganti.*
