<template>
  <div class="w-full">
    <!-- Section des filtres -->
    <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Recherche textuelle -->
        <div class="flex-1">
          <label
            for="search"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Rechercher une voie :
          </label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Nom, description..."
            class="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200"
          />
        </div>

        <!-- Filtre par difficulté -->
        <div>
          <label
            for="difficulty"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Difficulté :
          </label>
          <select
            id="difficulty"
            v-model="selectedDifficulty"
            class="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 min-w-[120px]"
          >
            <option value="">Toutes</option>
            <option value="3a">3a</option>
            <option value="3b">3b</option>
            <option value="3c">3c</option>
            <option value="4a">4a</option>
            <option value="4b">4b</option>
            <option value="4c">4c</option>
            <option value="5a">5a</option>
            <option value="5b">5b</option>
            <option value="5c">5c</option>
            <option value="6a">6a</option>
            <option value="6b">6b</option>
            <option value="6c">6c</option>
            <option value="7a">7a</option>
            <option value="7b">7b</option>
            <option value="7c">7c</option>
            <option value="8a">8a</option>
            <option value="8b">8b</option>
            <option value="8c">8c</option>
          </select>
        </div>

        <!-- Filtre par ouvreur -->
        <div>
          <label
            for="opener"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Ouvreur :
          </label>
          <select
            id="opener"
            v-model="selectedOpener"
            class="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 min-w-[120px]"
          >
            <option value="">Tous</option>
            <option value="Will">Will</option>
            <option value="Joye">Joye</option>
            <option value="Max">Max</option>
          </select>
        </div>

        <!-- Filtre par nombre de prises -->
        <div>
          <label
            for="holds"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Nb. prises :
          </label>
          <select
            id="holds"
            v-model="selectedHoldsRange"
            class="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 min-w-[140px]"
          >
            <option value="">Toutes</option>
            <option value="1-5">1 à 5 prises</option>
            <option value="6-10">6 à 10 prises</option>
            <option value="11-15">11 à 15 prises</option>
            <option value="16-20">16 à 20 prises</option>
            <option value="21+">21+ prises</option>
          </select>
        </div>

        <!-- Tri -->
        <div>
          <label
            for="sort"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Trier par :
          </label>
          <select
            id="sort"
            v-model="sortBy"
            class="w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 min-w-[140px]"
          >
            <option value="newest">Plus récent</option>
            <option value="oldest">Plus ancien</option>
            <option value="name">Nom A-Z</option>
            <option value="difficulty-asc">Difficulté ↗</option>
            <option value="difficulty-desc">Difficulté ↘</option>
            <option value="holds-asc">Moins de prises</option>
            <option value="holds-desc">Plus de prises</option>
          </select>
        </div>

        <!-- Boutons d'action -->
        <div class="flex items-end gap-2">
          <button
            @click="clearFilters"
            v-if="hasActiveFilters"
            class="bg-gray-500 hover:bg-gray-600 border-2 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap"
          >
            🗑️ Effacer
          </button>
        </div>
      </div>

      <!-- Résultats du filtrage -->
      <div v-if="hasActiveFilters" class="mt-4 p-3 bg-blue-50 rounded-lg">
        <div class="flex items-center gap-2 text-blue-800">
          <span class="font-medium"
            >{{ filteredRoutes.length }} voie(s) trouvée(s)</span
          >
          <span class="text-sm">sur {{ routes.length }} au total</span>
        </div>
      </div>
    </div>

    <!-- Indicateur de chargement -->
    <div
      v-if="loading"
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center"
    >
      <div
        class="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
      ></div>
      <p class="text-gray-600">Chargement des voies...</p>
    </div>

    <!-- Section vide -->
    <div
      v-else-if="routes.length === 0"
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
    >
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Aucune voie trouvée</h3>
      <p class="text-gray-600 mb-8 text-lg">
        Les voies d'escalade créées apparaîtront ici.
      </p>
      <NuxtLink
        to="/addbloc"
        class="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
      >
        Créer votre première voie
      </NuxtLink>
    </div>

    <!-- Résultats de filtrage vides -->
    <div
      v-else-if="filteredRoutes.length === 0"
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
    >
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Aucun résultat</h3>
      <p class="text-gray-600 mb-8 text-lg">
        Aucune voie ne correspond à vos critères de recherche.
      </p>
      <button
        @click="clearFilters"
        class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
      >
        Afficher toutes les voies
      </button>
    </div>

    <!-- Section avec voies filtrées -->
    <div
      v-else
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- Grid des voies -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(route, index) in filteredRoutes"
            :key="route.id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <!-- Header de la carte -->
            <div
              class="p-4 bg-gradient-to-r to-[#0f172a] from-[#334155] text-white"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg leading-tight">
                  {{ route.name }}
                </h3>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm opacity-90">
                  {{ route.stats.totalHolds }} prises
                </span>
                <span
                  class="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold"
                  :class="getDifficultyColor(route.difficulty)"
                >
                  {{ route.difficulty }}
                </span>
              </div>
            </div>

            <!-- Image avec marqueurs (overlay dynamique) -->
            <div
              class="relative cursor-pointer group"
              @click="openModal(route)"
            >
              <img
                :src="getImageUrl(route.originalImagePath)"
                alt="Voie d'escalade"
                class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                @error="handleImageError"
                @load="onImageLoad($event, route, index)"
                :ref="(el:any) => setImageRef(el, index)"
              />

              <!-- Badge avec nombre de prises -->
              <div
                class="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ route.stats.totalHolds }}
              </div>
            </div>

            <!-- Footer avec statistiques et info ouvreur -->
            <div class="p-4 bg-gray-50">
              <!-- Informations ouvreur -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">Ouvreur :</span>
                  <span
                    class="text-xs font-semibold text-gray-700 px-2 py-1 bg-gray-200 rounded-full"
                    >{{ route.opener }}</span
                  >
                </div>
                <div class="text-gray-500 text-xs">
                  {{ formatDate(route.createdAt) }}
                </div>
              </div>

              <!-- Description si présente -->
              <div
                v-if="route.description"
                class="mt-2 pt-2 border-t border-gray-200"
              >
                <p class="text-gray-600 text-xs leading-relaxed line-clamp-2">
                  {{ route.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal pour voir la voie en détail -->
    <div
      v-if="selectedRoute"
      class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-2xl max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
        @click.stop
      >
        <!-- Header du modal -->
        <div
          class="bg-gradient-to-r to-[#0f172a] from-[#334155] text-white p-6 w-full"
        >
          <div class="flex justify-between items-center flex-col w-full">
            <div class="w-full flex justify-between items-center">
              <h3 class="text-2xl font-bold">{{ selectedRoute.name }}</h3>
              <button
                @click="closeModal"
                class="w-12 h-12 flex items-center justify-center text-2xl font-bold transition-all duration-200"
              >
                ×
              </button>
            </div>
          </div>

          <div
            v-if="selectedRoute.description"
            class="bg-white/10 rounded-xl p-4 mt-4"
          >
            <p class="text-white/90">{{ selectedRoute.description }}</p>
          </div>
        </div>

        <!-- Contenu du modal -->
        <div class="px-4 max-h-[calc(99dvh-300px)] overflow-y-auto">
          
          <!-- Image avec marqueurs en overlay -->
          <div class="relative my-6 text-center">
            <img
              :src="getImageUrl(selectedRoute.originalImagePath)"
              alt="Voie d'escalade détaillée"
              class="max-w-full max-h-[60vh] rounded-xl shadow-lg object-contain mx-auto bg-black"
              @error="handleImageError"
              @load="onModalImageLoad"
              ref="modalImageRef"
            />
          </div>
<!-- Informations supplémentaires avec ouvreur -->
          <div class="my-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-emerald-50 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-emerald-600">
                {{ selectedRoute.difficulty }}
              </div>
              <div class="text-sm text-gray-600">Difficulté</div>
            </div>

            <div class="bg-purple-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-purple-600">
                {{ selectedRoute.opener }}
              </div>
              <div class="text-sm text-gray-600">Ouvreur</div>
            </div>

            <div class="bg-orange-50 rounded-xl p-4 text-center">
              <div class="text-lg font-bold text-orange-600">
                {{ formatDate(selectedRoute.createdAt) }}
              </div>
              <div class="text-sm text-gray-600">Date de création</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composables
const {
  routes,
  loading,
  deleteRoute,
  getImageUrl,
  totalRoutes,
  totalHolds,
  averageDifficulty,
} = useApiRoutes();

// Filtres réactifs
const searchQuery = ref("");
const selectedDifficulty = ref("");
const selectedOpener = ref("");
const selectedHoldsRange = ref("");
const sortBy = ref("newest");
const showStats = ref(false);

// Refs
const selectedRoute = ref<any>(null);
const showModalMarkers = ref<boolean>(true);
const imageScales = ref<Record<number, number>>({});
const modalScale = ref<number>(1);
const modalImageRef = ref<HTMLImageElement>();
const imageRefs = ref<Record<number, HTMLImageElement>>({});

// Computed - Filtres appliqués
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    selectedDifficulty.value ||
    selectedOpener.value ||
    selectedHoldsRange.value ||
    sortBy.value !== "newest"
  );
});

