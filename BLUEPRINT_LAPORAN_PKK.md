# BLUEPRINT SISTEM LAPORAN PKK
## Padukuhan Mandingan — Panduan Implementasi Detail
> Blueprint ini KHUSUS membahas generate laporan.
> Baca bersama BLUEPRINT_SISTEM_PADUKUHAN.md dan DATABASE_SCHEMA.sql
> Target: Developer AI yang akan implementasi fitur laporan

---

## DAFTAR ISI
1. Gambaran Umum Sistem Laporan
2. Teknologi yang Digunakan
3. Arsitektur Laporan
4. Laporan 1 — Data Warga Individu (TP-PKK)
5. Laporan 2 — Data Keluarga per KK
6. Laporan 3 — Rekapitulasi Dasawisma
7. Laporan 4 — Rekapitulasi RT
8. Laporan 5 — Rekapitulasi Padukuhan
9. Form Kelahiran — Dasawisma
10. Form Kelahiran — RT
11. Form Kelahiran — Padukuhan
12. Strategi Render Tabel Kompleks
13. Implementasi PDF Generator
14. Query Data per Laporan
15. Checklist Implementasi Laporan

---

## 1. GAMBARAN UMUM SISTEM LAPORAN

Ada **8 jenis dokumen** yang harus bisa digenerate:

```
LAPORAN INDIVIDU & KELUARGA
├── L1: Data Warga TP-PKK          (per warga, 1 halaman)
└── L2: Laporan Data Keluarga      (per KK, bisa multi-halaman)

REKAPITULASI PKK
├── L3: Rekap Dasawisma            (baris = KK, kolom = 30+)
├── L4: Rekap RT                   (baris = dasawisma)
└── L5: Rekap Padukuhan            (baris = RT)

FORM KELAHIRAN / KEMATIAN
├── F1: Kelahiran per Dasawisma    (baris = per kejadian)
├── F2: Kelahiran per RT           (baris = per dasawisma)
└── F3: Kelahiran per Padukuhan    (baris = per RT)
```

### Siapa Generate Laporan Mana?

| Laporan | Generator | Kapan |
|---|---|---|
| L1 — Data Warga | Kader / RT | Kapan saja, per warga |
| L2 — Data Keluarga | Kader / RT | Per KK atau massal per dasawisma |
| L3 — Rekap Dasawisma | Kader | Akhir tahun / sesuai kebutuhan |
| L4 — Rekap RT | Ketua RT | Akhir tahun |
| L5 — Rekap Padukuhan | Dukuh | Akhir tahun |
| F1 — Kelahiran Dasawisma | Kader | Per bulan |
| F2 — Kelahiran RT | Ketua RT | Per bulan |
| F3 — Kelahiran Padukuhan | Dukuh | Per bulan |

---

## 2. TEKNOLOGI YANG DIGUNAKAN

### Web (Next.js) — PRIORITAS
```
Generate PDF  : @react-pdf/renderer
               → Untuk tabel kompleks dengan colspan/rowspan
               → Output PDF langsung, bukan screenshot

Render preview: Di browser sebelum download
               → Gunakan komponen React biasa untuk preview
               → Lalu generate PDF saat tombol "Unduh" ditekan

Orientasi     : A4 Portrait untuk L1, L2
               A4 Landscape untuk L3, L4, L5, F1, F2, F3
               (tabel lebar HARUS landscape)
```

### Mobile (Expo) — SEKUNDER
```
Generate PDF  : expo-print (HTML → PDF)
               → Kirim HTML string ke expo-print
               → Lebih mudah dari @react-pdf/renderer untuk mobile

Berbagi PDF   : expo-sharing
               → Setelah generate, langsung bisa share via WA

CATATAN PENTING:
Laporan kompleks (L3, L4, L5) sebaiknya hanya dari Web.
Mobile cukup untuk L1 dan L2 saja karena layar terbatas.
```

### Strategi Umum
```
1. Buat SATU template HTML per jenis laporan
2. Template menerima data sebagai props/parameter
3. Render data ke template
4. Konversi ke PDF

Jangan mencoba pakai library tabel Excel/Word —
HTML → PDF sudah cukup untuk semua kebutuhan ini.
```

---

## 3. ARSITEKTUR LAPORAN

### Folder Structure

```
apps/web/
├── app/
│   └── (dashboard)/
│       └── laporan/
│           ├── page.tsx                  ← Menu pilih laporan
│           ├── warga/
│           │   └── [id]/
│           │       └── page.tsx          ← Preview L1
│           ├── keluarga/
│           │   └── [id]/
│           │       └── page.tsx          ← Preview L2
│           ├── dasawisma/
│           │   └── [id]/
│           │       └── page.tsx          ← Preview L3
│           ├── rt/
│           │   └── [id]/
│           │       └── page.tsx          ← Preview L4
│           └── padukuhan/
│               └── page.tsx              ← Preview L5
│
├── components/
│   └── laporan/
│       ├── shared/
│       │   ├── KopSurat.tsx              ← Header kop semua laporan
│       │   ├── TandaTangan.tsx           ← Blok tanda tangan
│       │   └── PageBreak.tsx             ← Pemisah halaman
│       ├── L1WargaTemplate.tsx
│       ├── L2KeluargaTemplate.tsx
│       ├── L3DasawismaTemplate.tsx
│       ├── L4RTTemplate.tsx
│       ├── L5PadukuhanTemplate.tsx
│       ├── F1KelahiranDasawisma.tsx
│       ├── F2KelahiranRT.tsx
│       └── F3KelahiranPadukuhan.tsx
│
└── lib/
    └── laporan/
        ├── queries.ts                    ← Semua query data laporan
        ├── pdfGenerator.ts              ← Fungsi generate PDF
        ├── formatters.ts                ← Format data untuk laporan
        └── constants.ts                 ← Label kolom, dll
```

---

## 4. LAPORAN 1 — DATA WARGA TP-PKK (L1)

### Gambaran Format
```
┌─────────────────────────────────────────────┐
│  [Logo]  SISTEM TERPADU    [Logo]  Mandingan│
│                                             │
│           DATA WARGA TP-PKK                 │
│                                             │
│  Dasa Wisma    : Melati 14                  │
│  Nama KRT      : SANTOSO                    │
│  No. Registrasi: 744                        │
│                                             │
│  1. No. KTP/NIK  : 3402080109090001         │
│  2. Nama         : SANTOSO                  │
│  3. Jabatan      : -                        │
│  4. Jenis Kelamin: Laki-laki                │
│  5. Tempat Lahir : BANTUL                   │
│  6. Tanggal Lahir: 04/06/1977  Umur: 48 th  │
│  7. Status Perkawinan : KAWIN               │
│  8. Status Dalam Keluarga : KEPALA KELUARGA │
│  9. Agama        : -                        │
│  10. Alamat      : Padukuhan Mandingan, ... │
│  11. Pendidikan  : -                        │
│  12. Pekerjaan   : WIRASWASTA               │
│  13. Akseptor KB : Tidak                    │
│  14. Aktif Posyandu : Tidak                 │
│  15. Ikut BKB Balita : Tidak                │
│  16. Ikut PAUD   : Tidak                    │
│  17. Ikut Koperasi : Tidak                  │
│                                             │
│  KEGIATAN WARGA                             │
│  ┌──┬────────────────────┬───────┬────────┐ │
│  │No│ Kegiatan           │ Y/T   │ Ket.   │ │
│  ├──┼────────────────────┼───────┼────────┤ │
│  │1 │ P'hayatan Pancasila│  T    │   -    │ │
│  │2 │ Kerja Bakti        │  T    │   -    │ │
│  │3 │ Rukun Kematian     │  T    │   -    │ │
│  │4 │ Kegiatan Keagamaan │  T    │   -    │ │
│  │5 │ Jimpitan           │  T    │   -    │ │
│  │6 │ Arisan             │  T    │   -    │ │
│  │7 │ Lain-Lain          │  T    │   -    │ │
│  └──┴────────────────────┴───────┴────────┘ │
└─────────────────────────────────────────────┘
```

