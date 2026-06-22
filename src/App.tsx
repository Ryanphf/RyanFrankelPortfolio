import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Resume from '@/pages/Resume'
import Minigames from '@/pages/Minigames'
import Pong from '@/pages/games/Pong'
import Tetris from '@/pages/games/Tetris'
import CarDodge from '@/pages/games/CarDodge'
import Leaderboard from '@/pages/games/Leaderboard'
import AdminLogin from '@/pages/AdminLogin'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminProjectForm from '@/pages/AdminProjectForm'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/"                       element={<Home />} />
              <Route path="/projects"               element={<Projects />} />
              <Route path="/projects/:id"           element={<ProjectDetail />} />
              <Route path="/about"                  element={<About />} />
              <Route path="/contact"                element={<Contact />} />
              <Route path="/resume"                 element={<Resume />} />
              <Route path="/minigames"              element={<Minigames />} />
              <Route path="/minigames/pong"         element={<Pong />} />
              <Route path="/minigames/tetris"       element={<Tetris />} />
              <Route path="/minigames/car-dodge"    element={<CarDodge />} />
              <Route path="/minigames/leaderboard"  element={<Leaderboard />} />
              <Route path="/admin/login"            element={<AdminLogin />} />
              <Route path="/admin"                  element={<AdminDashboard />} />
              <Route path="/admin/project/new"      element={<AdminProjectForm />} />
              <Route path="/admin/project/:id/edit" element={<AdminProjectForm />} />
              <Route path="*"                       element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
