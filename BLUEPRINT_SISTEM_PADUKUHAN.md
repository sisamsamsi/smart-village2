# BLUEPRINT SISTEM PADUKUHAN MANDINGAN
> Dokumen ini adalah panduan teknis lengkap untuk development.
> Target pembaca: Developer AI (Gemini Flash) yang akan mengimplementasikan sistem ini.
> Baca seluruh dokumen sebelum menulis satu baris kode pun.

---

## DAFTAR ISI
1. Gambaran Arsitektur
2. Teknologi & Dependensi
3. Struktur Folder
4. Konvensi Kode
5. Autentikasi & Role
6. Supabase Client
7. State Management
8. Navigasi
9. Desain UI/UX
10. Implementasi Per Modul
11. PWA — Portal Warga
12. Web App — Dashboard Dukuh
13. Notifikasi
14. Generate PDF
15. Migrasi SQLite
16. Checklist Development

---

## 1. GAMBARAN ARSITEKTUR

```
┌─────────────────────────────────────────────────────────┐
│                    TIGA PLATFORM                        │
├─────────────────┬───────────────────┬───────────────────┤
│  Mobile App     │    Web App        │      PWA          │
│  (Expo)         │  (Next.js)        │  (Next.js juga)   │
│                 │                   │                   │
│  Dukuh          │  Dukuh            │  Warga            │
│  Ketua RT       │  (dashboard besar │  (tanpa login,    │
│  Kader PKK      │   & laporan)      │   buka browser)   │
└────────┬────────┴─────────┬─────────┴─────────┬─────────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
              ┌─────────────▼────────────┐
              │        SUPABASE          │
              │  (shared dengan Posyandu)│
              │                          │
              │  PostgreSQL + Auth       │
              │  Storage + Realtime      │
              └──────────────────────────┘
```

### Repo Structure
```
padukuhan-mandingan/          ← root monorepo (opsional, bisa 2 repo terpisah)
├── apps/
│   ├── mobile/               ← Expo app
│   └── web/                  ← Next.js app (Web + PWA)
└── packages/
    └── shared/               ← types & utils bersama (opsional)
```

> CATATAN: Jika monorepo terlalu kompleks, buat 2 repo terpisah:
> `padukuhan-mobile` dan `padukuhan-web`. Lebih mudah dikelola.

---

## 2. TEKNOLOGI & DEPENDENSI

### Mobile App (Expo)

```
Framework     : Expo (React Native)
Bahasa        : TypeScript — WAJIB, tidak boleh plain JS
UI Library    : NativeWind (Tailwind untuk React Native)
Navigation    : Expo Router (file-based routing)
State         : Zustand
Server State  : TanStack Query (React Query)
Backend       : Supabase JS Client (@supabase/supabase-js)
Form          : React Hook Form + Zod (validasi)
PDF View      : expo-print + expo-sharing
Storage Lokal : expo-secure-store (untuk token auth)
Notifikasi    : expo-notifications
Icons         : @expo/vector-icons (Ionicons)
Date          : date-fns
```

### Web App (Next.js)

```
Framework     : Next.js (App Router)
Bahasa        : TypeScript — WAJIB
Styling       : Tailwind CSS
UI Components : shadcn/ui
State         : Zustand
Server State  : TanStack Query
Backend       : Supabase JS Client + @supabase/ssr
Form          : React Hook Form + Zod
PDF Generate  : @react-pdf/renderer
Table         : TanStack Table
Chart         : Recharts
Icons         : Lucide React
Date          : date-fns
```

### Supabase
```
Database      : PostgreSQL (sudah ada schema v1.1)
Auth          : Supabase Auth (email + password)
Storage       : Supabase Storage (foto, dokumen)
Realtime      : Supabase Realtime (notifikasi live)
```

---

## 3. STRUKTUR FOLDER

### Mobile (Expo)

```
apps/mobile/
├── app/                          ← Expo Router (file = route)
│   ├── (auth)/                   ← layout group: halaman auth
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (app)/                    ← layout group: halaman utama (butuh login)
│   │   ├── _layout.tsx           ← bottom tab navigator
│   │   ├── index.tsx             ← Dashboard (home)
│   │   ├── kependudukan/
│   │   │   ├── index.tsx         ← List warga
│   │   │   ├── [id].tsx          ← Detail warga
│   │   │   ├── tambah.tsx        ← Form tambah warga
│   │   │   └── kk/
│   │   │       ├── index.tsx     ← List KK
│   │   │       └── [id].tsx      ← Detail KK
│   │   ├── pkk/
│   │   │   ├── index.tsx         ← Dashboard PKK
│   │   │   ├── partisipasi/
│   │   │   │   └── [dasawisma_id].tsx
│   │   │   └── laporan/
│   │   │       └── index.tsx
│   │   ├── surat/
│   │   │   ├── index.tsx         ← List pengajuan
│   │   │   ├── [id].tsx          ← Detail + proses
│   │   │   └── buat.tsx          ← RT input manual
│   │   ├── program/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── buat.tsx
│   │   ├── pengumuman/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── buat.tsx
│   │   ├── kegiatan/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── buat.tsx
│   │   ├── keamanan/
│   │   │   ├── index.tsx
│   │   │   ├── laporan/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   └── tamu/
│   │   │       └── index.tsx
│   │   ├── masukan/
│   │   │   └── index.tsx
│   │   └── pengaturan/
│   │       └── index.tsx
│   └── _layout.tsx               ← Root layout (auth check)
│
├── components/
│   ├── ui/                       ← Komponen dasar (Button, Input, Card, dll)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Avatar.tsx
│   │   └── EmptyState.tsx
│   ├── layout/
│   │   ├── ScreenHeader.tsx
│   │   ├── ListItem.tsx
│   │   └── SectionTitle.tsx
│   ├── kependudukan/
│   │   ├── WargaCard.tsx
│   │   ├── KKCard.tsx
│   │   └── StatBadge.tsx
│   ├── pkk/
│   │   └── PartisipasiRow.tsx
│   ├── surat/
│   │   └── SuratCard.tsx
│   └── dashboard/
│       ├── StatCard.tsx
│       └── PosyanduWidget.tsx
│
├── lib/
│   ├── supabase.ts               ← Supabase client (singleton)
│   ├── auth.ts                   ← Auth helpers
│   └── pdf.ts                   ← PDF generator
│
├── hooks/
│   ├── useAuth.ts
│   ├── useWarga.ts
│   ├── usePKK.ts
│   ├── useSurat.ts
│   └── usePosyandu.ts
│
├── stores/
│   ├── authStore.ts              ← Zustand: user, role, rt_id
│   └── appStore.ts              ← Zustand: global UI state
│
├── types/
│   ├── database.ts               ← Types dari Supabase schema
│   ├── forms.ts                  ← Zod schemas untuk form
│   └── index.ts
│
├── constants/
│   ├── colors.ts
│   ├── strings.ts                ← Semua teks UI (Indonesia)
│   └── config.ts                 ← ENV variables
│
└── utils/
    ├── format.ts                 ← Format tanggal, nomor, dll
    ├── validators.ts             ← Validasi NIK, no HP, dll
    └── nomorSurat.ts            ← Generate nomor surat
```

