import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

export default function LoginPage() {
  const { status, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Ingresa tu correo y contraseña.')
      return
    }

    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      const from = location.state?.from || '/dashboard'
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err?.message?.includes('Invalid login credentials')
          ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
          : err?.message || 'No se pudo iniciar sesión. Intenta de nuevo.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-slate-900">Iniciar sesión</h2>
      <p className="mt-1 text-sm text-slate-500">
        Accede con tu cuenta THALEX Portal.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={submitting} disabled={submitting}>
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        La interfaz se adapta automáticamente según tu rol.
      </p>
    </Card>
  )
}
