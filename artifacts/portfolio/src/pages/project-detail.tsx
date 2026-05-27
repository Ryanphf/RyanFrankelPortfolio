import { useParams, Link } from "wouter";
import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Github, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, isError } = useGetProject(Number(id), {
    query: {
      enabled: !!id,
      queryKey: getGetProjectQueryKey(Number(id))
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 animate-pulse">
        <div className="w-24 h-4 bg-muted mb-8 rounded"></div>
        <div className="w-3/4 h-10 bg-muted mb-4 rounded"></div>
        <div className="w-1/2 h-5 bg-muted mb-10 rounded"></div>
        <div className="w-full aspect-video bg-muted rounded-lg mb-10"></div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Project not found</h1>
        <Button asChild variant="outline">
          <Link href="/projects">Return to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="pb-16 md:pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border/50 py-8 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to projects
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 font-mono text-xs uppercase tracking-wider">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">Featured</Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-6xl font-display font-bold mb-4 md:mb-6 leading-tight">
            {project.title}
          </h1>

          <p className="text-base md:text-2xl text-muted-foreground leading-relaxed mb-6 md:mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(project.createdAt), 'MMMM yyyy')}
            </div>

            {(project.githubUrl || project.liveUrl) && (
              <div className="flex items-center gap-4 md:border-l md:border-border md:pl-6">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-foreground hover:text-primary transition-colors">
                    <Github className="w-4 h-4 mr-2" /> Repository
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl mt-8 md:mt-12">
        {project.imageUrl && (
          <div className="mb-10 md:mb-16 rounded-xl overflow-hidden shadow-lg border border-border/50 bg-muted">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Tags shown above content on mobile, sidebar on desktop */}
        {project.tags && project.tags.length > 0 && (
          <div className="md:hidden bg-card border border-border/50 rounded-lg p-4 mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 font-mono">Technologies & Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="text-xs font-medium px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_250px] gap-12 items-start">
          <div className="prose prose-neutral dark:prose-invert prose-base md:prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary">
            {project.longDescription ? (
              <p className="whitespace-pre-wrap font-sans leading-relaxed">{project.longDescription}</p>
            ) : (
              <p>{project.description}</p>
            )}
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="hidden md:block sticky top-24 bg-card border border-border/50 rounded-lg p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 font-mono">Technologies & Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="text-sm font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
