<template>
  <div class="w-full max-w-6xl mx-auto">
    <!-- Indicateur de chargement -->
    <div v-if="loading" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
        <div class="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p class="text-gray-700 font-medium">Traitement en cours...</p>
      </div>
    </div>

    <!-- Alerte d'erreur -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div class="flex items-center gap-3">
        <span class="text-red-500 text-xl">❌</span>
        <p class="text-red-800 font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- Section de création -->
    <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span class="text-2xl">🏔️</span>
        Informations de la Voie
      </h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label for="routeName" class="block text-sm font-medium text-gray-700 mb-2">
            Nom de la voie :
          </label>
          <input 
            id="routeName"
            v-model="currentRoute.name" 
            type="text" 
            placeholder="Ex: La Traverse du Débutant"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          />
        </div>
        
        <div>
          <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-2">
            Difficulté :
          </label>
          <select 
            id="difficulty"
            v-model="currentRoute.difficulty" 
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          >
            <option value="">Sélectionner une difficulté</option>
            <option 
              v-for="option in DIFFICULTY_OPTIONS" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="mt-6">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Description / Conseils :
        </label>
        <textarea 
          id="description"
          v-model="currentRoute.description" 
          placeholder="Décrivez la voie, donnez des conseils aux grimpeurs..."
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-vertical"
          rows="3"
        />
      </div>
      
      <div class="mt-6">
        <label for="image-upload" class="block text-sm font-medium text-gray-700 mb-2">
          Photo du mur d'escalade :
        </label>
        <input 
          id="image-upload"
          type="file" 
          accept="image/*" 
          @change="handleImageUpload"
          class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 transition-all duration-200 cursor-pointer bg-white"
        />
      </div>
      
      <button 
        @click="saveRoute" 
        :disabled="!canSave || loading" 
        class="w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
        :class="canSave && !loading
          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
          : 'bg-gray-400 text-gray-200 cursor-not-allowed'"
      >
        {{ loading ? '💾 Sauvegarde en cours...' : '💾 Sauvegarder la Voie' }}
      </button>
    </div>

    <!-- Section d'édition de l'image -->
    <div v-if="currentRoute.src" class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        <span class="text-xl">🎯</span>
        Cliquez sur les prises dans l'ordre de progression
      </h3>
      
      <div class="text-center mb-4">
        <div class="inline-flex items-center gap-4 bg-gray-100 rounded-xl px-6 py-3">
          <span class="text-gray-700 font-medium">Prochaine prise :</span>
          <span 
            class="text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
            :class="getNextHoldColorClass()"
          >
            {{ currentRoute.holds.length + 1 }}
          </span>
        </div>
      </div>
      
      <div class="text-center mb-6">
        <div class="relative inline-block">
          <img 
            :src="currentRoute.src" 
            @click="addHold"
            @load="onImageLoad"
            ref="imageRef"
            class="max-w-full max-h-[600px] border-4 border-gray-300 rounded-xl cursor-crosshair shadow-lg"
            alt="Mur d'escalade à annoter"
          />
          
          <!-- Marqueurs des prises -->
          <div 
            v-for="(hold, index) in currentRoute.holds" 
            :key="`hold-${index}`"
            class="absolute text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110"
            :class="getHoldStyleClass(hold.type)"
            :style="{ 
              left: hold.x + 'px', 
              top: hold.y + 'px' 
            }"
            @click.stop="removeHold(index)"
            :title="`Prise ${index + 1} (${getHoldTypeName(hold.type)}) - Clic pour supprimer`"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-emerald-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-emerald-600">{{ currentRoute.holds.length }}</div>
          <div class="text-sm text-gray-600">Prises marquées</div>
        </div>
        
        <div class="bg-green-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-green-600">{{ startHolds }}</div>
          <div class="text-sm text-gray-600">Prises de départ</div>
        </div>
        
        <div class="bg-red-50 rounded-xl p-4 text-center">
          <div class="text-2xl font-bold text-red-600">{{ finishHolds }}</div>
          <div class="text-sm text-gray-600">Prises d'arrivée</div>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 justify-center mb-6">
        <button 
          v-for="holdType in HOLD_TYPES" 
          :key="holdType.key"
          @click="setNextHoldType(holdType.key)"
          class="px-4 py-2 rounded-lg font-medium transition-all duration-200"
          :class="nextHoldType === holdType.key 
            ? 'bg-emerald-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          {{ holdType.emoji }} {{ holdType.label }}
        </button>
      </div>
      
      <div class="p-4 bg-blue-50 rounded-xl mb-4">
        <p class="text-sm text-blue-800">
          <strong>💡 Conseil :</strong> Cliquez sur les prises dans l'ordre où elles doivent être utilisées. 
          Commencez par les prises de départ (vertes), puis suivez la progression jusqu'aux prises de fin (rouges).
        </p>
      </div>
      
      <div class="flex gap-2 justify-center">
        <button 
          @click="undoLastHold" 
          :disabled="currentRoute.holds.length === 0"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200"
          :class="currentRoute.holds.length > 0 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'"
        >
          ↶ Annuler dernière prise
        </button>
        
        <button 
          @click="clearAllHolds" 
          :disabled="currentRoute.holds.length === 0"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200"
          :class="currentRoute.holds.length > 0 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'"
        >
          🗑️ Effacer tout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hold, RouteFormData } from '~/types'
