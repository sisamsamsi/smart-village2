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
  Inbox,
  Hash
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
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-emerald-600 shadow-2xl shadow-emerald-600/30 text-white">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Administrasi Surat</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
              {isDukuh() 
                ? 'Layanan Mandingan Sejahtera' 
                : `Wilayah RT ${profile.rts?.nomor_rt || ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/surat/baru">
            <Button className="h-14 px-8 rounded-2xl font-black bg-emerald-600 shadow-xl shadow-emerald-600/20 transition-transform hover:scale-105 active:scale-95 hover:bg-emerald-700">
              <Plus className="mr-2 h-5 w-5" />
              Buat Surat (RT)
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="semua" className="w-full space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 dark:bg-slate-900">
            <TabsTrigger value="semua" className="rounded-xl px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Semua</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Antrean</TabsTrigger>
            <TabsTrigger value="selesai" className="rounded-xl px-8 h-full font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Selesai</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari NIK atau Nama..."
                className="h-14 w-full rounded-2xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500/50 pl-12 pr-4 text-sm font-medium"
              />
            </div>
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {['semua', 'pending', 'selesai'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0 outline-none">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sinkronisasi Data...</p>
                </div>
              </div>
            ) : !pengajuan?.length ? (
              <EmptyState isKetuaRT={isKetuaRT()} />
            ) : (
              <div className="grid gap-4">
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
  )
}

function SuratCard({ item }: { item: any }) {
  return (
    <Card className="group relative overflow-hidden border-none shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-emerald-200/30 hover:ring-emerald-200/50 rounded-3xl bg-white">
      <div className="flex flex-col p-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Type Icon */}
        <div className="mb-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-emerald-50 text-emerald-600 transition-all group-hover:scale-110 group-hover:rotate-3 sm:mb-0">
          <FileText className="h-10 w-10" />
        </div>

        {/* Main Info */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-black capitalize text-slate-900 group-hover:text-emerald-600 transition-colors">
              {item.jenis_surat.replace(/_/g, ' ')}
            </h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="text-slate-900">{item.wargas?.nama_lengkap}</span>
            <span className="flex items-center gap-1.5">
              <Hash size={14} className="text-slate-300" />
              {item.wargas?.nik}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-300" />
              {new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <p className="mt-3 line-clamp-1 text-sm font-medium text-slate-500 italic">
            "{item.keperluan || 'Tanpa keterangan keperluan'}"
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-6 sm:mt-0 sm:border-none sm:pt-0">
          <div className="flex flex-col text-left sm:text-right sm:mr-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Nomor Surat</span>
            <span className="text-sm font-black text-slate-700">
              {item.nomor_surat || '— Draf —'}
            </span>
          </div>
          <Link href={`/surat/${item.id}`}>
            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all">
              <ChevronRight className="h-6 w-6" />
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
