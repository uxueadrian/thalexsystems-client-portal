import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV_SECTIONS } from '../../constants/navigation'
import { useRole } from '../../hooks/useRole'
import { cn } from '../../utils/cn'

function itemVisible(item, can, canAny) {
  if (item.permission) return can(item.permission)
  if (item.permissions) return canAny(item.permissions)
  return true
}

export default function Sidebar({ open, onClose }) {
  const { can, canAny } = useRole()

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => itemVisible(item, can, canAny)),
  })).filter((section) => section.items.length > 0)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950 text-slate-300 transition-transform',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              T
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              THALEX SYSTEMS
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-brand-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          )
                        }
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {item.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4 text-[11px] text-slate-500">
          Portal · Fase 2
        </div>
      </aside>
    </>
  )
}
