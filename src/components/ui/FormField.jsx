// Envoltorio genérico de campo de formulario. Sirve para componentes que no
// expongan label/hint/error por sí mismos (p. ej. un <textarea>).
export default function FormField({ label, hint, error, required, children }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
