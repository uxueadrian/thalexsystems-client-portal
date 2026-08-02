import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { MODULES } from '../../constants/modules'
import { ROLE_LABELS } from '../../constants/roles'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/layout/PageHeader'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardHome() {
  const { user, profile } = useAuth()
  const { role, canAny } = useRole()

  const displayName = profile?.nombre || user?.email
  const visibleModules = MODULES.filter((m) => canAny(m.permissions))

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${displayName || 'bienvenido'} 👋`}
        description="Este es tu espacio en el ecosistema THALEX SYSTEMS."
      >
        {role && <Badge tone="brand">{ROLE_LABELS[role]}</Badge>}
      </PageHeader>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">Accesos disponibles</h2>
          <p className="mt-1 text-sm text-slate-500">
            Módulos a los que tu rol tiene permiso. La interfaz y la navegación se
            ajustan automáticamente según tus permisos.
          </p>

          {visibleModules.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleModules.map((module) => {
                const Icon = module.icon
                return (
                  <Link
                    key={module.path}
                    to={module.path}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {module.label}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">No hay módulos habilitados para tu rol.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">Sesión</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Rol</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {role ? ROLE_LABELS[role] : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Correo</dt>
              <dd className="mt-1 truncate font-medium text-slate-900">{user?.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Nombre</dt>
              <dd className="mt-1 font-medium text-slate-900">{profile?.nombre || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Estado</dt>
              <dd className="mt-1">
                <Badge tone="emerald">Sesión activa</Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  )
}
