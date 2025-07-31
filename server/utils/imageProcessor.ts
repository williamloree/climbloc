import sharp from 'sharp'
import path from 'path'
import { promises as fs } from 'fs'

export async function saveOriginalImage(imageData: string): Promise<string> {
  try {
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')
    
    const filename = `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
    const filepath = path.join(process.cwd(), 'storage/images', filename)
    
    await ensureDirectoryExists(path.dirname(filepath))
    
    // Optimiser l'image avec Sharp
    await sharp(imageBuffer)
      .jpeg({ quality: 85 })
      .resize(1920, 1080, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .toFile(filepath)
    
    return filename
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'image:', error)
    throw new Error('Impossible de sauvegarder l\'image')
  }
}

async function ensureDirectoryExists(dir: string): Promise<void> {
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}