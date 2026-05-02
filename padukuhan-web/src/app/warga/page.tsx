import Link from 'next/link'
import { Megaphone, Calendar, LayoutTemplate, FileText, AlertTriangle, MessageSquare, ShieldAlert, Users } from 'lucide-react'

const menuItems = [
  { href: '/warga/pengumuman', label: 'Pengumuman', icon: <Megaphone className="text-blue-500" /> },
  { href: '/warga/kegiatan', label: 'Kegiatan', icon: <Calendar className="text-orange-500" /> },
  { href: '/warga/program', label: 'Program', icon: <LayoutTemplate className="text-green-500" /> },
  { href: '/warga/surat', label: 'Ajukan Surat', icon: <FileText className="text-purple-500" /> },
  { href: '/warga/laporan', label: 'Laporan Kejadian', icon: <AlertTriangle className="text-yellow-500" /> },
  { href: '/warga/masukan', label: 'Masukan Anonim', icon: <MessageSquare className="text-cyan-500" /> },
  { href: '/warga/darurat', label: 'Darurat', icon: <ShieldAlert className="text-red-500" /> },
] as const

export default function WargaHomePage() {
  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">PORTAL<br/>WARGA</h1>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">Mandingan Village</p>
        </div>
        <div className="h-14 w-14 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20">
          <ShieldAlert className="h-7 w-7 text-primary" />
        </div>
      </header>

      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <h2 className="text-xl font-black tracking-tight mb-2">Informasi RT</h2>
          <p className="text-sm text-white/80 font-medium mb-6 leading-relaxed">
            Pilih unit RT Anda untuk mendapatkan informasi spesifik lingkungan.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((rt) => (
              <Link 
                key={rt}
                href={`/warga/rt/${rt}`}
                className="flex items-center justify-center rounded-2xl bg-white/20 py-3 text-sm font-black backdrop-blur-md transition-all hover:bg-white/30 active:scale-90 border border-white/10 shadow-sm"
              >
                RT {rt}
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-5 -left-5 h-20 w-20 bg-black/10 rounded-full blur-xl"></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col items-center justify-center rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100/50 transition-all active:scale-95 hover:shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 group-hover:bg-primary/5 transition-colors">
              {item.icon}
            </div>
            <span className="text-sm font-black text-slate-800 text-center tracking-tight leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-[2rem] bg-slate-50 p-8 text-center border border-slate-100">
        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Users className="h-6 w-6 text-slate-300" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pusat Bantuan</p>
        <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto">
          Butuh bantuan? Silakan hubungi pengurus RT Anda.
        </p>
      </div>
    </div>
  )
}
