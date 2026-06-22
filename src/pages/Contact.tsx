import { Mail, Link, MapPin, ExternalLink } from 'lucide-react'

export default function Contact() {
  return (
    <div className="mx-auto max-w-lg px-5 pt-14 pb-28">
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4">Get in touch</p>
      <h1 className="text-5xl font-display font-bold tracking-tight mb-4">Contact</h1>
      <p className="text-lg text-stone-500 leading-relaxed mb-10">
        Available for full-time roles, contract work, and technical consulting.
      </p>

      {[
        { href: 'mailto:rpfrankel@cpp.edu', Icon: Mail, label: 'Email', value: 'rpfrankel@cpp.edu', external: false },
        { href: 'https://linkedin.com/in/ryan-p-frankel', Icon: Link, label: 'LinkedIn', value: 'linkedin.com/in/ryan-p-frankel', external: true },
      ].map(({ href, Icon, label, value, external }) => (
        <a
          key={label}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="group flex items-center gap-5 p-6 rounded-lg border border-stone-200 bg-white hover:border-primary/40 hover:bg-primary/5 transition-all mb-3"
        >
          <div className="w-12 h-12 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">{label}</p>
            <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{value}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </a>
      ))}

      <div className="flex items-center gap-5 p-6 rounded-lg border border-stone-200 bg-white">
        <div className="w-12 h-12 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-1">Location</p>
          <p className="font-semibold text-lg">Los Angeles, CA</p>
        </div>
      </div>
    </div>
  )
}