### Data Source
```typescript
// Query: 1 warga dengan semua data yang dibutuhkan
const queryL1 = async (wargaId: string, tahun: number) => {
  const { data: warga } = await supabase
    .from('wargas')
    .select(`
      no_reg, nik, nama_lengkap, tempat_lahir, tanggal_lahir,
      jenis_kelamin, status_perkawinan, status_dalam_keluarga,
      agama, pendidikan, pekerjaan, jabatan,
      akseptor_kb, aktif_posyandu, ikut_bkb, ikut_paud, ikut_koperasi,
      rumah_tangga:rumah_tanggas(
        no_kk, nama_kepala_keluarga, alamat_detail
      ),
      rt:rts(nomor_rt, nama_ketua),
      dasawisma:dasawismas(nama_dasawisma)
    `)
    .eq('id', wargaId)
    .single()

  const { data: pkk } = await supabase
    .from('pkk_partisipasi')
    .select('*')
    .eq('warga_id', wargaId)
    .eq('tahun', tahun)
    .maybeSingle()

  return { warga, pkk }
}
```

### Komponen Template L1

```tsx
// components/laporan/L1WargaTemplate.tsx
// ORIENTASI: Portrait A4

interface L1Props {
  warga: WargaDetail
  pkk: PKKPartisipasi | null
  tahun: number
  padukuhan: PadukuhanProfil
}

// Tabel kegiatan warga di L1
// Berbeda dari 8 program PKK utama!
// L1 menggunakan 7 kegiatan WARGA (bukan 8 program PKK):
const KEGIATAN_WARGA = [
  { no: 1, label: 'Penghayatan dan Pengamalan Pancasila', key: 'penghayatan_pancasila' },
  { no: 2, label: 'Kerja Bakti',                          key: 'kerja_bakti' },
  { no: 3, label: 'Rukun Kematian',                       key: 'rukun_kematian' },
  { no: 4, label: 'Kegiatan Keagamaan',                   key: 'kegiatan_keagamaan' },
  { no: 5, label: 'Jimpitan',                             key: 'jimpitan' },
  { no: 6, label: 'Arisan',                               key: 'arisan' },
  { no: 7, label: 'Lain-Lain',                            key: 'lain_lain' },
] as const

// Format data untuk tampil di laporan
const formatStatusPerkawinan = (status: string) => {
  const map: Record<string, string> = {
    'kawin': 'KAWIN',
    'belum_kawin': 'BELUM KAWIN',
    'cerai_hidup': 'CERAI HIDUP',
    'cerai_mati': 'CERAI MATI',
  }
  return map[status] ?? '-'
}

const formatStatusKeluarga = (status: string) => {
  const map: Record<string, string> = {
    'kepala_keluarga': 'KEPALA KELUARGA',
    'istri': 'ISTRI',
    'anak': 'ANAK',
    'menantu': 'MENANTU',
    'cucu': 'CUCU',
    'orang_tua': 'ORANG TUA',
    'mertua': 'MERTUA',
    'famili_lain': 'FAMILI LAIN',
    'lainnya': 'LAINNYA',
  }
  return map[status] ?? '-'
}
```

---

## 5. LAPORAN 2 — DATA KELUARGA PER KK (L2)

### Gambaran Format
```
┌───────────────────────────────────────────────────────────────────┐
│                    LAPORAN DATA KELUARGA                          │
│  Dasa Wisma : Melati 14                                           │
│  Alamat     : Padukuhan Mandingan, Kalurahan Ringinharjo, Bantul  │
│  Nama Kepala RT : SANTOSO                                         │
│  Nomor KK   : 3402080109090001                                    │
│  Jml Anggota: 3 orang                                             │
│  Jumlah Anak: Balita:0 PUS:0 WUS:1 Buta:0 Hamil:0 Menyusui:0    │
│               Lansia:0                                            │
│  ┌──┬────────┬──────────────────┬────────────┬───────┬─┬─┬──────┬────────┐
│  │No│ No.REG │ NAMA ANGGOTA     │ STATUS DLM │STATUS │L│P│TGL   │PEKERJAAN│
│  │  │        │ KELUARGA         │ KELUARGA   │KAWIN  │ │ │LAHIR │         │
│  ├──┼────────┼──────────────────┼────────────┼───────┼─┼─┼──────┼────────┤
│  │1 │ 744    │ SANTOSO          │ KPL KLRGA  │ KAWIN │V│ │04/06/│WIRAS.  │
│  │2 │ 745    │ SANTIKA PUTRI    │ ANAK       │BLM KWN│ │V│10/09/│PELAJAR │
│  │3 │ 746    │ PARMIYATI        │ ISTRI      │ KAWIN │ │V│20/01/│MRT     │
│  └──┴────────┴──────────────────┴────────────┴───────┴─┴─┴──────┴────────┘
│                                                                   │
│  Makanan Pokok          : Beras                                   │
│  Jamban Keluarga        : Ada, Jumlah: 1 buah                     │
│  Sumber Air             : PDAM                                    │
│  Tempat Pembuangan Sampah: Ada                                    │
│  SPAL                   : Ada                                     │
│  Stiker P4K             : Tidak                                   │
│  Kriteria Rumah         : Sehat Layak Huni                        │
│  Aktivitas UP2K         : Tidak                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Penting — Kolom Tabel Anggota
```
Kolom tabel anggota keluarga (L2):
NO | No.REG | NAMA ANGGOTA KELUARGA | STATUS DLM KELUARGA |
STATUS DALAM PERKAWINAN | L | P | TGL LAHIR/UMUR | PEKERJAAN

