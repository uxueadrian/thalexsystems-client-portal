import { supabase } from '../config/supabase'
import { getCarePlanById } from '../config/carePlans'

// Capa de datos del flujo de contratación de THALEX Care.
//
// Dos caminos, separados por la sesión del Portal:
//  - Nuevo interesado (sin sesión): solo se registra un lead y se notifica a
//    THALEX. NO se crea usuario, cliente, perfil ni servicio. La evaluación
//    comercial/técnica ocurre antes y el acceso se habilita manualmente.
//  - Cliente existente (con sesión): se sube el comprobante de pago a Storage
//    (RLS del bucket permite al CLIENT subir a su propia carpeta) y se
//    notifica a THALEX. El servicio queda en `pendiente_activacion` hasta la
//    revisión manual del OWNER/ADMIN. No hay tabla de solicitudes aún: la
//    notificación + el comprobante en Storage son el registro.

const WHATSAPP_NUMBER = '7772597109'
const THALEX_EMAIL = 'thalexsystems@gmail.com'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-email`

function planSummary(plan) {
  if (!plan) return 'THALEX Care'
  return `${plan.periodicidad} · ${plan.moneda} ${plan.precio.toLocaleString('es-MX')} (referencia)`
}

async function notifyThalex(payload) {
  try {
    await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('Error notifying THALEX:', err)
  }
}

export function buildWhatsAppUrl(planId) {
  const plan = getCarePlanById(planId)
  const message = plan
    ? `Hola, quiero contratar ${plan.name} para un sitio o sistema existente.`
    : 'Hola, quiero contratar THALEX Care.'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export function buildEmailUrl(planId) {
  const plan = getCarePlanById(planId)
  const subject = plan
    ? `Solicitud de evaluación - ${plan.name}`
    : 'Solicitud de evaluación - THALEX Care'
  return `mailto:${THALEX_EMAIL}?subject=${encodeURIComponent(subject)}`
}

// Nuevo interesado (sin sesión).
export async function submitCareLead({ nombre, correo, telefono, empresa, planId, descripcion }) {
  const plan = getCarePlanById(planId)
  const planName = plan ? plan.name : 'THALEX Care'

  const mensaje = [
    descripcion?.trim(),
    empresa?.trim() ? `Empresa: ${empresa.trim()}` : '',
    `Plan de interés: ${planName}`,
  ]
    .filter(Boolean)
    .join('\n')

  const leadData = {
    nombre,
    correo,
    telefono,
    servicio: `THALEX Care - ${planName}`,
    presupuesto: planSummary(plan),
    mensaje,
  }

  const { error } = await supabase.from('leads').insert([leadData])
  if (error) throw new Error(error.message)

  await notifyThalex(leadData)
  return leadData
}

// Cliente existente (con sesión). Devuelve la ruta del comprobante subido.
// La identidad (usuario + perfil/cliente_id) SIEMPRE se obtiene desde la
// sesión Supabase dentro del servicio; el frontend nunca envía identidad ni
// cliente_id. El server (RLS del bucket) valida además que la ruta coincida
// con current_cliente_id() del usuario autenticado.
export async function submitCareRequest({ planId, proyecto, descripcion, comprobante }) {
  const plan = getCarePlanById(planId)
  if (!plan) throw new Error('El plan de THALEX Care no es reconocido.')

  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user
  if (!user) throw new Error('No hay sesión activa. Inicia sesión para continuar.')

  const { data: profile, error: profileError } = await supabase
    .from('perfiles')
    .select('id, cliente_id, nombre, telefono')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError) throw new Error('No se pudo verificar tu perfil.')

  if (!profile?.cliente_id) {
    throw new Error(
      'Tu perfil aún no tiene un cliente asociado. Contacta a THALEX para regularizar tu acceso.'
    )
  }

  const clienteId = profile.cliente_id

  let comprobantePath = null
  if (comprobante) {
    const safeName = comprobante.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    comprobantePath = `${clienteId}/${crypto.randomUUID()}/comprobante-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('comprobantes')
      .upload(comprobantePath, comprobante, {
        contentType: comprobante.type || 'application/octet-stream',
        upsert: false,
      })
    if (uploadError) throw new Error('No se pudo subir el comprobante de pago.')
  }

  const lines = [
    `Solicitud de contratación: ${plan.name}`,
    `Cliente: ${profile.nombre || user.email}`,
    proyecto?.trim() ? `Proyecto / referencia: ${proyecto.trim()}` : '',
    descripcion?.trim() ? `Descripción:\n${descripcion.trim()}` : '',
    comprobantePath
      ? `Comprobante de pago subido: ${comprobantePath}`
      : 'Sin comprobante adjunto en esta solicitud.',
    'Estado esperado: pendiente de revisión y activación por THALEX.',
  ]

  const payload = {
    nombre: profile.nombre || user.email,
    correo: user.email,
    telefono: profile.telefono || '',
    servicio: `THALEX Care - ${plan.name}`,
    presupuesto: planSummary(plan),
    mensaje: lines.filter(Boolean).join('\n'),
  }

  await notifyThalex(payload)
  return { comprobantePath }
}