import { DIFFICULTY_OPTIONS, HOLD_TYPES } from '~/types'

// Composables
const { createRoute, loading, error } = useApiRoutes()

// Refs
const imageRef = ref<HTMLImageElement>()
const imageScale = ref<number>(1)
const nextHoldType = ref<Hold['type']>('start')

// Reactive form data
const currentRoute = reactive<RouteFormData>({
  name: '',
  difficulty: '',
  description: '',
  src: null,
  holds: [],
  originalWidth: 0,
  originalHeight: 0
})

// Computed properties
const canSave = computed((): boolean => 
  Boolean(currentRoute.name && 
         currentRoute.difficulty && 
         currentRoute.src && 
         currentRoute.holds.length >= 2)
)

const startHolds = computed((): number => 
  currentRoute.holds.filter(hold => hold.type === 'start').length
)

const finishHolds = computed((): number => 
  currentRoute.holds.filter(hold => hold.type === 'finish').length
)

// Methods
const handleImageUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      currentRoute.src = e.target?.result as string
      currentRoute.holds = []
    }
    reader.readAsDataURL(file)
  }
}

const onImageLoad = (): void => {
  const img = imageRef.value
  if (img) {
    currentRoute.originalWidth = img.naturalWidth
    currentRoute.originalHeight = img.naturalHeight
    calculateScale()
  }
}

const calculateScale = (): void => {
  const img = imageRef.value
  if (img) {
    imageScale.value = img.offsetWidth / img.naturalWidth
  }
}

const addHold = (event: MouseEvent): void => {
  const target = event.target as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Convertir en coordonnées relatives à l'image originale
  const actualX = x / imageScale.value
  const actualY = y / imageScale.value
  
  const newHold: Hold = {
    x: x, // Position pour l'affichage
    y: y,
    actualX: actualX, // Position réelle sur l'image
    actualY: actualY,
    type: nextHoldType.value,
    order: currentRoute.holds.length + 1
  }
  
  currentRoute.holds.push(newHold)
  
  // Auto-progression du type de prise
  if (nextHoldType.value === 'start' && startHolds.value >= 2) {
    nextHoldType.value = 'normal'
  }
}

const removeHold = (index: number): void => {
  currentRoute.holds.splice(index, 1)
  // Réorganiser les numéros d'ordre
  currentRoute.holds.forEach((hold, i) => {
    hold.order = i + 1
  })
}

const undoLastHold = (): void => {
  if (currentRoute.holds.length > 0) {
    currentRoute.holds.pop()
  }
}

