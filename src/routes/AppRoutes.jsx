import { Navigate, Route, Routes } from 'react-router-dom'
import { MODULES } from '../constants/modules'
import { PERMISSIONS } from '../constants/roles'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import FullPageLoader from '../components/FullPageLoader'
import ComingSoon from '../components/layout/ComingSoon'
import LoginPage from '../pages/auth/LoginPage'
import CareContratarPage from '../pages/care/CareContratarPage'
import DashboardHome from '../pages/dashboard/DashboardHome'
import ProfilePage from '../pages/dashboard/ProfilePage'
import UsuariosPage from '../pages/users/UsuariosPage'
import ServiciosPage from '../pages/servicios/ServiciosPage'
import NotFoundPage from '../pages/errors/NotFoundPage'
import UnauthorizedPage from '../pages/errors/UnauthorizedPage'
import { useAuth } from '../hooks/useAuth'
import { useRole } from '../hooks/useRole'

function RootRedirect() {
  const { status } = useAuth()
  const { role } = useRole()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'unauthenticated' || !role) return <Navigate to="/login" replace />
  return <Navigate to="/dashboard" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        }
      />

      <Route path="/care/contratar" element={<CareContratarPage />} />

      <Route path="/" element={<RootRedirect />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute permission={PERMISSIONS.PROFILE_VIEW}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute permissions={MODULES.find((m) => m.path === '/usuarios').permissions}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/servicios"
          element={
            <ProtectedRoute permissions={MODULES.find((m) => m.path === '/servicios').permissions}>
              <ServiciosPage />
            </ProtectedRoute>
          }
        />

        {MODULES.filter((m) => m.path !== '/usuarios' && m.path !== '/servicios').map((module) => (
          <Route
            key={module.path}
            path={module.path}
            element={
              <ProtectedRoute permissions={module.permissions}>
                <ComingSoon title={module.label} description={module.description} />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
