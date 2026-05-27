import { useListProjects, useDeleteProject, getListProjectsQueryKey, useGetAdminMe } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: adminMe, isLoading: isMeLoading } = useGetAdminMe();
  const { data: projects, isLoading: isProjectsLoading } = useListProjects({ query: { enabled: !!adminMe?.isAdmin } });
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!isMeLoading && !adminMe?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [adminMe, isMeLoading, setLocation]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      deleteProject.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: "Project deleted successfully" });
        },
        onError: () => {
          toast({ title: "Failed to delete project", variant: "destructive" });
        }
      });
    }
  };

  if (isMeLoading || !adminMe?.isAdmin) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse">Checking credentials...</div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" /> System Administration
          </h1>
          <p className="text-muted-foreground mt-2">Manage your portfolio content.</p>
        </div>
        <Button asChild>
          <Link href="/admin/project/new">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[100px]">Featured</TableHead>
              <TableHead className="w-[100px]">Order</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isProjectsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground animate-pulse">
                  Loading projects data...
                </TableCell>
              </TableRow>
            ) : projects?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No projects found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">{project.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {project.featured ? <Badge variant="secondary">Yes</Badge> : <span className="text-muted-foreground text-sm">-</span>}
                  </TableCell>
                  <TableCell>
                    {project.order !== null ? project.order : <span className="text-muted-foreground text-sm">-</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/project/${project.id}/edit`}>
                          <Edit2 className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
