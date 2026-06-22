import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as db from './db'
import type { ProjectInput } from './db'

// ── Projects ──────────────────────────────────────────────────────────────────

export const PROJECTS_KEY        = ['projects']
export const FEATURED_KEY        = ['projects', 'featured']
export const STATS_KEY           = ['projects', 'stats']
export const projectKey = (id: string) => ['projects', id]

export function useProjects() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: db.listProjects })
}

export function useFeaturedProjects() {
  return useQuery({ queryKey: FEATURED_KEY, queryFn: db.listFeaturedProjects })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKey(id),
    queryFn:  () => db.getProject(id),
    enabled:  !!id,
  })
}

export function useProjectStats() {
  return useQuery({ queryKey: STATS_KEY, queryFn: db.getProjectStats })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectInput) => db.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
      qc.invalidateQueries({ queryKey: FEATURED_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    },
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectInput> }) =>
      db.updateProject(id, data),
    onSuccess: (_,{ id }) => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
      qc.invalidateQueries({ queryKey: FEATURED_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
      qc.invalidateQueries({ queryKey: projectKey(id) })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => db.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
      qc.invalidateQueries({ queryKey: FEATURED_KEY })
      qc.invalidateQueries({ queryKey: STATS_KEY })
    },
  })
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardKey = (game: string) => ['leaderboard', game]

export function useLeaderboard(game: string) {
  return useQuery({
    queryKey: leaderboardKey(game),
    queryFn:  () => db.getLeaderboard(game),
  })
}

export function useSubmitScore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ playerName, score, game }: { playerName: string; score: number; game: string }) =>
      db.submitScore(playerName, score, game),
    onSuccess: (_, { game }) => {
      qc.invalidateQueries({ queryKey: leaderboardKey(game) })
    },
  })
}

// ── Resume ────────────────────────────────────────────────────────────────────

export const RESUME_KEY = ['resume']

export function useResumeMeta() {
  return useQuery({ queryKey: RESUME_KEY, queryFn: db.getResumeMeta })
}

export function useUploadResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => db.uploadResume(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESUME_KEY }),
  })
}

export function useDeleteResume() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: db.deleteResume,
    onSuccess: () => qc.invalidateQueries({ queryKey: RESUME_KEY }),
  })
}
