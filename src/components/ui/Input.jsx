import { forwardRef, useId } from 'react'
import { cn } from '../../utils/cn'

const Input = forwardRef(function Input(
  { label, type = 'text', error, hint, className, id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id || autoId

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-900',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          error && 'border-red-400 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
})

export default Input
