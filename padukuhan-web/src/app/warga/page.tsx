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
    <div className="space-y-6 pb-20">
      <header className="py-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal Warga</h1>
        <p className="mt-1 text-slate-500">Layanan publik Padukuhan Mandingan.</p>
      </header>

      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-6 text-white shadow-lg shadow-green-200">
        <h2 className="text-lg font-bold">Informasi RT</h2>
        <p className="mt-2 text-sm text-green-50 opacity-90">
          Akses informasi spesifik lingkungan Anda dengan memilih RT.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((rt) => (
            <Link 
              key={rt}
              href={`/warga/rt/${rt}`}
              className="flex items-center justify-center rounded-lg bg-white/20 py-2 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              RT {rt}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all active:scale-95"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              {item.icon}
            </div>
            <span className="text-sm font-bold text-slate-800 text-center">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
        <Users className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-2 text-xs text-slate-400">
          Butuh bantuan? Hubungi Ketua RT setempat atau gunakan layanan Darurat.
        </p>
      </div>
    </div>
  )
}
