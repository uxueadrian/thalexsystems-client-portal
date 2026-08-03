import { cn } from '../../utils/cn'

// Tabla de datos genérica basada en columnas.
// columns: [{ key, header, className, headerClassName, render(row) }]
// onRowClick: función opcional al hacer clic en una fila (fila clicable).
export default function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  onRowClick,
  empty = 'Sin registros.',
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">{empty}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            {columns.map((col) => (
              <th key={col.key} className={cn('pb-3 pr-4 font-medium', col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(onRowClick && 'cursor-pointer transition-colors hover:bg-slate-50')}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('py-3 pr-4 align-top', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
