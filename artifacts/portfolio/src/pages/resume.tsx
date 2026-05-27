import { useGetResume } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Resume() {
  const { data: resume, isLoading } = useGetResume();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Curriculum Vitae</h1>
          <p className="text-lg text-muted-foreground">
            A summary of my professional experience, education, and skills.
          </p>
        </div>
        
        {resume?.hasResume && resume.downloadUrl && (
          <Button size="lg" className="shrink-0 font-bold tracking-wide" asChild>
            <a href={resume.downloadUrl} download>
              <Download className="w-5 h-5 mr-2" />
              Download PDF Resume
            </a>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="w-full aspect-[1/1.4] bg-muted animate-pulse rounded-lg border border-border/50"></div>
      ) : resume?.hasResume && resume.downloadUrl ? (
        <div className="flex flex-col gap-4">
          {resume.updatedAt && (
            <div className="flex items-center justify-end text-sm text-muted-foreground font-mono">
              <Calendar className="w-4 h-4 mr-2" />
              Last updated: {format(new Date(resume.updatedAt), 'MMMM d, yyyy')}
            </div>
          )}
          <div className="w-full aspect-[1/1.4] bg-card rounded-lg border border-border/50 shadow-xl overflow-hidden relative">
            <iframe 
              src={`${resume.downloadUrl}?view=1`} 
              className="absolute inset-0 w-full h-full border-0"
              title="Resume Document"
            />
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2 py-24 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No resume uploaded yet</h3>
            <p className="text-muted-foreground max-w-sm">
              The resume document is currently unavailable. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