CATATAN:
- Kolom L dan P adalah centang (√) sesuai jenis kelamin
- TGL LAHIR format: DD/MM/YYYY / umur dalam tahun
- UMUR dihitung dari tanggal lahir ke hari ini (bukan dari database)
```

### Data Source L2
```typescript
const queryL2 = async (rumahTanggaId: string) => {
  const { data: kk } = await supabase
    .from('rumah_tanggas')
    .select(`
      no_kk, nama_kepala_keluarga, alamat_detail,
      makanan_pokok, memiliki_jamban, jumlah_jamban,
      sumber_air, memiliki_tempat_sampah, memiliki_spal,
      menempel_stiker_p4k, kriteria_rumah, aktivitas_up2k,
      rt:rts(nomor_rt, nama_ketua),
      dasawisma:dasawismas(nama_dasawisma)
    `)
    .eq('id', rumahTanggaId)
    .single()

  const { data: anggota } = await supabase
    .from('wargas')
    .select(`
      no_reg, nama_lengkap, status_dalam_keluarga,
      status_perkawinan, jenis_kelamin,
      tanggal_lahir, pekerjaan, status_warga
    `)
    .eq('rumah_tangga_id', rumahTanggaId)
    .eq('status_warga', 'aktif')
    .order('status_dalam_keluarga')  // kepala keluarga duluan

  return { kk, anggota }
}
```

### Hitung Statistik Anggota (untuk header "Jumlah Anak")
```typescript
// formatters.ts
export const hitungStatistikKK = (anggota: Warga[]) => {
  const today = new Date()

  return anggota.reduce((acc, w) => {
    const usia = hitungUsiaBulan(w.tanggal_lahir, today)
    const usiaTotal = hitungUsiaTotal(w.tanggal_lahir, today)

    return {
      balita:      acc.balita + (usia <= 60 ? 1 : 0),
      pus:         acc.pus +
                   (w.jenis_kelamin === 'P' &&
                    usiaTotal >= 15 && usiaTotal <= 49 &&
                    w.status_perkawinan === 'kawin' ? 1 : 0),
      wus:         acc.wus +
                   (w.jenis_kelamin === 'P' &&
                    usiaTotal >= 15 && usiaTotal <= 49 ? 1 : 0),
      buta:        acc.buta + 0,  // tidak ada data di database
      ibu_hamil:   acc.ibu_hamil + 0,  // dari mutasi_penduduk
      menyusui:    acc.menyusui + 0,
      lansia:      acc.lansia + (usiaTotal >= 60 ? 1 : 0),
    }
  }, {
    balita: 0, pus: 0, wus: 0, buta: 0,
    ibu_hamil: 0, menyusui: 0, lansia: 0
  })
}
```

### Mode Generate L2
```
Ada 2 mode generate L2:

MODE 1 — Single KK:
  Pilih 1 KK → generate 1 dokumen → 1 halaman (atau lebih jika banyak anggota)

MODE 2 — Massal per Dasawisma (Laporan Massal):
  Pilih dasawisma → generate 1 PDF berisi SEMUA KK di dasawisma
  Setiap KK = 1 halaman (page break setelah setiap KK)
  Ini yang disebut "LapKel_Massal" di file PDF yang dilampirkan
```

### Implementasi Page Break (Mode Massal)
```tsx
// Untuk mode massal, setiap KK dipisah dengan page break

// Di @react-pdf/renderer:
import { Page, Document } from '@react-pdf/renderer'

const L2MassalDocument = ({ dataKKList }: { dataKKList: KKData[] }) => (
  <Document>
    {dataKKList.map((kkData) => (
      <Page key={kkData.kk.no_kk} size="A4" orientation="portrait">
        <L2KeluargaPage kkData={kkData} />
      </Page>
    ))}
  </Document>
)

// Untuk expo-print (HTML):
const generateL2MassalHTML = (dataKKList: KKData[]) => {
  const pages = dataKKList.map((kk) => templateL2HTML(kk))
  return pages.join('<div style="page-break-after: always;"></div>')
}
```

---

## 6. LAPORAN 3 — REKAPITULASI DASAWISMA (L3)

### PERINGATAN KOMPLEKSITAS ⚠️
```
Ini laporan PALING KOMPLEKS dalam sistem.
Tabelnya memiliki:
- Header 2 baris dengan colspan dan rowspan
- ±30 kolom total
- Orientasi LANDSCAPE wajib
- Font size harus kecil (7-8pt) agar muat
```

### Struktur Header Tabel L3 (2 Baris)
```
Baris Header 1 (dengan colspan/rowspan):
┌──┬──────────────────┬────┬─────────────────────────────────────────┬─────────────────────┬────────────────┬──────────────────────┬──────────────────────────────────────────┐
│No│ NAMA KEPALA      │JML │        JUMLAH ANGGOTA KELUARGA          │  KRITERIA RUMAH     │ SUMBER AIR     │   MAKANAN POKOK      │     WARGA MENGIKUTI KEGIATAN        │KET│
│  │ RUMAH TANGGA     │ KK │                                         │                     │ KELUARGA       │                      │                                    │   │
├──┼──────────────────┼────┼───┬───┬────┬────┬───┬───┬──────┬──┬────┼──────────┬──────────┼────┬─────┬────┼──────┬──────────────┼────┬──────┬────┬──────┬────┬──────┬────┤
│  │                  │    │TL │TP │BL  │ BP │PUS│WUS│ IBU  │IM│LNS │  SEHAT   │  TIDAK   │TMP │SPAL │JMB │STKER │ PDAM │SUMUR │BRAS│NBNRS │UP2K│PMF TK│INDS│KRJA B│   │
│  │                  │    │   │   │    │    │   │   │HAMIL │  │    │  LAYAK H │ SEHAT LH │SMPAH│     │    │ P4K  │      │      │    │      │    │PKRNGN│ RT │BAKTI  │   │
└──┴──────────────────┴────┴───┴───┴────┴────┴───┴───┴──────┴──┴────┴──────────┴──────────┴────┴─────┴────┴──────┴──────┴──────┴────┴──────┴────┴──────┴────┴──────┴────┘
```

### Definisi Lengkap Kolom L3
```typescript
// constants.ts — JANGAN UBAH URUTAN INI

