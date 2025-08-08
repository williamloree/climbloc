<template>
  <div
    class="min-h-screen bg-gradient-to-r from-[#0f172a] to-[#334155] flex items-center justify-center p-4"
  >
    <div
      class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center"
    >
      <!-- Animation d'escaladeur qui tombe -->
      <div class="relative mb-8">
        <div class="text-8xl mb-4 animate-bounce">🧗‍♀️</div>
        <div
          class="absolute top-0 left-1/2 transform -translate-x-1/2 animate-pulse"
        >
          <div class="text-2xl">💫</div>
        </div>
      </div>

      <!-- Titre d'erreur dynamique -->
      <h1 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
        {{ getErrorTitle() }}
      </h1>

      <!-- Code d'erreur stylisé -->
      <div
        class="bg-red-100 border-2 border-red-300 rounded-2xl p-4 mb-6 inline-block"
      >
        <span class="text-red-600 font-mono text-xl font-bold">
          Erreur {{ error.statusCode || "500" }}
        </span>
      </div>

      <!-- Message d'erreur personnalisé -->
      <p class="text-gray-600 text-lg mb-8 leading-relaxed">
        {{ getErrorMessage() }}
      </p>

      <!-- Suggestions d'action selon le type d'erreur -->
      <div class="bg-blue-50 rounded-2xl p-6 mb-8">
        <h3
          class="text-lg font-semibold text-blue-800 mb-3 flex items-center justify-center gap-2"
        >
          <span>💡</span>
          Suggestions
        </h3>
        <div class="text-blue-700 text-sm space-y-2">
          <div
            v-for="suggestion in getErrorSuggestions()"
            :key="suggestion"
            class="flex items-start gap-2"
          >
            <span class="text-blue-500 mt-1">•</span>
            <span>{{ suggestion }}</span>
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <!-- Bouton retour -->
        <button
          @click="goBack"
          class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>←</span>
          Retour
        </button>

        <!-- Bouton accueil -->
        <NuxtLink
          to="/"
          class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🏠</span>
          Accueil
        </NuxtLink>

        <!-- Bouton rafraîchir -->
        <button
          @click="refreshPage"
          class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          Actualiser
        </button>

        <!-- Bouton aide (si erreur 500) -->
        <button
          v-if="isServerError"
          @click="reportError"
          class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>📧</span>
          Signaler
        </button>
      </div>

      <!-- Informations techniques (mode développement) -->
      <div v-if="isDev && error.stack" class="mt-8 p-4 bg-gray-100 rounded-xl">
        <details class="text-left">
          <summary class="cursor-pointer font-semibold text-gray-700 mb-2">
            🔧 Détails techniques (développement)
          </summary>
          <div
            class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto"
          >
            <div class="mb-2">
              <strong>Message:</strong>
              {{ error.statusMessage || error.message }}
            </div>
            <div class="mb-2">
              <strong>URL:</strong> {{ error.url || $route.fullPath }}
            </div>
            <div v-if="error.stack">
              <strong>Stack trace:</strong>
              <pre class="mt-2 whitespace-pre-wrap">{{ error.stack }}</pre>
            </div>
          </div>
        </details>
      </div>
    </div>

    <!-- Particules flottantes d'escalade -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="i in 8"
        :key="i"
        class="absolute animate-float"
        :style="getParticleStyle(i)"
      >
        {{ getRandomClimbingEmoji() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props from Nuxt error page
interface ErrorProps {
  error: {
    statusCode?: number;
    statusMessage?: string;
    message?: string;
    stack?: string;
    url?: string;
  };
}

const props = defineProps<ErrorProps>();

// Reactive data
const isDev = process.dev;
const isServerError = computed(
  () => props.error.statusCode && props.error.statusCode >= 500
);

// Meta
useHead({
  title: `Erreur ${
    props.error.statusCode || "500"
  } - Créateur de Bloc d'Escalade`,
  meta: [
    {
      name: "description",
      content:
        "Une erreur est survenue dans l'application de création de blocs d'escalade",
    },
  ],
});

// Methods
const getErrorTitle = (): string => {
  const statusCode = props.error.statusCode;

  switch (statusCode) {
    case 400:
      return "Oups ! Mauvaise prise";
    case 401:
      return "Accès interdit";
    case 403:
      return "Zone interdite";
    case 404:
      return "Voie introuvable";
    case 429:
      return "Trop d'escalade !";
    case 500:
      return "Chute technique";
    case 502:
      return "Voie bloquée";
    case 503:
      return "Site en maintenance";
    default:
      return "Chute inattendue";
  }
};

const getErrorMessage = (): string => {
  const statusCode = props.error.statusCode;

  switch (statusCode) {
    case 400:
      return "Votre demande n'est pas valide. Vérifiez les informations saisies et réessayez.";
    case 401:
      return "Vous devez vous authentifier pour accéder à cette section. Entrez le mot de passe ouvreur.";
    case 403:
      return "Vous n'avez pas les autorisations nécessaires pour accéder à cette ressource.";
    case 404:
      return "La voie d'escalade que vous cherchez n'existe pas ou a été supprimée. Elle a peut-être changé d'emplacement !";
    case 429:
      return "Vous effectuez trop de requêtes. Prenez une pause et réessayez dans quelques instants.";
    case 500:
      return "Notre serveur rencontre des difficultés techniques. Nos équipes travaillent à résoudre le problème.";
    case 502:
      return "Le serveur ne répond pas correctement. Le problème devrait se résoudre rapidement.";
    case 503:
      return "Le site est temporairement en maintenance pour améliorer votre expérience d'escalade.";
    default:
      return "Une erreur inattendue s'est produite. Comme une chute surprise lors d'une ascension !";
  }
};

const getErrorSuggestions = (): string[] => {
  const statusCode = props.error.statusCode;

  switch (statusCode) {
    case 400:
      return [
        "Vérifiez que tous les champs requis sont remplis",
        "Assurez-vous d'avoir sélectionné une difficulté valide",
        "Vérifiez le format de l'image uploadée",
      ];
    case 401:
      return [
        "Retournez à la page de connexion",
        "Vérifiez que vous avez le mot de passe ouvreur",
        "Contactez un administrateur si nécessaire",
      ];
    case 403:
      return [
        "Contactez un administrateur pour obtenir les droits",
        "Vérifiez que vous êtes bien connecté",
        "Essayez de vous reconnecter",
      ];
    case 404:
      return [
        "Vérifiez l'URL dans la barre d'adresse",
        "Utilisez le menu de navigation",
        "Consultez la liste de toutes les voies",
        "La voie a peut-être été supprimée récemment",
      ];
    case 429:
      return [
        "Attendez quelques minutes avant de réessayer",
        "Réduisez la fréquence de vos actions",
        "Rafraîchissez la page plus tard",
      ];
    case 500:
      return [
        "Actualisez la page dans quelques instants",
        "Vérifiez votre connexion internet",
        "Réessayez plus tard",
        "Contactez le support si le problème persiste",
      ];
    case 502:
    case 503:
      return [
        "Attendez quelques minutes et réessayez",
        "Le service sera bientôt rétabli",
        "Vérifiez notre statut sur les réseaux sociaux",
      ];
    default:
      return [
        "Actualisez la page",
        "Vérifiez votre connexion internet",
        "Réessayez dans quelques instants",
        "Contactez le support si nécessaire",
      ];
  }
};

const getMotivationalMessage = (): string => {
  const messages = [
    "🧗‍♀️ Même les meilleurs grimpeurs tombent parfois !",
    "🎯 Chaque chute est une leçon pour la prochaine ascension",
    "💪 L'escalade, c'est se relever après chaque chute",
    "🏔️ Les sommets les plus hauts valent quelques détours",
    "⭐ Pas d'escalade sans quelques obstacles à surmonter",
    "🚀 Cette erreur n'est qu'un pas vers votre prochaine réussite",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

const getRandomClimbingEmoji = (): string => {
  const emojis = ["🧗‍♀️", "🧗‍♂️", "🏔️", "⛰️", "🎯", "💎", "⭐", "🌟"];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

const getParticleStyle = (index: number): Record<string, string> => {
  return {
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    animationDelay: Math.random() * 3 + "s",
    animationDuration: 3 + Math.random() * 4 + "s",
    fontSize: 1 + Math.random() * 1.5 + "rem",
    opacity: "0.6",
  };
};

const goBack = (): void => {
  if (process.client && window.history.length > 1) {
    window.history.back();
  } else {
    navigateTo("/");
  }
};

const refreshPage = (): void => {
  if (process.client) {
    window.location.reload();
  }
};

const reportError = (): void => {
  const subject = `Erreur ${props.error.statusCode} - Créateur de Bloc`;
  const body = `Bonjour,\n\nJ'ai rencontré une erreur sur le site :\n\nCode: ${
    props.error.statusCode
  }\nMessage: ${props.error.statusMessage || props.error.message}\nURL: ${
    props.error.url || window.location.href
  }\n\nMerci de votre aide !`;

  const mailtoLink = `mailto:support@escalade.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  if (process.client) {
    window.location.href = mailtoLink;
  }
};
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
  }
  50% {
    transform: translateY(-10px) rotate(-5deg);
  }
  75% {
    transform: translateY(-15px) rotate(3deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Animation pour l'escaladeur qui tombe */
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
