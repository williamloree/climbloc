import { updateRoute, getRouteById } from '../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== DÉBUT UPDATE ROUTE ===')
    
    const id = getRouterParam(event, 'id')
    console.log('ID reçu:', id)
    
    const body = await readBody(event)
    console.log('Body reçu:', body)
    
    if (!id) {
      console.error('ID manquant')
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de la voie requis'
      })
    }

    // Récupérer la route existante
    console.log('Recherche de la route existante...')
    const existingRoute = await getRouteById(id)
    console.log('Route existante trouvée:', existingRoute ? 'OUI' : 'NON')
    
    if (!existingRoute) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Voie non trouvée'
      })
    }

    // Validation des données modifiables
    const { name, difficulty, description, opener } = body

    console.log('Validation des données:', { name, difficulty, description, opener })

    if (!name || !difficulty || !opener) {
      console.error('Données manquantes:', { name: !!name, difficulty: !!difficulty, opener: !!opener })
      throw createError({
        statusCode: 400,
        statusMessage: 'Données manquantes (name, difficulty, opener requis)'
      })
    }

    // Validation de l'ouvreur
    const validOpeners = ["Will", "Joye", "Max"]
    if (!validOpeners.includes(opener)) {
      console.error('Ouvreur invalide:', opener)
      throw createError({
        statusCode: 400,
        statusMessage: 'Ouvreur invalide. Doit être Will, Joye ou Max'
      })
    }

    // Créer l'objet route mis à jour (on garde les données existantes non modifiables)
    const updatedRoute = {
      ...existingRoute,
      name: name.trim(),
      difficulty,
      description: description?.trim() || '',
      opener,
      updatedAt: new Date().toISOString()
    }

    console.log('Route mise à jour préparée:', updatedRoute)

    // Mettre à jour en base de données
    console.log('Sauvegarde en base...')
    await updateRoute(id, updatedRoute)
    console.log('Sauvegarde réussie')

    console.log('=== FIN UPDATE ROUTE (SUCCÈS) ===')

    return {
      success: true,
      data: updatedRoute,
      message: `Bloc "${name}" modifié avec succès`
    }
  } catch (error:any) {
    console.error('=== ERREUR UPDATE ROUTE ===')
    console.error('Type d\'erreur:', error.constructor.name)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('=== FIN ERREUR ===')
    
    // Si c'est déjà une erreur HTTP, la relancer
    if (error.statusCode) {
      throw error
    }
    
    // Sinon, créer une erreur générique
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur serveur: ${error.message}`
    })
  }
})