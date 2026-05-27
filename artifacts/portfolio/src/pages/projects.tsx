import { useState, useMemo } from "react";
import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Image as ImageIcon } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    if (!projects) return ["All"];
    const cats = new Set(projects.map(p => p.category));
    return ["All", ...Array.from(cats)].sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      const matchCat = filter === "All" || p.category === filter;
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase()) ||
                          p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (a.order !== null && b.order !== null) return a.order - b.order;
      if (a.order !== null) return -1;
      if (b.order !== null) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [projects, filter, search]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">All Projects</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A comprehensive archive of engineering projects, studies, and designs.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search projects, tags..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50 focus-visible:ring-primary/50"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
              className={`rounded-full whitespace-nowrap ${filter !== cat ? 'bg-card' : ''}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-border/50 border-dashed">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          <Button variant="link" onClick={() => { setSearch(""); setFilter("All"); }} className="mt-4">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group h-full flex flex-col overflow-hidden bg-card hover:border-primary/50 transition-all duration-200">
                {project.imageUrl ? (
                  <div className="aspect-[4/3] w-full overflow-hidden border-b border-border/50">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] w-full bg-secondary/50 flex items-center justify-center border-b border-border/50">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <Badge variant="outline" className="w-fit mb-3 bg-background text-[10px] uppercase font-mono tracking-wider">
                    {project.category}
                  </Badge>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                    {project.description}
                  </p>
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded-sm text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="text-[10px] font-mono uppercase text-muted-foreground px-1 py-0.5">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
