import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function AdminLogin() {
  const { login, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  useEffect(() => {
    if (!loading && isAdmin) navigate('/admin')
  }, [isAdmin, loading, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-display font-bold">Admin Access</h2>
          <p className="text-sm text-stone-500 mt-1">Sign in to manage portfolio content.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 border border-stone-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-stone-400 text-center mt-5">
          Enable Email/Password in Firebase Authentication, then create a user in the Firebase Console.
        </p>
      </div>
    </div>
  )
}
