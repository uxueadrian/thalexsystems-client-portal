import { useNavigate } from 'react-router-dom'
import { carePlans } from '../../config/carePlans'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

// Sección "Servicios" del Portal. Hoy expone el catálogo de THALEX Care.
// El botón "Contratar" navega a /care/contratar?plan=... — la MISMA ruta que
// usa la página oficial — de modo que ambos flujos terminan en la misma
// lógica de solicitud (confirmación, pago, comprobante, notificación y
// revisión manual por OWNER/ADMIN).
export default function ServiciosPage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Catálogo de servicios y contratación de THALEX Care."
      />

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="brand">THALEX Care</Badge>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Planes de mantenimiento continuo</h2>
            <p className="mt-1 text-sm text-slate-500">
              Contrata el plan que mantiene tu sitio o sistema actualizado, seguro y funcionando.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {carePlans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5"
            >
              <Badge tone={plan.id === 'care-pro' ? 'violet' : 'slate'}>{plan.tagline}</Badge>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.short}</p>

              <div className="mt-4 flex items-end gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${plan.precio.toLocaleString('es-MX')}
                </span>
                <span className="mb-1 text-sm text-slate-500">/{plan.periodicidad.toLowerCase()}</span>
              </div>
              <p className="text-xs text-slate-400">{plan.precioNota} · sujeto a evaluación</p>

              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                onClick={() => navigate(`/care/contratar?plan=${plan.id}`)}
              >
                Contratar
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-500">
          La contratación incluye confirmación del plan, pago, subida de comprobante y notificación a
          THALEX. La activación queda pendiente de la revisión de un OWNER/ADMIN.
        </p>
      </Card>
    </>
  )
}