export const KOLOM_L3 = [
  // Kolom identitas
  { key: 'no',               label: 'NO',          width: 20,  rowspan: 2 },
  { key: 'nama_krt',         label: 'NAMA KEPALA RUMAH TANGGA', width: 80, rowspan: 2 },
  { key: 'jml_kk',           label: 'JML KK',      width: 25,  rowspan: 2 },

  // Grup: Jumlah Anggota Keluarga (colspan=9)
  { group: 'JUMLAH ANGGOTA KELUARGA', colspan: 9, children: [
    { key: 'total_l',        label: 'TOTAL L',     width: 22 },
    { key: 'total_p',        label: 'TOTAL P',     width: 22 },
    { key: 'balita_l',       label: 'BALITA L',    width: 22 },
    { key: 'balita_p',       label: 'BALITA P',    width: 22 },
    { key: 'pus',            label: 'PUS',         width: 22 },
    { key: 'wus',            label: 'WUS',         width: 22 },
    { key: 'ibu_hamil',      label: 'IBU HAMIL',   width: 22 },
    { key: 'ibu_menyusui',   label: 'IBU MENYUSUI',width: 22 },
    { key: 'lansia',         label: 'LANSIA',      width: 22 },
    { key: 'buta',           label: '3 BUTA',      width: 22 },
    { key: 'berkebutuhan',   label: 'BRK. KHUSUS', width: 22 },
  ]},

  // Grup: Kriteria Rumah (colspan=2)
  { group: 'KRITERIA RUMAH', colspan: 2, children: [
    { key: 'sehat_layak',    label: 'SEHAT LAYAK HUNI',       width: 35 },
    { key: 'tidak_sehat',    label: 'TIDAK SEHAT LAYAK HUNI', width: 35 },
  ]},

  // Grup: Fasilitas (colspan=3)
  { group: 'FASILITAS', colspan: 3, children: [
    { key: 'ada_tempat_sampah', label: 'MEMILIKI TMP. PEMB. SAMPAH', width: 35 },
    { key: 'ada_spal',       label: 'MEMILIKI SPAL',          width: 30 },
    { key: 'ada_jamban',     label: 'MEMILIKI JAMBAN KELUARGA',width: 30 },
  ]},

  // Kolom tunggal
  { key: 'stiker_p4k', label: 'MENEMPEL STIKER P4K', width: 30, rowspan: 2 },

  // Grup: Sumber Air (colspan=3)
  { group: 'SUMBER AIR KELUARGA', colspan: 3, children: [
    { key: 'sumber_pdam',    label: 'PDAM',    width: 25 },
    { key: 'sumber_sumur',   label: 'SUMUR',   width: 25 },
    { key: 'sumber_dll',     label: 'DLL',     width: 25 },
  ]},

  // Grup: Makanan Pokok (colspan=2)
  { group: 'MAKANAN POKOK', colspan: 2, children: [
    { key: 'beras',          label: 'BERAS',     width: 25 },
    { key: 'non_beras',      label: 'NON BERAS', width: 25 },
  ]},

  // Grup: Kegiatan (colspan=4)
  { group: 'WARGA MENGIKUTI KEGIATAN', colspan: 4, children: [
    { key: 'up2k',           label: 'UP2K',              width: 25 },
    { key: 'pmt_pekarangan', label: 'PMFTN TANAH PKRNGN',width: 35 },
    { key: 'industri_rt',    label: 'INDUSTRI RUMAH TGG', width: 35 },
    { key: 'kerja_bakti',    label: 'KERJA BAKTI',       width: 30 },
  ]},

  // Kolom keterangan
  { key: 'ket',              label: 'KET', width: 30, rowspan: 2 },
]
```

### Implementasi Header 2 Baris dengan @react-pdf/renderer
```tsx
// Ini bagian paling tricky — header multi-baris di react-pdf

import { View, Text, StyleSheet } from '@react-pdf/renderer'

// react-pdf TIDAK mendukung colspan/rowspan secara langsung
// Kita harus simulasikan dengan nested View dan lebar yang tepat

const HeaderL3 = () => (
  <View style={styles.headerContainer}>

    {/* ── Baris Header 1 ── */}
    <View style={styles.headerRow1}>
      {/* Kolom yang rowspan=2: render dengan height 2x */}
      <View style={[styles.headerCell, { width: 20, height: 30 }]}>
        <Text>NO</Text>
      </View>
      <View style={[styles.headerCell, { width: 80, height: 30 }]}>
        <Text>NAMA KEPALA RUMAH TANGGA</Text>
      </View>
      <View style={[styles.headerCell, { width: 25, height: 30 }]}>
        <Text>JML KK</Text>
      </View>

      {/* Kolom grup dengan colspan */}
      <View style={[styles.headerGroup, { width: 242 }]}>
        {/* width = sum semua child = 22*11 = 242 */}
        <Text>JUMLAH ANGGOTA KELUARGA</Text>
      </View>

      <View style={[styles.headerGroup, { width: 70 }]}>
        <Text>KRITERIA RUMAH</Text>
      </View>

      {/* ... grup lainnya */}
    </View>

    {/* ── Baris Header 2 ── */}
    <View style={styles.headerRow2}>
      {/* Kolom rowspan=2 TIDAK dirender di baris 2 karena sudah di baris 1 */}

      {/* Child kolom dari JUMLAH ANGGOTA KELUARGA */}
      <View style={[styles.headerCell, { width: 22 }]}><Text>TOTAL L</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>TOTAL P</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>BALITA L</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>BALITA P</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>PUS</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>WUS</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>IBU HAMIL</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>IBU MENYUSUI</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>LANSIA</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>3 BUTA</Text></View>
      <View style={[styles.headerCell, { width: 22 }]}><Text>BRK KHUSUS</Text></View>

      {/* Child kolom dari KRITERIA RUMAH */}
      <View style={[styles.headerCell, { width: 35 }]}><Text>SEHAT LAYAK HUNI</Text></View>
      <View style={[styles.headerCell, { width: 35 }]}><Text>TIDAK SEHAT LAYAK HUNI</Text></View>

      {/* ... child kolom lainnya */}
    </View>

  </View>
)

// TEKNIK ROWSPAN di react-pdf:
// Kolom dengan rowspan=2 dirender di baris 1 dengan height double.
// Di baris 2, kolom tersebut di-SKIP (tidak dirender).
// Lebar baris 2 = total width - width kolom rowspan.

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column',
    border: '1px solid black',
  },
  headerRow1: {
    flexDirection: 'row',
    borderBottom: '1px solid black',
  },
  headerRow2: {
    flexDirection: 'row',
  },
  headerCell: {
    fontSize: 5,            // KECIL karena tabel sangat lebar
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 2,
    borderRight: '1px solid black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGroup: {
    borderRight: '1px solid black',
    borderBottom: '1px solid black',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    fontSize: 5,
    fontWeight: 'bold',
  },
})
```

### Data Source L3
```typescript
// Query langsung dari view v_rekap_dasawisma
const queryL3 = async (dasawismaId: string, tahun: number) => {
  const { data } = await supabase
    .from('v_rekap_dasawisma')
    .select('*')
    .eq('dasawisma_id', dasawismaId)
    .eq('tahun', tahun)
    .order('nama_krt')

  return data
}

// Hitung baris JUMLAH (total semua KK di dasawisma)
export const hitungTotalL3 = (rows: RekapDasawismaRow[]) => {
  return rows.reduce((acc, row) => ({
    jml_anggota:      acc.jml_anggota + (row.jml_anggota ?? 0),
    total_l:          acc.total_l + (row.total_l ?? 0),
    total_p:          acc.total_p + (row.total_p ?? 0),
    balita_l:         acc.balita_l + (row.balita_l ?? 0),
    balita_p:         acc.balita_p + (row.balita_p ?? 0),
    // ... semua kolom
    sehat_layak:      acc.sehat_layak + (row.sehat_layak ?? 0),
    ada_tempat_sampah:acc.ada_tempat_sampah + (row.ada_tempat_sampah ?? 0),
    ada_spal:         acc.ada_spal + (row.ada_spal ?? 0),
    ada_jamban:       acc.ada_jamban + (row.ada_jamban ?? 0),
    stiker_p4k:       acc.stiker_p4k + (row.stiker_p4k ?? 0),
    sumber_pdam:      acc.sumber_pdam + (row.sumber_pdam ?? 0),
    sumber_sumur:     acc.sumber_sumur + (row.sumber_sumur ?? 0),
    beras:            acc.beras + (row.beras ?? 0),
    up2k:             acc.up2k + (row.up2k ?? 0),
    kerja_bakti:      acc.kerja_bakti + (row.kerja_bakti ?? 0),
  }), {
    jml_anggota: 0, total_l: 0, total_p: 0,
    // ... semua diinisialisasi 0
  })
}
```

### Baris Jumlah di Laporan
```
Setiap laporan HARUS ada baris JUMLAH di akhir tabel.
Baris ini adalah SUM semua baris data.
Font bold, background sedikit berbeda.
```

---

## 7. LAPORAN 4 — REKAPITULASI RT (L4)

### Perbedaan dari L3
```
L3: Baris = KK (kepala rumah tangga)
L4: Baris = Dasawisma