### Web (Next.js)

```
apps/web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              ← Dukuh & Admin (butuh login)
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Dashboard utama
│   │   ├── kependudukan/
│   │   ├── pkk/
│   │   ├── surat/
│   │   ├── program/
│   │   ├── pengumuman/
│   │   ├── kegiatan/
│   │   ├── keamanan/
│   │   ├── masukan/
│   │   └── pengaturan/
│   ├── warga/                    ← PWA portal publik (tanpa login)
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Halaman utama PWA
│   │   ├── pengumuman/
│   │   │   └── page.tsx
│   │   ├── kegiatan/
│   │   │   └── page.tsx
│   │   ├── program/
│   │   │   └── page.tsx
│   │   ├── surat/
│   │   │   └── page.tsx          ← Form pengajuan surat
│   │   ├── laporan/
│   │   │   └── page.tsx          ← Form laporan kejadian
│   │   ├── masukan/
│   │   │   └── page.tsx          ← Form masukan anonim
│   │   └── darurat/
│   │       └── page.tsx          ← Tombol darurat + kontak
│   └── layout.tsx
│
├── components/
│   ├── ui/                       ← shadcn/ui components
│   ├── dashboard/
│   ├── pwa/                      ← Komponen khusus PWA
│   └── shared/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← Browser client
│   │   ├── server.ts             ← Server client (SSR)
│   │   └── middleware.ts
│   └── pdf/
│       └── templates/
│
├── hooks/
├── stores/
├── types/
└── utils/
```

---

## 4. KONVENSI KODE

### TypeScript
```typescript
// WAJIB: Semua file harus TypeScript (.ts / .tsx)
// WAJIB: Tidak boleh menggunakan 'any'
// WAJIB: Semua props harus didefinisikan dengan interface atau type

// ✅ BENAR
interface WargaCardProps {
  warga: Warga
  onPress: (id: string) => void
}

// ❌ SALAH
const WargaCard = ({ warga, onPress }: any) => { ... }
```

### Naming Convention
```
Komponen React     : PascalCase    → WargaCard.tsx
Hooks              : camelCase     → useWarga.ts (diawali 'use')
Stores             : camelCase     → authStore.ts
Utils / lib        : camelCase     → format.ts
Konstanta          : UPPER_SNAKE   → MAX_UPLOAD_SIZE
Variabel biasa     : camelCase     → namaLengkap
Tipe / Interface   : PascalCase    → UserProfile
Route file         : kebab-case    → tambah-warga.tsx
```

### Struktur Komponen
```tsx
// Urutan yang harus diikuti dalam setiap komponen:
// 1. Import
// 2. Interface/Type props
// 3. Komponen (arrow function)
//    a. Hooks (useState, useEffect, custom hooks)
//    b. Derived state / computed values
//    c. Handler functions
//    d. Render (return)
// 4. Export default

import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useWarga } from '@/hooks/useWarga'
import type { Warga } from '@/types'

interface WargaCardProps {
  warga: Warga
  onPress?: (id: string) => void
  showRT?: boolean
}

const WargaCard = ({ warga, onPress, showRT = false }: WargaCardProps) => {
  const router = useRouter()

  const usia = hitungUsia(warga.tanggal_lahir)

  const handlePress = () => {
    onPress?.(warga.id)
    router.push(`/kependudukan/${warga.id}`)
  }

  return (
    <View>
      <Text>{warga.nama_lengkap}</Text>
    </View>
  )
}

export default WargaCard
```

### Error Handling
```typescript
// SELALU gunakan try-catch untuk operasi async
// SELALU tampilkan pesan error yang ramah kepada user
// JANGAN sembunyikan error dengan console.log saja

const tambahWarga = async (data: WargaForm) => {
  try {
    const { error } = await supabase
      .from('wargas')
      .insert(data)

    if (error) throw error

    // sukses
  } catch (error) {
    // Tampilkan ke user, bukan hanya console
    Alert.alert('Gagal', 'Data warga tidak berhasil disimpan. Coba lagi.')
    console.error('[tambahWarga]', error)
  }
}
```

### Bahasa
```
SEMUA teks yang tampil ke user harus dalam Bahasa Indonesia.
Tidak boleh ada teks Inggris yang tampil ke user.
Komentar kode boleh Bahasa Indonesia atau Inggris.
Nama variabel dan fungsi boleh Inggris.
```

---

## 5. AUTENTIKASI & ROLE

### Flow Login
```
User buka app
    │
    ▼
Cek session di Supabase Auth
    │
    ├── Ada session → ambil user_profiles → set role di Zustand → ke Dashboard
    │
    └── Tidak ada → Redirect ke /login
```

### Implementasi Auth Store
```typescript
// stores/authStore.ts
import { create } from 'zustand'
import type { UserProfile, UserRole } from '@/types'

interface AuthState {
  user: UserProfile | null
  role: UserRole | null
  rtId: string | null
  dasawismaId: string | null
  isLoading: boolean

  setUser: (user: UserProfile | null) => void
  clearUser: () => void

  // Helpers — gunakan ini di seluruh app, jangan cek role secara manual
  isDukuh: () => boolean
  isKetuaRT: () => boolean
  isKader: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  rtId: null,
  dasawismaId: null,
  isLoading: true,

  setUser: (user) => set({
    user,
    role: user?.role ?? null,
    rtId: user?.rt_id ?? null,
    dasawismaId: user?.dasawisma_id ?? null,
    isLoading: false,
  }),

  clearUser: () => set({
    user: null,
    role: null,
    rtId: null,
    dasawismaId: null,
    isLoading: false,
  }),

  isDukuh: () => get().role === 'dukuh',
  isKetuaRT: () => get().role === 'ketua_rt',
  isKader: () => get().role === 'kader_dasawisma',
}))
```

### Role & Akses — ATURAN PENTING
```
DUKUH       → akses SEMUA data, SEMUA RT
KETUA_RT    → akses data RT-nya SAJA
KADER       → akses data dasawisma-nya SAJA (khusus PKK)
WARGA (PWA) → hanya data publik, tidak perlu login
```

