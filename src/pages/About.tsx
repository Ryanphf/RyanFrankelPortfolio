// ── About ─────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import { Mountain, Gamepad2, ChevronRight } from 'lucide-react'

function SkisIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="3" x2="9" y2="21"/><line x1="19" y1="3" x2="15" y2="21"/>
      <path d="M5 17Q7 15 12 16Q17 17 19 15"/>
      <line x1="3" y1="21" x2="11" y2="21"/><line x1="13" y1="21" x2="21" y2="21"/>
    </svg>
  )
}

function MotoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3"/><circle cx="18.5" cy="17.5" r="3"/>
      <path d="M5.5 17.5L9 10L13 10L16 14L18.5 17.5"/>
      <path d="M13 10L15 6L18 6"/>
    </svg>
  )
}

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-28">
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4">About me</p>
      <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">Ryan Frankel</h1>
      <p className="font-mono text-sm text-stone-400 mb-7">Mechanical Engineer</p>
      <p className="text-base md:text-lg text-stone-700 leading-[1.8] mb-14">
        A dedicated and motivated Mechanical Engineering student with a strong passion for automotive technology and innovation. Possesses excellent teamwork abilities, consistently contributing to collaborative projects with a positive attitude and effective communication skills. A fast learner, eager to acquire new knowledge and skills, and always ready to take on new challenges. Seeking opportunities to apply engineering principles in a dynamic environment, with a keen interest in advancing expertise in the automotive industry.
      </p>

      <h2 className="text-2xl font-display font-bold mb-6">How I work</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-14">
        {[
          { label: 'Detail-oriented', desc: 'I care about the tolerance stacks, the weld classifications, and the corner cases.' },
          { label: 'Systems thinker', desc: 'Every component exists in context. I design with the full lifecycle in mind.' },
          { label: 'Hands-on', desc: "I've machined parts, run the tests, and reviewed the data — not just the CAD." },
          { label: 'Clear communicator', desc: 'I write documentation people actually read and give presentations that land.' },
        ].map(t => (
          <div key={t.label} className="p-5 rounded-lg border border-stone-200 bg-white">
            <p className="font-semibold mb-1">{t.label}</p>
            <p className="text-sm text-stone-500 leading-relaxed">{t.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-display font-bold mb-6">Tools &amp; skills</h2>
      <div className="flex flex-wrap gap-2 mb-14">
        {['SolidWorks', 'Fusion 360', 'MATLAB', 'FEA', 'Python', 'Java'].map(s => (
          <span key={s} className="font-mono text-xs px-3 py-1.5 border border-stone-200 rounded text-stone-600">{s}</span>
        ))}
      </div>

      <h2 className="text-2xl font-display font-bold mb-6">Outside of work</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Mountain, label: 'Mountain Biking', desc: "Love a good trail day, whether it's singletrack or a local pump track." },
          { icon: SkisIcon, label: 'Skiing', desc: 'I am an avid skier, love carving turns and hitting the powder.' },
          { icon: MotoIcon, label: 'Motorcycles', desc: 'I own a DRZ400SM and enjoy canyons and the track.' },
          { icon: Gamepad2, label: 'Video Games', desc: 'I play a wide range of video games. Click to play a few mini-games.', href: '/minigames' },
        ].map(h => {
          const Icon = h.icon
          const inner = (
            <>
              <div className="w-9 h-9 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-1 group-hover:text-primary transition-colors">{h.label}</p>
                <p className="text-sm text-stone-500 leading-relaxed">{h.desc}</p>
              </div>
              {h.href && <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 self-center opacity-60 group-hover:opacity-100 transition-opacity" />}
            </>
          )
          return h.href ? (
            <Link key={h.label} to={h.href}>
              <div className="group flex items-start gap-4 p-5 rounded-lg border border-stone-200 bg-white hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">{inner}</div>
            </Link>
          ) : (
            <div key={h.label} className="group flex items-start gap-4 p-5 rounded-lg border border-stone-200 bg-white">{inner}</div>
          )
        })}
      </div>
    </div>
  )
}
export default About
