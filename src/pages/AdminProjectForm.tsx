import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProject, useCreateProject, useUpdateProject } from '@/lib/queries'
import type { ProjectInput } from '@/lib/db'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function AdminProjectForm() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'new'
  const { isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  const { data: existing } = useProject(isNew ? '' : (id ?? ''))
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const initialized = useRef(false)

  const [form, setForm] = useState({
    title: '', category: '', description: '', longDescription: '',
    tags: '', imageUrl: '', githubUrl: '', liveUrl: '', order: '', featured: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { if (!loading && !isAdmin) navigate('/admin/login') }, [isAdmin, loading, navigate])

  useEffect(() => {
    if (existing && !initialized.current) {
      initialized.current = true
      setForm({
        title:           existing.title,
        category:        existing.category,
        description:     existing.description,
        longDescription: existing.longDescription ?? '',
        tags:            existing.tags.join(', '),
        imageUrl:        existing.imageUrl ?? '',
        githubUrl:       existing.githubUrl ?? '',
        liveUrl:         existing.liveUrl ?? '',
        order:           existing.order != null ? String(existing.order) : '',
        featured:        existing.featured,
      })
    }
  }, [existing])

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim())       errs.title       = 'Title is required.'
    if (!form.category.trim())    errs.category    = 'Category is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    let finalImageUrl = form.imageUrl.trim()

if (imageFile) {
      try {
        setIsUploadingImage(true)
        const storage = getStorage()
        const storageRef = ref(storage, `projects/${Date.now()}_${imageFile.name}`)
        const snapshot = await uploadBytes(storageRef, imageFile)
        finalImageUrl = await getDownloadURL(snapshot.ref)
      } catch (error) {
        console.error("Image upload failed:", error)
        alert("Failed to upload image to storage.")
        setIsUploadingImage(false)
        return
      }
    }

    const data: ProjectInput = {
      title:           form.title.trim(),
      category:        form.category.trim(),
      description:     form.description.trim(),
      longDescription: form.longDescription.trim() || undefined,
      tags:            form.tags.split(',').map(t => t.trim()).filter(Boolean),
      imageUrl:        finalImageUrl || undefined,
      githubUrl:       form.githubUrl.trim() || undefined,
      liveUrl:         form.liveUrl.trim() || undefined,
      order:           form.order !== '' ? parseInt(form.order) : undefined,
      featured:        form.featured,
    }
    if (isNew) {
      await createProject.mutateAsync(data)
    } else {
      await updateProject.mutateAsync({ id: id!, data })
    }
    setIsUploadingImage(false)
    navigate('/admin')
  }

  const isSaving = createProject.isPending || updateProject.isPending || isUploadingImage

  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition ${
      errors[field] ? 'border-red-400' : 'border-stone-200'
    }`

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 px-8 py-5">
          <h2 className="text-xl font-display font-bold">{isNew ? 'Create New Project' : 'Edit Project'}</h2>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Title *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputCls('title')} />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Category *</label>
              <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Thermofluids" className={inputCls('category')} />
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Short Description *</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} className={inputCls('description')} />
            <p className="text-xs text-stone-400 mt-1">Appears on cards and lists.</p>
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Long Description</label>
            <textarea rows={8} value={form.longDescription} onChange={e => set('longDescription', e.target.value)} placeholder="HTML is supported…" className="w-full px-3 py-2.5 border border-stone-200 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Tags</label>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="CAD, Python, SolidWorks…" className={inputCls('tags')} />
            <p className="text-xs text-stone-400 mt-1">Comma-separated values.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Project Image Cover</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => {
                  if(e.target.files?.[0]) setImageFile(e.target.files[0])
                }} 
                className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer" 
              />
              {form.imageUrl && !imageFile && (
                <p className="text-xs text-stone-400 mt-1.5 truncate">Current: {form.imageUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Order</label>
              <input type="number" value={form.order} onChange={e => set('order', e.target.value)} placeholder="0" className={inputCls('order')} />
              <p className="text-xs text-stone-400 mt-1">Lower numbers appear first.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Repository URL</label>
              <input type="url" value={form.githubUrl} onChange={e => set('githubUrl', e.target.value)} placeholder="https://github.com/…" className={inputCls('githubUrl')} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Live Demo URL</label>
              <input type="url" value={form.liveUrl} onChange={e => set('liveUrl', e.target.value)} placeholder="https://…" className={inputCls('liveUrl')} />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="mt-0.5 accent-primary cursor-pointer" />
            <div>
              <label htmlFor="featured" className="text-sm font-semibold cursor-pointer">Featured Project</label>
              <p className="text-xs text-stone-400 mt-0.5">Featured projects appear on the homepage.</p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-stone-100">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving…' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
