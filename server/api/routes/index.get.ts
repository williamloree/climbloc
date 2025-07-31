export default defineEventHandler(async (event) => {
  try {
    const routes = await getRoutes()
    return {
      success: true,
      data: routes,
      count: routes.length
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des voies:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur lors de la récupération des voies'
    })
  }
})