### Cara Cek Role di Komponen
```tsx
// ✅ BENAR — gunakan helper dari store
const { isDukuh, isKetuaRT, rtId } = useAuthStore()

// ✅ Tampilkan tombol hanya untuk dukuh
{isDukuh() && <TambahButton />}

// ✅ Filter data berdasarkan RT
const query = isKetuaRT()
  ? supabase.from('wargas').eq('rt_id', rtId)
  : supabase.from('wargas')  // dukuh lihat semua

// ❌ SALAH — jangan cek role sebagai string secara langsung di komponen
{user?.role === 'dukuh' && <TambahButton />}
```

---

## 6. SUPABASE CLIENT

### Mobile — Singleton Pattern
```typescript
// lib/supabase.ts (Mobile)
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage menggunakan SecureStore (lebih aman dari AsyncStorage)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,  // PENTING untuk React Native
    },
  }
)
```

### Web — SSR Pattern
```typescript
// lib/supabase/client.ts (Web — browser)
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// lib/supabase/server.ts (Web — server components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export const createServerSupabase = () => {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
      },
    }
  )
}
```

### Pola Query — Selalu Gunakan TanStack Query
```typescript
// hooks/useWarga.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

// Query keys — centralisasi agar invalidation mudah
export const wargaKeys = {
  all: ['wargas'] as const,
  byRT: (rtId: string) => ['wargas', 'rt', rtId] as const,
  byDasawisma: (id: string) => ['wargas', 'dasawisma', id] as const,
  detail: (id: string) => ['wargas', id] as const,
}

// Hook untuk daftar warga (otomatis filter berdasarkan role)
export const useWargas = () => {
  const { rtId, isDukuh, isKetuaRT } = useAuthStore()

  return useQuery({
    queryKey: isKetuaRT() ? wargaKeys.byRT(rtId!) : wargaKeys.all,
    queryFn: async () => {
      let query = supabase
        .from('wargas')
        .select(`
          id, nik, nama_lengkap, tanggal_lahir, jenis_kelamin,
          status_warga, status_dalam_keluarga, pekerjaan,
          rt:rts(nomor_rt),
          dasawisma:dasawismas(nama_dasawisma),
          rumah_tangga:rumah_tanggas(no_kk, nama_kepala_keluarga)
        `)
        .eq('status_warga', 'aktif')
        .order('nama_lengkap')

      // RLS sudah handle ini, tapi kita filter eksplisit untuk kejelasan
      if (isKetuaRT() && rtId) {
        query = query.eq('rt_id', rtId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 menit
  })
}

// Mutation untuk tambah warga
export const useTambahWarga = () => {
  const queryClient = useQueryClient()
  const { rtId } = useAuthStore()

  return useMutation({
    mutationFn: async (data: WargaInsert) => {
      const { error } = await supabase.from('wargas').insert(data)
      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate semua cache warga agar list refresh otomatis
      queryClient.invalidateQueries({ queryKey: wargaKeys.all })
    },
  })
}
```

---

## 7. STATE MANAGEMENT

### Prinsip
```
Server state (data dari Supabase)  → TanStack Query
UI state lokal (loading, modal)    → useState
Global state (user, role)          → Zustand
Form state                         → React Hook Form
```

### Jangan Gunakan Zustand untuk Server State
```typescript
// ❌ SALAH — jangan simpan data dari DB di Zustand
const useAppStore = create(() => ({
  wargas: [],  // ← JANGAN ini
  fetchWargas: async () => { ... }
}))

// ✅ BENAR — gunakan TanStack Query
const { data: wargas, isLoading } = useWargas()
```

---

## 8. NAVIGASI

### Mobile — Expo Router

```
Tab Bar (bawah layar) — tergantung role:

DUKUH:
  🏠 Dashboard | 👥 Warga | 📋 PKK | 📄 Surat | ☰ Lainnya

KETUA RT:
  🏠 Dashboard | 👥 Warga | 📄 Surat | 📢 Pengumuman | ☰ Lainnya

KADER:
  🏠 Dashboard | 📋 PKK | 👥 Warga | ☰ Lainnya
```

```tsx
// app/(app)/_layout.tsx
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/authStore'

export default function AppLayout() {
  const { isDukuh, isKetuaRT } = useAuthStore()

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="kependudukan" options={{ title: 'Warga' }} />

      {/* PKK — hanya untuk dukuh dan kader */}
      {!isKetuaRT() && (
        <Tabs.Screen name="pkk" options={{ title: 'PKK' }} />
      )}

      <Tabs.Screen name="surat" options={{ title: 'Surat' }} />
      {/* Tab "Lainnya" berisi menu secondary */}
    </Tabs>
  )
}
```

### Web — Next.js App Router

```
Sidebar kiri (desktop) / Bottom nav (mobile):
  Dashboard | Kependudukan | PKK | Surat | Program |
  Pengumuman | Kegiatan | Keamanan | Masukan | Pengaturan
```

---

## 9. DESAIN UI/UX

### Prinsip Utama
```
1. SIMPEL — Ibu-ibu kader dan bapak-bapak RT harus bisa pakai tanpa training
2. LOKAL — Bahasa Indonesia, tidak ada istilah teknis
3. CEPAT — Loading state selalu ada, skeleton UI bukan spinner polos
4. AMAN — Konfirmasi sebelum aksi destruktif (hapus, tolak)
```

### Palet Warna (Mobile & Web)
```
Primary     : #1B5E20  (hijau tua — warna padukuhan/desa)
Secondary   : #2E7D32  (hijau medium)
Accent      : #F9A825  (kuning — untuk badge, CTA sekunder)
Background  : #F5F5F5  (abu sangat muda)
Surface     : #FFFFFF
Text Primary: #212121
Text Muted  : #757575
Danger      : #C62828  (merah — hapus, tolak, darurat)
Success     : #2E7D32
Warning     : #F57F17
Info        : #1565C0
```

### Tipografi (Mobile)
```
Font utama  : System font (San Francisco di iOS, Roboto di Android)
Heading     : fontWeight: '700', fontSize: 20-24
Subheading  : fontWeight: '600', fontSize: 16-18
Body        : fontWeight: '400', fontSize: 14-16
Caption     : fontWeight: '400', fontSize: 12, color: muted
```

### Komponen UI Standar

#### Button
```tsx
// components/ui/Button.tsx
// Varian: primary, secondary, danger, ghost
// Size: sm, md, lg
// Selalu ada loading state

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}
```

#### Card Warga
```
┌─────────────────────────────────┐
│ [Avatar]  Nama Lengkap          │
│           NIK: 34020812345      │
│           RT 006 · Melati 14    │
│           Laki-laki · 45 th     │
└─────────────────────────────────┘
```

