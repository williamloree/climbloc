export function calculateAverageDifficulty(routes: any[]): string {
  if (routes.length === 0) return '---'
  
  const gradeMap: Record<string, number> = {
    '3a': 1, '3b': 2, '3c': 3, '4a': 4, '4b': 5, '4c': 6,
    '5a': 7, '5b': 8, '5c': 9, '6a': 10, '6b': 11, '6c': 12,
    '7a': 13, '7b': 14, '7c': 15, '8a': 16, '8b': 17, '8c': 18
  }
  
  const difficulties = routes.map(route => route.difficulty)
  const gradeNumbers = difficulties.map(d => gradeMap[d] || 0)
  const average = gradeNumbers.reduce((sum, grade) => sum + grade, 0) / gradeNumbers.length
  
  const reverseMap = Object.keys(gradeMap).find(key => gradeMap[key] === Math.round(average))
  return reverseMap || difficulties[0] || '---'
}

export function calculateOpenerStats(routes: any[]): Record<string, any> {
  const openerStats = routes.reduce((acc, route) => {
    if (!acc[route.opener]) {
      acc[route.opener] = {
        totalRoutes: 0,
        totalHolds: 0,
        difficulties: [],
        averageDifficulty: '---'
      }
    }
    
    acc[route.opener].totalRoutes++
    acc[route.opener].totalHolds += route.stats.totalHolds
    acc[route.opener].difficulties.push(route.difficulty)
    
    return acc
  }, {} as Record<string, any>)
  
  // Calculer la difficulté moyenne pour chaque ouvreur
  Object.keys(openerStats).forEach(opener => {
    const stats = openerStats[opener]
    stats.averageDifficulty = calculateAverageDifficulty([{ difficulty: stats.difficulties[0] || '5a' }])
  })
  
  return openerStats
}

export function calculateDifficultyDistribution(routes: any[]): Record<string, number> {
  return routes.reduce((acc, route) => {
    acc[route.difficulty] = (acc[route.difficulty] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}