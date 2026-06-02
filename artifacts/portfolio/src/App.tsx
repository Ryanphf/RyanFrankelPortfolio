import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";

import Home from "@/pages/home";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Resume from "@/pages/resume";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import Minigames from "@/pages/minigames";
import Pong from "@/pages/games/pong";
import Tetris from "@/pages/games/tetris";
import CarDodge from "@/pages/games/car-dodge";
import GameLeaderboard from "@/pages/games/leaderboard";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProjectForm from "@/pages/admin-project-form";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id" component={ProjectDetail} />
        <Route path="/resume" component={Resume} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/minigames" component={Minigames} />
        <Route path="/minigames/pong" component={Pong} />
        <Route path="/minigames/tetris" component={Tetris} />
        <Route path="/minigames/car-dodge" component={CarDodge} />
        <Route path="/minigames/leaderboard" component={GameLeaderboard} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/project/new" component={AdminProjectForm} />
        <Route path="/admin/project/:id/edit" component={AdminProjectForm} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
