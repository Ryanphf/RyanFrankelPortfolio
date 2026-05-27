import { useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetAdminMe, useCreateProject, useUpdateProject, useGetProject, getGetProjectQueryKey, getListProjectsQueryKey, getListFeaturedProjectsQueryKey, getGetProjectStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  longDescription: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(), // We'll parse this to string[] before sending
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  order: z.coerce.number().optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function AdminProjectForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const projectId = !isNew ? Number(id) : undefined;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: adminMe, isLoading: isMeLoading } = useGetAdminMe();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  
  const { data: existingProject, isLoading: isProjectLoading } = useGetProject(projectId as number, {
    query: {
      enabled: !!projectId && !!adminMe?.isAdmin,
      queryKey: getGetProjectQueryKey(projectId as number)
    }
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      category: "",
      tags: "",
      imageUrl: "",
      githubUrl: "",
      liveUrl: "",
      featured: false,
      order: "",
    },
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isMeLoading && !adminMe?.isAdmin) {
      setLocation("/admin/login");
    }
  }, [adminMe, isMeLoading, setLocation]);

  useEffect(() => {
    if (existingProject && !initializedRef.current) {
      initializedRef.current = true;
      form.reset({
        title: existingProject.title,
        description: existingProject.description,
        longDescription: existingProject.longDescription || "",
        category: existingProject.category,
        tags: existingProject.tags?.join(", ") || "",
        imageUrl: existingProject.imageUrl || "",
        githubUrl: existingProject.githubUrl || "",
        liveUrl: existingProject.liveUrl || "",
        featured: existingProject.featured,
        order: existingProject.order ?? "",
      });
    }
  }, [existingProject, form]);

  const onSubmit = (data: ProjectFormValues) => {
    const payload = {
      ...data,
      longDescription: data.longDescription || undefined,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      imageUrl: data.imageUrl || undefined,
      githubUrl: data.githubUrl || undefined,
      liveUrl: data.liveUrl || undefined,
      order: data.order !== "" ? Number(data.order) : undefined,
    };

    if (isNew) {
      createProject.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListFeaturedProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProjectStatsQueryKey() });
          toast({ title: "Project created successfully" });
          setLocation("/admin");
        },
        onError: () => {
          toast({ title: "Failed to create project", variant: "destructive" });
        }
      });
    } else {
      updateProject.mutate({ id: projectId as number, data: payload }, {
        onSuccess: (updated) => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListFeaturedProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProjectStatsQueryKey() });
          queryClient.setQueryData(getGetProjectQueryKey(updated.id), updated);
          toast({ title: "Project updated successfully" });
          setLocation("/admin");
        },
        onError: () => {
          toast({ title: "Failed to update project", variant: "destructive" });
        }
      });
    }
  };

  if (isMeLoading || !adminMe?.isAdmin || (!isNew && isProjectLoading)) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-pulse">Loading...</div></div>;
  }

  const isSaving = createProject.isPending || updateProject.isPending;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to dashboard
      </Link>
      
      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6 mb-6">
          <CardTitle className="text-2xl font-display">{isNew ? "Create New Project" : "Edit Project"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl><Input placeholder="e.g. Thermofluids" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description *</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormDescription>Appears on cards and lists.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="longDescription" render={({ field }) => (
                <FormItem>
                  <FormLabel>Long Description</FormLabel>
                  <FormControl><Textarea rows={8} className="font-mono text-sm" {...field} /></FormControl>
                  <FormDescription>HTML is allowed. Full project details.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tags" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl><Input placeholder="CAD, Python, SolidWorks..." {...field} /></FormControl>
                  <FormDescription>Comma-separated values.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="order" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormDescription>Lower numbers appear first.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="githubUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="liveUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="featured" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Project</FormLabel>
                    <FormDescription>Featured projects appear on the homepage.</FormDescription>
                  </div>
                </FormItem>
              )} />

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "Saving..." : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