#### Status Badge
```
Aktif      → hijau
Meninggal  → abu
Pindah     → orange
Pending    → kuning
Selesai    → hijau
Ditolak    → merah
```

### UX Rules
```
1. Tombol aksi PRIMER di kanan bawah (FAB untuk tambah data)
2. Swipe to delete TIDAK boleh — warga bisa tidak sengaja hapus data
3. Konfirmasi dialog WAJIB sebelum: hapus warga, tolak surat, update status
4. Pull to refresh WAJIB di semua list
5. Empty state HARUS ada ilustrasi + teks jelas, bukan halaman kosong
6. Error state HARUS ada tombol "Coba lagi"
7. Semua form HARUS ada validasi real-time (React Hook Form + Zod)
8. Input tanggal GUNAKAN DatePicker, bukan input text manual
9. Pencarian GUNAKAN debounce 300ms agar tidak spam request
10. Infinite scroll atau pagination WAJIB untuk list > 20 item
```

---

## 10. IMPLEMENTASI PER MODUL

---

### MODUL 1 — KEPENDUDUKAN

#### Screens (Mobile)
```
/kependudukan
  ├── index          → Daftar warga dengan search & filter
  ├── [id]           → Detail warga lengkap
  ├── tambah         → Form tambah warga
  ├── [id]/edit      → Form edit warga
  └── kk/
      ├── index      → Daftar KK
      ├── [id]       → Detail KK + anggota keluarga
      └── tambah     → Form tambah KK
```

#### Fitur Pencarian Warga
```typescript
// Implementasi search dengan debounce
const [keyword, setKeyword] = useState('')
const debouncedKeyword = useDebounce(keyword, 300)

const { data } = useQuery({
  queryKey: ['wargas', 'search', debouncedKeyword],
  queryFn: async () => {
    if (!debouncedKeyword) return []

    const { data, error } = await supabase
      .from('wargas')
      .select('id, nik, nama_lengkap, rt:rts(nomor_rt)')
      .or(`nama_lengkap.ilike.%${debouncedKeyword}%,nik.ilike.%${debouncedKeyword}%`)
      .eq('status_warga', 'aktif')
      .limit(20)

    if (error) throw error
    return data
  },
  enabled: debouncedKeyword.length >= 2,
})
```

#### Form Tambah Warga — Validasi Zod
```typescript
// types/forms.ts
import { z } from 'zod'

export const wargaSchema = z.object({
  nik: z.string()
    .length(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya angka'),
  nama_lengkap: z.string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100),
  tanggal_lahir: z.date({ required_error: 'Tanggal lahir wajib diisi' }),
  jenis_kelamin: z.enum(['L', 'P']),
  status_perkawinan: z.enum(['belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati']),
  status_dalam_keluarga: z.enum([
    'kepala_keluarga', 'istri', 'anak', 'menantu',
    'cucu', 'orang_tua', 'mertua', 'famili_lain', 'lainnya'
  ]),
  pekerjaan: z.string().optional(),
  agama: z.string().optional(),       // opsional — kader yang lengkapi nanti
  pendidikan: z.string().optional(),  // opsional
  rumah_tangga_id: z.string().uuid(),
})

export type WargaForm = z.infer<typeof wargaSchema>
```

#### Mutasi Penduduk
```
Kelahiran:
  1. Input nama bayi, jenis kelamin, tanggal lahir
  2. Pilih ibu (dari daftar warga wanita di RT)
  3. Input nama ayah
  4. Centang ada/tidak akte
  5. System otomatis buat record baru di tabel wargas
  6. System otomatis catat di tabel mutasi_penduduk

Kematian:
  1. Cari warga yang meninggal
  2. Input tanggal dan sebab meninggal
  3. System update status_warga → 'meninggal'
  4. System catat di mutasi_penduduk

Pindah keluar:
  1. Cari warga
  2. Input tujuan kepindahan
  3. System update status_warga → 'pindah_keluar'
```

---

### MODUL 2 — PKK & DASAWISMA

#### Alur Input Kader
```
1. Kader login → masuk ke menu PKK
2. Pilih tahun (default: tahun berjalan)
3. Tampil daftar KK di dasawisma-nya
4. Tap KK → tampil daftar anggota KK
5. Centang/uncentang 14 indikator kegiatan per warga
6. Simpan → otomatis masuk tabel pkk_partisipasi
```

#### UI Partisipasi PKK
```
┌─────────────────────────────────────────────┐
│ KK: BASUKI          Dasawisma: Melati 11    │
├─────────────────────────────────────────────┤
│ BASUKI          L  52th  Mekanik            │
│  ✅ Pancasila  ✅ Gotong Royong             │
│  ✅ Pendidikan ❌ Koperasi                  │
│  ✅ Pangan     ✅ Sandang                   │
│  ✅ Kesehatan  ✅ Perencanaan Sehat         │
├─────────────────────────────────────────────┤
│ EVAN KURNIAWAN  L  20th  Pelajar            │
│  ✅ Pancasila  ✅ Gotong Royong  ...        │
└─────────────────────────────────────────────┘
```

#### Generate Laporan PKK
```typescript
// Laporan diambil dari view yang sudah ada di database:
// v_rekap_dasawisma   → untuk laporan per dasawisma
// v_rekap_rt          → untuk laporan per RT
// v_rekap_padukuhan   → untuk rekap total padukuhan

const { data: rekap } = useQuery({
  queryKey: ['laporan', 'dasawisma', dasawismaId, tahun],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('v_rekap_dasawisma')
      .select('*')
      .eq('dasawisma_id', dasawismaId)
      .eq('tahun', tahun)

    if (error) throw error
    return data
  },
})
```

---

### MODUL 3 — ADMINISTRASI & SURAT

#### Alur Pengajuan Surat (2 jalur)

**Jalur A — RT Input Langsung:**
```
RT buka menu Surat → Buat Baru
→ Cari warga (by nama/NIK)
→ Pilih jenis surat (Pengantar RT / Domisili)
→ Isi keperluan (untuk Pengantar RT)
→ Preview data warga (otomatis terisi dari database)
→ Approve langsung → Generate PDF → Selesai
```

**Jalur B — Warga via PWA:**
```
Warga buka PWA → Menu Surat
→ Pilih RT → Pilih jenis surat → Isi NIK + nama + no HP + keperluan
→ Submit → Notifikasi masuk ke HP RT
→ RT cek di app → Verifikasi NIK apakah valid
→ RT approve → PDF digenerate → RT info ke warga via WA/telpon
```

