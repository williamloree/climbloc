<template>
  <div class="w-full max-w-6xl mx-auto">
    <!-- Indicateur de chargement -->
    <div
      v-if="loading"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
        <div
          class="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"
        ></div>
        <p class="text-gray-700 font-medium">Traitement en cours...</p>
      </div>
    </div>

    <!-- Alerte d'erreur -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <div class="flex items-center gap-3">
        <span class="text-red-500 text-xl">❌</span>
        <p class="text-red-800 font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- Section de création de la voie -->
    <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        Créer une Nouveau bloc
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label
            for="routeName"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Nom de la voie : <span class="text-red-500">*</span>
          </label>
          <input
            id="routeName"
            v-model="currentRoute.name"
            type="text"
            placeholder="Ex: La Traverse du Débutant"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200"
            required
          />
        </div>

        <div>
          <label
            for="difficulty"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Difficulté : <span class="text-red-500">*</span>
          </label>
          <select
            id="difficulty"
            v-model="currentRoute.difficulty"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200"
            required
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

      <div class="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <label
            for="opener"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Ouvreur : <span class="text-red-500">*</span>
          </label>
          <select
            id="opener"
            v-model="currentRoute.opener"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200"
            required
          >
            <option value="">Sélectionner un ouvreur</option>
            <option
              v-for="opener in OPENER_OPTIONS"
              :key="opener"
              :value="opener"
            >
              {{ opener }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="image-upload"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Photo du mur : <span class="text-red-500">*</span>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl transition-all duration-200 cursor-pointer bg-white"
            required
          />
          <!-- Indicateur de taille de fichier -->
          <div v-if="originalFileSize || resizedFileSize" class="mt-2 text-xs text-gray-600">
            <div v-if="originalFileSize">Taille originale: {{ formatFileSize(originalFileSize) }}</div>
            <div v-if="resizedFileSize" class="text-green-600">
              Taille redimensionnée: {{ formatFileSize(resizedFileSize) }}
              <span v-if="originalFileSize">({{ Math.round((1 - resizedFileSize / originalFileSize) * 100) }}% de réduction)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Description / Conseils :
        </label>
        <textarea
          id="description"
          v-model="currentRoute.description"
          placeholder="Décrivez la voie, donnez des conseils aux grimpeurs..."
          class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 resize-vertical"
          rows="3"
        />
      </div>

      <button
        @click="saveRoute"
        :disabled="!canSave || loading"
        class="w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
        :class="
          canSave && !loading
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        "
      >
        {{ loading ? "Sauvegarde en cours..." : "Sauvegarder la Voie" }}
      </button>
    </div>

    <!-- Section d'édition de l'image -->
    <div
      v-if="currentRoute.src"
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6"
    >
      <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        Cliquez sur les prises et appuis dans l'ordre de progression
      </h3>

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
            class="absolute transform cursor-pointer transition-all duration-200 hover:scale-110"
            :class="getHoldStyleClass(hold.type)"
            :style="{
              left: hold.x + 'px',
              top: hold.y + 'px',
              transform: 'translate(-50%, -50%)',
            }"
            @click.stop="removeHold(index)"
            :title="`${getHoldTypeName(hold.type)} ${
              index + 1
            } - Clic pour supprimer`"
          />
        </div>
      </div>

      <!-- Sélecteur de type de prise -->
      <div class="flex flex-wrap gap-2 justify-center mb-6">
        <button
          v-for="holdType in EXTENDED_HOLD_TYPES"
          :key="holdType.key"
          @click="setNextHoldType(holdType.key)"
          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          :class="
            nextHoldType === holdType.key
              ? 'bg-emerald-500 text-white transform scale-105'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          "
        >
          <span class="text-lg">{{ holdType.emoji }}</span>
          <span>{{ holdType.label }}</span>
        </button>
      </div>

      <!-- Instructions d'utilisation -->
      <div class="p-4 bg-blue-50 rounded-xl mb-4">
        <h4 class="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          Instructions d'utilisation
        </h4>
        <div class="text-sm text-blue-800 space-y-1">
          <p>
            <strong>🟢 Prises de départ :</strong> Première(s) prise(s) à saisir
            au début
          </p>
          <p>
            <strong>🔵 Prises normales :</strong> Prises intermédiaires pour les
            mains
          </p>
          <p>
            <strong>🟡 Appuis pieds :</strong> Points d'appui pour les pieds
            (optionnels)
          </p>
          <p>
            <strong>🔴 Prises d'arrivée :</strong> Dernière(s) prise(s) pour
            terminer la voie
          </p>
          <p class="mt-2 font-medium">
            Cliquez dans l'ordre de progression. Les appuis pieds peuvent être
            placés à tout moment.
          </p>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          @click="undoLastHold"
          :disabled="currentRoute.holds.length === 0"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          :class="
            currentRoute.holds.length > 0
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          "
        >
          <span>↶</span>
          Annuler dernière
        </button>

        <button
          @click="clearAllHolds"
          :disabled="currentRoute.holds.length === 0"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          :class="
            currentRoute.holds.length > 0
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          "
        >
          <span>🗑️</span>
          Effacer tout
        </button>

        <button
          @click="toggleFootMode"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          :class="
            footModeEnabled
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          "
        >
          <span>👟</span>
          {{ footModeEnabled ? "Mode pieds ON" : "Mode pieds OFF" }}
        </button>

        <button
          @click="showHoldsList = !showHoldsList"
          class="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <span>📋</span>
          {{ showHoldsList ? "Masquer liste" : "Voir liste" }}
        </button>
      </div>

      <!-- Liste détaillée des prises -->
      <div v-if="showHoldsList" class="mt-6 bg-gray-50 rounded-xl p-4">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>📋</span>
          Liste des prises ({{ currentRoute.holds.length }})
        </h4>

        <div
          v-if="currentRoute.holds.length === 0"
          class="text-gray-500 text-center py-4"
        >
          Aucune prise marquée pour le moment
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          <div
            v-for="(hold, index) in currentRoute.holds"
            :key="`list-hold-${index}`"
            class="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex items-center justify-center text-white font-bold border-2 border-white shadow-sm"
                :class="getHoldStyleClass(hold.type)"
              >
                <span v-if="hold.type !== 'foot'" class="text-xs">{{
                  index + 1
                }}</span>
                <span v-else class="text-sm">👟</span>
              </span>
              <div>
                <div class="font-medium text-gray-800">
                  {{ getHoldTypeName(hold.type) }}
                </div>
                <div class="text-xs text-gray-500">
                  Position: {{ Math.round(hold.actualX) }},
                  {{ Math.round(hold.actualY) }}
                </div>
              </div>
            </div>
            <button
              @click="removeHold(index)"
              class="text-red-500 hover:text-red-700 p-1 rounded transition-colors duration-200"
              title="Supprimer cette prise"
            >
              ❌
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteFormData } from "~/types";
import { DIFFICULTY_OPTIONS, HOLD_TYPES, OPENER_OPTIONS } from "~/types";

interface Hold {
  x: number;
  y: number;
  actualX: number;
  actualY: number;
  type: "start" | "normal" | "foot" | "finish";
  order: number;
}

// Configuration pour le redimensionnement
const IMAGE_CONFIG = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  minSizeForResize: 500 * 1024 // 500KB - seuil minimum pour déclencher le redimensionnement
};

// Composables
const { createRoute, loading, error } = useApiRoutes();

// Refs
const imageRef = ref<HTMLImageElement>();
const imageScale = ref<number>(1);
const nextHoldType = ref<"start" | "normal" | "foot" | "finish">("start");
const footModeEnabled = ref<boolean>(false);
const showHoldsList = ref<boolean>(false);
const originalFileSize = ref<number>(0);
const resizedFileSize = ref<number>(0);

// Types de prises étendus avec les pieds
const EXTENDED_HOLD_TYPES = [
  { key: "start", label: "Départ", emoji: "🟢" },
  { key: "normal", label: "Normale", emoji: "🔵" },
  { key: "foot", label: "Pied", emoji: "👟" },
  { key: "finish", label: "Arrivée", emoji: "🔴" },
] as const;

// Reactive form data
const currentRoute = reactive<RouteFormData & { holds: Hold[] }>({
  name: "",
  difficulty: "",
  description: "",
  src: null,
  originalWidth: 0,
  originalHeight: 0,
  opener: "",
  holds: [],
});

// Computed properties
const canSave = computed((): boolean =>
  Boolean(
    currentRoute.name &&
      currentRoute.difficulty &&
      currentRoute.src &&
      currentRoute.opener &&
      currentRoute.holds.filter((h) => h.type !== "foot").length >= 2 // Au moins 2 prises non-pied
  )
);

const startHolds = computed(
  (): number =>
    currentRoute.holds.filter((hold) => hold.type === "start").length
);

const normalHolds = computed(
  (): number =>
    currentRoute.holds.filter((hold) => hold.type === "normal").length
);

const footHolds = computed(
  (): number => currentRoute.holds.filter((hold) => hold.type === "foot").length
);

const finishHolds = computed(
  (): number =>
    currentRoute.holds.filter((hold) => hold.type === "finish").length
);

// Fonction pour formater la taille des fichiers
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Fonction pour redimensionner une image
const resizeImage = (file: File): Promise<{ dataUrl: string; blob: Blob; size: number }> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Cannot get canvas context'));
      return;
    }

    img.onload = () => {
      let { width, height } = img;
      
      // Calculer les nouvelles dimensions en conservant le ratio
      if (width > height) {
        if (width > IMAGE_CONFIG.maxWidth) {
          height = (height * IMAGE_CONFIG.maxWidth) / width;
          width = IMAGE_CONFIG.maxWidth;
        }
      } else {
        if (height > IMAGE_CONFIG.maxHeight) {
          width = (width * IMAGE_CONFIG.maxHeight) / height;
          height = IMAGE_CONFIG.maxHeight;
        }
      }

      // Redimensionner le canvas
      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en blob et dataURL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_CONFIG.quality);
            resolve({
              dataUrl,
              blob,
              size: blob.size
            });
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        IMAGE_CONFIG.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Methods
const handleImageUpload = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  try {
    originalFileSize.value = file.size;
    
    // Si le fichier est déjà petit, pas besoin de redimensionner
    if (file.size <= IMAGE_CONFIG.minSizeForResize) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentRoute.src = e.target?.result as string;
        currentRoute.holds = [];
        resizedFileSize.value = file.size;
      };
      reader.readAsDataURL(file);
      return;
    }

    // Redimensionner l'image si elle est trop lourde
    const resizedImage = await resizeImage(file);
    currentRoute.src = resizedImage.dataUrl;
    currentRoute.holds = [];
    resizedFileSize.value = resizedImage.size;
    
  } catch (error) {
    console.error('Erreur lors du redimensionnement:', error);
    // Fallback: utiliser l'image originale
    const reader = new FileReader();
    reader.onload = (e) => {
      currentRoute.src = e.target?.result as string;
      currentRoute.holds = [];
      resizedFileSize.value = originalFileSize.value;
    };
    reader.readAsDataURL(file);
  }
};

const onImageLoad = (): void => {
  const img = imageRef.value;
  if (img) {
    currentRoute.originalWidth = img.naturalWidth;
    currentRoute.originalHeight = img.naturalHeight;
    calculateScale();
  }
};

const calculateScale = (): void => {
  const img = imageRef.value;
  if (img) {
    imageScale.value = img.offsetWidth / img.naturalWidth;
  }
};

const addHold = (event: MouseEvent): void => {
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Convertir en coordonnées relatives à l'image originale
  const actualX = x / imageScale.value;
  const actualY = y / imageScale.value;

  const newHold: Hold = {
    x: x, // Position pour l'affichage
    y: y,
    actualX: actualX, // Position réelle sur l'image
    actualY: actualY,
    type: nextHoldType.value,
    order: currentRoute.holds.length + 1,
  };

  currentRoute.holds.push(newHold);

  // Auto-progression du type de prise (sauf pour les pieds)
  if (!footModeEnabled.value) {
    if (nextHoldType.value === "start" && startHolds.value >= 2) {
      nextHoldType.value = "normal";
    }
  }
};

const removeHold = (index: number): void => {
  currentRoute.holds.splice(index, 1);
  // Réorganiser les numéros d'ordre
  currentRoute.holds.forEach((hold, i) => {
    hold.order = i + 1;
  });
};

const undoLastHold = (): void => {
  if (currentRoute.holds.length > 0) {
    currentRoute.holds.pop();
  }
};

const clearAllHolds = (): void => {
  if (
    confirm("Êtes-vous sûr de vouloir effacer toutes les prises marquées ?")
  ) {
    currentRoute.holds = [];
    nextHoldType.value = "start";
    footModeEnabled.value = false;
  }
};

const setNextHoldType = (
  type: "start" | "normal" | "foot" | "finish"
): void => {
  nextHoldType.value = type;
  footModeEnabled.value = type === "foot";
};

const toggleFootMode = (): void => {
  footModeEnabled.value = !footModeEnabled.value;
  if (footModeEnabled.value) {
    nextHoldType.value = "foot";
  } else {
    nextHoldType.value = startHolds.value < 2 ? "start" : "normal";
  }
};

const getHoldStyleClass = (type: "start" | "normal" | "foot" | "finish"): string => {
  switch (type) {
    case "start":
      return "w-10 h-10 border-4 border-green-500 rounded-full opacity-80 bg-transparent";
    case "finish":
      return "w-10 h-10 border-4 border-red-500 rounded-full opacity-80 bg-transparent";
    case "foot":
      return "w-10 h-6 border-4 border-yellow-400 rounded-md opacity-80 bg-transparent";
    default: // normal
      return "w-8 h-8 border-4 border-blue-500 rounded-full opacity-80 bg-transparent";
  }
};

const getNextHoldDisplayClass = (): string => {
  const baseClasses = "w-8 h-8";
  switch (nextHoldType.value) {
    case "start":
      return `${baseClasses} bg-green-500 rounded-full`;
    case "finish":
      return `${baseClasses} bg-red-500 rounded-full`;
    case "foot":
      return "w-8 h-6 bg-yellow-500 rounded-md text-sm";
    default:
      return `${baseClasses} bg-blue-500 rounded-full`;
  }
};

const getHoldTypeName = (
  type: "start" | "normal" | "foot" | "finish"
): string => {
  switch (type) {
    case "start":
      return "Départ";
    case "finish":
      return "Arrivée";
    case "foot":
      return "Appui pied";
    default:
      return "Normale";
  }
};

const saveRoute = async (): Promise<void> => {
  if (!canSave.value || loading.value) return;

  const annotatedImage = await generateAnnotatedImage();

  const routeData = {
    name: currentRoute.name,
    difficulty: currentRoute.difficulty,
    description: currentRoute.description,
    opener: currentRoute.opener,
    imageData: annotatedImage,
    holds: currentRoute.holds.map((hold) => ({
      ...hold,
      x: hold.actualX,
      y: hold.actualY,
    })),
  };

  const createdRoute = await createRoute(routeData);

  if (createdRoute) {
    resetForm();
  }
};

const resetForm = (): void => {
  Object.assign(currentRoute, {
    name: "",
    difficulty: "",
    description: "",
    src: null,
    originalWidth: 0,
    originalHeight: 0,
    opener: "",
    holds: [],
  });

  nextHoldType.value = "start";
  footModeEnabled.value = false;
  showHoldsList.value = false;
  originalFileSize.value = 0;
  resizedFileSize.value = 0;

  // Reset du input file
  const fileInput = document.getElementById("image-upload") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
};

const generateAnnotatedImage = async (): Promise<string> => {
  const img = imageRef.value;
  if (!img) throw new Error("Image non chargée");

  // Créer un canvas avec les dimensions originales
  const canvas = document.createElement("canvas");
  canvas.width = currentRoute.originalWidth;
  canvas.height = currentRoute.originalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte 2D non disponible");

  // Dessiner l'image de base
  const baseImage = new Image();
  baseImage.src = currentRoute.src as string;
  await new Promise((resolve) => (baseImage.onload = resolve));
  ctx.drawImage(baseImage, 0, 0);

  // Définir le style des prises
  currentRoute.holds.forEach((hold) => {
    const x = hold.actualX;
    const y = hold.actualY;

    ctx.save();
    ctx.lineWidth = 4;

    switch (hold.type) {
      case "start":
        ctx.strokeStyle = "#10B981"; // vert
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case "finish":
        ctx.strokeStyle = "#EF4444"; // rouge
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case "normal":
        ctx.strokeStyle = "#3B82F6"; // bleu
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.stroke();
        break;

      case "foot":
        ctx.strokeStyle = "#EAB308"; // jaune
        ctx.strokeRect(x - 20, y - 12, 40, 24);
        break;
    }

    ctx.restore();
  });

  return canvas.toDataURL("image/png", 0.9);
};

// Watch for window resize
if (process.client) {
  window.addEventListener("resize", calculateScale);
}

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener("resize", calculateScale);
  }
});
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

/* Style spécial pour les appuis pieds */
.foot-hold {
  border-radius: 4px !important;
}

.absolute {
  animation: holdAppear 0.3s ease-out;
}
</style>