Kolom hampir IDENTIK dengan L3.
Perbedaan hanya di 2 kolom pertama:
  L3: NO | NAMA KEPALA RUMAH TANGGA
  L4: NO | NAMA DASAWISMA
```

### Data Source L4
```typescript
const queryL4 = async (rtId: string, tahun: number) => {
  const { data } = await supabase
    .from('v_rekap_rt')
    .select('*')
    .eq('rt_id', rtId)
    .eq('tahun', tahun)
    .order('nama_dasawisma')

  return data
}
```

### CATATAN IMPLEMENTASI L4
```
Karena kolom identik dengan L3, GUNAKAN ULANG komponen header.
Buat satu komponen <HeaderTabelRekap /> yang bisa dipakai L3, L4, L5.
Bedanya hanya di:
  1. Label baris pertama (KRT vs Dasawisma vs RT)
  2. Data yang diisi di tiap baris
```

---

## 8. LAPORAN 5 — REKAPITULASI PADUKUHAN (L5)

### Perbedaan dari L4
```
L4: Baris = Dasawisma (per RT)
L5: Baris = RT

Kolom identik.
Header tambahan:
  - Nama Padukuhan, Desa, Tahun
  - Judul lebih besar: "REKAPITULASI CATATAN DATA DAN KEGIATAN WARGA KELOMPOK PKK DUSUN"

Ada kolom tambahan di L5: JML DASA WISMA (setelah nomor RT)
```

### Data Source L5
```typescript
const queryL5 = async (tahun: number) => {
  const { data } = await supabase
    .from('v_rekap_padukuhan')
    .select('*')
    .eq('tahun', tahun)
    .order('nomor_rt')

  return data
}
```

---

## 9. LAPORAN CATATAN KELUARGA DASAWISMA

### Format — Dokumen BERBEDA dari L2
```
Dokumen ini adalah "CATATAN KELUARGA" bukan "LAPORAN DATA KELUARGA"
Ini untuk data per anggota keluarga dengan KEGIATAN PKK (8 program)

Header per KK:
  CATATAN KELUARGA DARI : [NAMA KRT]
  ANGGOTA KELOMPOK DASA WISMA : Melati 11
  TAHUN : 2025
  KRITERIA RUMAH / JAMBAN / SUMBER AIR / TEMPAT SAMPAH

Tabel anggota + kolom PKK 8 program (berbeda dari L1!):
┌──┬──────────────┬───────┬──┬────────┬──────────┬──────────┬────┬──────┬────────┬────┬──────┬─────────┬──────────┐
│No│ NAMA ANGGOTA │STATUS │L/│ TEMPAT │TGL/BL/TH │          │    │      │        │    │      │         │ PERENCAN │
│  │ KELUARGA     │KAWIN  │P │ LAHIR  │LAHIR/UMUR│ AGAMA    │PDK │ PKRJ │BRK KHUS│P.P.│G.R.  │PEND&KTR │AAN SEHAT │
```

### 8 Kolom Kegiatan PKK di Catatan Keluarga
```typescript
// BERBEDA dari 7 kegiatan di L1!
// Ini 8 PROGRAM POKOK PKK:
export const PROGRAM_PKK_8 = [
  { key: 'penghayatan_pancasila',   label: 'PENGHAYATAN DAN PENGAMALAN PANCASILA' },
  { key: 'gotong_royong',           label: 'GOTONG ROYONG' },
  { key: 'pendidikan_keterampilan', label: 'PENDIDIKAN DAN KETERAMPILAN' },
  { key: 'pengembangan_koperasi',   label: 'PENGEMBANGAN KEHIDUPAN BERKOPERASI' },
  { key: 'pangan',                  label: 'PANGAN' },
  { key: 'sandang',                 label: 'SANDANG' },
  { key: 'kesehatan',               label: 'KESEHATAN' },
  { key: 'perencanaan_sehat',       label: 'PERENCANAAN SEHAT' },
]

// Di laporan, ditandai dengan V (ikut) atau X (tidak ikut)
// Bukan Y/T seperti di L1
```

---

## 10. FORM KELAHIRAN — DASAWISMA (F1)

### Format Header
```
REKAPITULASI DATA
IBU HAMIL, MELAHIRKAN, NIFAS, IBU MENINGGAL*, KELAHIRAN BAYI,
BAYI MENINGGAL DAN KEMATIAN BALITA

KELOMPOK DASAWISMA : ___________
PADUKUHAN          : Mandingan
KALURAHAN          : Ringinharjo
BULAN              : ___________
TAHUN              : ___________
```

### Kolom Tabel F1 (per kejadian/baris = per ibu)
```
Header 2 baris:

Baris 1:
NO | NAMA IBU | NAMA SUAMI | STATUS (HAMIL/MELAHIRKAN/NIFAS) |
NAMA BAYI | [CATATAN KELAHIRAN colspan=4] | [CATATAN KEMATIAN colspan=6]

Baris 2 (sub-header):
                                           [JENIS KELAMIN: L | P] | TGL LAHIR |
[NAMA IBU/BALITA/BAYI] | [STATUS IBU/BALITA/BAYI] | [JENIS KEL: L|P] |
[TGL MENINGGAL] | [SEBAB MENINGGAL] | [KETR]

AKTE KELAHIRAN: ADA | TIDAK
```

### Definisi Kolom F1 Lengkap
```typescript
export const KOLOM_F1 = {
  identitas: [
    { key: 'no',           label: 'NO',           col: 1, rowspan: 2 },
    { key: 'nama_ibu',     label: 'NAMA IBU',     col: 2, rowspan: 2 },
    { key: 'nama_suami',   label: 'NAMA SUAMI',   col: 3, rowspan: 2 },
    { key: 'status_ibu',   label: 'STATUS (HAMIL/MELAHIRKAN/NIFAS)', col: 4, rowspan: 2 },
    { key: 'nama_bayi',    label: 'NAMA BAYI',    col: 5, rowspan: 2 },
  ],
  catatan_kelahiran: {
    label: 'CATATAN KELAHIRAN',
    colspan: 4,
    children: [
      { key: 'jk_bayi_l', label: 'L', col: 6 },
      { key: 'jk_bayi_p', label: 'P', col: 7 },
      { key: 'tgl_lahir', label: 'TGL. LAHIR', col: 8 },
      { key: 'akte_ada',  label: 'ADA',   col: 9 },
      { key: 'akte_tidak',label: 'TIDAK', col: 10 },
    ]
  },
  catatan_kematian: {
    label: 'CATATAN KEMATIAN',
    colspan: 6,
    children: [
      { key: 'nama_korban',    label: 'NAMA IBU/BALITA/BAYI', col: 11 },
      { key: 'status_korban',  label: 'STATUS (IBU/BALITA/BAYI)', col: 12 },
      { key: 'jk_korban_l',    label: 'L', col: 13 },
      { key: 'jk_korban_p',    label: 'P', col: 14 },
      { key: 'tgl_meninggal',  label: 'TGL. MENINGGAL', col: 15 },
      { key: 'sebab_meninggal',label: 'SEBAB MENINGGAL', col: 16 },
    ]
  },
  ketr: { key: 'ketr', label: 'KETR', col: 17, rowspan: 2 },
}
```

### Data Source F1
```typescript
// Data kelahiran datang dari VIEW posyandu_ringkasan_rt (integrasi Posyandu)
// ATAU dari tabel mutasi_penduduk (jika ada kasus yang dicatat manual)

