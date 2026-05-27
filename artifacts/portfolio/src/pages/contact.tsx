import { Mail, Linkedin, MapPin, ExternalLink } from "lucide-react";

const CONTACT = {
  email: "ryan.frankel@email.com",
  linkedin: "linkedin.com/in/ryanfrankel",
  location: "San Francisco Bay Area, CA",
};

export default function Contact() {
  return (
    <div className="container mx-auto px-4 pt-10 pb-16 md:pt-24 md:pb-32 max-w-2xl">
      <div className="mb-12">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Get in touch</p>
        <h1 className="text-5xl font-bold tracking-tight mb-4">Contact</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Available for full-time roles, contract work, and technical consulting. Reach out through any of the channels below.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <a
          href={`mailto:${CONTACT.email}`}
          data-testid="link-email"
          className="group flex items-center gap-5 p-6 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Email</p>
            <p data-testid="text-email" className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {CONTACT.email}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>

        <a
          href={`https://${CONTACT.linkedin}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-linkedin"
          className="group flex items-center gap-5 p-6 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">LinkedIn</p>
            <p data-testid="text-linkedin" className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {CONTACT.linkedin}
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>

        <div
          data-testid="card-location"
          className="flex items-center gap-5 p-6 rounded-lg border border-border bg-card"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Location</p>
            <p data-testid="text-location" className="text-lg font-semibold">
              {CONTACT.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
