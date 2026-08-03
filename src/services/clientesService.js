import { supabase } from '../config/supabase'

// Capa de datos del módulo Clientes.
//
// Se usa PostgREST directo (sin Edge Function): la política RLS
// `clientes_admin_all` habilita CRUD administrativo completo para
// OWNER/ADMIN vía la sesión del Portal. La identidad se obtiene siempre
// desde la sesión Supabase; el frontend nunca envía id de usuario ni
// cliente_id inventados.

const SELECT_FIELDS =
  'id, nombre, empresa, contacto_nombre, correo, telefono, origen, estado, notas, created_at, updated_at, created_by'

async function currentUserId() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.user?.id ?? null
}

export async function listClients() {
  const { data, error } = await supabase
    .from('clientes')
    .select(SELECT_FIELDS)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getClient(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select(SELECT_FIELDS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function createClient({ nombre, empresa, contacto_nombre, correo, telefono, notas, estado }) {
  const payload = {
    nombre,
    empresa,
    contacto_nombre,
    correo,
    telefono,
    notas,
    estado,
    origen: 'manual',
    created_by: await currentUserId(),
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert([payload])
    .select(SELECT_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateClient(id, { nombre, empresa, contacto_nombre, correo, telefono, notas, estado }) {
  const payload = { nombre, empresa, contacto_nombre, correo, telefono, notas, estado }

  const { data, error } = await supabase
    .from('clientes')
    .update(payload)
    .eq('id', id)
    .select(SELECT_FIELDS)
    .single()

  if (error) throw new Error(error.message)
  return data
}
