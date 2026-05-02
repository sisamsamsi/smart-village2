'use client'

import { useState } from 'react'
import { useProposals } from '@/hooks/useProgram'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutTemplate, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Construction,
  Users as UsersIcon,
  HeartPulse,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

export default function ProgramPage() {
  const isKetuaRT = useAuthStore((s) => s.isKetuaRT)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { data: proposals, isLoading } = useProposals(
    filterStatus === 'all' ? undefined : { status: filterStatus }
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program & Pembangunan</h1>
          <p className="text-muted-foreground mt-1">
            {isKetuaRT() 
              ? 'Kelola usulan pembangunan dan pemberdayaan di wilayah Anda.' 
              : 'Daftar usulan pembangunan dari seluruh RT Padukuhan Mandingan.'}
          </p>
        </div>
        <Link href="/program/baru">
          <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-12 px-6">
            <Plus className="mr-2 h-5 w-5" />
            Buat Usulan Baru
          </Button>
        </Link>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Usulan" 
          value={proposals?.length || 0} 
          icon={<LayoutTemplate className="h-5 w-5 text-blue-600" />} 
          className="bg-blue-50/50 border-blue-100"
        />
        <StatCard 
          label="Menunggu" 
          value={proposals?.filter(p => p.status === 'diusulkan').length || 0} 
          icon={<Clock className="h-5 w-5 text-amber-600" />} 
          className="bg-amber-50/50 border-amber-100"
        />
        <StatCard 
          label="Disetujui" 
          value={proposals?.filter(p => ['disetujui', 'dilaksanakan'].includes(p.status)).length || 0} 
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} 
          className="bg-emerald-50/50 border-emerald-100"
        />
        <StatCard 
          label="Selesai" 
          value={proposals?.filter(p => p.status === 'selesai').length || 0} 
          icon={<Construction className="h-5 w-5 text-purple-600" />} 
          className="bg-purple-50/50 border-purple-100"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-4 rounded-3xl border border-slate-100 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama program..." 
            className="pl-10 h-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-emerald-500/20"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FilterButton active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>Semua</FilterButton>
          <FilterButton active={filterStatus === 'diusulkan'} onClick={() => setFilterStatus('diusulkan')}>Usulan</FilterButton>
          <FilterButton active={filterStatus === 'dikaji'} onClick={() => setFilterStatus('dikaji')}>Dikaji</FilterButton>
          <FilterButton active={filterStatus === 'disetujui'} onClick={() => setFilterStatus('disetujui')}>Disetujui</FilterButton>
          <FilterButton active={filterStatus === 'selesai'} onClick={() => setFilterStatus('selesai')}>Selesai</FilterButton>
        </div>
      </div>

      {/* Proposals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : proposals?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <LayoutTemplate className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Belum Ada Usulan</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Belum ada usulan program yang masuk {filterStatus !== 'all' && `dengan status ${filterStatus}`}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals?.map((item) => (
            <ProposalCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProposalCard({ item }: { item: any }) {
  const typeIcons = {
    infrastruktur: <Construction className="h-4 w-4" />,
    sosial: <UsersIcon className="h-4 w-4" />,
    kesehatan: <HeartPulse className="h-4 w-4" />,
    penerangan: <Lightbulb className="h-4 w-4" />,
    lainnya: <LayoutTemplate className="h-4 w-4" />
  }

  return (
    <Link href={`/program/${item.id}`}>
      <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md border border-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="rounded-full bg-slate-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
              {item.jenis_program}
            </Badge>
            <StatusBadge status={item.status} />
          </div>
          <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors leading-tight">
            {item.nama_program}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
            {item.deskripsi}
          </p>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-50">
            <div className="flex items-center text-xs text-slate-500">
              <MapPin className="mr-2 h-3.5 w-3.5 text-emerald-500" />
              {item.lokasi || 'Mandingan'}
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <Calendar className="mr-2 h-3.5 w-3.5 text-blue-500" />
              Tahun {item.tahun_diusulkan}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                  RT
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 leading-none">RT {item.rts?.nomor_rt}</span>
                  <span className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter mt-1">
                    {item.sumber_usulan === 'inisiatif_dukuh' ? 'Inisiatif Dukuh' : item.sumber_usulan === 'pemerintah' ? 'Instruksi Pemerintah' : 'Aspirasi RT/Warga'}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatCard({ label, value, icon, className }: any) {
  return (
    <div className={`p-4 rounded-3xl border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  )
}

function FilterButton({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
        active 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
          : 'bg-white text-slate-500 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'diusulkan':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Clock className="mr-1 h-3 w-3" /> USULAN</Badge>
    case 'dikaji':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Search className="mr-1 h-3 w-3" /> DIKAJI</Badge>
    case 'disetujui':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-1 rounded-full text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" /> DISETUJUI</Badge>
    case 'dilaksanakan':
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Construction className="mr-1 h-3 w-3" /> JALAN</Badge>
    case 'selesai':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-2.5 py-1 rounded-full text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" /> SELESAI</Badge>
    case 'ditolak':
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none px-2.5 py-1 rounded-full text-[10px]"><XCircle className="mr-1 h-3 w-3" /> DITOLAK</Badge>
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}
