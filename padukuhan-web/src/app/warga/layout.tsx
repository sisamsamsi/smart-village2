import type { ReactNode } from 'react'
import Link from 'next/link'

export default function WargaPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#212121]">
      <header className="border-b border-[#1B5E20]/20 bg-[#1B5E20] text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/warga" className="text-lg font-bold">
            Portal Warga
          </Link>
          <span className="text-sm text-white/90">Mandingan</span>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
    </div>
  )
}
