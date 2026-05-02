'use client'

import { useState } from 'react'
import { useSuratList, useUpdateSuratStatus } from '@/hooks/useSurat'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Plus, 
  FileText, 
  ChevronRight, 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox
} from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SuratDashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const isDukuh = useAuthStore((s) => s.isDukuh)
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  
  // Use profile?.rt_id only if ketua_rt
  const rtFilter = isKetuaRT() ? (profile?.rt_id || undefined) : undefined
  const { data: pengajuan, isLoading } = useSuratList(rtFilter)

  if (!profile) return null

  const canAccessList = isDukuh() || isKetuaRT()

  if (!canAccessList) {
    return (
      <div className="p-6 md:p-8">
        <Card className="border-rose-100 bg-rose-50/30">
          <CardHeader>
            <CardTitle className="flex items-center text-rose-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              Akses Terbatas
            </CardTitle>
            <CardDescription className="text-rose-600">
              Halaman ini hanya dapat diakses oleh Ketua RT dan Dukuh untuk keperluan administrasi surat menyurat.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-slate-50/50 pb-12 dark:bg-slate-950/50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Administrasi Surat</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isDukuh() 
                ? 'Kelola seluruh permohonan surat warga se-Padukuhan Mandingan.' 
                : `Kelola permohonan surat warga di wilayah RT ${profile.rts?.nomor_rt || ''}.`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/surat/baru">
              <Button className="rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Buat Surat (RT)
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="semua" className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/50 p-1 backdrop-blur-md dark:bg-slate-900/50">
              <TabsTrigger value="semua" className="rounded-lg px-6">Semua</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg px-6">Antrean</TabsTrigger>
              <TabsTrigger value="selesai" className="rounded-lg px-6">Selesai</TabsTrigger>
            </TabsList>
            
            <div className="hidden items-center gap-2 sm:flex">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari NIK atau Nama..."
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-white/50 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/50"
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {['semua', 'pending', 'selesai'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/30 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-sm text-slate-500">Memuat data surat...</p>
                  </div>
                </div>
              ) : !pengajuan?.length ? (
                <EmptyState isKetuaRT={isKetuaRT()} />
              ) : (
                <div className="grid gap-4 md:grid-cols-1">
                  {pengajuan
                    .filter(item => tab === 'semua' || item.status === tab)
                    .map((item) => (
                      <SuratCard key={item.id} item={item} />
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

function SuratCard({ item }: { item: any }) {
  return (
    <Card className="group relative overflow-hidden border-slate-200 bg-white/70 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col p-5 sm:flex-row sm:items-center sm:gap-6">
        {/* Type Icon */}
        <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 sm:mb-0">
          <FileText className="h-7 w-7" />
        </div>

        {/* Main Info */}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold capitalize text-slate-900 dark:text-white">
              {item.jenis_surat.replace('_', ' ')}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{item.wargas?.nama_lengkap}</span>
            <span className="flex items-center">
              <AlertCircle className="mr-1 h-3.5 w-3.5" />
              {item.wargas?.nik}
            </span>
            <span className="flex items-center">
              <Clock className="mr-1 h-3.5 w-3.5" />
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <p className="mt-2 line-clamp-1 text-sm italic text-slate-400">
            "{item.keperluan || 'Tanpa keterangan keperluan'}"
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between sm:mt-0">
          <div className="flex flex-col text-right sm:mr-6">
            <span className="text-xs font-semibold text-slate-400">NOMOR SURAT</span>
            <span className="text-sm font-mono font-medium text-slate-600 dark:text-slate-300">
              {item.nomor_surat || '— Belum ada —'}
            </span>
          </div>
          <Link href={`/surat/${item.id}`}>
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-900/30">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

function EmptyState({ isKetuaRT }: { isKetuaRT: boolean }) {
  return (
    <Card className="border-dashed border-slate-200 bg-white/30 py-16 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/30">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <Inbox className="h-8 w-8 text-slate-400" />
        </div>
        <CardTitle className="mb-2 text-xl font-bold text-slate-700 dark:text-slate-300">
          Tidak Ada Pengajuan
        </CardTitle>
        <CardDescription className="max-w-xs text-slate-500">
          {isKetuaRT 
            ? 'Belum ada warga yang mengajukan surat atau Anda belum membuat draf surat baru.' 
            : 'Belum ada data pengajuan surat masuk untuk diproses.'}
        </CardDescription>
        {isKetuaRT && (
          <Link href="/surat/baru" className="mt-6">
            <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50">
              Buat Surat Sekarang
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
          <Clock className="mr-1 h-3 w-3" /> Antrean
        </Badge>
      )
    case 'diproses':
      return (
        <Badge variant="secondary" className="border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Diproses
        </Badge>
      )
    case 'selesai':
      return (
        <Badge variant="secondary" className="border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Selesai
        </Badge>
      )
    case 'ditolak':
      return (
        <Badge variant="secondary" className="border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400">
          <XCircle className="mr-1 h-3 w-3" /> Ditolak
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
