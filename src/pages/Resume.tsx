import { Download, FileText } from 'lucide-react'
import { useResumeMeta } from '@/lib/queries'

export default function Resume() {
  const { data: resume, isLoading } = useResumeMeta()
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Curriculum Vitae</h1>
          <p className="text-stone-500">A summary of my professional experience, education, and skills.</p>
        </div>
        {resume?.url && (
          <a
            href={resume.url}
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shrink-0"
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
        )}
      </div>

      {isLoading ? (
        <div className="w-full aspect-[1/1.4] rounded-lg bg-stone-100 animate-pulse" />
      ) : resume?.url ? (
        <div>
          {resume.updatedAt && (
            <p className="text-right text-xs font-mono text-stone-400 mb-3">
              Last updated: {fmt(resume.updatedAt)}
            </p>
          )}
          <div className="w-full rounded-lg border border-stone-200 shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 600 }}>
            <embed src={resume.url} type="application/pdf" className="w-full h-full" />
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-stone-200 rounded-lg py-24 bg-white text-center">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No resume uploaded yet</h3>
          <p className="text-stone-500 max-w-xs mx-auto text-sm">The resume document is currently unavailable. Please check back later.</p>
        </div>
      )}
    </div>
  )
}
