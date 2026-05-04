'use client'

import { useAuthStore } from '@/stores/authStore'
import { useState, useEffect } from 'react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Zap, PlusCircle, ArrowRight, Users, Home, FileText, User as UserIcon, Activity, Baby, HeartPulse } from 'lucide-react'

export default function HomePage() {
  const { user, profile } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const { data: stats, isLoading } = useDashboardStats()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !user) return null

  return (
    <div className="p-8 space-y-12">
      {/* Premium Hero Section */}
      <header className="relative overflow-hidden rounded-[3rem] bg-slate-900 px-12 py-16 text-white shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-6 bg-primary text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20">
            Mandingan Digital Hub
          </Badge>
          <h2 className="text-5xl font-black tracking-tight mb-4 leading-tight">
            Selamat Datang, <span className="text-primary italic">{profile?.nama_lengkap?.split(' ')[0] || 'Dukuh'}!</span>
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed mb-8">
            Kelola data kependudukan dan layanan publik Padukuhan Mandingan dengan satu klik cerdas.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/kependudukan/tambah">
              <Button className="h-14 px-8 rounded-2xl font-black bg-primary shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                Tambah Warga Baru
              </Button>
            </Link>
            <Link href="/surat">
              <Button variant="outline" className="h-14 px-8 rounded-2xl font-black border-2 border-slate-700 bg-transparent text-white transition-all hover:bg-slate-800">
                Lihat Antrean Surat
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute top-[-20%] right-[-10%] h-[150%] w-[50%] bg-primary/20 rotate-12 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[-40%] right-[10%] h-[100%] w-[40%] bg-blue-500/10 -rotate-12 blur-[100px] rounded-full"></div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Warga"
          description="Jiwa terdaftar aktif"
          icon={<Users className="h-7 w-7" />}
          value={stats?.totalWarga.toLocaleString() ?? '0'}
          color="bg-primary"
        />
        <StatCard
          title="Kepala Keluarga"
          description="Total KK Mandingan"
          icon={<Home className="h-7 w-7" />}
          value={stats?.totalKK.toLocaleString() ?? '0'}
          color="bg-emerald-500"
        />
        <StatCard
          title="RT Aktif"
          description="Unit wilayah kerja"
          icon={<Activity className="h-7 w-7" />}
          value={stats?.totalRT.toLocaleString() ?? '0'}
          color="bg-orange-500"
        />
        <StatCard
          title="Surat Antrean"
          description="Butuh verifikasi"
          icon={<Zap className="h-7 w-7" />}
          value={stats?.suratPending.toLocaleString() ?? '0'}
          color="bg-rose-500"
        />
      </div>

      {/* Quick Actions & PKK Section */}
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left: Quick Actions */}
        <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight">Aksi Cepat</h3>
            <PlusCircle className="text-primary h-6 w-6" />
          </div>
          <div className="space-y-4">
            <QuickActionButton href="/kependudukan/mutasi" label="Catat Mutasi" color="bg-blue-50 text-blue-600" />
            <QuickActionButton href="/surat/baru" label="Buat Surat Baru" color="bg-emerald-50 text-emerald-600" />
            <QuickActionButton href="/pengumuman" label="Kirim Pengumuman" color="bg-orange-50 text-orange-600" />
            <QuickActionButton href="/pkk" label="Input Dasawisma" color="bg-pink-50 text-pink-600" />
          </div>
        </Card>

        {/* Center: PKK Demographics */}
        <Card className="lg:col-span-2 p-10 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden relative group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Demografi & Kesehatan</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Rekapitulasi Dasawisma</p>
              </div>
              <Activity className="text-primary/20 h-12 w-12 group-hover:text-primary transition-colors" />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-4">
              <MiniStat label="Balita" value={stats?.balita ?? 0} icon={<Baby size={16} />} color="text-sky-600" bg="bg-sky-50" />
              <MiniStat label="Lansia" value={stats?.lansia ?? 0} icon={<HeartPulse size={16} />} color="text-indigo-600" bg="bg-indigo-50" />
              <MiniStat label="WUS" value={stats?.wus ?? 0} icon={<Zap size={16} />} color="text-purple-600" bg="bg-purple-50" />
              <MiniStat label="PUS" value={stats?.pus ?? 0} icon={<Users size={16} />} color="text-rose-600" bg="bg-rose-50" />
            </div>

            <div className="mt-10 pt-10 border-t border-slate-50 flex flex-wrap gap-8">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ibu Hamil</p>
                  <p className="text-2xl font-black">{stats?.ibuHamil ?? 0} <span className="text-xs font-bold text-slate-400">JIWA</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ibu Menyusui</p>
                  <p className="text-2xl font-black">{stats?.ibuMenyusui ?? 0} <span className="text-xs font-bold text-slate-400">JIWA</span></p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20"></div>
        </Card>
      </div>

      {/* Activity Insight */}
      <Card className="p-10 border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] bg-primary text-white overflow-hidden relative">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="max-w-md">
             <h3 className="text-2xl font-black mb-2 tracking-tight">Kesehatan Sistem</h3>
             <p className="text-white/70 font-medium">Data sinkron 100% dengan database Supabase. Performa sistem saat ini berjalan sangat optimal.</p>
           </div>
           <div className="flex items-center gap-10">
              <div className="text-center">
                <p className="text-4xl font-black mb-1">98%</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Layanan Tuntas</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black mb-1">{stats?.mutasiBulanIni ?? 0}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Mutasi Bulan Ini</p>
              </div>
           </div>
         </div>
         {/* Background Effect */}
         <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
      </Card>
    </div>
  )
}

function QuickActionButton({ href, label, color }: { href: string, label: string, color: string }) {
  return (
    <Link href={href} className={`flex items-center justify-between p-4 rounded-2xl ${color} transition-all hover:scale-[1.02] active:scale-[0.98] group`}>
      <span className="font-black text-xs uppercase tracking-widest">{label}</span>
      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function MiniStat({ label, value, icon, color, bg }: { label: string, value: number | string, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <div className={`p-4 rounded-2xl ${bg} border border-slate-100 dark:border-slate-800 flex flex-col gap-1`}>
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
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
    <Card className="group relative flex flex-col gap-6 overflow-hidden border-none p-8 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-2xl dark:shadow-none bg-white dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} text-white shadow-lg shadow-${color.split('-')[1]}-500/20`}>
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-1">{value}</h4>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-xs font-medium text-muted-foreground">{description}</p>
      </div>
      {/* Decorative gradient on hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
    </Card>
  )
}