#### Generate Nomor Surat
```typescript
// utils/nomorSurat.ts
// Format: 001/RT-01/V/2025

const BULAN_ROMAWI = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
]

export const generateNomorSurat = async (
  rtId: string,
  nomorRt: number,
  jenisSurat: 'pengantar_rt' | 'domisili'
): Promise<string> => {
  const tahun = new Date().getFullYear()
  const bulan = new Date().getMonth() + 1

  // Increment counter di database (atomic)
  const { data, error } = await supabase.rpc('increment_surat_counter', {
    p_rt_id: rtId,
    p_jenis: jenisSurat,
    p_tahun: tahun,
  })

  if (error) throw error

  const counter = String(data).padStart(3, '0')
  const rtStr = String(nomorRt).padStart(2, '0')
  const prefix = jenisSurat === 'domisili' ? 'MAND' : `RT-${rtStr}`

  return `${counter}/${prefix}/${BULAN_ROMAWI[bulan]}/${tahun}`
}
```

#### Generate PDF Surat
```typescript
// lib/pdf.ts (Mobile — menggunakan expo-print)
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

export const generateSuratPDF = async (
  jenisSurat: 'pengantar_rt' | 'domisili',
  warga: Warga,
  rt: RT,
  keperluan: string,
  nomorSurat: string
): Promise<string> => {

  const html = jenisSurat === 'pengantar_rt'
    ? templateSuratPengantarRT({ warga, rt, keperluan, nomorSurat })
    : templateSuratDomisili({ warga, rt, nomorSurat })

  const { uri } = await Print.printToFileAsync({ html })
  return uri  // path ke file PDF lokal
}

export const bagikanPDF = async (uri: string) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Simpan atau bagikan surat',
    })
  }
}
```

#### Template Surat HTML
```typescript
// Variabel dinamis menggunakan placeholder {{...}}
const templateSuratPengantarRT = ({ warga, rt, keperluan, nomorSurat }: TemplateProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 2cm; }
    .kop { text-align: center; border-bottom: 3px solid black; padding-bottom: 10px; }
    .judul { text-align: center; font-weight: bold; margin: 20px 0; font-size: 14pt; }
    .nomor { text-align: center; margin-bottom: 20px; }
    table.isi { width: 100%; border-collapse: collapse; }
    table.isi td { padding: 3px 5px; vertical-align: top; }
    table.isi td:first-child { width: 180px; }
    table.isi td:nth-child(2) { width: 10px; }
    .ttd { margin-top: 40px; float: right; text-align: center; width: 200px; }
  </style>
</head>
<body>
  <div class="kop">
    <strong>PEMERINTAH KABUPATEN BANTUL</strong><br>
    <strong>KALURAHAN RINGINHARJO</strong><br>
    PADUKUHAN MANDINGAN
  </div>

  <div class="judul">SURAT PENGANTAR</div>
  <div class="nomor">Nomor: ${nomorSurat}</div>

  <p>Yang bertanda tangan di bawah ini, Ketua RT ${String(rt.nomor_rt).padStart(3, '0')}
  Padukuhan Mandingan, Kalurahan Ringinharjo, Kapanewon Bantul, menerangkan bahwa:</p>

  <table class="isi">
    <tr><td>Nama</td><td>:</td><td>${warga.nama_lengkap}</td></tr>
    <tr><td>NIK</td><td>:</td><td>${warga.nik}</td></tr>
    <tr><td>Tempat/Tgl. Lahir</td><td>:</td>
        <td>${warga.tempat_lahir}, ${formatTanggal(warga.tanggal_lahir)}</td></tr>
    <tr><td>Jenis Kelamin</td><td>:</td>
        <td>${warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td></tr>
    <tr><td>Pekerjaan</td><td>:</td><td>${warga.pekerjaan ?? '-'}</td></tr>
    <tr><td>Alamat</td><td>:</td>
        <td>Padukuhan Mandingan, Kalurahan Ringinharjo, Kapanewon Bantul</td></tr>
  </table>

  <p>Orang tersebut di atas adalah benar-benar warga RT ${String(rt.nomor_rt).padStart(3, '0')}
  Padukuhan Mandingan dan bermaksud untuk <strong>${keperluan}</strong>.</p>

  <p>Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>

  <div class="ttd">
    Bantul, ${formatTanggalLengkap(new Date())}<br><br><br>
    Ketua RT ${String(rt.nomor_rt).padStart(3, '0')}<br><br><br><br>
    <strong>${rt.nama_ketua}</strong>
  </div>
</body>
</html>
`
```

---

### MODUL 4 — PROGRAM & PROPOSAL

#### Status Flow
```
DIUSULKAN → DIKAJI → DISETUJUI → DILAKSANAKAN → SELESAI
     └──────────────────────────────────────────→ DITOLAK
```

#### Tampilan List Proposal (Dukuh)
```
┌──────────────────────────────────────────┐
│ Corblok Jalan RT 006          [DIKAJI]   │
│ Infrastruktur · RT 006 · 2025            │
│ Diusulkan: Puji Sukanto                  │
│ ─────────────────────────────────────── │
│ Penerangan Jalan RT 003     [DISETUJUI]  │
│ Penerangan · RT 003 · 2025               │
│ Sumber: Dana Desa                        │
└──────────────────────────────────────────┘
```

---

### MODUL 5 — PENGUMUMAN

#### ATURAN SEKAT PENTING — IMPLEMENTASIKAN DENGAN BENAR:
```
Dukuh membuat pengumuman:
  → target = 'semua'    : tampil di SEMUA RT
  → target = 'rt_tertentu' : isi tabel pengumuman_target_rt

Ketua RT membuat pengumuman:
  → HANYA untuk RT-nya sendiri
  → rt_pembuat WAJIB diisi dengan rt_id ketua RT tersebut
  → Ketua RT lain TIDAK BOLEH melihat pengumuman ini

PWA warga:
  → Tampilkan pengumuman dari dukuh (target=semua) +
    pengumuman dari RT-nya sendiri
  → RT warga ditentukan dari parameter URL (/warga/rt/6)
```

#### Query Pengumuman untuk Ketua RT
```typescript
// Ketua RT hanya lihat pengumuman yang relevan untuk dia
const pengumumanQuery = supabase
  .from('pengumuman')
  .select('*')
  .eq('aktif', true)
  .or(`rt_pembuat.eq.${rtId},target.eq.semua`)
  .order('created_at', { ascending: false })
```

---

### MODUL 7 — KEAMANAN

#### Tombol Darurat — Implementasi
```tsx
// components/DaruratButton.tsx
import { Linking } from 'react-native'
import { useQuery } from '@tanstack/react-query'