const queryF1 = async (dasawismaId: string, bulan: number, tahun: number) => {
  // Ambil dari mutasi_penduduk (kelahiran, kehamilan, kematian)
  const startDate = new Date(tahun, bulan - 1, 1).toISOString()
  const endDate = new Date(tahun, bulan, 0).toISOString()

  const { data } = await supabase
    .from('mutasi_penduduk')
    .select(`
      jenis_mutasi,
      nama_bayi, jenis_kelamin_bayi, nama_ibu, nama_ayah,
      ada_akte, tanggal_lahir,
      sebab_meninggal, tanggal_mutasi,
      hpht, hpl, status_kehamilan,
      warga:wargas(nama_lengkap, dasawisma_id)
    `)
    .in('jenis_mutasi', ['kelahiran', 'kematian', 'kehamilan'])
    .gte('tanggal_mutasi', startDate)
    .lte('tanggal_mutasi', endDate)

  // Filter yang dasawisma-nya sesuai
  return data?.filter(m =>
    m.warga?.dasawisma_id === dasawismaId
  )
}
```

### Ringkasan (Bawah Tabel F1)
```
Di bawah tabel ada CATATAN ringkasan:
  1. Jumlah Ibu Hamil    : ___ Orang
  2. Jumlah Ibu Melahirkan: ___ Orang
  3. Jumlah Ibu Nifas    : ___ Orang
  4. Jumlah Ibu Meninggal : ___ Orang
  5. Jumlah Bayi Lahir   : ___ Orang
  6. Jumlah Bayi Meninggal: ___ Orang
  7. Jumlah Balita Meninggal: ___ Orang
  *Ibu Meninggal karena hamil/melahirkan/nifas
```

---

## 11. FORM KELAHIRAN — RT (F2) & PADUKUHAN (F3)

### Perbedaan dari F1
```
F1 (Dasawisma): Baris = per ibu/bayi/kejadian
F2 (RT):        Baris = per dasawisma (agregasi F1)
F3 (Padukuhan): Baris = per RT (agregasi F2)
```

### Kolom F2 (berbeda dari F1)
```
F2 baris = per DASAWISMA, bukan per kejadian.
Kolom berubah menjadi angka (COUNT), bukan nama individu:

NO | NAMA KELOMPOK DASAWISMA |
[JUMLAH IBU: HAMIL|MELAHIRKAN|NIFAS|MENINGGAL] |
[JUMLAH BAYI: LAHIR(L/P) | AKTE(ADA/TIDAK) | MENINGGAL(L/P)] |
[JML BALITA MENINGGAL(L/P)] | KETERANGAN
```

### Kolom F3 (baris = RT)
```
NO | NOMOR RT | NAMA DASA WISMA (daftar, bukan 1 kolom) |
[sama dengan F2 dari sini...]
```

### Data Source F2 & F3
```typescript
// F2: Agregasi per dasawisma dalam 1 RT
const queryF2 = async (rtId: string, bulan: number, tahun: number) => {
  // Ambil semua mutasi dalam bulan ini di RT tersebut
  const { data: mutasi } = await supabase
    .from('mutasi_penduduk')
    .select(`
      jenis_mutasi,
      jenis_kelamin_bayi, ada_akte,
      warga:wargas(dasawisma_id, dasawisma:dasawismas(nama_dasawisma))
    `)
    .eq('rt_id', rtId)
    .gte('tanggal_mutasi', `${tahun}-${String(bulan).padStart(2,'0')}-01`)
    .lt('tanggal_mutasi', `${tahun}-${String(bulan+1).padStart(2,'0')}-01`)

  // Group by dasawisma dan hitung masing-masing
  const grouped = groupBy(mutasi, m => m.warga?.dasawisma_id)

  return Object.entries(grouped).map(([dasawismaId, events]) => ({
    dasawisma_id: dasawismaId,
    nama_dasawisma: events[0]?.warga?.dasawisma?.nama_dasawisma,
    jml_ibu_hamil:       events.filter(e => e.jenis_mutasi === 'kehamilan').length,
    jml_ibu_melahirkan:  events.filter(e => e.jenis_mutasi === 'kelahiran').length,
    jml_bayi_lahir_l:    events.filter(e =>
                           e.jenis_mutasi === 'kelahiran' && e.jenis_kelamin_bayi === 'L'
                         ).length,
    jml_bayi_lahir_p:    events.filter(e =>
                           e.jenis_mutasi === 'kelahiran' && e.jenis_kelamin_bayi === 'P'
                         ).length,
    akte_ada:            events.filter(e => e.ada_akte === true).length,
    akte_tidak:          events.filter(e => e.ada_akte === false).length,
    // ... dst
  }))
}

// F3: Agregasi per RT untuk padukuhan
const queryF3 = async (bulan: number, tahun: number) => {
  // Sama tapi group by rt_id dan return per RT
}
```

---

## 12. STRATEGI RENDER TABEL KOMPLEKS

### Masalah Utama & Solusinya

**Masalah 1: react-pdf tidak punya colspan/rowspan**
```
SOLUSI: Simulasi manual dengan nested View dan lebar yang presisi.

RUMUS:
  lebar_grup = SUM(lebar semua child kolom dalam grup)
  tinggi_rowspan2 = tinggi_baris_header_1 + tinggi_baris_header_2

Contoh:
  Grup "JUMLAH ANGGOTA KELUARGA" punya 11 child @ 22px
  → Lebar grup = 11 × 22 = 242px
```

**Masalah 2: Tabel terlalu lebar untuk A4**
```
SOLUSI:
  1. Orientasi LANDSCAPE (297mm × 210mm)
  2. Font size 5-6pt untuk kolom kecil (masih terbaca)
  3. Padding minimal (2px)
  4. Jika masih tidak muat, gunakan ukuran kertas A3

JANGAN:
  - Scale down seluruh konten (teks jadi tidak terbaca)
  - Wrap text di kolom angka (merusak alignment)
```

**Masalah 3: Teks header terlalu panjang**
```
SOLUSI:
  1. Gunakan singkatan yang konsisten:
     "MEMILIKI TEMPAT PEMBUANGAN SAMPAH" → "MEMILIKI TMP. PEMB. SAMPAH"
     "PEMANFAATAN TANAH PEKARANGAN"      → "PMF TNH PKRNGN"
     "INDUSTRI RUMAH TANGGA"             → "INDS RT"
  2. Text rotasi 90° untuk kolom sangat sempit (menggunakan transform)
  3. Font bold hanya untuk header, bukan data
