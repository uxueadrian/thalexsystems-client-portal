import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  Building2,
  CreditCard,
  FileStack,
  FileText,
  FolderKanban,
  LifeBuoy,
  Pencil,
  Users,
} from 'lucide-react'
import { getClient, updateClient } from '../../services/clientesService'
import { useRole } from '../../hooks/useRole'
import { useToast } from '../../components/ui/Toast'
import { PERMISSIONS } from '../../constants/roles'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ClienteForm from './ClienteForm'

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const PLACEHOLDER_SECTIONS = [
  {
    key: 'usuarios',
    icon: Users,
    title: 'Usuarios asociados',
    description:
      'Personas con acceso al Portal vinculadas a este cliente. Se gestionan desde el módulo Usuarios.',
  },
  {
    key: 'proyectos',
    icon: FolderKanban,
    title: 'Proyectos',
    description: 'Proyectos contratados o en desarrollo para este cliente.',
  },
  {
    key: 'servicios',
    icon: Boxes,
    title: 'Servicios contratados',
    description: 'Servicios activos y suscripciones de THALEX Care asociadas al cliente.',
  },
  {
    key: 'pagos',
    icon: CreditCard,
    title: 'Pagos',
    description: 'Pagos realizados, comprobantes y validaciones.',
  },
  {
    key: 'facturas',
    icon: FileText,
    title: 'Facturas',
    description: 'Facturación asociada al cliente.',
  },
  {
    key: 'documentos',
    icon: FileStack,
    title: 'Documentos',
    description: 'Contratos, informes y entregables.',
  },
  {
    key: 'soporte',
    icon: LifeBuoy,
    title: 'Soporte',
    description: 'Solicitudes de soporte y atención al cliente.',
  },
]

export default function ClienteDetallePage() {
  const { id } = useParams()
  const { can } = useRole()
  const { showToast } = useToast()

  const canManage = can(PERMISSIONS.CLIENTS_MANAGE)

  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadClient = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getClient(id)
      setClient(data)
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el cliente.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadClient()
  }, [loadClient])

  async function handleUpdate(values) {
    await updateClient(id, values)
    setModalOpen(false)
    showToast('Cliente actualizado correctamente.', 'success')
    await loadClient()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={Building2}
          title="Cliente no encontrado"
          description={error || 'El cliente solicitado no existe o no tienes acceso.'}
          action={
            <Link to="/clientes">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver a clientes</span>
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Link
          to="/clientes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{client.nombre}</h1>
            <StatusBadge value={client.estado} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {client.empresa || 'Sin empresa registrada'}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setModalOpen(true)}>
            <Pencil className="h-4 w-4" />
            <span>Editar cliente</span>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Datos generales</h2>
          <dl className="mt-5 grid gap-6 sm:grid-cols-2">
            <InfoItem label="Nombre" value={client.nombre} />
            <InfoItem label="Empresa" value={client.empresa} />
            <InfoItem label="Contacto principal" value={client.contacto_nombre} />
            <InfoItem label="Correo" value={client.correo} />
            <InfoItem label="Teléfono" value={client.telefono} />
            <InfoItem label="Notas" value={client.notas} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-slate-900">Comercial</h2>
          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Estado</dt>
              <dd className="mt-1">
                <StatusBadge value={client.estado} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Origen</dt>
              <dd className="mt-1">
                <Badge tone="slate">{client.origen === 'web' ? 'Web' : 'Manual'}</Badge>
              </dd>
            </div>
            <InfoItem label="Creado el" value={formatDate(client.created_at)} />
            <InfoItem label="Última actualización" value={formatDate(client.updated_at)} />
          </dl>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">
          Módulos vinculados al cliente
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEHOLDER_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.key} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-500" />
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-500">{section.description}</p>
                <p className="mt-3 text-xs font-medium text-brand-600">
                  Disponible en próximas fases
                </p>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar cliente"
        description="Actualiza la información comercial del cliente."
      >
        <ClienteForm
          initial={client}
          onSubmit={handleUpdate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