const DaruratButton = () => {
  const { data: kontak } = useQuery({
    queryKey: ['kontak-penting'],
    queryFn: async () => {
      const { data } = await supabase
        .from('kontak_penting')
        .select('*')
        .eq('aktif', true)
        .order('urutan')
      return data
    },
  })

  const bukaWhatsApp = (noHp: string) => {
    // Format nomor WA: hilangkan 0 di depan, ganti dengan 62
    const noFormatted = noHp.replace(/^0/, '62').replace(/\D/g, '')
    const url = `whatsapp://send?phone=${noFormatted}`
    Linking.openURL(url).catch(() => {
      // Fallback: buka telepon biasa
      Linking.openURL(`tel:${noHp}`)
    })
  }

  return (
    <View>
      {/* Tombol merah besar yang mencolok */}
      <TouchableOpacity
        style={styles.daruratButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.daruratText}>🚨 DARURAT</Text>
      </TouchableOpacity>

      {/* Modal pilihan kontak */}
      <Modal visible={showModal}>
        {kontak?.map((k) => (
          <TouchableOpacity
            key={k.id}
            onPress={() => bukaWhatsApp(k.no_wa ?? k.no_hp)}
          >
            <Text>{k.label}</Text>
            <Text>{k.no_hp}</Text>
          </TouchableOpacity>
        ))}
      </Modal>
    </View>
  )
}
```

---

### MODUL 8 — DASHBOARD

#### Dashboard Dukuh — Widget yang Harus Ada
```
┌─────────────┬─────────────┬─────────────┐
│  1.250      │    424      │      7      │
│  Total Warga│  Total KK   │   Total RT  │
└─────────────┴─────────────┴─────────────┘

┌─────────────┬─────────────┬─────────────┐
│  MUTASI     │   SURAT     │  LAPORAN    │
│  Bulan Ini  │  Pending    │  Belum      │
│  3 lahir    │  2 pengaj.  │  ditindak   │
└─────────────┴─────────────┴─────────────┘

┌──────────────────────────────────────────┐
│ POSYANDU (dari integrasi)                │
│  Balita: 85  | Stunting: 4 | Lansia: 207 │
│  Ditimbang bulan ini: 72 balita          │
└──────────────────────────────────────────┘
```

#### Query Dashboard — Gunakan Promise.all untuk Paralel
```typescript
const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Jalankan semua query paralel, bukan berurutan
      const [
        { count: totalWarga },
        { count: totalKK },
        { data: mutasiBulanIni },
        { count: suratPending },
        { data: posyandu },
      ] = await Promise.all([
        supabase.from('wargas').select('*', { count: 'exact', head: true })
          .eq('status_warga', 'aktif'),
        supabase.from('rumah_tanggas').select('*', { count: 'exact', head: true })
          .eq('status_aktif', true),
        supabase.from('mutasi_penduduk')
          .select('jenis_mutasi')
          .gte('tanggal_mutasi', startOfMonth(new Date()).toISOString()),
        supabase.from('surat_pengajuan').select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('posyandu_ringkasan_rt').select('*'),
      ])

      return {
        totalWarga,
        totalKK,
        mutasiBulanIni,
        suratPending,
        posyandu: posyandu?.reduce((acc, rt) => ({
          balita: acc.balita + (rt.balita_aktif ?? 0),
          stunting: acc.stunting + (rt.jumlah_stunting ?? 0),
          lansia: acc.lansia + (rt.jumlah_lansia ?? 0),
        }), { balita: 0, stunting: 0, lansia: 0 }),
      }
    },
    staleTime: 2 * 60 * 1000, // refresh tiap 2 menit
  })
}
```

---

### MODUL 9 — MASUKAN ANONIM

#### Penting: Tidak Ada Identitas Tersimpan
```typescript
// Pengiriman masukan dari PWA — tidak perlu auth
const kirimMasukan = async (data: MasukanForm) => {
  const { error } = await supabase
    .from('masukan')
    .insert({
      tujuan: data.tujuan,
      rt_id: data.tujuan === 'rt' ? data.rt_id : null,
      kategori: data.kategori,
      isi: data.isi,
      // TIDAK ADA nama, NIK, no HP, atau identitas apapun
    })

  if (error) throw error
}
```

---

## 11. PWA — PORTAL WARGA

### Cara Akses
```
Link unik per RT (dibagikan via grup WA):
  mandingan.vercel.app/warga/rt/1   → Portal warga RT 001
  mandingan.vercel.app/warga/rt/6   → Portal warga RT 006
  mandingan.vercel.app/warga        → Portal umum (pilih RT)
```

### Halaman PWA (Next.js)
```
/warga/rt/[nomor]
  ├── Beranda        → Pengumuman terbaru + jadwal kegiatan
  ├── Pengumuman     → List semua pengumuman RT + dukuh
  ├── Kegiatan       → Kalender kegiatan
  ├── Program        → Daftar program yang sudah disetujui
  ├── Ajukan Surat   → Form pengajuan surat (nama + NIK + keperluan)
  ├── Laporan        → Form laporan kejadian
  ├── Masukan        → Form masukan anonim
  └── Darurat        → Tombol darurat + kontak penting
