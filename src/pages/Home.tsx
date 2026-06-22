import { Link } from 'react-router-dom'
import { ArrowRight, Wrench } from 'lucide-react'
import { useFeaturedProjects, useProjectStats } from '@/lib/queries'

export default function Home() {
  const { data: featured, isLoading } = useFeaturedProjects()
  const { data: stats } = useProjectStats()

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-24 md:pt-28 md:pb-36">
        <div className="max-w-3xl">
          <span className="inline-block mb-5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 rounded">
            Mechanical Engineering
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.08] mb-7">
            Building robust{' '}
            <span className="text-primary">physical systems</span>{' '}
            with precision.
          </h1>
          <p className="text-lg text-stone-500 mb-10 max-w-xl leading-relaxed">
            I am a student at Cal Poly Pomona pursuing Mechanical Engineering with a passion for motorsports and innovation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/projects" className="inline-flex items-center gap-2 px-7 py-3 rounded bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors">
              View My Work
            </Link>
            <Link to="/resume" className="inline-flex items-center gap-2 px-7 py-3 rounded border border-stone-200 bg-white text-stone-800 font-semibold text-sm hover:bg-stone-50 transition-colors">
              Read Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="border-y border-stone-200 bg-white py-12">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-display font-bold mb-1">{stats.totalProjects}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400">Total Projects</div>
              </div>
              {stats.categories.slice(0, 3).map(cat => (
                <div key={cat.name}>
                  <div className="text-4xl font-display font-bold mb-1">{cat.count}</div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">Featured Work</h2>
            <p className="text-stone-500 text-sm">Selected projects highlighting different disciplines.</p>
          </div>
          <Link to="/projects" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[0,1].map(i => <div key={i} className="h-72 rounded-lg bg-stone-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {(featured ?? []).map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <div className="group border border-stone-200 rounded-lg bg-white overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full cursor-pointer">
                  {p.imageUrl ? (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-stone-100 flex items-center justify-center">
                      <Wrench className="w-10 h-10 text-stone-300" />
                    </div>
                  )}
                  <div className="p-7 flex flex-col flex-1">
                    <span className="inline-block mb-3 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-stone-100 text-stone-500 rounded-sm">{p.category}</span>
                    <h3 className="text-xl font-display font-bold mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {p.tags.slice(0,3).map(t => (
                        <span key={t} className="text-xs font-medium px-2 py-0.5 bg-stone-100 text-stone-600 rounded-sm">{t}</span>
                      ))}
                      {p.tags.length > 3 && <span className="text-xs text-stone-400 px-1">+{p.tags.length-3}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 md:hidden">
          <Link to="/projects" className="flex items-center justify-center w-full py-3 border border-stone-200 rounded text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors">
            See all projects
          </Link>
        </div>
      </section>
    </div>
  )
}
