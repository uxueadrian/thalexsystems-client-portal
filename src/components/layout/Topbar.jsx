import { Menu, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { ROLE_LABELS } from '../../constants/roles'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

function initials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase()
  }
  return (email || 'U')[0].toUpperCase()
}

export default function Topbar({ onMenuClick }) {
  const { user, profile, signOut } = useAuth()
  const { role } = useRole()
  const navigate = useNavigate()

  const displayName = profile?.nombre || user?.user_metadata?.full_name || user?.email

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-900">Portal THALEX SYSTEMS</span>
      </div>

      <div className="flex items-center gap-3">
        {role && <Badge tone="brand">{ROLE_LABELS[role]}</Badge>}
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {initials(displayName, user?.email)}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-slate-900">{displayName || 'Usuario'}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  )
}