```

### Manifest PWA (agar bisa "install" ke homescreen)
```json
// public/manifest.json
{
  "name": "Padukuhan Mandingan",
  "short_name": "Mandingan",
  "description": "Portal Warga Padukuhan Mandingan",
  "start_url": "/warga",
  "display": "standalone",
  "background_color": "#F5F5F5",
  "theme_color": "#1B5E20",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### next.config.js untuk PWA
```javascript
// Gunakan package: next-pwa
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // config Next.js biasa
})
```

---

## 12. WEB APP — DASHBOARD DUKUH

### Halaman Prioritas (bangun urutan ini)
```
1. Login page
2. Dashboard utama (statistik + widget)
3. Halaman Kependudukan (list + detail warga)
4. Halaman PKK (laporan rekap)
5. Halaman Surat (list pengajuan + proses)
6. Halaman Program & Proposal
7. Halaman Pengumuman
8. Halaman Pengaturan (kontak darurat, template surat, kelola user)
```

### Layout Web
```
┌──────────────────────────────────────────────────┐
│  🏡 Padukuhan Mandingan        [Nama Dukuh] [→]  │  ← Topbar
├──────────┬───────────────────────────────────────┤
│          │                                       │
│  📊 Dashboard     │      KONTEN HALAMAN          │
│  👥 Kependudukan  │                              │
│  📋 PKK           │                              │
│  📄 Surat         │                              │
│  🏗️ Program       │                              │
│  📢 Pengumuman    │                              │
│  📅 Kegiatan      │                              │
│  🔒 Keamanan      │                              │
│  💬 Masukan       │                              │
│  ⚙️ Pengaturan    │                              │
│          │                                       │
└──────────┴───────────────────────────────────────┘
          Sidebar                 Main Content
```

---

## 13. NOTIFIKASI

### Mobile (Expo Notifications)
```typescript
// Daftarkan push token saat login
import * as Notifications from 'expo-notifications'

const daftarkanNotifikasi = async (userId: string) => {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Simpan token ke Supabase (buat tabel push_tokens jika perlu)
  await supabase.from('push_tokens').upsert({
    user_id: userId,
    token,
    platform: Platform.OS,
  })
}
```

### Jenis Notifikasi yang Dikirim
```
KETUA RT:
  - Surat pengajuan baru masuk (dari warga via PWA)
  - Proposal diupdate statusnya oleh dukuh
  - Pengumuman baru dari dukuh
  - Laporan kejadian masuk di wilayahnya

DUKUH:
  - Proposal baru masuk dari RT
  - Laporan kejadian dari semua RT
  - Masukan baru masuk

KADER:
  - Pengingat: "Laporan PKK bulan ini belum diisi"
    (kirim tanggal 25 tiap bulan jika belum ada data)
```

### Realtime dengan Supabase
```typescript
// Subscribe ke perubahan tabel surat_pengajuan untuk RT
const channel = supabase
  .channel('surat-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'surat_pengajuan',
      filter: `rt_id=eq.${rtId}`,
    },
    (payload) => {
      // Tampilkan notifikasi lokal
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pengajuan Surat Baru',
          body: 'Ada warga yang mengajukan surat',
        },
        trigger: null,
      })
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['surat'] })
    }
  )
  .subscribe()

// PENTING: Unsubscribe saat komponen unmount
return () => { supabase.removeChannel(channel) }
```

---

## 14. GENERATE PDF

### Laporan PKK (Web — @react-pdf/renderer)
```typescript
// Gunakan @react-pdf/renderer di Next.js untuk laporan kompleks
// Karena bisa generate PDF dengan tabel terformat rapi

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const LaporanRekapPadukuhan = ({ data, tahun }: Props) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>REKAPITULASI DATA DAN KEGIATAN WARGA</Text>
        <Text>PADUKUHAN MANDINGAN · TAHUN {tahun}</Text>
      </View>

      <View style={styles.table}>
        {/* Header tabel */}
        <View style={styles.tableRow}>
          <Text style={styles.colNo}>NO</Text>
          <Text style={styles.colRT}>RT</Text>
          <Text style={styles.colDW}>JML DW</Text>
          {/* ... kolom lainnya */}
        </View>

        {/* Data per RT */}
        {data.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colNo}>{i + 1}</Text>
            <Text style={styles.colRT}>{String(row.nomor_rt).padStart(3, '0')}</Text>
            {/* ... */}
          </View>
        ))}
      </View>
    </Page>
  </Document>
)
```

---

## 15. MIGRASI SQLITE

### Script Migrasi (Python)
```python
# migration_script.py
# Jalankan SEKALI SAJA setelah schema Supabase siap

import sqlite3
import json
from supabase import create_client
from datetime import datetime

SQLITE_PATH = './database_backup_20260430.sqlite'
SUPABASE_URL = 'https://xxx.supabase.co'
SUPABASE_KEY = 'service_role_key'  # Gunakan service role, bukan anon key

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
conn = sqlite3.connect(SQLITE_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# ─── Helper ───────────────────────────────────────────────

def parse_tanggal(tanggal_str):
    """Parse DD/MM/YYYY ke DATE yang bisa diterima Supabase"""
    if not tanggal_str:
        return None
    try:
        return datetime.strptime(tanggal_str, '%d/%m/%Y').date().isoformat()
    except:
        return None

def normalize_jenis_kelamin(jk_str):
    if jk_str in ('Laki-laki', 'L', 'l', 'laki-laki'):
        return 'L'
    return 'P'

def normalize_status_perkawinan(status):
    mapping = {
        'KAWIN': 'kawin',
        'BELUM KAWIN': 'belum_kawin',
        'CERAI HIDUP': 'cerai_hidup',
        'CERAI MATI': 'cerai_mati',
    }
    return mapping.get(status.upper(), 'belum_kawin')

def normalize_status_keluarga(status):
    mapping = {
        'KEPALA KELUARGA': 'kepala_keluarga',
        'ISTRI': 'istri',
        'ANAK': 'anak',
        'MENANTU': 'menantu',
        'CUCU': 'cucu',
        'ORANG TUA': 'orang_tua',
        'MERTUA': 'mertua',
        'LAINNYA': 'lainnya',
    }
    return mapping.get(status.upper(), 'lainnya')

# ─── Ambil mapping RT dan Dasawisma ───────────────────────

rt_map = {}  # nomor_rt → id
res = supabase.table('rts').select('id, nomor_rt').execute()
for rt in res.data:
    rt_map[rt['nomor_rt']] = rt['id']

dasawisma_map = {}  # nama_dasawisma → id
res = supabase.table('dasawismas').select('id, nama_dasawisma').execute()
for dw in res.data:
    dasawisma_map[dw['nama_dasawisma']] = dw['id']

# ─── Migrasi Keluarga → rumah_tanggas ─────────────────────

print('Migrasi rumah tangga...')
cur.execute('SELECT * FROM keluarga')  # sesuaikan nama tabel di SQLite
for row in cur.fetchall():
    rt_id = rt_map.get(row['rt_nomor'])
    if not rt_id:
        print(f'  SKIP: RT tidak ditemukan untuk KK {row["no_kk"]}')
        continue

    supabase.table('rumah_tanggas').upsert({
        'rt_id': rt_id,
        'dasawisma_id': dasawisma_map.get(row.get('dasawisma')),
        'no_kk': row['no_kk'],
        'nama_kepala_keluarga': row['nama_kepala_keluarga'],
        'no_reg': row.get('no_reg'),
        'makanan_pokok': 'beras',
        'memiliki_jamban': bool(row.get('ada_jamban', 0)),
        'jumlah_jamban': row.get('jumlah_jamban', 0),
        'sumber_air': 'pdam' if 'PDAM' in str(row.get('sumber_air', '')).upper() else 'sumur',
        'memiliki_tempat_sampah': bool(row.get('ada_tempat_sampah', 0)),
        'memiliki_spal': bool(row.get('ada_spal', 0)),
        'menempel_stiker_p4k': bool(row.get('stiker_p4k', 0)),
        'kriteria_rumah': 'sehat_layak_huni',
        'aktivitas_up2k': bool(row.get('up2k', 0)),
    }).execute()

print('  ✓ Selesai')

# ─── Migrasi Anggota → wargas ─────────────────────────────

print('Migrasi warga...')

# Ambil semua rumah_tanggas (butuh id untuk foreign key)
rt_kk_map = {}  # no_kk → id di rumah_tanggas
res = supabase.table('rumah_tanggas').select('id, no_kk, rt_id, dasawisma_id').execute()
for kk in res.data:
    rt_kk_map[kk['no_kk']] = kk

cur.execute('SELECT * FROM anggota')
batch = []
for row in cur.fetchall():
    kk_data = rt_kk_map.get(row['no_kk'])
    if not kk_data:
        continue

    warga = {
        'rumah_tangga_id': kk_data['id'],
        'rt_id': kk_data['rt_id'],
        'dasawisma_id': kk_data['dasawisma_id'],
        'no_reg': row.get('no_reg'),
        'nik': row.get('nik') or None,
        'nama_lengkap': row['nama'].strip().upper(),
        'tempat_lahir': row.get('tempat_lahir') or None,
        'tanggal_lahir': parse_tanggal(row.get('tanggal_lahir')),
        'jenis_kelamin': normalize_jenis_kelamin(row.get('jenis_kelamin', 'L')),
        'agama': row.get('agama') or None,        # NULL jika kosong
        'pendidikan': row.get('pendidikan') or None,  # NULL jika kosong
        'pekerjaan': row.get('pekerjaan') or None,
        'status_perkawinan': normalize_status_perkawinan(row.get('status_perkawinan', '')),
        'status_dalam_keluarga': normalize_status_keluarga(row.get('status_keluarga', '')),
        'status_warga': 'aktif',
    }
    batch.append(warga)

    # Insert per batch 100 agar tidak timeout
    if len(batch) >= 100:
        supabase.table('wargas').insert(batch).execute()
        batch = []
        print('  ... 100 warga dimigrasi')

if batch:
    supabase.table('wargas').insert(batch).execute()

print(f'  ✓ Selesai')

# ─── Validasi ──────────────────────────────────────────────

res = supabase.table('wargas').select('*', count='exact').execute()
print(f'\nValidasi:')
print(f'  Total warga di Supabase : {res.count}')
print(f'  (Ekspektasi: ±1250)')

res = supabase.table('rumah_tanggas').select('*', count='exact').execute()
print(f'  Total KK di Supabase    : {res.count}')
print(f'  (Ekspektasi: ±424)')

conn.close()
print('\nMigrasi selesai!')
```

---

## 16. CHECKLIST DEVELOPMENT

### Fase 1 — Fondasi (SELESAIKAN INI DULU)
```
□ Setup Supabase project (gunakan project Posyandu yang sudah ada)
□ Jalankan DATABASE_SCHEMA.sql di SQL Editor
□ Jalankan migration_script.py untuk migrasi data SQLite
□ Validasi data migrasi (jumlah warga, KK, RT)
□ Setup Expo project (mobile)
□ Setup Next.js project (web)
□ Konfigurasi environment variables
□ Implementasi Supabase client (mobile & web)
□ Implementasi auth store (Zustand)
□ Implementasi login screen
□ Implementasi auth middleware (route protection)
□ Implementasi bottom tab navigator dengan role-based tabs
□ Implementasi layout web (sidebar)
```

### Fase 2 — Modul Utama
```
□ Modul 1: List warga (dengan search & filter)
□ Modul 1: Detail warga
□ Modul 1: Form tambah/edit warga
□ Modul 1: List KK + detail KK
□ Modul 1: Mutasi penduduk
□ Modul 2: Input partisipasi PKK
□ Modul 2: Rekap laporan PKK
□ Modul 3: List pengajuan surat
□ Modul 3: Proses surat (approve/tolak)
□ Modul 3: Generate nomor surat (atomic counter)
□ Modul 3: Generate PDF surat
□ Modul 4: List proposal + detail
□ Modul 4: Form ajukan proposal (RT)
□ Modul 4: Review proposal (dukuh)
□ Modul 5: List + detail pengumuman
□ Modul 5: Buat pengumuman (dengan sekat RT)
□ Modul 8: Dashboard statistik
□ Modul 8: Widget posyandu (integrasi view)
```

### Fase 3 — PWA & Fitur Sekunder
```
□ Setup PWA manifest di Next.js
□ Halaman beranda PWA per RT
□ Halaman pengumuman PWA
□ Halaman kegiatan PWA
□ Form pengajuan surat PWA (tanpa login)
□ Form laporan kejadian PWA
□ Form masukan anonim PWA
□ Halaman darurat + kontak WA
□ Modul 6: Kegiatan & agenda
□ Modul 7: Laporan kejadian (mobile)
□ Modul 7: Tamu pendatang
□ Modul 9: Masukan (view untuk RT & dukuh)
□ Generate PDF laporan PKK
□ Export laporan
□ Push notification
□ Realtime subscription
```

### Fase 4 — Polish & Deploy
```
□ Error boundary di semua screen utama
□ Offline handling (tampilkan pesan jika no internet)
□ Loading skeleton di semua list
□ Empty state di semua list
□ Konfirmasi dialog untuk semua aksi destruktif
□ Testing di Android (minimal)
□ Testing PWA di HP Android (Chrome)
□ Deploy Next.js ke Vercel
□ Build APK Expo untuk distribusi
□ Pengaturan sistem (kontak darurat, template surat)
□ Buat akun user untuk setiap RT dan kader
```

---

## VARIABEL ENVIRONMENT

### Mobile (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Web (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  (server only, jangan expose ke client)
```

---

## CATATAN PENTING UNTUK DEVELOPER

```
1. JANGAN pernah expose SUPABASE_SERVICE_ROLE_KEY ke client/browser
2. SELALU gunakan RLS — jangan bypass dengan service role di client
3. SELALU validasi input dengan Zod sebelum kirim ke Supabase
4. JANGAN simpan NIK atau data sensitif di localStorage
5. SELALU test di Android fisik — emulator tidak akurat untuk Expo
6. GUNAKAN expo install bukan npm install untuk semua package di Expo
7. JANGAN hardcode nomor HP atau URL — simpan di tabel sistem_settings
8. Nama dasawisma di database HARUS cocok dengan nama di SQLite lama
   saat migrasi, atau migrasi akan gagal
9. Kolom agama dan pendidikan yang NULL adalah NORMAL, bukan error
10. View posyandu_ringkasan_rt HANYA bisa dipakai jika schema Posyandu
    ada di project Supabase yang sama
```

---

*Blueprint v1.0 — Sistem Padukuhan Mandingan*
*Disusun berdasarkan: spesifikasi fitur, database schema v1.1, dan data aktual padukuhan*
