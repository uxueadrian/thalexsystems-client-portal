import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRole } from '../hooks/useRole'
import FullPageLoader from './FullPageLoader'

/**
 * Guard por autenticación y por permisos.
 * - Sin `permission` ni `permissions`: solo exige sesión activa.
 * - Con `permission`: exige ese permiso exacto.
 * - Con `permissions`: exige al menos uno de la lista.
 * Redirige a /login o /unauthorized según el caso.
 */
export default function ProtectedRoute({ permission, permissions, children }) {
  const { status } = useAuth()
  const { can, canAny } = useRole()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const hasAccess = permission
    ? can(permission)
    : permissions
      ? canAny(permissions)
      : true

  if (!hasAccess) return <Navigate to="/unauthorized" replace />

  return children
}
