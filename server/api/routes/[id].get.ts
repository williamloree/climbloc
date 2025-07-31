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

    return {
      success: true,
      data: route
    }
  } catch (error) {
    console.error('Erreur lors de la récupération:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur'
    })
  }
})