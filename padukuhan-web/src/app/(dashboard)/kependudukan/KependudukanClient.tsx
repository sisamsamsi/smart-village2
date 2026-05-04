'use client'

import { useAuthStore } from '@/stores/authStore'
import { useWargasList } from '@/hooks/useWargasList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type RtsJoin = { nomor_rt: number } | { nomor_rt: number }[] | null

function nomorRtLabel(rts: RtsJoin): string {
  if (rts == null) return '—'
  if (Array.isArray(rts)) return String(rts[0]?.nomor_rt ?? '—')
  return String(rts.nomor_rt)
}

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Filter, MoreHorizontal, User } from 'lucide-react'

export function KependudukanClient() {
  const { data, isLoading, isError, error } = useWargasList()
  const profile = useAuthStore((s) => s.profile)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRt, setSelectedRt] = useState<string>('all')

  if (!profile) return <p className="text-muted-foreground">Memuat profil…</p>
  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  const filteredData = data?.filter(warga => {
    const matchesSearch = warga.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         warga.nik?.includes(searchTerm)
    const rtNum = nomorRtLabel(warga.rts as RtsJoin)
    const matchesRt = selectedRt === 'all' || rtNum === selectedRt
    return matchesSearch && matchesRt
  })

  const rtList = Array.from(new Set(data?.map(w => nomorRtLabel(w.rts as RtsJoin)) || [])).sort()

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary shadow-2xl shadow-primary/30 text-white">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Kependudukan</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">Padukuhan Mandingan</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/kependudukan/mutasi">
            <Button className="h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              Catat Mutasi
            </Button>
          </Link>
          <Link href="/kependudukan/tambah">
            <Button variant="outline" className="h-14 px-8 rounded-2xl font-black border-2 border-slate-200 transition-all hover:border-primary/30 hover:bg-primary/5">
              Tambah Warga
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Cari nama atau NIK..." 
            className="h-14 pl-12 rounded-2xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-primary/50 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full h-14 pl-12 pr-4 rounded-2xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/50 font-bold text-sm appearance-none cursor-pointer"
            value={selectedRt}
            onChange={(e) => setSelectedRt(e.target.value)}
          >
            <option value="all">Semua Wilayah RT</option>
            {rtList.map(rt => (
              <option key={rt} value={rt}>Wilayah RT {rt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
             Total: <span className="text-slate-900">{filteredData?.length ?? 0}</span> Warga
           </p>
        </div>
      </div>

      {/* Citizens List */}
      <div className="grid gap-4">
        {filteredData?.length === 0 ? (
          <div className="py-20 text-center rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Warga tidak ditemukan.</p>
          </div>
        ) : (
          filteredData?.map((row) => (
            <Link key={row.id} href={`/kependudukan/${row.id}`}>
              <Card className="group border-none shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:ring-primary/20 rounded-3xl overflow-hidden">
                <CardContent className="flex items-center gap-6 p-5">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xl group-hover:from-primary/10 group-hover:to-primary/20 group-hover:text-primary transition-all duration-500">
                      {row.nama_lengkap?.[0]}
                    </div>
                    {row.status_warga === 'aktif' && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white"></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">
                      {row.nama_lengkap}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">NIK: {row.nik ?? '—'}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">KK: {(row.rumah_tanggas as any)?.[0]?.no_kk ?? (row.rumah_tanggas as any)?.no_kk ?? '—'}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-3 pr-4">
                    <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-transparent group-hover:border-slate-200 transition-all">
                      RT {nomorRtLabel(row.rts as RtsJoin)}
                    </div>
                    <Badge className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-none shadow-none",
                      row.status_warga === 'aktif' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {row.status_warga ?? '—'}
                    </Badge>
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 group-hover:text-slate-900 transition-colors">
                       <MoreHorizontal size={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
