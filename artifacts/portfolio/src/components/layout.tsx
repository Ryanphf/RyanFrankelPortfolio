import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Compass, LogOut, Settings, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const navigate = (href: string) => {
    setMenuOpen(false);
    setLocation(href);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <span>Ryan Frankel</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`hover:text-primary transition-colors ${location.startsWith(href) ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </Link>
            ))}
            {adminMe?.isAdmin && (
              <Link href="/admin" className={`hover:text-primary transition-colors ${location.startsWith("/admin") ? "text-primary" : "text-muted-foreground"}`}>
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            data-testid="button-mobile-menu"
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                data-testid={`link-mobile-${label.toLowerCase()}`}
                onClick={() => navigate(href)}
                className={`text-left px-3 py-3 rounded-md text-sm font-medium transition-colors w-full ${
                  location.startsWith(href)
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
            {adminMe?.isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className={`text-left px-3 py-3 rounded-md text-sm font-medium transition-colors w-full ${
                  location.startsWith("/admin") ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted"
                }`}
              >
                Admin
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-card py-8 md:py-12 mt-12">
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
