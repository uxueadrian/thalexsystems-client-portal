import { Construction } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import PageHeader from './PageHeader'

export default function ComingSoon({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Construction className="h-7 w-7 text-amber-600" />
        </span>
        <Badge tone="amber">Próximamente</Badge>
        <p className="max-w-md text-sm text-slate-500">
          Este módulo forma parte de la fase de crecimiento del ecosistema. La base
          técnica del Portal ya está lista para construirlo sobre los permisos
          correspondientes.
        </p>
      </Card>
    </>
  )
}