// Computed - Routes filtrées
const filteredRoutes = computed(() => {
  let filtered = [...routes.value];

  // Filtrage par recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (route) =>
        route.name.toLowerCase().includes(query) ||
        (route.description || "").toLowerCase().includes(query) ||
        route.opener.toLowerCase().includes(query)
    );
  }

  // Filtrage par difficulté
  if (selectedDifficulty.value) {
    filtered = filtered.filter(
      (route) => route.difficulty === selectedDifficulty.value
    );
  }

  // Filtrage par ouvreur
  if (selectedOpener.value) {
    filtered = filtered.filter(
      (route) => route.opener === selectedOpener.value
    );
  }

  // Filtrage par nombre de prises
  if (selectedHoldsRange.value) {
    filtered = filtered.filter((route) => {
      const totalHolds = route.stats.totalHolds;
      switch (selectedHoldsRange.value) {
        case "1-5":
          return totalHolds >= 1 && totalHolds <= 5;
        case "6-10":
          return totalHolds >= 6 && totalHolds <= 10;
        case "11-15":
          return totalHolds >= 11 && totalHolds <= 15;
        case "16-20":
          return totalHolds >= 16 && totalHolds <= 20;
        case "21+":
          return totalHolds >= 21;
        default:
          return true;
      }
    });
  }

  // Tri
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "difficulty-asc":
        return (
          getDifficultyValue(a.difficulty) - getDifficultyValue(b.difficulty)
        );
      case "difficulty-desc":
        return (
          getDifficultyValue(b.difficulty) - getDifficultyValue(a.difficulty)
        );
      case "holds-asc":
        return a.stats.totalHolds - b.stats.totalHolds;
      case "holds-desc":
        return b.stats.totalHolds - a.stats.totalHolds;
      default:
        return 0;
    }
  });

  return filtered;
});

