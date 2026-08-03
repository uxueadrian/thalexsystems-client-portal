import { AuthProvider } from './context/AuthContext'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './components/ui/Toast'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </RoleProvider>
    </AuthProvider>
  )
}