```

**Masalah 4: Banyak halaman untuk laporan massal**
```
SOLUSI:
  1. Laporan massal (L2 mode massal) = 1 KK per halaman
  2. Laporan rekap (L3, L4, L5) = semua dalam 1 halaman landscape
     Jika baris > 25, otomatis lanjut ke halaman berikutnya dengan
     header tabel diulang di setiap halaman
  3. react-pdf OTOMATIS handle page break
     Gunakan: <View wrap={true}> untuk konten yang boleh dibagi antar halaman
```

**Masalah 5: Angka 0 vs kosong**
```
SOLUSI:
  Tampilkan "0" bukan kosong untuk angka.
  Tampilkan "-" untuk data yang memang tidak ada/tidak diketahui.
  Tampilkan "V" atau "√" untuk centang boolean TRUE.
  Tampilkan "" (kosong) untuk boolean FALSE di tabel rekap.
```

### Style Tabel Standar
```typescript
// Gunakan konstanta ini di SEMUA laporan untuk konsistensi

export const TABLE_STYLES = StyleSheet.create({
  // Container tabel
  table: {
    flexDirection: 'column',
    width: '100%',
    border: '0.5px solid black',
    marginTop: 5,
  },

  // Baris header
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '0.5px solid black',
  },

  // Baris data
  dataRow: {
    flexDirection: 'row',
    borderBottom: '0.5px solid black',
    minHeight: 16,
  },

  // Baris total/jumlah
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderBottom: '0.5px solid black',
    fontWeight: 'bold',
  },

  // Cell header
  headerCell: {
    fontSize: 5.5,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 2,
    borderRight: '0.5px solid black',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  // Cell data angka
  dataCell: {
    fontSize: 6,
    textAlign: 'center',
    padding: '2px 1px',
    borderRight: '0.5px solid black',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cell data teks (nama dll)
  dataCellText: {
    fontSize: 6,
    textAlign: 'left',
    padding: '2px 3px',
    borderRight: '0.5px solid black',
    justifyContent: 'center',
  },
})
```

---

## 13. IMPLEMENTASI PDF GENERATOR

### Fungsi Generate PDF Web
```typescript
// lib/laporan/pdfGenerator.ts

import { pdf } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'

// Generate dan download langsung
export const generateAndDownloadPDF = async (
  DocumentComponent: React.ComponentType<any>,
  props: any,
  namaFile: string
) => {
  try {
    const blob = await pdf(<DocumentComponent {...props} />).toBlob()
    saveAs(blob, `${namaFile}.pdf`)
  } catch (error) {
    console.error('[generatePDF]', error)
    throw new Error('Gagal membuat PDF. Coba lagi.')
  }
}

// Contoh penggunaan di komponen:
const handleDownloadL5 = async () => {
  setIsGenerating(true)
  try {
    const data = await queryL5(tahun)
    await generateAndDownloadPDF(
      L5PadukuhanDocument,
      { data, tahun, padukuhan },
      `Rekap_PKK_Padukuhan_Mandingan_${tahun}`
    )
  } finally {
    setIsGenerating(false)
  }
}
```

### Fungsi Generate PDF Mobile (expo-print)
```typescript
// lib/pdf.ts (Mobile)
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

export const generateAndSharePDF = async (
  htmlContent: string,
  namaFile: string
) => {
  // Generate PDF dari HTML
  const { uri } = await Print.printToFileAsync({
    html: htmlContent,
    base64: false,
  })

  // Pindahkan ke lokasi yang bisa dibaca
  const targetUri = `${FileSystem.documentDirectory}${namaFile}.pdf`
  await FileSystem.moveAsync({ from: uri, to: targetUri })

  // Share
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Simpan atau Bagikan Laporan',
      UTI: 'com.adobe.pdf',
    })
  }

  return targetUri
}
```

### KOP SURAT — Dipakai Semua Laporan
```tsx
// components/laporan/shared/KopSurat.tsx
// Komponen ini dipakai di SEMUA jenis laporan

import { View, Text, Image } from '@react-pdf/renderer'

interface KopSuratProps {
  judul: string
  subtitle?: string
  tanggal?: string
  logoUrl?: string
}

const KopSurat = ({ judul, subtitle, logoUrl }: KopSuratProps) => (
  <View style={styles.kop}>
    <View style={styles.logoKiri}>
      {logoUrl && <Image src={logoUrl} style={styles.logo} />}
    </View>

    <View style={styles.tengah}>
      <Text style={styles.instansi}>
        KELOMPOK PKK PADUKUHAN MANDINGAN
      </Text>
      <Text style={styles.alamat}>
        Padukuhan Mandingan, Kalurahan Ringinharjo,
        Kapanewon Bantul, Kabupaten Bantul
      </Text>
      <View style={styles.garisBawah} />
      <Text style={styles.judul}>{judul}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>

    <View style={styles.logoKanan}>
      {/* Logo kanan jika ada */}
    </View>
  </View>
)
```

---

## 14. QUERY DATA PER LAPORAN — RINGKASAN

```typescript
// lib/laporan/queries.ts
// Semua fungsi query untuk laporan dikumpulkan di sini

import { supabase } from '@/lib/supabase'

// ── L1: Data Warga Individu ─────────────────────────────
export const getDataL1 = async (wargaId: string, tahun: number) => { ... }

// ── L2: Data Keluarga (single) ──────────────────────────
export const getDataL2Single = async (rumahTanggaId: string) => { ... }

// ── L2: Data Keluarga (massal per dasawisma) ────────────
export const getDataL2Massal = async (dasawismaId: string) => {
  const { data: kks } = await supabase
    .from('rumah_tanggas')
    .select('id')
    .eq('dasawisma_id', dasawismaId)
    .eq('status_aktif', true)
    .order('nama_kepala_keluarga')

  // Fetch detail per KK secara paralel
  const results = await Promise.all(
    kks!.map(kk => getDataL2Single(kk.id))
  )
  return results
}

// ── L3: Rekap Dasawisma ─────────────────────────────────
export const getDataL3 = async (dasawismaId: string, tahun: number) => {
  const { data } = await supabase
    .from('v_rekap_dasawisma')
    .select('*')
    .eq('dasawisma_id', dasawismaId)
    .eq('tahun', tahun)
  return data
}

// ── L4: Rekap RT ────────────────────────────────────────
export const getDataL4 = async (rtId: string, tahun: number) => {
  const { data } = await supabase
    .from('v_rekap_rt')
    .select('*')
    .eq('rt_id', rtId)
    .eq('tahun', tahun)
  return data
}

// ── L5: Rekap Padukuhan ─────────────────────────────────
export const getDataL5 = async (tahun: number) => {
  const { data } = await supabase
    .from('v_rekap_padukuhan')
    .select('*')
    .eq('tahun', tahun)
  return data
}

// ── F1: Kelahiran Dasawisma ─────────────────────────────
export const getDataF1 = async (
  dasawismaId: string, bulan: number, tahun: number
) => { ... }

