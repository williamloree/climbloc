export default defineEventHandler(async (event) => {
  try {
    const opener = getRouterParam(event, 'opener')
    
    if (!opener) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nom de l\'ouvreur requis'
      })
    }

    const routes = await getRoutesByOpener(opener)

    return {
      success: true,
      data: routes,
      count: routes.length,
      opener: opener
    }
  } catch (error) {
    console.error('Erreur lors de la récupération par ouvreur:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur'
    })
  }
})