const clearAllHolds = (): void => {
  if (confirm('Êtes-vous sûr de vouloir effacer toutes les prises marquées ?')) {
    currentRoute.holds = []
    nextHoldType.value = 'start'
  }
}

const setNextHoldType = (type: Hold['type']): void => {
  nextHoldType.value = type
}

const getHoldStyleClass = (type: Hold['type']): string => {
  switch (type) {
    case 'start': return 'w-10 h-10 text-lg bg-green-500'
    case 'finish': return 'w-10 h-10 text-lg bg-red-500'
    default: return 'w-8 h-8 text-sm bg-blue-500'
  }
}

const getNextHoldColorClass = (): string => {
  switch (nextHoldType.value) {
    case 'start': return 'bg-green-500'
    case 'finish': return 'bg-red-500'
    default: return 'bg-blue-500'
  }
}

const getHoldTypeName = (type: Hold['type']): string => {
  switch (type) {
    case 'start': return 'Départ'
    case 'finish': return 'Arrivée'
    default: return 'Normale'
  }
}

const saveRoute = async (): Promise<void> => {
  if (!canSave.value || loading.value) return

  const annotatedImage = await generateAnnotatedImage()

  const routeData = {
    name: currentRoute.name,
    difficulty: currentRoute.difficulty,
    description: currentRoute.description,
    imageData: annotatedImage, // l’image avec les prises intégrées
    holds: currentRoute.holds.map(hold => ({
      ...hold,
      x: hold.actualX,
      y: hold.actualY
    }))
  }

  const createdRoute = await createRoute(routeData)

  if (createdRoute) {
    resetForm()
    alert(`🎉 Voie "${createdRoute.name}" créée avec succès !`)
  }
}

const resetForm = (): void => {
  Object.assign(currentRoute, {
    name: '',
    difficulty: '',
    description: '',
    src: null,
    holds: [],
    originalWidth: 0,
    originalHeight: 0
  })
  
  nextHoldType.value = 'start'
  
  // Reset du input file
  const fileInput = document.getElementById('image-upload') as HTMLInputElement
  if (fileInput) fileInput.value = ''
}

// Watch for window resize
if (process.client) {
  window.addEventListener('resize', calculateScale)
}

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', calculateScale)
  }
})

const generateAnnotatedImage = async (): Promise<string> => {
  const img = imageRef.value
  if (!img) throw new Error('Image non chargée')

  // Créer un canvas avec les dimensions originales
  const canvas = document.createElement('canvas')
  canvas.width = currentRoute.originalWidth
  canvas.height = currentRoute.originalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Contexte 2D non disponible')

  // Dessiner l’image de base
  const baseImage = new Image()
  baseImage.src = currentRoute.src as string
  await new Promise((resolve) => (baseImage.onload = resolve))
  ctx.drawImage(baseImage, 0, 0)

  // Définir le style des prises
  currentRoute.holds.forEach((hold, index) => {
    const x = hold.actualX
    const y = hold.actualY
    const radius = hold.type === 'start' || hold.type === 'finish' ? 20 : 15

    // Couleur de fond
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fillStyle =
      hold.type === 'start'
        ? '#10B981' // vert
        : hold.type === 'finish'
        ? '#EF4444' // rouge
        : '#3B82F6' // bleu
    ctx.fill()

    // Contour blanc
    ctx.lineWidth = 4
    ctx.strokeStyle = '#FFFFFF'
    ctx.stroke()

    // Numéro
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 20px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((index + 1).toString(), x, y)
  })

  return canvas.toDataURL('image/png')
}
</script>

<style scoped>
/* Animation pour les marqueurs de prises */
@keyframes holdAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.absolute {
  animation: holdAppear 0.3s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .w-10 {
    width: 2rem !important;
    height: 2rem !important;
  }
  
  .w-8 {
    width: 1.75rem !important;
    height: 1.75rem !important;
  }
}
</style>