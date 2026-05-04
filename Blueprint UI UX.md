# PROMPT: Redesign Total UI/UX Platform Web — Smart Village (Padukuhan)

## Instruksi Redesign

Lakukan perombakan total UI/UX untuk platform web pada proyek Smart Village (Padukuhan) dengan mengikuti **seluruh** pedoman berikut secara ketat. Setiap keputusan visual harus bisa dipertanggungjawabkan berdasarkan prinsip-prinsip yang disebutkan di bawah.

---

## 1. Prinsip Dasar: KISS (Keep It Sort and Simple)

- Setiap elemen UI yang ditampilkan **harus memiliki fungsi yang jelas**. Jika tidak punya fungsi → hapus.
- Hindari dekorasi yang tidak perlu: shadow berlebihan, gradient tanpa tujuan, border ganda, ornamen visual kosmetik.
- Navigasi harus **flat dan intuitif** — maksimal 2 level kedalaman. Pengguna harus bisa mencapai halaman manapun dalam ≤3 klik.
- Gunakan **whitespace secara strategis** sebagai elemen desain utama, bukan dekorasi. Whitespace yang cukup membuat konten terasa "bernapas".
- Setiap halaman memiliki **satu fokus utama** (single primary action). Jangan memaksa pengguna memproses terlalu banyak informasi sekaligus.
- Ikon hanya digunakan jika memperjelas konteks, bukan sebagai pengganti teks. Jika ikon tidak langsung dimengerti tanpa label → tambahkan label atau ganti dengan teks.
- State kosong (empty state), loading state, dan error state harus didesain — bukan hanya halaman normal.

---

## 2. Sistem Warna: Aturan 60:30:10

Terapkan komposisi warna dengan rasio ketat:

### 60% — Warna Dominan (Putih Bersih)

```
Primary White:    #FFFFFF  (background utama)
Off-White:        #F8F9FA  (background sekunder/alternatif section)
Light Gray:       #F1F3F5  (background card, input field, subtle divider)
```

- Digunakan pada: background halaman, area konten utama, card background, modal background.
- Memberikan kesan bersih, lega, dan profesional.

### 30% — Warna Sekunder (Biru)

```
Blue 700:         #1971C2  (primary action: tombol utama, link aktif, header navigasi)
Blue 600:         #1C7ED6  (hover state tombol, active tab indicator)
Blue 500:         #339AF0  (secondary action, selected state)
Blue 100:         #D0EBFF  (background badge, subtle highlight, tag background)
Blue 50:          #E7F5FF  (hover row table, info banner background)
```

- Digunakan pada: sidebar/navbar background atau aksen, tombol primary, link, active state, progress indicator, selected tab, tabel header.
- **Biru harus terasa tegas namun tidak mendominasi.** Jangan membuat seluruh header atau sidebar full-blue — gunakan sebagai aksen struktural.

### 10% — Warna Aksen (Hijau)

```
Green 700:        #2F9E44  (success state, CTA sekunder, konfirmasi)
Green 600:        #37B24D  (hover success button)
Green 100:        #D3F9D8  (success badge background, notifikasi sukses)
Green 50:         #EBFBEE  (subtle success highlight)
```

- Digunakan pada: indikator sukses, badge status aktif, tombol konfirmasi/submit, notifikasi berhasil, indikator data positif.
- **Gunakan secara sangat selektif** — hijau hanya muncul saat ada konteks "positif" atau "berhasil".

### Warna Pendukung (Netral & Semantik)

```
Text Primary:     #212529  (heading, body text utama)
Text Secondary:   #495057  (subtitle, deskripsi, helper text)
Text Tertiary:    #868E96  (placeholder, caption, disabled text)
Border:           #DEE2E6  (border card, divider, input border)
Border Light:     #E9ECEF  (subtle separator)
Disabled:         #ADB5BD  (disabled button, inactive element)

— Semantik —
Error:            #E03131  (validasi gagal, error message)
Error Light:      #FFF5F5  (error banner background)
Warning:          #F08C00  (peringatan)
Warning Light:    #FFF9DB  (warning banner background)
```

### Implementasi di `constants/theme.ts`

Ganti seluruh objek `Colors` dengan palet baru di atas. Tambahkan key baru untuk setiap variasi warna agar komponen bisa mengaksesnya secara konsisten melalui `useThemeColor`.

---

## 3. Tipografi: Font Pairing Profesional, Simple, Minimalis

### Pilihan Font Pairing

**Heading: Inter**

