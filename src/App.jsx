import { AuthProvider } from './context/AuthContext'
import { RoleProvider } from './context/RoleContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </AuthProvider>
  )
}
