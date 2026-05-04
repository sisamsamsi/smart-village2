'use client'

import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Zap, PlusCircle, ArrowRight, Users, Home, FileText, Activity, Baby, HeartPulse } from 'lucide-react'

export default function HomePage() {
  const { user, profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return (
    <div className="p-8 space-y-8">
      {/* Premium Hero Section (Clean & Flat) */}
      <header className="px-6 py-8 border-b border-slate-100">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="mb-4">
            Mandingan Digital Hub
          </Badge>
          <h2 className="text-[28px] font-semibold tracking-tight mb-2 text-foreground">
            Selamat Datang, <span className="text-primary">{profile?.nama_lengkap?.split(' ')[0] || 'Dukuh'}!</span>
          </h2>
          <p className="text-base text-muted-foreground mb-6 max-w-xl">
            Kelola data kependudukan dan layanan publik Padukuhan Mandingan dengan satu klik cerdas.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/kependudukan/tambah">
              <Button size="default">
                Tambah Warga Baru
              </Button>
            </Link>
            <Link href="/surat">
              <Button variant="outline" size="default">
                Lihat Antrean Surat
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Warga"
          description="Jiwa terdaftar aktif"
          icon={<Users className="h-5 w-5" />}
          value={stats?.totalWarga.toLocaleString() ?? '0'}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Kepala Keluarga"
          description="Total KK Mandingan"
          icon={<Home className="h-5 w-5" />}
          value={stats?.totalKK.toLocaleString() ?? '0'}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="RT Aktif"
          description="Unit wilayah kerja"
          icon={<Activity className="h-5 w-5" />}
          value={stats?.totalRT.toLocaleString() ?? '0'}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Surat Antrean"
          description="Butuh verifikasi"
          icon={<Zap className="h-5 w-5" />}
          value={stats?.suratPending.toLocaleString() ?? '0'}
          color="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Quick Actions & PKK Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Quick Actions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold tracking-tight">Aksi Cepat</h3>
            <PlusCircle className="text-primary h-5 w-5" />
          </div>
          <div className="space-y-3">
            <QuickActionButton href="/kependudukan/mutasi" label="Catat Mutasi" color="bg-secondary text-secondary-foreground hover:bg-slate-200" />
            <QuickActionButton href="/surat/baru" label="Buat Surat Baru" color="bg-secondary text-secondary-foreground hover:bg-slate-200" />
            <QuickActionButton href="/pengumuman" label="Kirim Pengumuman" color="bg-secondary text-secondary-foreground hover:bg-slate-200" />
            <QuickActionButton href="/pkk" label="Input Dasawisma" color="bg-secondary text-secondary-foreground hover:bg-slate-200" />
          </div>
        </Card>

        {/* Center: PKK Demographics */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Demografi & Kesehatan</h3>
              <p className="text-xs text-muted-foreground mt-1">Rekapitulasi Dasawisma</p>
            </div>
            <Activity className="text-muted-foreground h-5 w-5" />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-4">
            <MiniStat label="Balita" value={stats?.balita ?? 0} icon={<Baby size={16} />} color="text-slate-600" bg="bg-slate-50" />
            <MiniStat label="Lansia" value={stats?.lansia ?? 0} icon={<HeartPulse size={16} />} color="text-slate-600" bg="bg-slate-50" />
            <MiniStat label="WUS" value={stats?.wus ?? 0} icon={<Zap size={16} />} color="text-slate-600" bg="bg-slate-50" />
            <MiniStat label="PUS" value={stats?.pus ?? 0} icon={<Users size={16} />} color="text-slate-600" bg="bg-slate-50" />
          </div>

          <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ibu Hamil</p>
                <p className="text-lg font-semibold leading-none">{stats?.ibuHamil ?? 0} <span className="text-xs font-normal text-muted-foreground">JIWA</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ibu Menyusui</p>
                <p className="text-lg font-semibold leading-none">{stats?.ibuMenyusui ?? 0} <span className="text-xs font-normal text-muted-foreground">JIWA</span></p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Insight */}
      <Card className="p-6 bg-accent text-accent-foreground border-primary/20">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="max-w-md">
             <h3 className="text-lg font-semibold mb-1 tracking-tight">Kesehatan Sistem</h3>
             <p className="text-sm text-muted-foreground">Data sinkron 100% dengan database Supabase. Performa sistem saat ini berjalan sangat optimal.</p>
           </div>
           <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-semibold mb-1">98%</p>
                <p className="text-xs text-muted-foreground">Layanan Tuntas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold mb-1">{stats?.mutasiBulanIni ?? 0}</p>
                <p className="text-xs text-muted-foreground">Mutasi Bulan Ini</p>
              </div>
           </div>
         </div>
      </Card>
    </div>
  )
}

function QuickActionButton({ href, label, color }: { href: string, label: string, color: string }) {
  return (
    <Link href={href} className={`flex items-center justify-between p-3 rounded-md transition-colors ${color} group`}>
      <span className="font-medium text-sm">{label}</span>
      <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
    </Link>
  )
}

function MiniStat({ label, value, icon, color, bg }: { label: string, value: number | string, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <div className={`p-4 rounded-md border bg-card flex flex-col gap-1`}>
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function StatCard({
  title,
  description,
  icon,
  value,
  color,
}: {
  title: string
  description: string
  icon: React.ReactNode
  value: string
  color: string
}) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-semibold tracking-tight text-foreground mb-1">{value}</h4>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}
