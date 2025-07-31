interface ApiRoute {
  id: string
  name: string
  difficulty: string
  description: string
  originalImagePath: string
  holds: Hold[]
  createdAt: string
  stats: {
    totalHolds: number
    startHolds: number
    normalHolds: number
    finishHolds: number
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  count?: number
}

export const useApiRoutes = () => {
  const routes = ref<ApiRoute[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Récupérer toutes les voies
  const fetchRoutes = async (): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<ApiResponse<ApiRoute[]>>('/api/routes')
      
      if (response.success) {
        routes.value = response.data
      } else {
        throw new Error('Erreur lors de la récupération des voies')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur réseau'
      console.error('Erreur fetchRoutes:', err)
    } finally {
      loading.value = false
    }
  }

  // Créer une nouvelle voie
  const createRoute = async (routeData: {
    name: string
    difficulty: string
    description: string
    imageData: string
    holds: Hold[]
  }): Promise<ApiRoute | null> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<ApiResponse<ApiRoute>>('/api/routes', {
        method: 'POST',
        body: routeData
      })
      
      if (response.success) {
        // Ajouter la nouvelle voie au début de la liste
        routes.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Erreur lors de la création')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création'
      console.error('Erreur createRoute:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Supprimer une voie
  const deleteRoute = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<ApiResponse<any>>(`/api/routes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        // Retirer la voie de la liste locale
        const index = routes.value.findIndex(route => route.id === id)
        if (index > -1) {
          routes.value.splice(index, 1)
        }
        return true
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression')
      }
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression'
      console.error('Erreur deleteRoute:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Obtenir l'URL d'une image
  const getImageUrl = (filename: string): string => {
    return `/api/images/${filename}`
  }

  // Statistiques calculées
  const totalRoutes = computed(() => routes.value.length)
  
  const totalHolds = computed(() => 
    routes.value.reduce((total, route) => total + route.stats.totalHolds, 0)
  )
  
  const averageDifficulty = computed((): string => {
    if (routes.value.length === 0) return '---'
    
    const gradeMap: Record<string, number> = {
      '3a': 1, '3b': 2, '3c': 3, '4a': 4, '4b': 5, '4c': 6,
      '5a': 7, '5b': 8, '5c': 9, '6a': 10, '6b': 11, '6c': 12,
      '7a': 13, '7b': 14, '7c': 15, '8a': 16, '8b': 17, '8c': 18
    }
    
    const difficulties = routes.value.map(route => route.difficulty)
    const gradeNumbers = difficulties.map(d => gradeMap[d] || 0)
    const average = gradeNumbers.reduce((sum, grade) => sum + grade, 0) / gradeNumbers.length
    
    const reverseMap = Object.keys(gradeMap).find(key => gradeMap[key] === Math.round(average))
    return reverseMap || difficulties[0] || '---'
  })

  // Initialiser au montage
  onMounted(() => {
    fetchRoutes()
  })

  return {
    // État
    routes: readonly(routes),
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    fetchRoutes,
    createRoute,
    deleteRoute,
    getImageUrl,
    
    // Statistiques
    totalRoutes,
    totalHolds,
    averageDifficulty
  }
}