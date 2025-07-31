<template>
  <div class="w-full">
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
      <div class="text-6xl mb-6 opacity-60">🧗‍♀️</div>
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

    <!-- Section avec voies -->
    <div
      v-else
      class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
    >
      <!-- Grid des voies -->
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(route, index) in routes"
            :key="route.id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <!-- Header de la carte -->
            <div
              class="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            >
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg leading-tight">
                  {{ route.name }}
                </h3>
              </div>
              <div class="flex items-center justify-between">
                <span
                  class="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {{ route.difficulty }}
                </span>
                <span class="text-sm opacity-90">
                  {{ route.stats.totalHolds }} prises
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
            </div>

            <!-- Footer avec statistiques -->
            <div class="p-4 bg-gray-50">
              <div v-if="route.description" class="pb-3 border-b bg-gray-50">
                <p class="text-gray-600 text-sm leading-relaxed">
                  {{ route.description }}
                </p>
              </div>
              <div class="text-gray-500 text-xs text-right pt-2">
                {{ formatDate(route.createdAt) }}
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
          class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 w-full"
        >
          <div class="flex justify-between items-center flex-col mb-4 w-full">
            <div class="w-full flex justify-between items-center py-4">
              <h3 class="text-2xl font-bold">{{ selectedRoute.name }}</h3>
              <button
                @click="closeModal"
                class="flex items-center justify-center text-2xl font-bold transition-all duration-200"
              >
                ×
              </button>
            </div>
            <div class="flex items-center gap-4 mt-2">
              <span class="bg-white/20 px-4 py-2 rounded-full font-semibold">
                Difficulté : {{ selectedRoute.difficulty }}
              </span>
              <span class="bg-white/20 px-4 py-2 rounded-full">
                {{ selectedRoute.stats.totalHolds }} prises au total
              </span>
            </div>
          </div>

          <div
            v-if="selectedRoute.description"
            class="bg-white/10 rounded-xl p-4"
          >
            <p class="text-white/90">{{ selectedRoute.description }}</p>
          </div>
        </div>

        <!-- Contenu du modal -->
        <div class="py-9 px-4 max-h-[calc(99dvh-300px)] overflow-y-auto">
          <!-- Image avec marqueurs en overlay -->
          <div class="relative mb-6 text-center">
            <div class="relative mb-6 text-center">
              <img
                :src="getImageUrl(selectedRoute.originalImagePath)"
                alt="Voie d'escalade détaillée"
                class="max-w-full max-h-[60vh] rounded-xl shadow-lg object-contain mx-auto bg-black"
                @error="handleImageError"
              />
            </div>
          </div>

          <!-- Informations sur les prises -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-lg font-bold text-gray-800 mb-4">
              📋 Informations sur la voie
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{ selectedRoute.stats.startHolds }}
                </div>
                <div class="text-sm text-gray-600">Prises de départ</div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">
                  {{ selectedRoute.stats.normalHolds }}
                </div>
                <div class="text-sm text-gray-600">Prises normales</div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">
                  {{ selectedRoute.stats.finishHolds }}
                </div>
                <div class="text-sm text-gray-600">Prises d'arrivée</div>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-gray-600 text-sm">
                <strong>Instructions :</strong> Suivez les numéros dans l'ordre
                pour réaliser la voie. Commencez par les prises vertes (départ),
                progressez selon la numérotation, et terminez sur les prises
                rouges (arrivée).
              </p>
            </div>
          </div>

          <!-- Informations supplémentaires -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-emerald-50 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-emerald-600">
                {{ selectedRoute.difficulty }}
              </div>
              <div class="text-sm text-gray-600">Difficulté</div>
            </div>

            <div class="bg-blue-50 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ selectedRoute.stats.totalHolds }}
              </div>
              <div class="text-sm text-gray-600">Prises totales</div>
            </div>

            <div class="bg-orange-50 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-orange-600">
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
  getImageUrl,
} = useApiRoutes();

// Refs
const selectedRoute = ref<any>(null);
const showModalMarkers = ref<boolean>(true);
const imageScales = ref<Record<number, number>>({});
const imageRefs = ref<Record<number, HTMLImageElement>>({});

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

const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  console.error("Erreur de chargement d'image:", img.src);
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
