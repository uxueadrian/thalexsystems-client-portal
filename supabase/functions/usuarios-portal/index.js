import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const VALID_ROLES = ['owner', 'admin', 'monitor', 'client']

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const values = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(values, (v) => chars[v % chars.length]).join('')
}

async function getCaller(req) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

async function getCallerRole(userId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data.rol
}

function isManagerRole(rol) {
  return rol === 'owner' || rol === 'admin'
}

async function listarUsuarios() {
  const { data: perfiles, error: perfilesError } = await supabase
    .from('perfiles')
    .select('id, cliente_id, nombre, telefono, rol, created_at')
    .order('created_at', { ascending: false })

  if (perfilesError) throw perfilesError

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) throw authError

  const perfilesByUserId = new Map(perfiles.map((p) => [p.id, p]))

  const users = authUsers.users.map((u) => {
    const perfil = perfilesByUserId.get(u.id)
    return {
      id: u.id,
      email: u.email,
      email_confirmed: u.email_confirmed_at != null,
      nombre: perfil?.nombre ?? u.user_metadata?.nombre ?? null,
      telefono: perfil?.telefono ?? u.user_metadata?.telefono ?? null,
      rol: perfil?.rol ?? u.app_metadata?.rol ?? null,
      cliente_id: perfil?.cliente_id ?? null,
      created_at: perfil?.created_at ?? u.created_at,
    }
  })

  users.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))

  return { users }
}

async function crearUsuario(body) {
  const { email, nombre, telefono, rol, cliente_id } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new JsonError('El correo es obligatorio y debe ser válido.', 400)
  }
  if (!nombre || typeof nombre !== 'string') {
    throw new JsonError('El nombre es obligatorio.', 400)
  }
  if (!VALID_ROLES.includes(rol)) {
    throw new JsonError(`El rol debe ser uno de: ${VALID_ROLES.join(', ')}.`, 400)
  }

  const password = generatePassword()

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, telefono: telefono ?? null },
    app_metadata: { rol },
  })

  if (createError) {
    throw new JsonError(`No se pudo crear el usuario: ${createError.message}`, 400)
  }

  const { error: perfilError } = await supabase.from('perfiles').insert({
    id: created.user.id,
    cliente_id: cliente_id || null,
    nombre,
    telefono: telefono ?? null,
    rol,
  })

  if (perfilError) {
    await supabase.auth.admin.deleteUser(created.user.id)
    throw new JsonError(`No se pudo crear el perfil del usuario: ${perfilError.message}`, 400)
  }

  return {
    user: {
      id: created.user.id,
      email: created.user.email,
      nombre,
      telefono: telefono ?? null,
      rol,
      cliente_id: cliente_id || null,
    },
    temporary_password: password,
  }
}

async function actualizarUsuario(body) {
  const { id, nombre, telefono, rol, cliente_id } = body

  if (!id || typeof id !== 'string') {
    throw new JsonError('El id del usuario es obligatorio.', 400)
  }
  if (!nombre || typeof nombre !== 'string') {
    throw new JsonError('El nombre es obligatorio.', 400)
  }
  if (!VALID_ROLES.includes(rol)) {
    throw new JsonError(`El rol debe ser uno de: ${VALID_ROLES.join(', ')}.`, 400)
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('id, rol')
    .eq('id', id)
    .maybeSingle()

  if (perfilError) throw perfilError
  if (!perfil) throw new JsonError('El usuario no tiene perfil.', 404)

  const { error: updateError } = await supabase
    .from('perfiles')
    .update({ nombre, telefono: telefono ?? null, rol, cliente_id: cliente_id || null })
    .eq('id', id)

  if (updateError) {
    throw new JsonError(`No se pudo actualizar el perfil: ${updateError.message}`, 400)
  }

  const rolChanged = perfil.rol !== rol

  if (rolChanged) {
    const { error: claimError } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { rol },
    })
    if (claimError) {
      throw new JsonError(`No se pudo sincronizar el rol: ${claimError.message}`, 400)
    }
  }

  const { error: metaError } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { nombre, telefono: telefono ?? null },
  })
  if (metaError) {
    throw new JsonError(`No se pudo actualizar los datos del usuario: ${metaError.message}`, 400)
  }

  return {
    user: { id, nombre, telefono: telefono ?? null, rol, cliente_id: cliente_id || null },
    rol_changed: rolChanged,
  }
}

class JsonError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const caller = await getCaller(req)
    if (!caller) throw new JsonError('No autorizado.', 401)

    // Fuente de verdad: perfiles.rol (negocio); fallback al claim del JWT
    // mientras no exista fila en perfiles (usuarios de validación).
    const callerRole = (await getCallerRole(caller.id)) ?? caller.app_metadata?.rol ?? null
    if (!isManagerRole(callerRole)) {
      throw new JsonError('No tienes permiso para gestionar usuarios.', 403)
    }

    const { action, ...body } = await req.json()

    switch (action) {
      case 'listar':
        return json(await listarUsuarios())

      case 'crear': {
        if (callerRole !== 'owner' && body.rol === 'owner') {
          throw new JsonError('Solo un OWNER puede crear usuarios OWNER.', 403)
        }
        return json(await crearUsuario(body))
      }

      case 'actualizar': {
        const { data: target, error: targetError } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', body.id)
          .maybeSingle()
        if (targetError) throw targetError

        if (callerRole !== 'owner') {
          const targetIsOwner = target?.rol === 'owner'
          if (targetIsOwner || body.rol === 'owner') {
            throw new JsonError('Solo un OWNER puede modificar usuarios OWNER.', 403)
          }
        }
        return json(await actualizarUsuario(body))
      }

      default:
        throw new JsonError(`Acción desconocida: ${action}`, 400)
    }
  } catch (err) {
    if (err instanceof JsonError) {
      return json({ error: err.message }, err.status)
    }
    console.error(err)
    return json({ error: 'Error interno del servidor.' }, 500)
  }
})
