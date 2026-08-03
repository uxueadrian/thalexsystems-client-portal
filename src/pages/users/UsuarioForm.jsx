import { useState } from 'react'
import { ROLES } from '../../constants/roles'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const ROLE_OPTIONS = [
  { value: ROLES.OWNER, label: 'OWNER' },
  { value: ROLES.ADMIN, label: 'ADMIN' },
  { value: 'monitor', label: 'SUPERVISOR' },
  { value: ROLES.CLIENT, label: 'CLIENT' },
]

export default function UsuarioForm({ initial = null, isAdmin, onSubmit, onCancel }) {
  const editing = initial !== null

  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [telefono, setTelefono] = useState(initial?.telefono ?? '')
  const [rol, setRol] = useState(initial?.rol ?? ROLES.CLIENT)
  const [clienteId, setClienteId] = useState(initial?.cliente_id ?? '')
  const [error, setError] = useState(null)

  const roleOptions = isAdmin ? ROLE_OPTIONS.filter((o) => o.value !== ROLES.OWNER) : ROLE_OPTIONS

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!editing && !email.trim()) {
      setError('El correo es obligatorio.')
      return
    }
    if (!rol) {
      setError('Selecciona un rol.')
      return
    }

    try {
      await onSubmit({
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || null,
        rol,
        cliente_id: clienteId.trim() || null,
      })
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el usuario.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="usuario@thalexsystems.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={editing}
          hint={editing ? 'El correo no se puede cambiar desde el portal.' : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Teléfono"
          placeholder="+52 ..."
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <Select
          label="Rol"
          options={roleOptions}
          placeholder="Selecciona un rol"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        />
      </div>

      <Input
        label="ID de cliente"
        placeholder="uuid del cliente (opcional)"
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
        hint="Obligatorio para roles CLIENT. Se podrá elegir del catálogo cuando exista el módulo Clientes."
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {editing ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  )
}
