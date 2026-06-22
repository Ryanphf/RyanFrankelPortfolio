import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, Plus, Edit2, Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProjects, useDeleteProject, useUploadResume, useDeleteResume, useResumeMeta } from '@/lib/queries'

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const { data: resume } = useResumeMeta()
  const deleteProject  = useDeleteProject()
  const uploadResume   = useUploadResume()
  const deleteResumeMut = useDeleteResume()
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login')
  }, [isAdmin, loading, navigate])

  const sorted = [...(projects ?? [])].sort((a, b) => {
    const ao = a.order ?? Infinity, bo = b.order ?? Infinity
    if (ao !== bo) return ao - bo
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteProject.mutate(id)
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { alert('Please upload a PDF.'); return }
    if (file.size > 5 * 1024 * 1024) { alert('PDF must be under 5 MB.'); return }
    await uploadResume.mutateAsync(file)
    e.target.value = ''
  }

  if (loading || !isAdmin) return (
    <div className="min-h-[60vh] flex items-center justify-center text-stone-400 animate-pulse">Checking credentials…</div>
  )

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-display font-bold">
            <ShieldAlert className="w-7 h-7 text-primary" /> System Administration
          </h1>
          <p className="text-stone-500 mt-1.5">Manage your portfolio content.</p>
        </div>
        <Link
          to="/admin/project/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Project
        </Link>
      </div>

      {/* Resume section */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Resume PDF</p>
            <p className="text-sm text-stone-500 mt-0.5">
              {resume?.url
                ? `Uploaded — last updated ${new Date(resume.updatedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`
                : 'No resume uploaded yet.'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-stone-200 bg-white text-sm font-semibold hover:bg-stone-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadResume.isPending ? 'Uploading…' : 'Upload PDF'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleResumeUpload} />
            {resume?.url && (
              <button
                onClick={() => confirm('Remove the uploaded resume?') && deleteResumeMut.mutate()}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide text-stone-400">Project</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide text-stone-400">Category</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide text-stone-400">Featured</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide text-stone-400">Order</th>
              <th className="text-right px-5 py-3 font-semibold text-xs uppercase tracking-wide text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-stone-400 animate-pulse">Loading…</td></tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-stone-400">No projects yet. Add one above.</td></tr>
            ) : sorted.map(p => (
              <tr key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                <td className="px-5 py-4 font-medium">{p.title}</td>
                <td className="px-5 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-stone-200 text-stone-500 rounded">{p.category}</span>
                </td>
                <td className="px-5 py-4">
                  {p.featured
                    ? <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 bg-stone-100 text-stone-600 rounded">Yes</span>
                    : <span className="text-stone-300">—</span>}
                </td>
                <td className="px-5 py-4">{p.order ?? <span className="text-stone-300">—</span>}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/admin/project/${p.id}/edit`}
                      className="p-2 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-2 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
