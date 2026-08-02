import { createContext, useCallback, useContext, useMemo } from 'react'
import { hasPermission, normalizeRole, ROLE_PERMISSIONS, ROLES } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'

export const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  const { user, profile, status } = useAuth()

  const role = useMemo(() => {
    if (status !== 'authenticated') return null
    const fromClaim = user?.app_metadata?.rol
    const fromProfile = profile?.rol
    return normalizeRole(fromClaim) || normalizeRole(fromProfile)
  }, [user, profile, status])

  const can = useCallback(
    (permission) => {
      if (!role || !permission) return false
      return hasPermission(role, permission, ROLE_PERMISSIONS)
    },
    [role]
  )

  const canAny = useCallback(
    (permissions) => {
      if (!Array.isArray(permissions) || permissions.length === 0) return false
      return permissions.some((p) => can(p))
    },
    [can]
  )

  const canAll = useCallback(
    (permissions) => {
      if (!Array.isArray(permissions) || permissions.length === 0) return false
      return permissions.every((p) => can(p))
    },
    [can]
  )

  const isInternal = useCallback(() => role != null && role !== ROLES.CLIENT, [role])
  const isClient = useCallback(() => role === ROLES.CLIENT, [role])

  const value = useMemo(
    () => ({ role, can, canAny, canAll, isInternal, isClient }),
    [role, can, canAny, canAll, isInternal, isClient]
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}
