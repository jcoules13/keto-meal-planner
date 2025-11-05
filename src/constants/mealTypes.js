/**
 * Constantes pour les types de repas standardisés
 * Utilisé dans tous les composants de génération de repas
 * Version consolidée pour éviter duplications
 */

export const MEAL_TYPES = {
  PETIT_DEJEUNER: {
    id: 'petit_dejeuner',
    label: 'Petit déjeuner',
    order: 1
  },
  COLLATION_MATIN: {
    id: 'collation_matin',
    label: 'Collation du matin',
    order: 2
  },
  DEJEUNER: {
    id: 'dejeuner',
    label: 'Déjeuner',
    order: 3
  },
  COLLATION_APREM: {
    id: 'collation_aprem',
    label: 'Collation après-midi',
    order: 4
  },
  SOUPER: {
    id: 'souper',
    label: 'Souper',
    order: 5
  }
};

/**
 * Obtient les types de repas en fonction de la fréquence configurée
 * @param {number} frequency - Nombre de repas par jour (1-5)
 * @returns {string[]} - Liste des identifiants de types de repas
 */
export const getMealTypes = (frequency) => {
  switch (frequency) {
    case 1:
      return [MEAL_TYPES.SOUPER.id];
    case 2:
      return [MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.SOUPER.id];
    case 3:
      return [
        MEAL_TYPES.PETIT_DEJEUNER.id,
        MEAL_TYPES.DEJEUNER.id,
        MEAL_TYPES.SOUPER.id
      ];
    case 4:
      return [
        MEAL_TYPES.PETIT_DEJEUNER.id,
        MEAL_TYPES.DEJEUNER.id,
        MEAL_TYPES.COLLATION_APREM.id,
        MEAL_TYPES.SOUPER.id
      ];
    case 5:
      return [
        MEAL_TYPES.PETIT_DEJEUNER.id,
        MEAL_TYPES.COLLATION_MATIN.id,
        MEAL_TYPES.DEJEUNER.id,
        MEAL_TYPES.COLLATION_APREM.id,
        MEAL_TYPES.SOUPER.id
      ];
    default:
      return [MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.SOUPER.id];
  }
};

/**
 * Convertit un identifiant de type de repas en nom d'affichage
 * @param {string} mealTypeId - Identifiant du type de repas
 * @returns {string} - Nom d'affichage du type de repas
 */
export const getMealLabel = (mealTypeId) => {
  const foundType = Object.values(MEAL_TYPES).find(type => type.id === mealTypeId);
  return foundType ? foundType.label : mealTypeId;
};

/**
 * Obtient l'ordre de tri pour un type de repas
 * @param {string} mealTypeId - Identifiant du type de repas
 * @returns {number} - Ordre de tri (1-5)
 */
export const getMealOrder = (mealTypeId) => {
  const foundType = Object.values(MEAL_TYPES).find(type => type.id === mealTypeId);
  return foundType ? foundType.order : 999;
};

/**
 * Liste de tous les identifiants de types de repas
 */
export const ALL_MEAL_TYPE_IDS = Object.values(MEAL_TYPES).map(type => type.id);

/**
 * Liste de tous les types de repas avec leurs labels
 */
export const ALL_MEAL_TYPES = Object.values(MEAL_TYPES);
