// ─────────────────────────────────────────────────────────────────────────────
//  Firebase data layer
//  All Firestore + Storage operations live here so the rest of the app
//  stays free of Firebase-specific imports.
// ─────────────────────────────────────────────────────────────────────────────
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, Timestamp, serverTimestamp,
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL, deleteObject, getStorage,
} from 'firebase/storage'
import { db, } from './firebase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  title: string
  description: string
  longDescription?: string
  category: string
  tags: string[]
  imageUrl?: string
  githubUrl?: string
  liveUrl?: string
  featured: boolean
  order?: number
  createdAt: string
}

export interface LeaderboardEntry {
  id: string
  playerName: string
  score: number
  game: string
  createdAt: string
}

// ── Projects ──────────────────────────────────────────────────────────────────

const storage = getStorage();

/**
 * Uploads an image file to Firebase Storage and returns its public URL string.
 * Pass the resulting URL into your `createProject` or `updateProject` data object as `imageUrl`.
 */
export async function uploadProjectImage(file: File): Promise<string> {
  // Create a unique filepath path inside your storage bucket
  const fileRef = ref(storage, `projects/${Date.now()}_${file.name}`);
  
  // Upload the file payload
  const snapshot = await uploadBytes(fileRef, file);
  
  // Retrieve the public URL
  return await getDownloadURL(snapshot.ref);
}

const PROJECTS = 'projects'

function toProject(id: string, data: Record<string, unknown>): Project {
  return {
    id,
    title:           String(data.title ?? ''),
    description:     String(data.description ?? ''),
    longDescription: data.longDescription ? String(data.longDescription) : undefined,
    category:        String(data.category ?? ''),
    tags:            Array.isArray(data.tags) ? data.tags.map(String) : [],
    imageUrl:        data.imageUrl ? String(data.imageUrl) : undefined,
    githubUrl:       data.githubUrl ? String(data.githubUrl) : undefined,
    liveUrl:         data.liveUrl ? String(data.liveUrl) : undefined,
    featured:        Boolean(data.featured),
    order:           data.order != null ? Number(data.order) : undefined,
    createdAt:       data.createdAt instanceof Timestamp
                       ? (data as any).createdAt.toDate().toISOString()
                       : String(data.createdAt ?? new Date().toISOString()),
  }
}

export async function listProjects(): Promise<Project[]> {
  const snap = await getDocs(collection(db, PROJECTS))
  return snap.docs.map((d: any) => toProject(d.id, d.data()))
}

export async function listFeaturedProjects(): Promise<Project[]> {
  const q = query(collection(db, PROJECTS), where('featured', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map((d: any) => toProject(d.id, d.data()))
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, PROJECTS, id))
  if (!snap.exists()) return null
  return toProject(snap.id, snap.data())
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt'>

function cleanData<T extends object>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const value = (obj as any)[key];
    if (value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
}

export async function createProject(data: ProjectInput): Promise<Project> {

  const cleanedData = cleanData(data);

  const ref = await addDoc(collection(db, PROJECTS), {
    ...cleanedData,
    createdAt: serverTimestamp(),
  })
  const snap = await getDoc(ref)
  return toProject(snap.id, snap.data()!)
}

export async function updateProject(id: string, data: Partial<ProjectInput>): Promise<void> {

  const cleanedData = cleanData(data);

  await updateDoc(doc(db, PROJECTS, id), cleanedData)
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, PROJECTS, id))
}

export async function getProjectStats() {
  const projects = await listProjects()
  const catMap: Record<string, number> = {}
  projects.forEach(p => { catMap[p.category] = (catMap[p.category] ?? 0) + 1 })
  return {
    totalProjects: projects.length,
    featuredCount: projects.filter(p => p.featured).length,
    categories: Object.entries(catMap).map(([name, count]) => ({ name, count })),
  }
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

const LEADERBOARD = 'leaderboard'

function toEntry(id: string, data: Record<string, unknown>): LeaderboardEntry {
  return {
    id,
    playerName: String(data.playerName ?? ''),
    score:      Number(data.score ?? 0),
    game:       String(data.game ?? ''),
    createdAt:  data.createdAt instanceof Timestamp
                  ? (data as any) .createdAt.toDate().toISOString()
                  : String(data.createdAt ?? new Date().toISOString()),
  }
}

export async function getLeaderboard(game: string): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, LEADERBOARD),
    where('game', '==', game),
    orderBy('score', 'desc'),
    limit(10),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d: any) => toEntry(d.id, d.data()))
}

export async function submitScore(playerName: string, score: number, game: string): Promise<void> {
  await addDoc(collection(db, LEADERBOARD), {
    playerName: playerName.trim().slice(0, 30),
    score,
    game,
    createdAt: serverTimestamp(),
  })
}

// ── Resume (Firebase Storage) ─────────────────────────────────────────────────

const RESUME_PATH = 'resume/resume.pdf'
const META_PATH   = 'resume_meta'

export async function getResumeMeta(): Promise<{ url: string; updatedAt: string } | null> {
  try {
    const snap = await getDoc(doc(db, META_PATH, 'resume'))
    if (!snap.exists()) return null
    const d = snap.data()
    return { url: String(d.url), updatedAt: String(d.updatedAt) }
  } catch {
    return null
  }
}

export async function uploadResume(file: File): Promise<string> {
  const storageRef = ref(storage, RESUME_PATH)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  // Store download URL + timestamp in Firestore so any client can read it
  await updateDoc(doc(db, META_PATH, 'resume'), {
    url,
    updatedAt: new Date().toISOString(),
  }).catch(async () => {
    const { setDoc } = await import('firebase/firestore')
    await setDoc(doc(db, META_PATH, 'resume'), {
      url,
      updatedAt: new Date().toISOString(),
    })
  })
  return url
}

export async function deleteResume(): Promise<void> {
  await deleteObject(ref(storage, RESUME_PATH))
  const { deleteDoc: del } = await import('firebase/firestore')
  await del(doc(db, META_PATH, 'resume')).catch(() => {})
}
