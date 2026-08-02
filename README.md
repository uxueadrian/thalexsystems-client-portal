# THALEX Portal

Plataforma digital de THALEX SYSTEMS para clientes y equipo interno. Un único acceso con una experiencia personalizada según el tipo de usuario.

Frontend (SPA) de la Fase 2 del ecosistema: una sola app, un solo login, UI según rol y permisos RBAC/ACL.

## Plataforma

THALEX Portal integra dos áreas en una sola aplicación:

### 1. Portal de Clientes

- **Para usuarios `CLIENT`.**
- Espacio donde los clientes pueden consultar sus **servicios, proyectos, documentos, pagos** y la **comunicación** con THALEX SYSTEMS.

### 2. Panel de Gestión

- **Para usuarios internos** (`OWNER`, `ADMIN`, `SUPERVISOR`).
- Espacio donde el equipo interno administra la **operación** de THALEX SYSTEMS: clientes, leads, cotizaciones, proyectos, pagos, soporte y la administración del ecosistema.

> Un solo login, una sola aplicación. Cada usuario ve la interfaz correspondiente a su rol (RBAC/ACL).

## Stack

- **React 19** + **Vite 6** + **react-router-dom 7**
- **Tailwind CSS 3** (palette `brand` indigo, fuente Inter)
- **Supabase JS** (`@supabase/supabase-js`)
- **lucide-react** (iconos)

## Requisitos

- Node 20+ (probado con Node 24).
- PowerShell bloquea `npm.ps1` por Execution Policy: usar **`npm.cmd`**.
- Variables de entorno: copiar `.env.example` a `.env` con las credenciales del proyecto Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## Comandos

```bash
npm.cmd install
npm.cmd run dev      # servidor de desarrollo
npm.cmd run build    # build de producción (genera dist/)
npm.cmd run preview  # previsualiza el build
```

### Nota sobre el build local (Windows / Application Control)

Este entorno bloquea la carga de binarios nativos `.node` (política de Application Control), incluido el de Rollup. Por eso `package.json` fuerza Rollup al build WASM vía `overrides`:

```json
"overrides": { "rollup": "npm:@rollup/wasm-node@4.62.3" }
```

No tocar esta configuración salvo que el entorno lo permita de nuevo.

## Arquitectura

- **Login único** con Supabase Auth. El rol del usuario se lee del claim `app_metadata.rol` (sincronizado por un trigger de la BD); fallback a `perfiles.rol`.
- **RBAC/ACL**: los componentes validan **permisos** (`module.action`), nunca nombres de rol. Catálogo y matriz en `src/constants/roles.js`.
- **Roles**: `owner` | `admin` | `supervisor` | `client`. El rol `monitor` de la BD se normaliza a `supervisor` (`ROLE_ALIASES`).
- **Navegación por permisos**: sidebar y dashboard filtran módulos según los permisos del usuario (`src/constants/modules.js`, `src/constants/navigation.js`).
- **Guard** en rutas protegidas: `src/components/ProtectedRoute.jsx` (autenticación + permiso requerido).

## Estructura

```
src/
├── config/supabase.js        # cliente Supabase
├── constants/                # roles.js (RBAC/ACL), modules.js, navigation.js
├── context/                  # AuthContext, RoleContext
├── hooks/                    # useAuth, useRole
├── services/                 # authService
├── layouts/                  # DashboardLayout, AuthLayout
├── components/
│   ├── ui/                   # Button, Input, Card, Badge, Spinner
│   ├── layout/               # Sidebar, Topbar, PageHeader, ComingSoon
│   ├── ProtectedRoute.jsx
│   └── FullPageLoader.jsx
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── dashboard/            # DashboardHome, ProfilePage
│   └── errors/               # NotFound, Unauthorized
├── routes/AppRoutes.jsx
├── App.jsx
└── main.jsx
```

## Estado

Fase 2 — **base técnica**. Los módulos de negocio (cotizaciones, pagos, care, automations, proyectos) aparecen como placeholders "Próximamente" y se desarrollarán en fases posteriores respetando el Business Core (`thalexsystems`).

## Repositorio

`https://github.com/uxueadrian/thalexsystems-client-portal`
