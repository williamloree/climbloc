<template>
  <div class="flex flex-col">
    <!-- Header simple -->
    <header class="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <!-- Logo/Titre centré -->
        <div class="flex justify-center">
          <NuxtLink to="/" class="group">
            <div class="flex items-center gap-3 transition-transform duration-200 group-hover:-translate-y-1">
              <span class="text-4xl filter drop-shadow-lg">🧗‍♂️</span>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ClimbTracker
              </h1>
            </div>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
// Script minimal sans gestion de menu mobile
</script>