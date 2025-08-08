export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de la voie requis'
      })
    }

    const route = await getRouteById(id)
    if (!route) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Voie non trouvée'
      })
    }

    // Supprimer le fichier image
    await deleteImageFiles(route.originalImagePath)
    
    // Supprimer de la base de données
    await deleteRoute(id)

    return {
      success: true,
      message: `Voie "${route.name}" supprimée avec succès`
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur lors de la suppression'
    })
  }
})