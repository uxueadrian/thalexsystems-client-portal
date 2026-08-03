import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { createUser, listUsers, updateUser } from '../../services/usersService'
import { normalizeRole, PERMISSIONS, ROLE_LABELS, ROLES } from '../../constants/roles'
import { useRole } from '../../hooks/useRole'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import PageHeader from '../../components/layout/PageHeader'
import UsuarioForm from './UsuarioForm'

const ROLE_TONES = {
  [ROLES.OWNER]: 'red',
  [ROLES.ADMIN]: 'violet',
  [ROLES.SUPERVISOR]: 'amber',
  [ROLES.CLIENT]: 'brand',
}

function RoleBadge({ rol }) {
  const normalized = normalizeRole(rol)
  if (!normalized) return <Badge>Sin rol</Badge>
  return <Badge tone={ROLE_TONES[normalized]}>{ROLE_LABELS[normalized]}</Badge>
}

export default function UsuariosPage() {
  const { role, can } = useRole()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [tempPassword, setTempPassword] = useState(null)

  const isAdmin = role === ROLES.ADMIN
  const canManage = can(PERMISSIONS.USERS_MANAGE)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsers()
      setUsers(data.users ?? [])
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la lista de usuarios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        (u.nombre ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q)
    )
  }, [users, search])

  const canEditUser = (user) => canManage && !(isAdmin && user.rol === ROLES.OWNER)

  function openCreate() {
    setTempPassword(null)
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(user) {
    setTempPassword(null)
    setEditing(user)
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditing(null)
  }

  async function handleCreate(values) {
    const result = await createUser(values)
    setTempPassword(result.temporary_password)
    closeForm()
    await loadUsers()
  }

  async function handleUpdate(values) {
    await updateUser({ id: editing.id, ...values })
    closeForm()
    await loadUsers()
  }

  return (
    <>
      <PageHeader title="Usuarios" description="Usuarios del sistema y sus roles.">
        {canManage && !formOpen && (
          <Button onClick={openCreate}>
            <span>Nuevo usuario</span>
          </Button>
        )}
      </PageHeader>

      {tempPassword && (
        <Card className="mb-6 border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">Usuario creado</p>
          <p className="mt-1 text-sm text-amber-700">
            Contraseña temporal:{' '}
            <span className="font-mono font-semibold">{tempPassword}</span>
          </p>
          <p className="mt-1 text-xs text-amber-600">
            Entrégala al usuario de forma segura. Solo se muestra una vez.
          </p>
        </Card>
      )}

      {formOpen ? (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">
            {editing ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editing
              ? 'El rol se aplica al próximo inicio de sesión del usuario.'
              : 'El usuario podrá iniciar sesión con la contraseña temporal.'}
          </p>
          <div className="mt-6 max-w-2xl">
            <UsuarioForm
              initial={editing}
              isAdmin={isAdmin}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={closeForm}
            />
          </div>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <input
              type="search"
              placeholder="Buscar por nombre o correo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="shrink-0 text-sm text-slate-500">
              {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              {users.length === 0
                ? 'Aún no hay usuarios registrados.'
                : 'No se encontraron usuarios con ese criterio.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-3 pr-4 font-medium">Usuario</th>
                    <th className="pb-3 pr-4 font-medium">Rol</th>
                    <th className="pb-3 pr-4 font-medium">Cliente</th>
                    <th className="pb-3 pr-4 font-medium">Confirmado</th>
                    {canManage && <th className="pb-3 text-right font-medium">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                            {(user.nombre || user.email || '?')[0].toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {user.nombre || '—'}
                            </p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <RoleBadge rol={user.rol} />
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-slate-500">
                          {user.cliente_id ? user.cliente_id.slice(0, 8) : '—'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {user.email_confirmed ? (
                          <Badge tone="emerald">Sí</Badge>
                        ) : (
                          <Badge tone="amber">Pendiente</Badge>
                        )}
                      </td>
                      {canManage && (
                        <td className="py-3 text-right">
                          {canEditUser(user) ? (
                            <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                              <Pencil className="h-4 w-4" />
                              <span>Editar</span>
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </>
  )
}
