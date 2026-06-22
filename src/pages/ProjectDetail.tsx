import { useParams, Link } from 'react-router-dom'
import { ArrowLeft,  ExternalLink, Calendar } from 'lucide-react'
import { useProject } from '@/lib/queries'

// A custom SVG component for GitHub
const GitHubIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: project, isLoading, isError } = useProject(id ?? '')

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (isLoading) return (
    <div className="animate-pulse mx-auto max-w-4xl px-5 py-10">
      <div className="w-24 h-4 bg-stone-100 mb-8 rounded" />
      <div className="w-3/4 h-10 bg-stone-100 mb-4 rounded" />
      <div className="w-full aspect-video bg-stone-100 rounded-lg mt-8" />
    </div>
  )

  if (isError || !project) return (
    <div className="text-center py-24">
      <h1 className="text-2xl font-bold mb-4">Project not found</h1>
      <Link to="/projects" className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-200 rounded text-sm font-semibold hover:bg-stone-50 transition-colors">
        Return to Projects
      </Link>
    </div>
  )

  return (
    <article className="pb-24">
      <header className="bg-white border-b border-stone-200 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-5">
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to projects
          </Link>
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded">{project.category}</span>
            {project.featured && <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 bg-stone-100 text-stone-500 border border-stone-200 rounded">Featured</span>}
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-5">{project.title}</h1>
          <p className="text-xl text-stone-500 leading-relaxed max-w-2xl mb-7">{project.description}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-stone-500">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{fmt(project.createdAt)}</span>
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-stone-800 hover:text-primary transition-colors">
                <GitHubIcon className="w-4 h-4" /> Repository
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-stone-800 hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4" /> Live Demo
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pt-10">
        {project.imageUrl && (
          <img src={project.imageUrl} alt={project.title} className="w-full aspect-video object-cover rounded-lg border border-stone-200 mb-8" />
        )}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map(t => <span key={t} className="font-mono text-xs uppercase px-2 py-1 bg-stone-100 text-stone-500 rounded-sm">{t}</span>)}
          </div>
        )}
        {project.longDescription ? (
          <div
            className="prose prose-stone max-w-none text-stone-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: project.longDescription }}
          />
        ) : (
          <p className="text-stone-400">No additional details provided.</p>
        )}
      </div>
    </article>
  )
}
