import { supabase } from '../config/supabase'

// Capa de datos del módulo Usuarios. Todas las operaciones pasan por la
// Edge Function `usuarios-portal` (service role): el email vive en auth.users
// (no expuesto por PostgREST) y la escritura de rol + claim debe ser atómica.
const FUNCTION_NAME = 'usuarios-portal'

async function invoke(action, payload) {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: { action, ...payload },
  })
  if (error) {
    throw new Error(data?.error || error.message || 'Error al conectar con el servicio.')
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export function listUsers() {
  return invoke('listar', {})
}

export function createUser({ email, nombre, telefono, rol, cliente_id }) {
  return invoke('crear', { email, nombre, telefono, rol, cliente_id })
}

export function updateUser({ id, nombre, telefono, rol, cliente_id }) {
  return invoke('actualizar', { id, nombre, telefono, rol, cliente_id })
}