// Computed - Statistiques filtrées
const filteredTotalHolds = computed(() => {
  return filteredRoutes.value.reduce(
    (sum, route) => sum + route.stats.totalHolds,
    0
  );
});

const filteredAverageDifficulty = computed(() => {
  if (filteredRoutes.value.length === 0) return "---";

  const total = filteredRoutes.value.reduce(
    (sum, route) => sum + getDifficultyValue(route.difficulty),
    0
  );
  const average = total / filteredRoutes.value.length;
  return getGradeFromValue(Math.round(average));
});

const filteredAverageHolds = computed(() => {
  if (filteredRoutes.value.length === 0) return 0;
  return Math.round(filteredTotalHolds.value / filteredRoutes.value.length);
});

// Methods
const clearFilters = (): void => {
  searchQuery.value = "";
  selectedDifficulty.value = "";
  selectedOpener.value = "";
  selectedHoldsRange.value = "";
  sortBy.value = "newest";
};

const toggleStatsView = (): void => {
  showStats.value = !showStats.value;
};

const getDifficultyValue = (difficulty: string): number => {
  const gradeMap: Record<string, number> = {
    "3a": 1,
    "3b": 2,
    "3c": 3,
    "4a": 4,
    "4b": 5,
    "4c": 6,
    "5a": 7,
    "5b": 8,
    "5c": 9,
    "6a": 10,
    "6b": 11,
    "6c": 12,
    "7a": 13,
    "7b": 14,
    "7c": 15,
    "8a": 16,
    "8b": 17,
    "8c": 18,
  };
  return gradeMap[difficulty] || 0;
};

