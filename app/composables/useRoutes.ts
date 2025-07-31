// composables/useRoutes.ts

import type { ClimbingRoute, Hold } from "~/app/types";

export const useRoutes = () => {
  const savedRoutes = ref<ClimbingRoute[]>([]);

  // Charger les voies depuis localStorage
  const loadSavedRoutes = (): void => {
    try {
      if (process.client) {
        const saved = localStorage.getItem("climbingRoutes");
        if (saved) {
          savedRoutes.value = JSON.parse(saved);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    }
  };

  // Sauvegarder dans localStorage
  const saveToLocalStorage = (): void => {
    try {
      if (process.client) {
        localStorage.setItem(
          "climbingRoutes",
          JSON.stringify(savedRoutes.value)
        );
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  // Ajouter une nouvelle voie
  const addRoute = (
    route: Omit<ClimbingRoute, "date" | "previewScale">
  ): void => {
    const newRoute: ClimbingRoute = {
      ...route,
      date: new Date().toISOString(),
      previewScale: 0.3,
    };

    savedRoutes.value.unshift(newRoute);
    saveToLocalStorage();
  };

  // Supprimer une voie
  const deleteRoute = (index: number): boolean => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette voie d'escalade ?")) {
      savedRoutes.value.splice(index, 1);
      saveToLocalStorage();
      return true;
    }
    return false;
  };

  // Statistiques calculées
  const totalHolds = computed((): number =>
    savedRoutes.value.reduce((total, route) => total + route.holds.length, 0)
  );

  const averageDifficulty = computed((): string => {
    if (savedRoutes.value.length === 0) return "---";

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

    const difficulties = savedRoutes.value.map((route) => route.difficulty);
    const gradeNumbers = difficulties.map((d) => gradeMap[d] || 0);
    const average =
      gradeNumbers.reduce((sum, grade) => sum + grade, 0) / gradeNumbers.length;

    const reverseMap = Object.keys(gradeMap).find(
      (key) => gradeMap[key] === Math.round(average)
    );
    return reverseMap || difficulties[0] || "---";
  });

  // Filtrer les prises par type
  const getHoldsByType = (route: ClimbingRoute, type: Hold["type"]): Hold[] => {
    return route.holds.filter((hold) => hold.type === type);
  };

  // Compter les prises par type
  const getHoldsCount = (route: ClimbingRoute, type: Hold["type"]): number => {
    return route.holds.filter((hold) => hold.type === type).length;
  };

  // Initialiser au montage
  onMounted(() => {
    loadSavedRoutes();
  });

  return {
    savedRoutes: readonly(savedRoutes),
    loadSavedRoutes,
    addRoute,
    deleteRoute,
    totalHolds,
    averageDifficulty,
    getHoldsByType,
    getHoldsCount,
  };
};
