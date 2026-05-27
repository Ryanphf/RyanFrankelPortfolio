import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Compass, FileText, Briefcase, LogOut, Settings } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: adminMe } = useGetAdminMe();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span>Ryan Frankel</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/about" className={`hover:text-primary transition-colors ${location === "/about" ? "text-primary" : "text-muted-foreground"}`}>
              About
            </Link>
            <Link href="/projects" className={`hover:text-primary transition-colors ${location.startsWith("/projects") ? "text-primary" : "text-muted-foreground"}`}>
              Projects
            </Link>
            <Link href="/resume" className={`hover:text-primary transition-colors ${location === "/resume" ? "text-primary" : "text-muted-foreground"}`}>
              Resume
            </Link>
            <Link href="/contact" className={`hover:text-primary transition-colors ${location === "/contact" ? "text-primary" : "text-muted-foreground"}`}>
              Contact
            </Link>
            {adminMe?.isAdmin && (
              <Link href="/admin" className={`hover:text-primary transition-colors ${location.startsWith("/admin") ? "text-primary" : "text-muted-foreground"}`}>
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card py-12 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ryan Frankel. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            {adminMe?.isAdmin ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link href="/admin/login" className="text-muted-foreground hover:text-foreground text-sm flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
