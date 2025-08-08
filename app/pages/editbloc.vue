<template>
  <div>
    <div
      v-if="!isAuthenticated"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100"
      >
        <h2
          class="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3"
        >
          <span class="text-xl">🔒</span>
          Accès Ouvreur
        </h2>
        <p class="text-gray-600 mb-6 text-center">
          Vous devez entrer le mot de passe d'ouvreur pour gérer les voies
          d'escalade.
        </p>

        <form @submit.prevent="handleAuthenticate" class="space-y-4">
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Mot de passe ouvreur :
            </label>
            <input
              id="password"
              v-model="passwordInput"
              type="password"
              placeholder="Entrez le mot de passe"
              class="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              :class="{ 'border-red-500 ring-2 ring-red-200': showError }"
              @input="clearError"
            />
          </div>

          <div
            v-if="showError"
            class="text-red-500 text-sm font-medium text-center"
          >
            ❌ Mot de passe incorrect
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="!passwordInput"
              class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Accéder
            </button>
            <NuxtLink
              to="/"
              class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold text-center transition-all duration-200"
            >
              Annuler
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
    <div v-if="isAuthenticated" class="container mx-auto px-4 py-6">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <NuxtLink
            to="/"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 text-center"
          >
            ← Retour à l'accueil
          </NuxtLink>

          <h1
            class="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3"
          >
            Gestion des Blocs
          </h1>

          <div class="flex gap-2">
            <NuxtLink
              to="/addbloc"
              class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
            >
              Nouveau bloc
            </NuxtLink>

            <button
              @click="handleLogout"
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <!-- Filtres et recherche -->
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Recherche -->
          <div class="flex-1">
            <label
              for="search"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Rechercher un bloc :
            </label>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Nom, numéro, difficulté..."
              class="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
          </div>

          <!-- Filtres -->
          <div class="flex gap-4">
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
                class="px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
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
                class="px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              >
                <option value="">Tous</option>
                <option value="Will">Will</option>
                <option value="Joye">Joye</option>
                <option value="Max">Max</option>
              </select>
            </div>
          </div>

          <!-- Bouton de rafraîchissement -->
          <div class="flex items-end">
            <button
              @click="loadRoutes"
              :disabled="isLoading"
              class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <span
                v-if="isLoading"
                class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
              ></span>
              <span v-else class="text-lg">🔄</span>
              {{ isLoading ? "Chargement..." : "Actualiser" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des blocs -->
      <div
        v-if="isLoading"
        class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8"
      >
        <div class="flex items-center justify-center space-x-3">
          <div
            class="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"
          ></div>
          <span class="text-lg font-medium text-gray-700"
            >Chargement des blocs...</span
          >
        </div>
      </div>

      <div
        v-else-if="error"
        class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8"
      >
        <div class="text-center">
          <span class="text-4xl mb-4 block">⚠️</span>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button
            @click="loadRoutes"
            class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Réessayer
          </button>
        </div>
      </div>

      <div
        v-else-if="filteredRoutes.length === 0"
        class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8"
      >
        <div class="text-center">
          <span class="text-4xl mb-4 block">🔍</span>
          <h2 class="text-xl font-bold text-gray-800 mb-2">
            Aucun bloc trouvé
          </h2>
          <p class="text-gray-600 mb-4">
            {{
              searchQuery || selectedDifficulty || selectedOpener
                ? "Aucun bloc ne correspond à vos critères de recherche."
                : "Aucun bloc n'a été créé pour le moment."
            }}
          </p>
          <div class="flex gap-3 justify-center">
            <button
              v-if="searchQuery || selectedDifficulty || selectedOpener"
              @click="clearFilters"
              class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              Effacer les filtres
            </button>
            <NuxtLink
              to="/create-route"
              class="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
            >
              Créer le premier bloc
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Grille des blocs -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="route in filteredRoutes"
          :key="route.id"
          class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <!-- Image du bloc -->
          <div
            class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden"
          >
            <img
              v-if="route.originalImagePath"
              :src="`/api/images/${route.originalImagePath}`"
              :alt="`Bloc ${route.name || route.id}`"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="text-4xl text-gray-400">🧗</span>
            </div>

            <!-- Badge de difficulté -->
            <div
              class="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg"
              :class="getDifficultyColor(route.difficulty)"
            >
              {{ route.difficulty || "N/A" }}
            </div>

            <!-- Badge de l'ouvreur -->
            <div
              v-if="route.opener"
              class="absolute top-3 right-3 px-3 py-1 bg-black/70 text-white rounded-full text-sm font-medium"
            >
              {{ route.opener }}
            </div>
          </div>

          <!-- Informations du bloc -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">
                  {{ route.name || `Bloc #${route.id}` }}
                </h3>
                <p
                  v-if="route.description"
                  class="text-gray-600 text-sm line-clamp-2"
                >
                  {{ route.description }}
                </p>
              </div>
            </div>

            <!-- Métadonnées -->
            <div class="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
              <span v-if="route.opener" class="flex items-center gap-1">
                <span>👤</span>
                {{ route.opener }}
              </span>
              <span v-if="route.createdAt" class="flex items-center gap-1">
                <span>📅</span>
                {{ formatDate(route.createdAt) }}
              </span>
              <span
                v-if="route.stats?.totalHolds"
                class="flex items-center gap-1"
              >
                <span>🎯</span>
                {{ route.stats.totalHolds }} prises
              </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="handleEdit(route)"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 text-center text-sm flex items-center justify-center gap-2"
              >
                Éditer
              </button>

              <button
                @click="handleDelete(route)"
                class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 text-sm flex items-center justify-center"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mt-8"
      >
        <div class="flex items-center justify-between">
          <p class="text-gray-600">
            Affichage {{ (currentPage - 1) * pageSize + 1 }} à
            {{ Math.min(currentPage * pageSize, totalRoutes) }} sur
            {{ totalRoutes }} blocs
          </p>

          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-all duration-200"
            >
              ← Précédent
            </button>

            <span
              class="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold"
            >
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div
      v-if="showEditModal && routeToEdit"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
      >
        <!-- Header du modal -->
        <div
          class="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-200"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-3">
              Éditer le bloc
            </h3>
            <button
              @click="closeEditModal"
              class="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-all duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Contenu du modal -->
        <div class="p-6">
          <form @submit.prevent="saveRoute" class="space-y-6">
            <!-- Nom du bloc -->
            <div>
              <label
                for="edit-name"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Nom du bloc <span class="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                v-model="editedRoute.name"
                type="text"
                required
                placeholder="Nom du bloc"
                class="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              />
            </div>

            <!-- Difficulté -->
            <div>
              <label
                for="edit-difficulty"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Difficulté <span class="text-red-500">*</span>
              </label>
              <select
                id="edit-difficulty"
                v-model="editedRoute.difficulty"
                required
                class="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              >
                <option value="">Sélectionner une difficulté</option>
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

            <!-- Ouvreur -->
            <div>
              <label
                for="edit-opener"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Ouvreur <span class="text-red-500">*</span>
              </label>
              <select
                id="edit-opener"
                v-model="editedRoute.opener"
                required
                class="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
              >
                <option value="">Sélectionner un ouvreur</option>
                <option value="Will">Will</option>
                <option value="Joye">Joye</option>
                <option value="Max">Max</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label
                for="edit-description"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                v-model="editedRoute.description"
                rows="3"
                placeholder="Description du bloc (optionnel)"
                class="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
              ></textarea>
            </div>

            <!-- Image actuelle -->
            <div v-if="editedRoute.originalImagePath">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Image actuelle
              </label>
              <div class="relative">
                <img
                  :src="`/api/images/${editedRoute.originalImagePath}`"
                  :alt="editedRoute.name"
                  class="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <div
                  class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
                >
                  <span class="text-white text-sm font-medium">
                    ⚠️ L'édition des prises n'est pas disponible dans ce modal
                  </span>
                </div>
              </div>
            </div>

            <!-- Statistiques (lecture seule) -->
            <div v-if="editedRoute.stats" class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3">
                Statistiques
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Total prises :</span>
                  <span class="font-medium ml-2">{{
                    editedRoute.stats.totalHolds
                  }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Prises de départ :</span>
                  <span class="font-medium ml-2">{{
                    editedRoute.stats.startHolds
                  }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Prises normales :</span>
                  <span class="font-medium ml-2">{{
                    editedRoute.stats.normalHolds
                  }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Prises d'arrivée :</span>
                  <span class="font-medium ml-2">{{
                    editedRoute.stats.finishHolds
                  }}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer du modal -->
        <div
          class="sticky bottom-0 bg-gray-50 rounded-b-3xl p-6 border-t border-gray-200"
        >
          <div class="flex gap-3">
            <button
              @click="saveRoute"
              :disabled="isSaving || !isFormValid"
              class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span
                v-if="isSaving"
                class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
              ></span>
              {{ isSaving ? "Sauvegarde..." : "Sauvegarder" }}
            </button>

            <button
              @click="closeEditModal"
              :disabled="isSaving"
              class="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <h3
          class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"
        >
          <span class="text-xl">🗑️</span>
          Supprimer le bloc
        </h3>
        <p class="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer le bloc
          <strong>{{ routeToDelete?.name || `#${routeToDelete?.id}` }}</strong>
          ?
        </p>
        <p class="text-gray-500 text-sm mb-6">Cette action est irréversible.</p>
        <div class="flex gap-3">
          <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span
              v-if="isDeleting"
              class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"
            ></span>
            {{ isDeleting ? "Suppression..." : "Supprimer" }}
          </button>
          <button
            @click="showDeleteModal = false"
            :disabled="isDeleting"
            class="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div
      v-if="notification"
      class="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl p-4 border-l-4 transition-all duration-300"
      :class="{
        'border-green-500': notification.type === 'success',
        'border-red-500': notification.type === 'error',
        'border-blue-500': notification.type === 'info',
      }"
    >
      <div class="flex items-center gap-3">
        <span class="text-lg">
          {{
            notification.type === "success"
              ? "✅"
              : notification.type === "error"
              ? "❌"
              : "ℹ️"
          }}
        </span>
        <span class="font-medium">{{ notification.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composables
const {
  isAuthenticated,
  passwordInput,
  showError,
  authenticate,
  logout,
  clearError,
} = useAuth();
const router = useRouter();

// Reactive data
const isLoading = ref(true);
const isDeleting = ref(false);
const error = ref<string | null>(null);
const routes = ref<any[]>([]);
const searchQuery = ref("");
const selectedDifficulty = ref("");
const selectedOpener = ref("");
const currentPage = ref(1);
const pageSize = ref(12);
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const routeToDelete = ref<any>(null);
const routeToEdit = ref<any>(null);
const editedRoute = ref<any>(null);
const isSaving = ref(false);
const notification = ref<{
  type: "success" | "error" | "info";
  message: string;
} | null>(null);

// Meta data
useHead({
  title: "Gestion des Blocs - Créateur de Bloc d'Escalade",
  meta: [
    {
      name: "description",
      content: "Gérer, modifier et supprimer les blocs d'escalade existants",
    },
  ],
});

// Computed
const isFormValid = computed(() => {
  return (
    editedRoute.value &&
    editedRoute.value.name?.trim() &&
    editedRoute.value.difficulty &&
    editedRoute.value.opener
  );
});

const filteredRoutes = computed(() => {
  // S'assurer que routes.value est un tableau
  let filtered = Array.isArray(routes.value) ? routes.value : [];

  // Filtrage par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (route) =>
        (route.name || "").toLowerCase().includes(query) ||
        (route.id || "").toString().includes(query) ||
        (route.difficulty || "").toLowerCase().includes(query) ||
        (route.description || "").toLowerCase().includes(query) ||
        (route.author || "").toLowerCase().includes(query)
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

  // Pagination
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  return filtered.slice(start, end);
});

const totalRoutes = computed(() => {
  // S'assurer que routes.value est un tableau
  let filtered = Array.isArray(routes.value) ? routes.value : [];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (route) =>
        (route.name || "").toLowerCase().includes(query) ||
        (route.id || "").toString().includes(query) ||
        (route.difficulty || "").toLowerCase().includes(query) ||
        (route.description || "").toLowerCase().includes(query) ||
        (route.author || "").toLowerCase().includes(query)
    );
  }

  if (selectedDifficulty.value) {
    filtered = filtered.filter(
      (route) => route.difficulty === selectedDifficulty.value
    );
  }

  if (selectedOpener.value) {
    filtered = filtered.filter(
      (route) => route.opener === selectedOpener.value
    );
  }

  return filtered.length;
});

const totalPages = computed(() =>
  Math.ceil(totalRoutes.value / pageSize.value)
);

// Methods
const handleAuthenticate = (): void => {
  const success = authenticate();
  if (success) {
    loadRoutes();
  }
};

const handleLogout = (): void => {
  logout();
  router.push("/");
};

const loadRoutes = async (): Promise<void> => {
  try {
    isLoading.value = true;
    error.value = null;

    // Utiliser votre API existante
    const response = await $fetch("/api/routes");

    // Votre API retourne { success: true, data: routes[], count: number }
    if (response.success && Array.isArray(response.data)) {
      routes.value = response.data;
    } else {
      throw new Error("Format de réponse invalide");
    }
  } catch (err) {
    console.error("Erreur lors du chargement:", err);
    error.value =
      err instanceof Error
        ? err.message
        : "Erreur lors du chargement des blocs";
    routes.value = []; // S'assurer que routes.value reste un tableau
  } finally {
    isLoading.value = false;
  }
};

const clearFilters = (): void => {
  searchQuery.value = "";
  selectedDifficulty.value = "";
  selectedOpener.value = "";
  currentPage.value = 1;
};

const handleEdit = (route: any): void => {
  routeToEdit.value = route;
  editedRoute.value = {
    ...route,
    // S'assurer que les champs requis sont présents
    name: route.name || "",
    difficulty: route.difficulty || "",
    opener: route.opener || "",
    description: route.description || "",
  };
  showEditModal.value = true;
};

const closeEditModal = (): void => {
  showEditModal.value = false;
  routeToEdit.value = null;
  editedRoute.value = null;
};

const saveRoute = async (): Promise<void> => {
  if (!editedRoute.value || !isFormValid.value) {
    console.log("Formulaire invalide ou données manquantes");
    return;
  }

  try {
    isSaving.value = true;
    console.log("=== DÉBUT SAUVEGARDE CLIENT ===");
    console.log("Route à sauvegarder:", editedRoute.value);

    // Préparer les données pour l'API (seulement les champs modifiables)
    const updateData = {
      name: editedRoute.value.name.trim(),
      difficulty: editedRoute.value.difficulty,
      opener: editedRoute.value.opener,
      description: editedRoute.value.description?.trim() || "",
    };

    console.log("Données à envoyer à l'API:", updateData);
    console.log("URL de l'API:", `/api/routes/${editedRoute.value.id}`);

    // Utiliser votre API de mise à jour
    const response = await $fetch(`/api/routes/${editedRoute.value.id}`, {
      method: "PUT",
      body: updateData,
    });

    console.log("Réponse de l'API:", response);

    if (response.success) {
      // Mettre à jour la route dans la liste locale
      const routeIndex = routes.value.findIndex(
        (r) => r.id === editedRoute.value.id
      );
      if (routeIndex !== -1) {
        routes.value[routeIndex] = {
          ...routes.value[routeIndex],
          ...updateData,
        };
        console.log("Route mise à jour dans la liste locale");
      }

      showNotification(
        "success",
        response.message || "Bloc modifié avec succès"
      );
      closeEditModal();
    } else {
      throw new Error("Réponse API indique un échec");
    }
  } catch (err: any) {
    console.error("=== ERREUR SAUVEGARDE CLIENT ===");
    console.error("Type d'erreur:", err.constructor.name);
    console.error("Message:", err.message);
    console.error("Erreur complète:", err);

    let errorMessage = "Erreur lors de la modification du bloc";

    // Extraire le message d'erreur spécifique
    if (err.data?.message) {
      errorMessage = err.data.message;
    } else if (err.statusMessage) {
      errorMessage = err.statusMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }

    console.error("Message d'erreur final:", errorMessage);
    showNotification("error", errorMessage);
  } finally {
    isSaving.value = false;
    console.log("=== FIN SAUVEGARDE CLIENT ===");
  }
};

const handleDelete = (route: any): void => {
  routeToDelete.value = route;
  showDeleteModal.value = true;
};

const confirmDelete = async (): Promise<void> => {
  if (!routeToDelete.value) return;

  try {
    isDeleting.value = true;

    // Utiliser votre API de suppression existante
    const response = await $fetch(`/api/routes/${routeToDelete.value.id}`, {
      method: "DELETE",
    });

    if (response.success) {
      // Retirer le bloc de la liste locale
      routes.value = routes.value.filter(
        (route) => route.id !== routeToDelete.value.id
      );

      showNotification(
        "success",
        response.message || "Bloc supprimé avec succès"
      );
      showDeleteModal.value = false;
      routeToDelete.value = null;
    } else {
      throw new Error("Erreur lors de la suppression");
    }
  } catch (err) {
    console.error("Erreur lors de la suppression:", err);
    showNotification("error", "Erreur lors de la suppression");
  } finally {
    isDeleting.value = false;
  }
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

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const showNotification = (
  type: "success" | "error" | "info",
  message: string
): void => {
  notification.value = { type, message };
  setTimeout(() => {
    notification.value = null;
  }, 4000);
};

// Watchers
watch([searchQuery, selectedDifficulty, selectedOpener], () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  if (isAuthenticated.value) {
    loadRoutes();
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