- Mengapa: Dirancang khusus untuk UI, memiliki x-height tinggi sehingga sangat terbaca di layar, tersedia banyak weight, dan terkenal clean.
- Alternatif jika Inter tidak tersedia: `"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

**Body: Inter**

- Gunakan font yang sama (Inter) untuk body agar konsistensi terjaga — bedakan hanya melalui weight dan size.
- Ini adalah pendekatan **single-family pairing** yang sangat umum di desain modern (mirip approach Apple, Vercel, Linear).

**Monospace (untuk kode/data teknis): JetBrains Mono**

- Alternatif: `"JetBrains Mono", "SF Mono", "Fira Code", "Cascadia Code", monospace`

### Skala Tipografi (Desktop Web)

Gunakan skala modular berbasis **golden ratio yang dimoderasi** (rasio ~1.25 / Major Third) agar tidak terlalu ekstrem:

```
Display / Hero:         28px  / font-weight: 600  / line-height: 1.2  / letter-spacing: -0.02em
Page Title (H1):        24px  / font-weight: 600  / line-height: 1.3  / letter-spacing: -0.015em
Section Title (H2):     20px  / font-weight: 600  / line-height: 1.35 / letter-spacing: -0.01em
Subsection Title (H3):  16px  / font-weight: 600  / line-height: 1.4  / letter-spacing: 0
Body (default):         14px  / font-weight: 400  / line-height: 1.6  / letter-spacing: 0
Body SemiBold:          14px  / font-weight: 500  / line-height: 1.6  / letter-spacing: 0
Small / Caption:        12px  / font-weight: 400  / line-height: 1.5  / letter-spacing: 0.01em
Overline / Label:       11px  / font-weight: 500  / line-height: 1.4  / letter-spacing: 0.05em / text-transform: uppercase
```

### Aturan Ketat Tipografi

- **Jangan pernah** menggunakan `font-weight: 700` atau `bold` untuk teks apa pun. Maksimal `600` (SemiBold) untuk heading.
- **Jangan pernah** menggunakan font size di atas `28px` untuk web. Ini bukan billboard.
- Body text **wajib** `14px` — tidak lebih besar, agar terasa compact dan profesional.
- Jaga kontras teks: teks utama `#212529` di atas background putih, teks sekunder `#495057`, teks tersier/disabled `#868E96`.
- Jangan gunakan warna-warni untuk teks biasa. Warna teks hanya: hitam/abu-abu netral, biru (link), hijau (success), merah (error).

### Implementasi

- Load font `Inter` via Google Fonts atau `expo-font`. Update `Fonts` di `constants/theme.ts` bagian `web` agar menggunakan Inter.
- Update seluruh style di `ThemedText` (`themed-text.tsx`) agar sesuai skala tipografi di atas.
- Hapus variant `title` yang saat ini `32px bold` → ganti ke `24px weight:600`.
- Hapus variant `subtitle` yang saat ini `20px bold` → ganti ke `16px weight:600`.

---

## 4. Layout & Spacing: Golden Ratio System

### Base Unit & Spacing Scale

Gunakan `base = 8px` dengan kelipatan yang mengikuti golden ratio yang dipraktiskan:

```
4xs:    2px    (micro spacing: border-radius kecil, subtle adjustment)
3xs:    4px    (spacing antar ikon dan label inline)
2xs:    6px    (padding badge, inner spacing kecil)
xs:     8px    (base unit — gap default antar elemen sebaris)
sm:     12px   (padding internal komponen kecil: chip, tag)
md:     16px   (padding card, gap antar field dalam form)
lg:     24px   (gap antar section dalam satu halaman)
xl:     32px   (margin section besar, padding kontainer utama)
2xl:    48px   (jarak antar blok konten major)
3xl:    64px   (padding halaman horizontal pada viewport besar)
```

### Prinsip Golden Ratio pada Layout

- **Sidebar : Konten utama** → rasio mendekati `1 : 1.618`
  - Sidebar width: `240px`, konten utama: sisa layar (fluid).
  - Pada viewport ≤1024px, sidebar menjadi collapsible overlay.
- **Content area** → max-width `960px` agar baris teks tidak terlalu panjang (optimal 60–80 karakter per baris).
- **Card grid**: gunakan CSS Grid dengan `gap: 16px`. Untuk dashboard, gunakan layout 3 kolom (golden ratio: 1 kolom ringkasan kecil, 2 kolom konten utama).
- **Vertikal rhythm**: semua spacing vertikal harus kelipatan `8px`. Tidak ada angka "aneh" seperti 15px, 7px, atau 23px.

### Grid System untuk Web

