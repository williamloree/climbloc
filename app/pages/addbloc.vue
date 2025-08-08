<template>
  <div>
    <!-- Modal d'authentification -->
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
          Vous devez entrer le mot de passe d'ouvreur pour créer de nouvelles
          voies d'escalade.
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

    <!-- Contenu principal (visible après authentification) -->
    <div v-if="isAuthenticated" class="container mx-auto px-4 py-6">
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <NuxtLink
            to="/"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 text-center"
          >
          Retour aux voies
          </NuxtLink>

          <h1
            class="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3"
          >
            Créer une Nouveau bloc
          </h1>

          <button
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <!-- <TaskMarkingDashboard /> -->
      <RouteCreator />
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

// Meta data
useHead({
  title: "Créer un Bloc - Créateur de Bloc d'Escalade",
  meta: [
    {
      name: "description",
      content: "Créer un nouveau bloc d'escalade avec marquage des prises",
    },
  ],
});

// Methods
const handleAuthenticate = (): void => {
  const success = authenticate();
  if (!success) {
    // L'erreur est déjà gérée dans le composable
  }
};

const handleLogout = (): void => {
  logout();
  router.push("/");
};
</script>
