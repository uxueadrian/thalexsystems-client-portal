import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
        🔒
      </span>
      <h1 className="text-xl font-bold text-slate-900">Acceso denegado</h1>
      <p className="max-w-md text-sm text-slate-500">
        Tu rol no tiene los permisos necesarios para acceder a esta sección. Si crees
        que esto es un error, contacta al administrador del sistema.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  )
}
