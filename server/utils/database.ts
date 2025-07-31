import { promises as fs } from 'fs'
import path from 'path'

interface Route {
  id: string
  name: string
  difficulty: string
  description: string
  originalImagePath: string
  holds: any[]
  createdAt: string
  stats: {
    totalHolds: number
    startHolds: number
    normalHolds: number
    finishHolds: number
  }
}

const DB_PATH = path.join(process.cwd(), 'storage/database/routes.json')

export async function initDatabase(): Promise<void> {
  try {
    await ensureDirectoryExists(path.dirname(DB_PATH))
    
    try {
      await fs.access(DB_PATH)
    } catch {
      // Créer le fichier de base de données s'il n'existe pas
      await fs.writeFile(DB_PATH, JSON.stringify([]))
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error)
  }
}

export async function getRoutes(): Promise<Route[]> {
  try {
    await initDatabase()
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erreur lors de la lecture:', error)
    return []
  }
}

export async function saveRoute(route: Route): Promise<void> {
  try {
    const routes = await getRoutes()
    routes.unshift(route)
    await fs.writeFile(DB_PATH, JSON.stringify(routes, null, 2))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    throw new Error('Impossible de sauvegarder la voie')
  }
}

export async function getRouteById(id: string): Promise<Route | null> {
  try {
    const routes = await getRoutes()
    return routes.find(route => route.id === id) || null
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    return null
  }
}

export async function deleteRoute(id: string): Promise<void> {
  try {
    const routes = await getRoutes()
    const filteredRoutes = routes.filter(route => route.id !== id)
    await fs.writeFile(DB_PATH, JSON.stringify(filteredRoutes, null, 2))
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    throw new Error('Impossible de supprimer la voie')
  }
}

export async function deleteImageFiles(...filenames: string[]): Promise<void> {
  try {
    for (const filename of filenames) {
      if (filename) {
        const filepath = path.join(process.cwd(), 'storage/images', filename)
        try {
          await fs.unlink(filepath)
        } catch (error) {
          console.warn(`Impossible de supprimer ${filename}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des images:', error)
  }
}

async function ensureDirectoryExists(dir: string): Promise<void> {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}