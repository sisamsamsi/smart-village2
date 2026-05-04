'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  href: string
  icon: ReactNode
  label: string
}

export default function SidebarNav({ items }: { items: { href: string, icon: ReactNode, label: string, category?: string }[] }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1.5 px-4">
      {items.map((item, idx) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        
        return (
          <div key={item.href}>
            {item.category && (
              <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                {item.category}
              </div>
            )}
            <Link 
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              )}
            >
              <span className={cn(
                "transition-colors duration-300",
                isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
              )}>
                {item.icon}
              </span>
              <span className={cn(
                "text-sm font-bold tracking-tight",
                isActive ? "text-white" : "group-hover:text-slate-900 dark:group-hover:text-slate-100"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-white rounded-r-full" />
              )}
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
