import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  Search,
  Calculator,
  Star,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scanner', label: 'Scanner', icon: Search },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/history', label: 'Flip History', icon: History },
] as const

export function Sidebar() {
  return (
    <aside className="h-full w-56 bg-sidebar-background border-r border-sidebar-border">
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