```
Kolom:              12 kolom
Gutter:             16px
Margin (mobile):    16px
Margin (tablet):    24px
Margin (desktop):   32px — 64px (responsive)
Breakpoint sm:      640px
Breakpoint md:      768px
Breakpoint lg:      1024px
Breakpoint xl:      1280px
```

---

## 5. Komponen UI: Spesifikasi Detail

### 5.1 Tombol (Button)

**Ukuran**

```
Small:    height: 30px  / padding: 0 12px  / font-size: 12px / font-weight: 500 / border-radius: 6px
Medium:   height: 36px  / padding: 0 16px  / font-size: 13px / font-weight: 500 / border-radius: 6px
Large:    height: 40px  / padding: 0 20px  / font-size: 14px / font-weight: 500 / border-radius: 8px
```

- **Jangan pernah** membuat tombol lebih tinggi dari `40px`.
- **Jangan pernah** menggunakan font-weight bold pada tombol.
- **Jangan pernah** menggunakan uppercase pada label tombol (kecuali overline/label pattern).

**Variasi**

```
Primary:      bg: Blue 700 (#1971C2)    / text: #FFFFFF / hover: Blue 600 (#1C7ED6)
Secondary:    bg: transparent           / text: Blue 700 / border: 1px solid #DEE2E6 / hover: bg Blue 50
Ghost:        bg: transparent           / text: Text Secondary (#495057) / hover: bg #F1F3F5
Success:      bg: Green 700 (#2F9E44)   / text: #FFFFFF / hover: Green 600 (#37B24D)
Danger:       bg: transparent           / text: Error (#E03131) / border: 1px solid #E03131 / hover: bg Error Light
Disabled:     bg: #F1F3F5               / text: #ADB5BD / cursor: not-allowed
```

**Transisi**

- Semua state change (hover, active, focus) menggunakan `transition: all 150ms ease`.
- Focus ring: `outline: 2px solid Blue 500` dengan `outline-offset: 2px`.

### 5.2 Input Field

```
Height:           36px
Padding:          0 12px
Font-size:        14px
Font-weight:      400
Border:           1px solid #DEE2E6
Border-radius:    6px
Background:       #FFFFFF
Placeholder:      #868E96
Focus border:     Blue 500 (#339AF0)
Focus shadow:     0 0 0 3px rgba(51, 154, 240, 0.1)
Error border:     #E03131
Error shadow:     0 0 0 3px rgba(224, 49, 49, 0.1)
```

- Label di atas input: `12px`, `font-weight: 500`, `color: #495057`, `margin-bottom: 4px`.
- Helper text di bawah input: `12px`, `font-weight: 400`, `color: #868E96`.
- Error message: `12px`, `color: #E03131`.

### 5.3 Card

```
Background:       #FFFFFF
Border:           1px solid #E9ECEF
Border-radius:    8px
Padding:          16px
Shadow (default): none (flat design — andalkan border saja)
Shadow (elevated): 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)
Hover (jika clickable): shadow elevated + translateY(-1px) / transition 150ms ease
```

- **Jangan** menggunakan shadow besar/tebal. Shadow harus sangat subtle atau tidak ada sama sekali.

### 5.4 Tabel

```
Header:           bg: #F8F9FA / font-size: 12px / font-weight: 500 / color: #495057 / text-transform: uppercase / letter-spacing: 0.05em
Row:              bg: #FFFFFF / font-size: 14px / font-weight: 400 / color: #212529
Row hover:        bg: Blue 50 (#E7F5FF)
Row border:       border-bottom: 1px solid #E9ECEF
Cell padding:     10px 12px
```

### 5.5 Navigation (Sidebar Web)

```
Width:            240px (fixed, collapsible di ≤1024px)
Background:       #FFFFFF
Border-right:     1px solid #E9ECEF
Nav item height:  36px
Nav item padding: 8px 12px
Nav item font:    14px / weight: 400 / color: #495057
Nav item active:  bg: Blue 50 (#E7F5FF) / color: Blue 700 (#1971C2) / font-weight: 500 / border-radius: 6px
Nav item hover:   bg: #F1F3F5
Icon size:        18px (di samping label, gap: 8px)
Section label:    11px / weight: 500 / color: #868E96 / uppercase / letter-spacing: 0.05em / padding: 16px 12px 6px
```

### 5.6 Top Bar / Header

```
Height:           52px
Background:       #FFFFFF
Border-bottom:    1px solid #E9ECEF
Padding:          0 24px
Content:          logo kiri, search center (opsional), user avatar + dropdown kanan
```

