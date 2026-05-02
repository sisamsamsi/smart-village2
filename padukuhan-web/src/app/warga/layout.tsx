import type { ReactNode } from 'react'
import Link from 'next/link'

export default function WargaPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/warga" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
               <div className="h-4 w-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-black tracking-tighter">MANDINGAN</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Online</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
    </div>
  )
}
