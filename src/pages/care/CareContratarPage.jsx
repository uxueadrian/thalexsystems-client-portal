import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { carePlans, getCarePlanById } from '../../config/carePlans'
import { useAuth } from '../../hooks/useAuth'
import { submitCareLead, submitCareRequest, buildWhatsAppUrl, buildEmailUrl } from '../../services/careService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { cn } from '../../utils/cn'

// Página pública del flujo de contratación de THALEX Care. Llega desde la
// página oficial con ?plan= (p. ej. /care/contratar?plan=care-pro).
// Gate de sesión: si hay sesión activa -> flujo de cliente existente; si no ->
// flujo de nuevo interesado (contacto, sin creación automática de nada).

const fieldClass =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500'

export default function CareContratarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const planId = searchParams.get('plan') || ''
  const plan = getCarePlanById(planId)

  const { status } = useAuth()

  if (status === 'loading') {
    return <CareShell><div className="flex justify-center py-16"><Spinner size="lg" /></div></CareShell>
  }

  if (!plan) {
    return <CareShell><PlanPicker current={planId} onSelect={(id) => setSearchParams({ plan: id })} /></CareShell>
  }

  return (
    <CareShell>
      <PlanSummary plan={plan} onBack={() => setSearchParams({})} />
      {status === 'authenticated' ? <ClientCareView plan={plan} /> : <GuestCareView plan={plan} />}
    </CareShell>
  )
}

function CareShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            T
          </span>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-white">THALEX Care</h1>
            <p className="text-sm text-slate-400">Contratación de mantenimiento continuo</p>
          </div>
        </div>
        <div className="space-y-5">{children}</div>
        <p className="mt-8 text-center text-xs text-slate-500">
          ¿Prefieres volver?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300">
            Iniciar sesión
          </Link>
          {' · '}
          <a href="https://thalexsystems.com" className="text-brand-400 hover:text-brand-300">
            Página oficial
          </a>
        </p>
      </div>
    </div>
  )
}

