import { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { Compass, Menu, X, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const NAV = [
  { to: '/about',    label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/resume',   label: 'Resume' },
  { to: '/contact',  label: 'Contact' },
]

export default function Layout() {
  const { isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-stone-500 hover:text-primary'}`

  return (
    <div className="min-h-dvh flex flex-col">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-[hsl(40_20%_97%/85%)] backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
            <Compass className="w-5 h-5 text-primary" />
            Ryan Frankel
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map(n => <NavLink key={n.to} to={n.to} className={linkCls}>{n.label}</NavLink>)}
            {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 text-stone-500 hover:text-stone-800 transition-colors"
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden border-t border-stone-200 bg-[hsl(40_20%_97%/96%)] backdrop-blur px-5 py-3 flex flex-col gap-1">
            {NAV.map(n => (
              <NavLink
                key={n.to} to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-primary bg-orange-50' : 'text-stone-800 hover:bg-stone-100'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-primary bg-orange-50' : 'text-stone-800 hover:bg-stone-100'}`
                }
              >Admin</NavLink>
            )}
          </div>
        )}
      </header>

      {/* ── Page ── */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 bg-white py-8 mt-12">
        <div className="mx-auto max-w-6xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Ryan Frankel. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
              >
                <Settings className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