- Logo/nama aplikasi: `16px`, `font-weight: 600`, `color: #212529`.
- Breadcrumb (jika ada): `13px`, `color: #868E96`, separator `chevron-right` 12px.

### 5.7 Badge / Tag

```
Small:            height: 20px / padding: 0 6px / font-size: 11px / font-weight: 500 / border-radius: 4px
Default:          height: 24px / padding: 0 8px / font-size: 12px / font-weight: 500 / border-radius: 4px

Status Active:    bg: Green 100 (#D3F9D8) / text: Green 700 (#2F9E44)
Status Info:      bg: Blue 100 (#D0EBFF) / text: Blue 700 (#1971C2)
Status Warning:   bg: Warning Light (#FFF9DB) / text: Warning (#F08C00)
Status Error:     bg: Error Light (#FFF5F5) / text: Error (#E03131)
Status Neutral:   bg: #F1F3F5 / text: #495057
```

### 5.8 Modal / Dialog

```
Overlay:          bg: rgba(0, 0, 0, 0.3)
Container:        bg: #FFFFFF / border-radius: 10px / padding: 24px / max-width: 480px
Shadow:           0 20px 25px rgba(0, 0, 0, 0.05), 0 10px 10px rgba(0, 0, 0, 0.04)
Title:            20px / weight: 600 / color: #212529
Close button:     ghost icon button, 18px icon, top-right
```

### 5.9 Toast / Notification

```
Position:         top-right, stacked
Container:        bg: #FFFFFF / border: 1px solid #E9ECEF / border-radius: 8px / padding: 12px 16px
Shadow:           0 4px 12px rgba(0, 0, 0, 0.08)
Left accent:      4px solid bar (color sesuai tipe: success/error/warning/info)
Auto dismiss:     5 detik
```

---

## 6. Ikonografi

- Gunakan **satu** set ikon saja secara konsisten: `MaterialIcons` (sudah tersedia via `@expo/vector-icons`).
- Ukuran standar ikon:
  ```
  Inline (dalam teks):     16px
  Navigasi:                18px
  Tombol (dengan label):   16px (gap 6px dengan label)
  Standalone / feature:    20px
  Empty state:             32px — 40px
  ```
- Warna ikon mengikuti warna teks di konteksnya. Jangan beri warna berbeda kecuali ada makna semantik (merah = error, hijau = sukses).
- **Jangan** membuat ikon lebih besar dari `40px` kecuali untuk empty state atau ilustrasi.

---

## 7. Animasi & Transisi

- Semua transisi: `150ms ease` untuk hover/focus, `200ms ease` untuk expand/collapse.
- **Tidak ada** animasi bounce, spring berlebihan, atau efek yang mengganggu.
- Parallax scroll (saat ini di `ParallaxScrollView`) → **hapus** untuk versi web. Ganti dengan static header yang bersih.
- Loading state: gunakan skeleton shimmer (subtle), bukan spinner besar.
- Page transition: simple `fade` atau `none` — jangan slide yang dramatis.

---

## 8. Responsive Design (Web-First)

### Breakpoints

```
Mobile:           < 640px    → single column, hamburger menu, stacked layout
Tablet:           640–1023px → 2 kolom, sidebar collapsible, compact spacing
Desktop:          ≥ 1024px   → full layout, sidebar visible, 3-kolom dashboard
Wide:             ≥ 1280px   → content centered, max-width 960px untuk readability
```

### Aturan Responsif

- Sidebar: visible pada ≥1024px, hamburger overlay pada <1024px.
- Tabel: horizontal scroll pada mobile, tidak menumpuk row menjadi card (kecuali data summary).
- Font size **tidak berubah** antar breakpoint — hanya spacing dan layout yang berubah.
- Touch target minimum `36px` pada mobile (sudah terpenuhi dengan sizing di atas).

---

## 9. Struktur File & Implementasi Teknis

### File yang Harus Diubah

1. **`constants/theme.ts`**
   - Ganti seluruh `Colors` object dengan palet baru (sesuai Section 2).
   - Ganti seluruh `Fonts` object untuk web agar menggunakan `Inter` dan `JetBrains Mono`.
   - Tambahkan `Spacing` object baru sesuai spacing scale (Section 4).
   - Tambahkan `Typography` object baru berisi preset styles (Section 3).
   - Tambahkan `Shadows`, `BorderRadius`, `Breakpoints` constants.