function PlanPicker({ current, onSelect }) {
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-xl font-bold text-slate-900">Elige tu plan THALEX Care</h2>
      <p className="mt-1 text-sm text-slate-500">
        Selecciona el plan que quieres contratar. El precio es de referencia y queda sujeto a
        evaluación.
      </p>
      <div className="mt-6 space-y-3">
        {carePlans.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors',
              current === item.id
                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
            )}
          >
            <span>
              <span className="block font-semibold text-slate-900">{item.name}</span>
              <span className="block text-sm text-slate-500">{item.short}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-bold text-slate-900">
                ${item.precio.toLocaleString('es-MX')}
              </span>
              <span className="block text-xs text-slate-500">/{item.periodicidad.toLowerCase()}</span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function PlanSummary({ plan, onBack }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone="brand">{plan.tagline}</Badge>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{plan.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{plan.short}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold text-slate-900">
            ${plan.precio.toLocaleString('es-MX')}
          </p>
          <p className="text-xs text-slate-500">/{plan.periodicidad.toLowerCase()}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {plan.features.map((feature) => (
          <span key={feature} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
            {feature}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        ← Cambiar de plan
      </button>
    </Card>
  )
}

// Cliente existente: confirma, asocia referencia, sube comprobante y notifica.
function ClientCareView({ plan }) {
  const { user, profile } = useAuth()
  const [proyecto, setProyecto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [confirmado, setConfirmado] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorText, setErrorText] = useState('')
  const [result, setResult] = useState(null)

  const nombre = profile?.nombre || user?.email || ''

  async function handleSubmit(e) {
    e.preventDefault()
    if (!confirmado || !comprobante) return
    setStatus('loading')
    try {
      const res = await submitCareRequest({
        planId: plan.id,
        proyecto,
        descripcion,
        comprobante,
      })
      setResult(res)
      setStatus('success')
    } catch (err) {
      setErrorText(err.message || 'No se pudo enviar tu solicitud. Intenta nuevamente.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Card className="p-6 sm:p-8 text-center">
        <Badge tone="emerald">Solicitud enviada</Badge>
        <h2 className="mt-3 text-xl font-bold text-slate-900">¡Recibimos tu solicitud, {nombre.split(' ')[0]}!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Notificamos a THALEX y registramos tu{' '}
          {result?.comprobantePath ? 'comprobante de pago' : 'solicitud'}.
        </p>
        <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-5 text-left text-sm text-slate-600">
          <p className="font-semibold text-slate-800">¿Qué sigue?</p>
          <p>1. THALEX revisa tu solicitud y comprobante (1–3 días hábiles).</p>
          <p>2. THALEX activa el servicio y lo deja listo en tu Portal.</p>
          <p>3. El servicio queda en estado «pendiente de activación» hasta esa revisión.</p>
        </div>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus('idle')}>
          Enviar otra solicitud
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">Confirmar contratación</h2>
      <p className="mt-1 text-sm text-slate-500">
        Como ya tienes cuenta en THALEX Portal, solo falta tu confirmación y el comprobante de pago.
      </p>

      {!profile?.cliente_id && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Tu perfil aún no tiene un cliente asociado. Puedes enviar la solicitud igualmente; THALEX
          la revisará y regularizará tu acceso.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Proyecto / referencia (opcional)"
          placeholder="P. ej. Sistema de inventario, sitio corporativo…"
          value={proyecto}
          onChange={(e) => setProyecto(e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Descripción (opcional)
          </label>
          <textarea
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cuéntanos qué necesitas cubrir con este plan…"
            className={cn(fieldClass, 'resize-none')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Comprobante de pago (obligatorio)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setComprobante(e.target.files?.[0] || null)}
            className={cn(fieldClass, 'cursor-pointer')}
          />
          <p className="mt-1 text-xs text-slate-500">
            PDF, PNG o JPG. Se guarda en tu carpeta segura del Portal para la revisión de THALEX.
          </p>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={confirmado}
            onChange={(e) => setConfirmado(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <span>
            Confirmo que deseo contratar <strong>{plan.name}</strong> y entiendo que la activación
            depende de la revisión y aprobación de THALEX.
          </span>
        </label>

        <Button type="submit" loading={status === 'loading'} disabled={!confirmado || !comprobante} className="w-full">
          Enviar solicitud de contratación
        </Button>

        {status === 'error' && <p className="text-center text-sm text-red-600">{errorText}</p>}
      </form>
    </Card>
  )
}

// Nuevo interesado: flujo de contacto. No se crea cuenta automáticamente.
function GuestCareView({ plan }) {
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '', empresa: '', descripcion: '' })
  const [status, setStatus] = useState('idle')
  const [errorText, setErrorText] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.correo.trim()) return
    setStatus('loading')
    try {
      await submitCareLead({ ...form, planId: plan.id })
      setStatus('success')
    } catch (err) {
      setErrorText(err.message || 'No se pudo enviar tu solicitud. Intenta nuevamente.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Card className="p-6 sm:p-8 text-center">
        <Badge tone="emerald">Solicitud recibida</Badge>
        <h2 className="mt-3 text-xl font-bold text-slate-900">¡Gracias por tu interés!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Registramos tu solicitud y THALEX te contactará para una evaluación sin compromiso. Cuando
          esté aprobada, habilitaremos tu acceso al Portal.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus('idle')}>
          Enviar otra solicitud
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">Primero, una evaluación</h2>
      <p className="mt-1 text-sm text-slate-500">
        Aún no necesitas cuenta. Déjanos tus datos y THALEX evaluará tu caso; si avanzamos, te
        habilitamos tu acceso al Portal. Sin registros ni cargos por adelantado.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={buildWhatsAppUrl(plan.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
        >
          WhatsApp
        </a>
        <a
          href={buildEmailUrl(plan.id)}
          className="rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          Correo
        </a>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        o envía el formulario
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          name="nombre"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <Input
          label="Correo"
          type="email"
          name="correo"
          placeholder="tu@correo.com"
          value={form.correo}
          onChange={handleChange}
          required
        />
        <Input
          label="Teléfono"
          name="telefono"
          placeholder="+52 777 123 4567"
          value={form.telefono}
          onChange={handleChange}
        />
        <Input
          label="Empresa (opcional)"
          name="empresa"
          placeholder="Tu empresa"
          value={form.empresa}
          onChange={handleChange}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Descripción (opcional)
          </label>
          <textarea
            rows={3}
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="¿Qué sistema o sitio quieres mantener bajo este plan?"
            className={cn(fieldClass, 'resize-none')}
          />
        </div>
        <Button type="submit" loading={status === 'loading'} className="w-full">
          Solicitar evaluación
        </Button>
        {status === 'error' && <p className="text-center text-sm text-red-600">{errorText}</p>}
      </form>
    </Card>
  )
}
