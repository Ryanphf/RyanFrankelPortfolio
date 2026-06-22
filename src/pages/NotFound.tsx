import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-32">
      <h1 className="text-8xl font-display font-bold text-stone-100 mb-4">404</h1>
      <p className="text-stone-500 mb-8">Page not found.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors">
        Go home
      </Link>
    </div>
  )
}