// ── F2: Kelahiran RT ────────────────────────────────────
export const getDataF2 = async (
  rtId: string, bulan: number, tahun: number
) => { ... }

// ── F3: Kelahiran Padukuhan ─────────────────────────────
export const getDataF3 = async (bulan: number, tahun: number) => { ... }
```

---

## 15. FORM KEHAMILAN — IMPLEMENTASI

### Data Kehamilan
```
Data kehamilan BUKAN dari Posyandu untuk laporan ini.
Laporan F1/F2/F3 diisi dari tabel mutasi_penduduk
dengan jenis_mutasi = 'kehamilan'

Data yang dicatat:
  - Nama ibu
  - Nama suami (dari data warga — kepala keluarga)
  - Status: hamil / melahirkan / nifas / meninggal
  - HPHT (Hari Pertama Haid Terakhir)
  - HPL (Hari Perkiraan Lahir)
  - Jika melahirkan: nama bayi, jenis kelamin, tanggal lahir, ada/tidak akte
  - Jika meninggal: sebab meninggal, tanggal meninggal
```

### Input Form Kehamilan (Mobile)
```
Form input mutasi baru dengan jenis_mutasi = 'kehamilan':

1. Cari warga ibu (dropdown, filter wanita saja)
2. Pilih status: Hamil / Melahirkan / Nifas
3. Jika HAMIL:
   - Input HPHT (date picker)
   - HPL otomatis dihitung: HPHT + 280 hari
4. Jika MELAHIRKAN:
   - Input nama bayi
   - Pilih jenis kelamin bayi
   - Input tanggal lahir
   - Centang: Ada akte / Tidak ada akte
5. Jika ada KEMATIAN (ibu/bayi/balita):
   - Input tanggal meninggal
   - Input sebab meninggal
   - Pilih yang meninggal: ibu / bayi / balita

HPL = HPHT + 280 hari (rumus standar)
```

```typescript
// Hitung HPL otomatis
export const hitungHPL = (hpht: Date): Date => {
  const hpl = new Date(hpht)
  hpl.setDate(hpl.getDate() + 280)
  return hpl
}

// Hitung usia kehamilan
export const hitungUsiaKehamilan = (hpht: Date): string => {
  const today = new Date()
  const diffMs = today.getTime() - hpht.getTime()
  const diffHari = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const minggu = Math.floor(diffHari / 7)
  const hari = diffHari % 7
  return `${minggu} minggu ${hari} hari`
}
```

---

## 16. CHECKLIST IMPLEMENTASI LAPORAN

### Urutan Pengerjaan (IKUTI URUTAN INI)
```
□ 1. Install dependensi
      Web  : npm install @react-pdf/renderer file-saver
             npm install -D @types/file-saver
      Mobile: expo install expo-print expo-sharing expo-file-system

□ 2. Buat komponen KopSurat.tsx (dipakai semua laporan)

□ 3. Implementasi L1 (paling sederhana — tidak ada tabel kompleks)
     □ Query data L1
     □ Template L1 (portrait)
     □ Tombol generate di halaman detail warga
     □ Test dengan data nyata

□ 4. Implementasi L2 (single mode)
     □ Query data L2
     □ Hitung statistik anggota (hitungStatistikKK)
     □ Template L2 (portrait)
     □ Test dengan beberapa KK yang ukurannya berbeda

□ 5. Implementasi L2 massal
     □ Query semua KK per dasawisma
     □ Page break antar KK
     □ Test dengan dasawisma yang punya banyak KK (>10)

□ 6. Implementasi KOLOM_L3 constants (definisi semua kolom)
     □ Pastikan total lebar semua kolom = lebar halaman landscape
     □ A4 landscape = 297mm usable ≈ 840pt di react-pdf

□ 7. Implementasi Header 2 Baris L3
     □ Baris 1: kolom rowspan=2 + label grup
     □ Baris 2: sub-kolom dari setiap grup
     □ Verifikasi alignment dengan data baris pertama

□ 8. Implementasi baris data L3
     □ Map data dari v_rekap_dasawisma ke kolom
     □ Baris JUMLAH di akhir (SUM semua baris)

□ 9. Implementasi L4 (reuse komponen header dari L3)
     □ Hanya ubah label kolom pertama

□ 10. Implementasi L5 (reuse komponen header dari L3/L4)
      □ Tambah kolom JML DASA WISMA
      □ Judul berbeda

□ 11. Implementasi Form Kehamilan di mobile
      □ Form input mutasi kehamilan
      □ Hitung HPL otomatis
      □ Simpan ke mutasi_penduduk

□ 12. Implementasi F1 (Kelahiran Dasawisma)
      □ Query dari mutasi_penduduk
      □ Header 2 baris F1
      □ Baris ringkasan di bawah tabel

□ 13. Implementasi F2 (Kelahiran RT)
      □ Agregasi data dari F1 per dasawisma
      □ Template F2 (landscape)

□ 14. Implementasi F3 (Kelahiran Padukuhan)
      □ Agregasi data dari F2 per RT

□ 15. Halaman Laporan di Web App
      □ Menu pilih jenis laporan
      □ Filter: dasawisma / RT / tahun / bulan
      □ Preview sebelum download
      □ Tombol "Unduh PDF"

□ 16. Testing Akhir
      □ Test semua laporan dengan data asli dari migrasi
      □ Cek alignment tabel di PDF yang didownload
      □ Cek ukuran file (harus < 5MB per laporan)
      □ Cek di printer fisik (ukuran kertas, margin)
```

### Catatan Penting untuk Developer
```
1. SELALU test PDF dengan membuka di PDF viewer, bukan hanya preview browser.
   Preview browser tidak akurat untuk lebar kolom dan page break.

2. Lebar kolom di react-pdf dalam satuan POINT (pt), bukan pixel.
   A4 landscape usable width ≈ 820pt (setelah margin kiri-kanan 20pt masing-masing).
   Pastikan SUM semua lebar kolom = 820pt atau kurang.

3. Font di react-pdf harus didaftarkan dulu. Gunakan font built-in:
   'Helvetica' untuk teks biasa
   'Helvetica-Bold' untuk bold
   JANGAN gunakan font custom kecuali benar-benar perlu.

4. Gambar (logo) harus berformat PNG/JPEG dan bisa diakses via URL publik
   atau dikonversi ke base64. Gunakan URL dari Supabase Storage.

5. Untuk laporan massal (L2) dengan 20+ KK, proses generate bisa
   memakan waktu 5-10 detik. WAJIB tampilkan loading state.

6. Data NULL di database harus ditangani gracefully:
   - Usia: jika tanggal_lahir null → tampilkan "-"
   - Agama/Pendidikan yang null → tampilkan "-"
   - Kolom boolean null → anggap FALSE (tampilkan "" kosong atau "0")
```

---

*Blueprint Laporan v1.0 — Sistem Padukuhan Mandingan*
*Dibuat sebagai dokumen terpisah dari Blueprint Utama*
*Gunakan bersama: BLUEPRINT_SISTEM_PADUKUHAN.md + DATABASE_SCHEMA.sql*
