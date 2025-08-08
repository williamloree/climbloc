import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import path from 'path'

export default defineEventHandler(async (event) => {
  try {
    const filename = getRouterParam(event, 'filename')
    
    if (!filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nom de fichier requis'
      })
    }

    // Validation du nom de fichier pour éviter les attaques de traversée de chemin
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nom de fichier invalide'
      })
    }

    const imagePath = path.join(process.cwd(), 'storage/images', filename)
    
    // Vérifier si le fichier existe
    try {
      await stat(imagePath)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'Image non trouvée'
      })
    }

    // Définir les headers appropriés
    setHeader(event, 'Content-Type', getContentType(filename))
    setHeader(event, 'Cache-Control', 'public, max-age=31536000')
    setHeader(event, 'Access-Control-Allow-Origin', '*')

    // Retourner le stream de l'image
    return sendStream(event, createReadStream(imagePath))
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur'
    })
  }
})