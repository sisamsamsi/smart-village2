'use client'

import { useProposals } from '@/hooks/useProgram'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Construction, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  LayoutTemplate,
  Users as UsersIcon,
  HeartPulse,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'

export default function WargaProgramPage() {
  // Public PWA view usually doesn't have filters, showing all relevant programs
  const { data: proposals, isLoading } = useProposals()

  // Filter for public view: approved, executing, or finished
  const publicProposals = proposals?.filter(p => 
    ['disetujui', 'dilaksanakan', 'selesai'].includes(p.status) || p.tampil_publik
  )

  return (
    <div className="pb-24">
      {/* Header Section */}
      <div className="bg-emerald-600 px-6 pt-12 pb-20 text-white rounded-b-[3rem] shadow-xl">
        <div className="flex items-center gap-3 mb-4 opacity-80">
          <Construction className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Pembangunan</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-tight mb-2">
          Program & <br/>Pembangunan
        </h1>
        <p className="text-emerald-100 text-sm leading-relaxed max-w-xs">
          Pantau progres pembangunan dan realisasi usulan di Padukuhan Mandingan.
        </p>
      </div>

      {/* Content Section */}
      <div className="px-6 -mt-10 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : publicProposals?.length === 0 ? (
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900">Belum Ada Program</h3>
            <p className="text-slate-500 text-xs mt-2">Daftar program pembangunan akan muncul di sini setelah disetujui.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {publicProposals?.map((item) => (
              <ProposalCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="px-6 mt-8">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex gap-4">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900">Ingin Mengusulkan?</h4>
            <p className="text-[11px] text-blue-700 leading-relaxed mt-1">
              Punya ide pembangunan? Sampaikan usulan Anda melalui musyawarah RT masing-masing untuk diajukan secara resmi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalCard({ item }: { item: any }) {
  return (
    <Card className="group border-none shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="rounded-full bg-slate-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
            {item.jenis_program}
          </Badge>
          <StatusBadge status={item.status} />
        </div>
        
        <h3 className="text-lg font-black text-slate-900 leading-tight mb-3">
          {item.nama_program}
        </h3>
        
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {item.deskripsi}
        </p>

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
          <div className="flex items-center text-[11px] text-slate-600 font-medium">
            <MapPin className="mr-2 h-3.5 w-3.5 text-emerald-500" />
            {item.lokasi || 'Mandingan'}
          </div>
          <div className="flex items-center justify-between mt-1">
             <div className="flex items-center text-[11px] text-slate-600 font-medium">
              <Calendar className="mr-2 h-3.5 w-3.5 text-blue-500" />
              Estimasi: {item.tahun_dilaksanakan || item.tahun_diusulkan}
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1 rounded-full">
                RT {item.rts?.nomor_rt}
              </div>
              <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                {item.sumber_usulan === 'inisiatif_dukuh' ? 'Inisiatif Dukuh' : item.sumber_usulan === 'pemerintah' ? 'Instruksi Pemerintah' : 'Usulan RT'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'diusulkan':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Clock className="mr-1 h-3 w-3" /> USULAN</Badge>
    case 'disetujui':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-1 rounded-full text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" /> DISETUJUI</Badge>
    case 'dilaksanakan':
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-1 rounded-full text-[10px]"><Construction className="mr-1 h-3 w-3" /> JALAN</Badge>
    case 'selesai':
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-2.5 py-1 rounded-full text-[10px]"><CheckCircle2 className="mr-1 h-3 w-3" /> SELESAI</Badge>
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}
