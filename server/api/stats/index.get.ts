export default defineEventHandler(async (event) => {
  try {
    const routes = await getRoutes()
    
    // Calcul des statistiques
    const stats = {
      totalRoutes: routes.length,
      totalHolds: routes.reduce((sum, route) => sum + route.stats.totalHolds, 0),
      averageDifficulty: calculateAverageDifficulty(routes),
      openerStats: calculateOpenerStats(routes),
      difficultyDistribution: calculateDifficultyDistribution(routes),
      recentRoutes: routes.slice(0, 5) // 5 dernières voies
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Erreur lors du calcul des stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur serveur lors du calcul des statistiques'
    })
  }
})