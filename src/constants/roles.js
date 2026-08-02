// ============================================================================
// RBAC / ACL — Catálogo de permisos y matriz por rol
// ----------------------------------------------------------------------------
// Los componentes y rutas validan PERMISOS, nunca nombres de rol.
// Nuevos cargos se agregan como entradas en ROLE_PERMISSIONS sin tocar la app.
// ============================================================================

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  CLIENT: 'client',
}

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'OWNER',
  [ROLES.ADMIN]: 'ADMIN',
  [ROLES.SUPERVISOR]: 'SUPERVISOR',
  [ROLES.CLIENT]: 'CLIENT',
}

// La BD v3 usa el enum 'monitor'; el negocio lo llama SUPERVISOR.
export const ROLE_ALIASES = {
  owner: ROLES.OWNER,
  admin: ROLES.ADMIN,
  supervisor: ROLES.SUPERVISOR,
  monitor: ROLES.SUPERVISOR,
  client: ROLES.CLIENT,
}

export function normalizeRole(raw) {
  if (!raw) return null
  return ROLE_ALIASES[String(raw).toLowerCase()] ?? null
}

// ---------------------------------------------------------------------------
// Catálogo de permisos (module.action)
// ---------------------------------------------------------------------------
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PROFILE_VIEW: 'profile.view',
  PROFILE_UPDATE: 'profile.update',

  CLIENTS_VIEW: 'clients.view',
  CLIENTS_MANAGE: 'clients.manage',
  CLIENTS_VIEW_ASSIGNED: 'clients.view_assigned',

  LEADS_VIEW: 'leads.view',
  LEADS_MANAGE: 'leads.manage',

  QUOTES_VIEW: 'quotes.view',
  QUOTES_MANAGE: 'quotes.manage',

  SERVICES_VIEW: 'services.view',
  SERVICES_MANAGE: 'services.manage',
  SERVICES_VIEW_OWN: 'services.view_own',

  PROJECTS_VIEW: 'projects.view',
  PROJECTS_MANAGE: 'projects.manage',
  PROJECTS_VIEW_ASSIGNED: 'projects.view_assigned',
  PROJECTS_VIEW_OWN: 'projects.view_own',

  TASKS_VIEW: 'tasks.view',
  TASKS_MANAGE: 'tasks.manage',
  TASKS_UPDATE_ASSIGNED: 'tasks.update_assigned',

  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',
  PAYMENTS_VIEW_OWN: 'payments.view_own',

  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_MANAGE: 'documents.manage',
  DOCUMENTS_VIEW_OWN: 'documents.view_own',

  SUPPORT_VIEW: 'support.view',
  SUPPORT_MANAGE: 'support.manage',
  SUPPORT_VIEW_ASSIGNED: 'support.view_assigned',
  SUPPORT_VIEW_OWN: 'support.view_own',

  REPORTS_VIEW: 'reports.view',

  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',

  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',

  SETTINGS_VIEW: 'settings.view',
  SETTINGS_GLOBAL: 'settings.global',
  SECURITY_MANAGE: 'security.manage',

  INFRASTRUCTURE_VIEW: 'infrastructure.view',
  INFRASTRUCTURE_MANAGE: 'infrastructure.manage',

  AUTOMATIONS_VIEW: 'automations.view',
  AUTOMATIONS_MANAGE: 'automations.manage',

  AI_VIEW: 'ai.view',
  HOSTING_VIEW: 'hosting.view',
}

// ---------------------------------------------------------------------------
// Matriz roles → permisos
// ---------------------------------------------------------------------------
const ALL = ['*']

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ALL,

  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_MANAGE,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_MANAGE,
    PERMISSIONS.QUOTES_VIEW,
    PERMISSIONS.QUOTES_MANAGE,
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.SERVICES_MANAGE,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_MANAGE,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_MANAGE,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
  ],

  [ROLES.SUPERVISOR]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.CLIENTS_VIEW_ASSIGNED,
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.PROJECTS_VIEW_ASSIGNED,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_UPDATE_ASSIGNED,
    PERMISSIONS.SUPPORT_VIEW_ASSIGNED,
  ],

  [ROLES.CLIENT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.SERVICES_VIEW_OWN,
    PERMISSIONS.PROJECTS_VIEW_OWN,
    PERMISSIONS.PAYMENTS_VIEW_OWN,
    PERMISSIONS.DOCUMENTS_VIEW_OWN,
    PERMISSIONS.SUPPORT_VIEW_OWN,
  ],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function hasPermission(role, permission, matrix = ROLE_PERMISSIONS) {
  const perms = matrix[role]
  if (!perms) return false
  if (perms.includes('*')) return true
  return perms.includes(permission)
}

export function hasAnyPermission(role, permissions, matrix = ROLE_PERMISSIONS) {
  if (!Array.isArray(permissions) || permissions.length === 0) return false
  return permissions.some((p) => hasPermission(role, p, matrix))
}
