import { Wrench, BookOpen, Mountain, Coffee, Music, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ABOUT = {
  name: "Ryan Frankel",
  role: "Mechanical Engineer",
  bio: "I'm a mechanical engineer with a passion for designing systems that work elegantly in the real world. My work sits at the intersection of thermal management, structural analysis, and precision manufacturing — the kind of problems that require both analytical rigor and practical intuition.",
  bio2: "I believe the best engineering is invisible: when a system performs exactly as intended, nobody notices the design decisions that made it possible.",
  traits: [
    { label: "Detail-oriented", description: "I care about the tolerance stacks, the weld classifications, and the corner cases." },
    { label: "Systems thinker", description: "Every component exists in context. I design with the full lifecycle in mind." },
    { label: "Hands-on", description: "I've machined parts, run the tests, and reviewed the data — not just the CAD." },
    { label: "Clear communicator", description: "I write documentation people actually read and give presentations that land." },
  ],
  hobbies: [
    { icon: Mountain, label: "Hiking & Backpacking", description: "Multi-day trips in the Sierras and Pacific Northwest." },
    { icon: Wrench, label: "Tinkering", description: "Home shop with a lathe, mill, and too many half-finished projects." },
    { icon: BookOpen, label: "Reading", description: "Technical history, systems theory, and good non-fiction." },
    { icon: Coffee, label: "Specialty Coffee", description: "Home roasting and dialing in espresso recipes." },
    { icon: Music, label: "Music", description: "Guitar — fingerpicking and the occasional open mic." },
    { icon: Globe, label: "Travel", description: "Drawn to places with interesting industrial or engineering history." },
  ],
  skills: [
    "SolidWorks", "ANSYS Fluent", "Abaqus CAE", "MATLAB", "GD&T",
    "Thermal Analysis", "FEA", "CFD", "DFM/DFA", "Tolerance Stackup",
    "Python", "Drizzle ORM", "Technical Writing", "PPAP", "ISO 13485",
  ],
};

export default function About() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-32 max-w-3xl">
      {/* Header */}
      <div className="mb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">About me</p>
        <h1 className="text-5xl font-bold tracking-tight mb-6">{ABOUT.name}</h1>
        <p className="text-lg font-mono text-muted-foreground mb-8">{ABOUT.role}</p>
        <p className="text-lg text-foreground leading-relaxed mb-4">{ABOUT.bio}</p>
        <p className="text-lg text-muted-foreground leading-relaxed">{ABOUT.bio2}</p>
      </div>

      {/* Traits */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">How I work</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ABOUT.traits.map((trait) => (
            <div
              key={trait.label}
              data-testid={`card-trait-${trait.label}`}
              className="p-5 rounded-lg border border-border bg-card"
            >
              <p className="font-semibold mb-1">{trait.label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{trait.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Tools &amp; skills</h2>
        <div className="flex flex-wrap gap-2">
          {ABOUT.skills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              data-testid={`badge-skill-${skill}`}
              className="font-mono text-xs px-3 py-1 border-border"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </section>

      {/* Hobbies */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Outside of work</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ABOUT.hobbies.map((hobby) => {
            const Icon = hobby.icon;
            return (
              <div
                key={hobby.label}
                data-testid={`card-hobby-${hobby.label}`}
                className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">{hobby.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{hobby.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
