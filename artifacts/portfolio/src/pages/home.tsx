import { useListFeaturedProjects, useGetProjectStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench } from "lucide-react";

export default function Home() {
  const { data: featuredProjects, isLoading: isProjectsLoading } = useListFeaturedProjects();
  const { data: stats } = useGetProjectStats();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-16 md:pt-24 md:pb-32">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-5 px-3 py-1 font-mono text-xs uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
            Mechanical Engineering
          </Badge>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-tight">
            Building robust <span className="text-primary">physical systems</span> with precision.
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl leading-relaxed">
            I am a student at California Polytechnic State University, Pomona pursuing a degree in Mechanical Engineering with a passion for motorsports and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/projects" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8">
              View My Work
            </Link>
            <Link href="/resume" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-11 px-8">
              Read Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="border-y border-border/50 bg-card py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{stats.totalProjects}</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Total Projects</div>
              </div>
              {stats.categories.map(cat => (
                <div key={cat.name}>
                  <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{cat.count}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2 md:mb-4">Featured Work</h2>
            <p className="text-sm md:text-base text-muted-foreground">Selected projects highlighting different disciplines.</p>
          </div>
          <Link href="/projects" className="hidden md:flex items-center text-sm font-medium text-primary hover:underline">
            See all projects <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {isProjectsLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects?.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 h-full cursor-pointer hover:shadow-lg hover:shadow-primary/5 bg-card flex flex-col">
                  {project.imageUrl ? (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-secondary flex items-center justify-center">
                      <Wrench className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardContent className="p-5 md:p-8 flex flex-col flex-1">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase rounded-sm bg-accent text-accent-foreground">{project.category}</Badge>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors leading-snug">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-sm">
                          {tag}
                        </span>
                      ))}
                      {(project.tags?.length || 0) > 3 && (
                        <span className="text-xs font-medium px-2 py-0.5 text-muted-foreground">
                          +{project.tags!.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 md:hidden">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/projects">See all projects</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
