import { useAuth } from '../../hooks/useAuth'
import { useRole } from '../../hooks/useRole'
import { ROLE_LABELS } from '../../constants/roles'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/layout/PageHeader'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const { role } = useRole()

  const fields = [
    { label: 'Nombre', value: profile?.nombre || '—' },
    { label: 'Correo', value: user?.email || '—' },
    { label: 'Teléfono', value: profile?.telefono || '—' },
    { label: 'Rol', value: role ? ROLE_LABELS[role] : '—' },
    { label: 'Cliente', value: profile?.cliente_id || '—' },
  ]

  return (
    <>
      <PageHeader title="Mi perfil" description="Información de tu cuenta en el ecosistema." />
      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {(profile?.nombre || user?.email || 'U')[0].toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {profile?.nombre || 'Usuario'}
            </p>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
          {role && <Badge tone="brand">{ROLE_LABELS[role]}</Badge>}
        </div>

        <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between py-3">
              <dt className="text-sm text-slate-500">{field.label}</dt>
              <dd className="max-w-[60%] truncate text-sm font-medium text-slate-900">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </>
  )
}
