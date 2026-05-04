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
    <nav className="space-y-1 px-4">
      {items.map((item, idx) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        
        return (
          <div key={item.href}>
            {item.category && (
              <div className="pt-4 pb-1.5 px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {item.category}
              </div>
            )}
            <Link 
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2 rounded-md px-3 py-2 h-9 transition-all duration-150",
                isActive 
                  ? "bg-accent text-primary font-medium" 
                  : "text-secondary-foreground font-normal hover:bg-secondary"
              )}
            >
              <span className={cn(
                "transition-colors duration-150",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.icon}
              </span>
              <span className="text-sm">
                {item.label}
              </span>
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
