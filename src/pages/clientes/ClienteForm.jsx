import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormField from '../../components/ui/FormField'

const ESTADO_OPTIONS = [
  { value: 'prospecto', label: 'Prospecto' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ClienteForm({ initial = null, onSubmit, onCancel }) {
  const editing = initial !== null

  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [empresa, setEmpresa] = useState(initial?.empresa ?? '')
  const [contactoNombre, setContactoNombre] = useState(initial?.contacto_nombre ?? '')
  const [correo, setCorreo] = useState(initial?.correo ?? '')
  const [telefono, setTelefono] = useState(initial?.telefono ?? '')
  const [notas, setNotas] = useState(initial?.notas ?? '')
  const [estado, setEstado] = useState(initial?.estado ?? 'prospecto')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre del cliente es obligatorio.')
      return
    }
    if (correo.trim() && !EMAIL_REGEX.test(correo.trim())) {
      setError('El correo electrónico no parece válido.')
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        nombre: nombre.trim(),
        empresa: empresa.trim() || null,
        contacto_nombre: contactoNombre.trim() || null,
        correo: correo.trim() || null,
        telefono: telefono.trim() || null,
        notas: notas.trim() || null,
        estado,
      })
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el cliente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre"
          placeholder="Despacho Contable XYZ"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Input
          label="Empresa"
          placeholder="Despacho Contable XYZ S.A. de C.V."
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Contacto principal"
          placeholder="Juan Pérez"
          value={contactoNombre}
          onChange={(e) => setContactoNombre(e.target.value)}
        />
        <Input
          label="Correo"
          type="email"
          placeholder="contacto@despacho.mx"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
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
          label="Estado"
          options={ESTADO_OPTIONS}
          placeholder="Selecciona un estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        />
      </div>

      <FormField label="Notas" hint="Información adicional comercial (opcional).">
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          placeholder="Contexto, acuerdos, referencias…"
          className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </FormField>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {editing ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  )
}
