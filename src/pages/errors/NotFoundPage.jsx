import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-4 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="text-xl font-bold text-slate-900">Página no encontrada</h1>
      <p className="max-w-md text-sm text-slate-500">
        La ruta que buscas no existe o ya no está disponible.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  )
}
