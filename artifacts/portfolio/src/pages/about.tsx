import { Mountain, Coffee, Music, Gamepad2, ChevronRight } from "lucide-react";

function SkisIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="3" x2="9" y2="21" />
      <line x1="19" y1="3" x2="15" y2="21" />
      <path d="M5 17 Q7 15 12 16 Q17 17 19 15" />
      <line x1="3" y1="21" x2="11" y2="21" />
      <line x1="13" y1="21" x2="21" y2="21" />
    </svg>
  );
}

function DirtBikeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5.5" cy="17.5" r="3" />
      <circle cx="18.5" cy="17.5" r="3" />
      <path d="M5.5 17.5 L9 10 L13 10 L16 14 L18.5 17.5" />
      <path d="M13 10 L15 6 L18 6" />
      <path d="M9 10 L7 13" />
    </svg>
  );
}

import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const ABOUT = {
  name: "Ryan Frankel",
  role: "Mechanical Engineer",
  bio: "A dedicated and motivated Mechanical Engineering student with a strong passion for automotive technology and innovation. Possesses excellent teamwork abilities, consistently contributing to collaborative projects with a positive attitude and effective communication skills. A fast learner, eager to acquire new knowledge and skills, and always ready to take on new challenges. Seeking opportunities to apply engineering principles in a dynamic environment, with a keen interest in advancing expertise in the automotive industry",
  //bio2: "I believe the best engineering is invisible: when a system performs exactly as intended, nobody notices the design decisions that made it possible.",
  traits: [
    {
      label: "Detail-oriented",
      description:
        "I care about the tolerance stacks, the weld classifications, and the corner cases.",
    },
    {
      label: "Systems thinker",
      description:
        "Every component exists in context. I design with the full lifecycle in mind.",
    },
    {
      label: "Hands-on",
      description:
        "I've machined parts, run the tests, and reviewed the data — not just the CAD.",
    },
    {
      label: "Clear communicator",
      description:
        "I write documentation people actually read and give presentations that land.",
    },
  ],
  hobbies: [
    {
      icon: Mountain,
      label: "Mountain Biking",
      description:
        "Love a good trail day, whether it's singletrack or a local pump track.",
    },
    {
      icon: SkisIcon,
      label: "Skiing",
      description:
        "I am an avid skier, love carving turns and hitting the powder.",
    },
    {
      icon: DirtBikeIcon,
      label: "Motorcycles",
      description: "I own a DRZ400SM and enjoy canyons and the track.",
    },
    // { icon: Coffee, label: "Specialty Coffee", description: "Home roasting and dialing in espresso recipes." },
    //{ icon: Music, label: "Music", description: "Guitar — fingerpicking and the occasional open mic." },
    {
      icon: Gamepad2,
      label: "Video Games",
      description:
        "I play a wide range of video games. Click to play a few mini-games.",
      href: "/minigames",
    },
  ],
  skills: ["SolidWorks", "Fusion 360", "MATLAB", "FEA", "Python", "Java"],
};

export default function About() {
  return (
    <div className="container mx-auto px-4 pt-10 pb-16 md:pt-24 md:pb-32 max-w-3xl">
      {/* Header */}
      <div className="mb-10 md:mb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
          About me
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 md:mb-6">
          {ABOUT.name}
        </h1>
        <p className="text-base font-mono text-muted-foreground mb-6 md:mb-8">
          {ABOUT.role}
        </p>
        <p className="text-base md:text-lg text-foreground leading-relaxed mb-4">
          {ABOUT.bio}
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {ABOUT.bio2}
        </p>
      </div>

      {/* Traits */}
      <section className="mb-10 md:mb-16">
        <h2 className="text-2xl font-bold mb-6">How I work</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {ABOUT.traits.map((trait) => (
            <div
              key={trait.label}
              data-testid={`card-trait-${trait.label}`}
              className="p-5 rounded-lg border border-border bg-card"
            >
              <p className="font-semibold mb-1">{trait.label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {trait.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-10 md:mb-16">
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
            const inner = (
              <>
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {hobby.label}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {hobby.description}
                  </p>
                </div>
                {hobby.href && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground self-center opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                )}
              </>
            );
            if (hobby.href) {
              return (
                <Link key={hobby.label} href={hobby.href}>
                  <div
                    data-testid={`card-hobby-${hobby.label}`}
                    className="group flex items-start gap-4 p-5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    {inner}
                  </div>
                </Link>
              );
            }
            return (
              <div
                key={hobby.label}
                data-testid={`card-hobby-${hobby.label}`}
                className="group flex items-start gap-4 p-5 rounded-lg border border-border bg-card"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