const getGradeFromValue = (value: number): string => {
  const grades = [
    "3a",
    "3b",
    "3c",
    "4a",
    "4b",
    "4c",
    "5a",
    "5b",
    "5c",
    "6a",
    "6b",
    "6c",
    "7a",
    "7b",
    "7c",
    "8a",
    "8b",
    "8c",
  ];
  return grades[value - 1] || "---";
};

const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    "3a": "bg-green-500",
    "3b": "bg-green-600",
    "3c": "bg-green-700",
    "4a": "bg-yellow-500",
    "4b": "bg-yellow-600",
    "4c": "bg-yellow-700",
    "5a": "bg-orange-500",
    "5b": "bg-orange-600",
    "5c": "bg-orange-700",
    "6a": "bg-red-500",
    "6b": "bg-red-600",
    "6c": "bg-red-700",
    "7a": "bg-purple-500",
    "7b": "bg-purple-600",
    "7c": "bg-purple-700",
    "8a": "bg-gray-700",
    "8b": "bg-gray-800",
    "8c": "bg-black",
  };
  return colors[difficulty] || "bg-gray-500";
};

const handleDeleteRoute = async (id: string): Promise<void> => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette voie d'escalade ?")) {
    await deleteRoute(id);
  }
};

const setImageRef = (el: HTMLImageElement | null, index: number): void => {
  if (el) {
    imageRefs.value[index] = el;
  }
};

const onImageLoad = (event: Event, route: any, index: number): void => {
  const img = event.target as HTMLImageElement;
  if (img && route.holds && route.holds.length > 0 && route.holds[0].actualX) {
    // Calculer l'échelle pour cette image
    const scale = img.offsetWidth / img.naturalWidth;
    imageScales.value[index] = scale;
  }
};

const onModalImageLoad = (): void => {
  const img = modalImageRef.value;
  if (
    img &&
    selectedRoute.value?.holds &&
    selectedRoute.value.holds.length > 0
  ) {
    modalScale.value = img.offsetWidth / img.naturalWidth;
  }
};

const getHoldPosition = (
  hold: any,
  route: any,
  routeIndex: number
): Record<string, string> => {
  const scale = imageScales.value[routeIndex] || 1;
  return {
    left: hold.actualX * scale + "px",
    top: hold.actualY * scale + "px",
  };
};

const getModalHoldPosition = (hold: any): Record<string, string> => {
  return {
    left: hold.actualX * modalScale.value + "px",
    top: hold.actualY * modalScale.value + "px",
  };
};

const openModal = (route: any): void => {
  selectedRoute.value = route;
  showModalMarkers.value = true;
  // Empêcher le scroll du body
  if (process.client) {
    document.body.style.overflow = "hidden";
  }
};

const closeModal = (): void => {
  selectedRoute.value = null;
  // Rétablir le scroll du body
  if (process.client) {
    document.body.style.overflow = "auto";
  }
};

const toggleModalMarkers = (): void => {
  showModalMarkers.value = !showModalMarkers.value;
};

const downloadRouteImage = async (): Promise<void> => {
  if (!selectedRoute.value) return;

  try {
    // Utiliser le composable pour traiter l'image
    const { downloadProcessedImage } = useImageProcessor();
    const img = modalImageRef.value;

    if (img) {
      await downloadProcessedImage(
        img.src,
        selectedRoute.value.holds,
        img.naturalWidth,
        img.naturalHeight,
        selectedRoute.value.name
      );
    }
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
  }
};

const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  console.error("Erreur de chargement d'image:", img.src);
};

const getHoldDisplayClass = (type: string): string => {
  switch (type) {
    case "start":
      return "bg-green-500 w-5 h-5";
    case "finish":
      return "bg-red-500 w-5 h-5";
    default:
      return "bg-blue-500 w-4 h-4";
  }
};

const getHoldModalClass = (type: string): string => {
  switch (type) {
    case "start":
      return "bg-green-500 w-10 h-10 text-lg";
    case "finish":
      return "bg-red-500 w-10 h-10 text-lg";
    default:
      return "bg-blue-500 w-8 h-8 text-sm";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

// Cleanup on unmount
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = "auto";
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
