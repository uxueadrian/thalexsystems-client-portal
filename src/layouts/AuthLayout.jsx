export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
            T
          </span>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight text-white">
              THALEX Portal
            </h1>
            <p className="text-sm text-slate-400">
              Plataforma para clientes y equipo interno
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
