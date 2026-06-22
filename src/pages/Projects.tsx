import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Image as ImageIcon } from 'lucide-react'
import { useProjects } from '@/lib/queries'

export default function Projects() {
  const { data: projects, isLoading } = useProjects()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    if (!projects) return ['All']
    return ['All', ...Array.from(new Set(projects.map(p => p.category))).sort()]
  }, [projects])

  const sorted = useMemo(() => {
    if (!projects) return []
    return [...projects].sort((a, b) => {
      const ao = a.order ?? Infinity, bo = b.order ?? Infinity
      if (ao !== bo) return ao - bo
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [projects])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return sorted.filter(p => {
      const matchCat = filter === 'All' || p.category === filter
      const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
      return matchCat && matchQ
    })
  }, [sorted, filter, search])

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">All Projects</h1>
        <p className="text-stone-500 max-w-xl">A comprehensive archive of engineering projects, studies, and designs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search projects, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-stone-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i) => <div key={i} className="h-72 rounded-lg bg-stone-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 border-2 border-dashed border-stone-200 rounded-lg text-center">
          <h3 className="font-semibold mb-2">No projects found</h3>
          <p className="text-stone-500 text-sm">Try adjusting your search or filter.</p>
          <button onClick={() => { setSearch(''); setFilter('All') }} className="mt-4 text-primary text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <div className="group border border-stone-200 rounded-lg bg-white overflow-hidden hover:border-primary/40 transition-all duration-200 flex flex-col h-full cursor-pointer">
                {p.imageUrl ? (
                  <div className="aspect-[4/3] overflow-hidden border-b border-stone-100">
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-stone-50 flex items-center justify-center border-b border-stone-100">
                    <ImageIcon className="w-8 h-8 text-stone-200" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <span className="inline-block mb-3 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border border-stone-200 text-stone-500 rounded-sm">{p.category}</span>
                  <h3 className="font-display font-bold text-lg mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-3 mb-5 flex-1 leading-relaxed">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {p.tags.slice(0,3).map(t => (
                      <span key={t} className="font-mono text-[10px] uppercase bg-stone-100 px-2 py-0.5 rounded-sm text-stone-500">{t}</span>
                    ))}
                    {p.tags.length > 3 && <span className="font-mono text-[10px] text-stone-400">+{p.tags.length-3}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
