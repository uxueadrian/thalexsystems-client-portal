import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, Pencil, Plus } from 'lucide-react'
import { createClient, listClients, updateClient } from '../../services/clientesService'
import { PERMISSIONS } from '../../constants/roles'
import { useRole } from '../../hooks/useRole'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import PageHeader from '../../components/layout/PageHeader'
import DataTable from '../../components/ui/DataTable'
import SearchBar from '../../components/ui/SearchBar'
import Select from '../../components/ui/Select'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ClienteForm from './ClienteForm'

const ESTADO_FILTER_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'prospecto', label: 'Prospecto' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ClientesPage() {
  const navigate = useNavigate()
  const { can } = useRole()
  const { showToast } = useToast()

  const canManage = can(PERMISSIONS.CLIENTS_MANAGE)

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const loadClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listClients()
      setClients(data)
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la lista de clientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      if (estadoFilter && c.estado !== estadoFilter) return false
      if (!q) return true
      return [c.nombre, c.empresa, c.contacto_nombre, c.correo, c.telefono]
        .some((field) => (field ?? '').toLowerCase().includes(q))
    })
  }, [clients, search, estadoFilter])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(client) {
    setEditing(client)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  async function handleCreate(values) {
    await createClient(values)
    closeModal()
    showToast('Cliente creado correctamente.', 'success')
    await loadClients()
  }

  async function handleUpdate(values) {
    await updateClient(editing.id, values)
    closeModal()
    showToast('Cliente actualizado correctamente.', 'success')
    await loadClients()
  }

  const columns = useMemo(
    () => [
      {
        key: 'nombre',
        header: 'Nombre',
        render: (c) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{c.nombre || '—'}</p>
            {c.empresa && <p className="truncate text-xs text-slate-500">{c.empresa}</p>}
          </div>
        ),
      },
      {
        key: 'empresa',
        header: 'Empresa',
        render: (c) => <span className="text-slate-600">{c.empresa || '—'}</span>,
      },
      {
        key: 'contacto_nombre',
        header: 'Contacto',
        render: (c) => <span className="text-slate-600">{c.contacto_nombre || '—'}</span>,
      },
      {
        key: 'correo',
        header: 'Correo',
        render: (c) => <span className="text-slate-600">{c.correo || '—'}</span>,
      },
      {
        key: 'telefono',
        header: 'Teléfono',
        render: (c) => <span className="text-slate-600">{c.telefono || '—'}</span>,
      },
      {
        key: 'estado',
        header: 'Estado',
        render: (c) => <StatusBadge value={c.estado} />,
      },
      {
        key: 'created_at',
        header: 'Fecha creación',
        render: (c) => <span className="text-slate-500">{formatDate(c.created_at)}</span>,
      },
      {
        key: 'actions',
        header: 'Acciones',
        headerClassName: 'text-right',
        className: 'text-right whitespace-nowrap',
        render: (c) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/clientes/${c.id}`)}>
              <Eye className="h-4 w-4" />
              <span>Ver</span>
            </Button>
            {canManage && (
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                <Pencil className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [navigate, canManage]
  )

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cartera de clientes del ecosistema THALEX."
      >
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span>Nuevo cliente</span>
          </Button>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, empresa, contacto, correo o teléfono…"
              className="sm:max-w-sm"
            />
            <div className="flex items-center gap-3">
              <Select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                options={ESTADO_FILTER_OPTIONS}
                className="w-48"
                aria-label="Filtrar por estado"
              />
              <p className="shrink-0 text-sm text-slate-500">
                {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Building2}
              title={
                clients.length === 0
                  ? 'Aún no hay clientes registrados.'
                  : 'No se encontraron clientes con esos criterios.'
              }
              description={
                clients.length === 0
                  ? 'Crea el primer cliente para comenzar a administrar tu cartera.'
                  : 'Ajusta la búsqueda o los filtros para ver más resultados.'
              }
            />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              rowKey="id"
              onRowClick={(c) => navigate(`/clientes/${c.id}`)}
            />
          )}
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
        description={
          editing
            ? 'Actualiza la información comercial del cliente.'
            : 'Registra un cliente y su información comercial. No se crea un usuario del Portal.'
        }
      >
        <ClienteForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
