export const useAuth = () => {
  const isAuthenticated = ref<boolean>(false)
  const passwordInput = ref<string>('')
  const showError = ref<boolean>(false)
  const adminPassword = 'admin123'

  // Vérifier l'authentification au montage
  const checkAuth = (): void => {
    if (process.client) {
      const sessionAuth = sessionStorage.getItem('isAuthenticated')
      if (sessionAuth === 'true') {
        isAuthenticated.value = true
      }
    }
  }

  // Authentifier l'utilisateur
  const authenticate = (): boolean => {
    if (passwordInput.value === adminPassword) {
      isAuthenticated.value = true
      showError.value = false
      passwordInput.value = ''
      
      // Sauvegarder l'authentification pour la session
      if (process.client) {
        sessionStorage.setItem('isAuthenticated', 'true')
        
        // Vibration sur mobile si supportée
        if (navigator.vibrate) {
          navigator.vibrate(200)
        }
      }
      return true
    } else {
      showError.value = true
      passwordInput.value = ''
      
      // Vibration d'erreur sur mobile
      if (process.client && navigator.vibrate) {
        navigator.vibrate(200)
      }
      return false
    }
  }

  // Déconnexion
  const logout = (): void => {
    isAuthenticated.value = false
    if (process.client) {
      sessionStorage.removeItem('isAuthenticated')
    }
  }

  // Réinitialiser l'erreur quand l'utilisateur tape
  const clearError = (): void => {
    showError.value = false
  }

  // Initialiser au montage
  onMounted(() => {
    checkAuth()
  })

  return {
    isAuthenticated: readonly(isAuthenticated),
    passwordInput,
    showError: readonly(showError),
    authenticate,
    logout,
    clearError
  }
}