2. **`components/themed-text.tsx`**
   - Sesuaikan semua variant (`default`, `title`, `subtitle`, `defaultSemiBold`, `link`) dengan skala tipografi baru.
   - Tambahkan variant baru: `caption`, `overline`, `h1`, `h2`, `h3`, `body`, `bodySemiBold`.
   - Hapus semua `fontWeight: 'bold'` → ganti ke `'600'` atau `'500'`.

3. **`components/themed-view.tsx`**
   - Tetap sederhana, hanya tambahkan default padding jika digunakan sebagai container.

4. **`components/parallax-scroll-view.tsx`**
   - Untuk web: ganti parallax effect → static clean header.
   - Kurangi `HEADER_HEIGHT` dari `250` menjadi `0` atau hapus konsep header image untuk web.
   - Ganti konten area padding dari `32` menjadi `24` sesuai spacing scale.

5. **`components/ui/collapsible.tsx`**
   - Sesuaikan heading font: `14px`, `weight: 500`.
   - Icon chevron: `14px`, warna mengikuti teks sekunder.
   - Gap heading: `6px` (sudah sesuai).

6. **`app/(tabs)/_layout.tsx`**
   - Untuk web: pertimbangkan sidebar navigation menggantikan bottom tabs.
   - Tab bar (jika tetap): height `48px`, icon `18px`, label `11px`.

7. **`app/(tabs)/index.tsx` & `app/(tabs)/explore.tsx`**
   - Redesign layout konten sesuai prinsip KISS.
   - Hapus elemen demo/boilerplate Expo.
   - Terapkan grid dan spacing baru.

8. **`app/_layout.tsx`**
   - Web: terapkan layout baru (sidebar + top bar + konten area).
   - Load font Inter via `expo-font` atau `<link>` tag untuk web.

### File Baru yang Perlu Dibuat

- `constants/spacing.ts` — jika ingin memisahkan spacing scale.
- `components/ui/button.tsx` — komponen tombol dengan semua variasi.
- `components/ui/input.tsx` — komponen input field.
- `components/ui/card.tsx` — komponen card.
- `components/ui/badge.tsx` — komponen badge/tag.
- `components/ui/modal.tsx` — komponen modal/dialog.
- `components/ui/toast.tsx` — komponen notifikasi toast.
- `components/ui/table.tsx` — komponen tabel.
- `components/layout/sidebar.tsx` — sidebar navigasi web.
- `components/layout/top-bar.tsx` — top bar/header web.
- `components/layout/page-container.tsx` — wrapper konten utama dengan max-width.

---

## 10. Checklist Validasi

Sebelum dianggap selesai, pastikan:

- [ ] Tidak ada font-size yang melebihi `28px`
- [ ] Tidak ada font-weight `700` atau `bold` di seluruh codebase
- [ ] Tidak ada tombol yang lebih tinggi dari `40px`
- [ ] Tidak ada shadow yang terasa "berat" atau terlalu prominent
- [ ] Semua spacing vertikal kelipatan `8px` (atau subset: 2, 4, 6, 8, 12, 16, 24, 32, 48, 64)
- [ ] Komposisi warna sesuai 60:30:10 — buka halaman, 60% harus terasa putih/netral
- [ ] Hijau hanya muncul di konteks positif/sukses/konfirmasi
- [ ] Biru digunakan untuk aksi, navigasi aktif, dan informasi
- [ ] Semua input, tombol, badge menggunakan ukuran yang konsisten
- [ ] Teks terbaca jelas — kontras ratio minimal 4.5:1 (WCAG AA)
- [ ] Halaman web tidak menggunakan parallax effect
- [ ] Responsif berfungsi di semua breakpoint (640, 768, 1024, 1280)
- [ ] Font Inter ter-load dengan benar di web
- [ ] Tidak ada elemen UI yang terasa "besar", "tebal", atau "warna-warni" berlebihan

---

## Ringkasan Filosofi Desain

> Desain ini terinspirasi dari pendekatan UI modern seperti **Linear**, **Vercel Dashboard**, dan **Notion** — clean, functional, tidak berisik. Setiap pixel punya alasan. Warna digunakan dengan hemat dan intentional. Tipografi konsisten dan terbaca. Layout mengikuti rasio yang harmonis. Interaksi terasa cepat dan responsif tanpa animasi berlebihan.

> **Yang dihindari**: UI yang terasa seperti "template WordPress", penuh warna tanpa hierarki, tombol besar ala landing page, heading 48px, shadow tebal di mana-mana, ikon berwarna-warni random.

> **Yang dikejar**: Kejelasan, ketenangan visual, profesionalisme, dan efisiensi — pengguna fokus pada konten dan tugas, bukan pada desain itu sendiri.
