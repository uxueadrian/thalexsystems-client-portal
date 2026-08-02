import Spinner from './ui/Spinner'

export default function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Spinner size="lg" />
    </div>
  )
}
