import { LayoutDashboard, UserRound } from 'lucide-react'
import { MODULES } from './modules'
import { PERMISSIONS } from './roles'

const PRINCIPAL = [
  {
    path: '/dashboard',
    label: 'Inicio',
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    path: '/perfil',
    label: 'Mi perfil',
    icon: UserRound,
    permission: PERMISSIONS.PROFILE_VIEW,
  },
]

const SECTION_ORDER = ['Operación', 'Gestión', 'Ecosistema']

export const NAV_SECTIONS = [
  { label: 'Principal', items: PRINCIPAL },
  ...SECTION_ORDER.map((label) => ({
    label,
    items: MODULES.filter((m) => m.section === label).map((m) => ({
      path: m.path,
      label: m.label,
      icon: m.icon,
      permissions: m.permissions,
    })),
  })),
]
