import Badge from './Badge'

const ESTADO_CONFIG = {
  prospecto: { label: 'Prospecto', tone: 'amber' },
  activo: { label: 'Activo', tone: 'emerald' },
  inactivo: { label: 'Inactivo', tone: 'slate' },
}

export default function StatusBadge({ value }) {
  const config = ESTADO_CONFIG[value]
  if (!config) return <Badge tone="slate">{String(value ?? '—')}</Badge>
  return <Badge tone={config.tone}>{config.label}</Badge>
}
