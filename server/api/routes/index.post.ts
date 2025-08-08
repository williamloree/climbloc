import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, difficulty, description, imageData, holds, opener } = body

    // Validation des données
    if (!name || !difficulty || !imageData || !holds || !opener) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Données manquantes (name, difficulty, imageData, holds, opener requis)'
      })
    }

    // Validation de l'ouvreur
    const validOpeners = ["Will", "Joye", "Max"]
    if (!validOpeners.includes(opener)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ouvreur invalide. Doit être Will, Joye ou Max'
      })
    }

    // Sauvegarde de l'image originale
    const originalImagePath = await saveOriginalImage(imageData)
    
    // Création de l'objet route
    const route = {
      id: generateId(),
      name,
      difficulty,
      description: description || '',
      originalImagePath,
      holds,
      opener,
      createdAt: new Date().toISOString(),
      stats: {
        totalHolds: holds.length,
        startHolds: holds.filter((h: any) => h.type === 'start').length,
        normalHolds: holds.filter((h: any) => h.type === 'normal').length,
        finishHolds: holds.filter((h: any) => h.type === 'finish').length
      }
    }

    // Sauvegarde en base de données
    await saveRoute(route)

    return {
      success: true,
      data: route,
      message: `Voie "${name}" créée avec succès par ${opener}`
    }
  } catch (error) {
    console.error('Erreur lors de la création:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur lors de la création de la voie'
    })
  }
})