import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';
import './MealGenerator.css';

/**
 * Constantes pour les types de repas standardisés
 * Inclut les identifiants, noms d'affichage et ordre pour le tri
 */
const MEAL_TYPES = {
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
const getMealTypes = (frequency) => {
  switch (frequency) {
    case 1:
      return [MEAL_TYPES.SOUPER.id];
    case 2:
      return [MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.SOUPER.id];
    case 3:
      return [MEAL_TYPES.PETIT_DEJEUNER.id, MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.SOUPER.id];
    case 4:
      return [MEAL_TYPES.PETIT_DEJEUNER.id, MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.COLLATION_APREM.id, MEAL_TYPES.SOUPER.id];
    case 5:
      return [MEAL_TYPES.PETIT_DEJEUNER.id, MEAL_TYPES.COLLATION_MATIN.id, MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.COLLATION_APREM.id, MEAL_TYPES.SOUPER.id];
    default:
      return [MEAL_TYPES.DEJEUNER.id, MEAL_TYPES.SOUPER.id];
  }
};

/**
 * Convertit un identifiant de type de repas en nom d'affichage
 * @param {string} mealTypeId - Identifiant du type de repas
 * @returns {string} - Nom d'affichage du type de repas
 */
const getMealLabel = (mealTypeId) => {
  const foundType = Object.values(MEAL_TYPES).find(type => type.id === mealTypeId);
  return foundType ? foundType.label : mealTypeId;
};
/**
 * Générateur de repas pour la semaine entière
 * Génère automatiquement des repas pour chaque jour du plan selon la fréquence configurée
 */
const WeeklyMealGenerator = () => {
  const { calorieTarget, macroTargets, dietType, preferences, mealFrequency } = useUser();
  const { currentPlan, addMealToCurrentPlan, deleteMeal } = useMealPlan();
  const { foods } = useFood();
  const { recipes } = useRecipe();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statsMessage, setStatsMessage] = useState('');
  const [debugLog, setDebugLog] = useState('');
  
  // Options du générateur
  const [generationOptions, setGenerationOptions] = useState({
    preferLowCarbs: true,
    maximizeProtein: false,
    balancedMacros: true,
    generateDinnerOnly: false, // Option pour générer seulement les dîners
    generateLunchOnly: false,  // Option pour générer seulement les déjeuners
    clearExistingMeals: true,  // Nouvelle option pour effacer les repas existants
  });
  
  // Effacer les messages après un délai
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  const handleOptionChange = (option, value) => {
    // Gestion des options mutuellement exclusives
    if (option === 'generateDinnerOnly' && value === true) {
      setGenerationOptions(prev => ({
        ...prev,
        [option]: value,
        generateLunchOnly: false
      }));
    } else if (option === 'generateLunchOnly' && value === true) {
      setGenerationOptions(prev => ({
        ...prev,
        [option]: value,
        generateDinnerOnly: false
      }));
    } else {
      setGenerationOptions(prev => ({
        ...prev,
        [option]: value
      }));
    }
  };
/**
   * Génère un repas réel basé sur les données d'aliments et de recettes
   * Version améliorée avec meilleure récupération des aliments
   */
  const generateRealMeal = (type, calories, macros, dietType, dayIndex) => {
    // Historique des repas déjà générés pour cette semaine (pour éviter les doublons)
    const existingMealsInPlan = currentPlan && currentPlan.days 
      ? currentPlan.days.flatMap(day => day.meals.map(meal => meal.name))
      : [];
    
    // Liste d'aliments déjà utilisés récemment (pour éviter les répétitions)
    const recentlyUsedFoodIds = [];
    
    // Sélection du mode de génération: recette ou combinaison d'aliments individuels
    // On privilégie les recettes pour les repas principaux (70% du temps)
    const useRecipe = (Math.random() < 0.7);
    
    // Si on utilise une recette
    if (useRecipe && recipes.length > 0) {
      // Filtrer les recettes appropriées selon le type de régime
      let filteredRecipes = recipes.filter(recipe => {
        // Vérifier les contraintes keto
        if (dietType === 'keto_alcalin' && !recipe.isAlkaline) {
          return false;
        }
        
        // Vérifier si la recette n'a pas déjà été utilisée cette semaine
        if (existingMealsInPlan.includes(recipe.name)) {
          return false;
        }
        
        // Vérifier si les valeurs nutritionnelles sont dans les limites appropriées
        const calorieMargin = 0.2; // 20% de marge
        if (recipe.nutritionPerServing && (
            recipe.nutritionPerServing.calories < calories * (1 - calorieMargin) || 
            recipe.nutritionPerServing.calories > calories * (1 + calorieMargin))) {
          return false;
        }
        
        // Vérifier que la recette correspond au type de repas
        const mealTypes = recipe.tags || [];
        // Conversion du type interne vers les tags de recette
        // Correction: Utiliser 'souper' au lieu de 'diner' pour être cohérent
        const tagToCheck = type === MEAL_TYPES.SOUPER.id ? 'souper' : type;
        return mealTypes.includes(tagToCheck);
      });
      
      // Si l'option preferLowCarbs est activée, privilégier les recettes faibles en glucides
      if (generationOptions.preferLowCarbs) {
        filteredRecipes.sort((a, b) => {
          const aCarbs = a.nutritionPerServing?.netCarbs || 0;
          const bCarbs = b.nutritionPerServing?.netCarbs || 0;
          return aCarbs - bCarbs;
        });
      }
      
      // Si l'option maximizeProtein est activée, privilégier les recettes riches en protéines
      if (generationOptions.maximizeProtein) {
        filteredRecipes.sort((a, b) => {
          const aProtein = b.nutritionPerServing?.protein || 0;
          const bProtein = a.nutritionPerServing?.protein || 0;
          return aProtein - bProtein;
        });
      }
      
      // Prendre les 5 meilleures recettes et en choisir une au hasard pour plus de variété
      const topRecipes = filteredRecipes.slice(0, Math.min(5, filteredRecipes.length));
      
      if (topRecipes.length > 0) {
        const selectedRecipe = topRecipes[Math.floor(Math.random() * topRecipes.length)];
        
        // Ajuster les portions pour respecter les objectifs caloriques
        let factor = 1;
        if (selectedRecipe.nutritionPerServing && selectedRecipe.nutritionPerServing.calories) {
          factor = calories / selectedRecipe.nutritionPerServing.calories;
        }
        const portions = Math.round(factor * 10) / 10; // Arrondir à 1 décimale
        
        // Construire les "items" du repas à partir des ingrédients de la recette
        const items = selectedRecipe.ingredients?.map(ingredient => {
          const food = foods.find(f => f.id === ingredient.foodId);
          return {
            id: ingredient.foodId, // Important pour la récupération ultérieure
            type: 'food',
            name: food ? food.name : ingredient.foodId, // Utiliser le nom de l'aliment s'il existe
            quantity: Math.round(ingredient.quantity * portions),
            unit: ingredient.unit
          };
        }) || [];
        
        // Créer l'objet repas avec les valeurs nutritionnelles ajustées
        return {
          name: selectedRecipe.name,
          type: type,  // Utiliser le type standardisé
          displayType: getMealLabel(type),  // Ajouter le nom d'affichage
          recipeId: selectedRecipe.id, // Pour référence
          isRecipe: true,
          totaux: {
            calories: Math.round(selectedRecipe.nutritionPerServing?.calories * portions || 0),
            macros: {
              protein: Math.round(selectedRecipe.nutritionPerServing?.protein * portions * 10) / 10 || 0,
              fat: Math.round(selectedRecipe.nutritionPerServing?.fat * portions * 10) / 10 || 0,
              netCarbs: Math.round(selectedRecipe.nutritionPerServing?.netCarbs * portions * 10) / 10 || 0
            }
          },
          items: items,
          order: getMealOrder(type)  // Ajouter l'ordre pour le tri
        };
      }
    }
// Si on n'a pas trouvé de recette appropriée ou si on a choisi de ne pas utiliser de recette,
    // générer un repas à partir d'aliments individuels
    
    // Filtrer les aliments selon le type de régime et les préférences
    let filteredFoods = foods.filter(food => {
      // Vérifier les contraintes keto
      if (!food.isKeto) {
        return false;
      }
      
      // Pour le régime alcalin, sélectionner uniquement les aliments alcalins
      if (dietType === 'keto_alcalin' && !food.isAlkaline) {
        return false;
      }
      
      // Exclure les aliments récemment utilisés
      if (recentlyUsedFoodIds.includes(food.id)) {
        return false;
      }
      
      // Exclure les aliments préférentiellement exclus par l'utilisateur
      if (preferences && preferences.excludedFoods && preferences.excludedFoods.includes(food.id)) {
        return false;
      }
      
      return true;
    });
    
    // Code de sélection des aliments (reste identique, juste ajout de l'ordre et du type d'affichage)
    // Diviser les aliments par catégorie
    const proteinFoods = filteredFoods.filter(food => 
      food.category === 'viande' || 
      food.category === 'poisson' || 
      food.category === 'œufs' || 
      (food.category === 'produits_laitiers' && food.nutritionPer100g?.protein > 15)
    );

    const fatFoods = filteredFoods.filter(food => 
      food.category === 'matières_grasses' || 
      food.category === 'noix_graines'
    );

    const vegetableFoods = filteredFoods.filter(food => 
      food.category === 'légumes' && 
      food.nutritionPer100g?.netCarbs < 10
    );

    // S'assurer qu'on a des aliments disponibles
    if (proteinFoods.length === 0 || vegetableFoods.length === 0 || fatFoods.length === 0) {
      throw new Error("Pas assez d'aliments disponibles pour générer un repas équilibré");
    }

    // Sélectionner une protéine
    const proteinFood = proteinFoods[Math.floor(Math.random() * proteinFoods.length)];

    // Sélectionner 1-2 légumes
    const vegetableCount = Math.floor(Math.random() * 2) + 1;
    const selectedVegetables = [];

    for (let i = 0; i < vegetableCount && i < vegetableFoods.length; i++) {
      // Éviter de sélectionner le même légume deux fois
      let availableVegetables = vegetableFoods.filter(veg => 
        !selectedVegetables.some(selected => selected.id === veg.id)
      );
      
      if (availableVegetables.length === 0) break;
      
      selectedVegetables.push(
        availableVegetables[Math.floor(Math.random() * availableVegetables.length)]
      );
    }

    // Sélectionner 1-2 sources de graisses
    const fatCount = Math.floor(Math.random() * 2) + 1;
    const selectedFats = [];

    for (let i = 0; i < fatCount && i < fatFoods.length; i++) {
      // Éviter de sélectionner la même source de graisse deux fois
      let availableFats = fatFoods.filter(fat => 
        !selectedFats.some(selected => selected.id === fat.id)
      );
      
      if (availableFats.length === 0) break;
      
      selectedFats.push(
        availableFats[Math.floor(Math.random() * availableFats.length)]
      );
    }
// Calculer les proportions pour atteindre les objectifs caloriques et de macros
    // Distribution typique pour un repas keto
    // Protéine: 25-30% des calories
    // Légumes: 10-15% des calories
    // Matières grasses: 55-65% des calories
    const caloriesProtein = calories * 0.28; // 28% des calories
    const caloriesVegetables = calories * 0.12; // 12% des calories
    const caloriesFat = calories * 0.60; // 60% des calories

    // Calculer les quantités pour chaque aliment
    const items = [];

    // Ajouter la protéine
    if (proteinFood) {
      const proteinCaloriesPer100g = proteinFood.nutritionPer100g?.calories || 200;
      const quantity = Math.round((caloriesProtein / (proteinCaloriesPer100g / 100)));
      
      items.push({
        id: proteinFood.id,
        type: 'food',
        name: proteinFood.name,
        quantity: quantity,
        unit: 'g'
      });
    }

    // Ajouter les légumes
    selectedVegetables.forEach(vegetable => {
      const caloriesPerVegetable = caloriesVegetables / selectedVegetables.length;
      const vegCaloriesPer100g = vegetable.nutritionPer100g?.calories || 25;
      let quantity = Math.round((caloriesPerVegetable / (vegCaloriesPer100g / 100)));
      
      // Minimum 100g de légumes
      quantity = Math.max(quantity, 100);
      
      items.push({
        id: vegetable.id,
        type: 'food',
        name: vegetable.name,
        quantity: quantity,
        unit: 'g'
      });
    });

    // Ajouter les matières grasses
    selectedFats.forEach(fat => {
      const caloriesPerFat = caloriesFat / selectedFats.length;
      const fatCaloriesPer100g = fat.nutritionPer100g?.calories || 800;
      const quantity = Math.round((caloriesPerFat / (fatCaloriesPer100g / 100)));
      
      items.push({
        id: fat.id,
        type: 'food',
        name: fat.name,
        quantity: quantity,
        unit: 'g'
      });
    });

    // Calculer les valeurs nutritionnelles totales
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalNetCarbs = 0;

    items.forEach(item => {
      const food = foods.find(f => f.id === item.id);
      if (food && food.nutritionPer100g) {
        const ratio = item.quantity / 100;
        totalCalories += (food.nutritionPer100g.calories || 0) * ratio;
        totalProtein += (food.nutritionPer100g.protein || 0) * ratio;
        totalFat += (food.nutritionPer100g.fat || 0) * ratio;
        totalNetCarbs += ((food.nutritionPer100g.carbs || 0) - (food.nutritionPer100g.fiber || 0)) * ratio;
      }
    });

    // Créer le nom du repas
    let mealName = "";
    if (proteinFood) {
      if (selectedVegetables.length > 0) {
        mealName = `${proteinFood.name} avec ${selectedVegetables.map(v => v.name).join(' et ')}`;
      } else {
        mealName = `${proteinFood.name} à la ${selectedFats[0]?.name || 'maison'}`;
      }
    } else if (selectedVegetables.length > 0) {
      mealName = `Salade de ${selectedVegetables.map(v => v.name).join(' et ')}`;
    } else {
      // Correction: Utiliser "souper" au lieu de comparer avec "dejeuner"
      mealName = `Plat keto ${type === MEAL_TYPES.DEJEUNER.id ? 'du midi' : 'du soir'}`;
    }
    
    // À la fin, retourner l'objet repas avec les propriétés additionnelles
    return {
      name: mealName,
      type: type,  // Identifiant du type de repas
      displayType: getMealLabel(type),  // Nom d'affichage du type de repas
      isRecipe: false,
      totaux: {
        calories: Math.round(totalCalories),
        macros: {
          protein: Math.round(totalProtein * 10) / 10,
          fat: Math.round(totalFat * 10) / 10,
          netCarbs: Math.round(totalNetCarbs * 10) / 10
        }
      },
      items: items,
      order: getMealOrder(type)  // Ordre pour le tri
    };
  };
/**
   * Retourne l'ordre d'un type de repas pour le tri
   * @param {string} mealType - Identifiant du type de repas
   * @returns {number} - Numéro d'ordre (1-5)
   */
  const getMealOrder = (mealType) => {
    const foundType = Object.values(MEAL_TYPES).find(type => type.id === mealType);
    return foundType ? foundType.order : 99;  // Valeur par défaut élevée si type non trouvé
  };

  /**
   * Fonction utilitaire pour normaliser les types de repas
   * (supprime les accents et met en minuscules)
   */
  const normalizeType = (type) => {
    return type
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  /**
   * Supprime tous les repas d'un type spécifique pour tous les jours du plan
   * Version améliorée pour être plus robuste face aux différentes formes des types de repas
   */
  const clearExistingMeals = async (mealTypes) => {
    if (!currentPlan || !currentPlan.days || currentPlan.days.length === 0) {
      console.log("Pas de plan ou de jours définis pour effacer les repas");
      return false;
    }

    setIsClearing(true);
    let deletedCount = 0;
    let currentDebugLog = "";
    
    try {
      // Normaliser les types de repas à supprimer
      const normalizedTypes = mealTypes.map(type => normalizeType(type));
      currentDebugLog += `Types normalisés à supprimer: ${normalizedTypes.join(', ')}\n`;
      
      // Pour chaque jour du plan
      for (let dayIndex = 0; dayIndex < currentPlan.days.length; dayIndex++) {
        const day = currentPlan.days[dayIndex];
        currentDebugLog += `Jour ${dayIndex}: ${day.meals.length} repas\n`;
        
        // Trouver tous les repas à supprimer
        const mealsToDelete = day.meals.filter(meal => {
          // Vérifier si le type du repas correspond à l'un des types à supprimer
          const normalizedMealType = normalizeType(meal.type || '');
          const typesToCheck = [
            normalizedMealType,
            normalizeType(meal.displayType || '')
          ];
          
          // CORRECTION: Gérer les équivalences souper/dîner explicitement
          if (normalizedMealType === 'souper' || normalizedMealType === 'diner') {
            return normalizedTypes.includes('souper') || normalizedTypes.includes('diner');
          }
          
          // Pour les autres types, vérifier s'il y a une correspondance
          return typesToCheck.some(type => normalizedTypes.includes(type));
        });
        
        currentDebugLog += `  Repas à supprimer: ${mealsToDelete.length}\n`;
        
        // Supprimer chaque repas identifié
        for (const meal of mealsToDelete) {
          try {
            await deleteMeal(currentPlan.id, dayIndex, meal.id);
            deletedCount++;
            currentDebugLog += `  Repas supprimé: ${meal.name} (ID: ${meal.id})\n`;
          } catch (error) {
            currentDebugLog += `  ERREUR lors de la suppression du repas ${meal.id}: ${error.message}\n`;
          }
          
          // Petite pause pour éviter de surcharger l'interface
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Mettre à jour le message de succès
      if (deletedCount > 0) {
        setSuccessMessage(`${deletedCount} repas ont été supprimés avant la génération.`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
      // Conserver les informations de debug
      setDebugLog(currentDebugLog);
      console.log("Debug: Suppression des repas", currentDebugLog);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des repas existants:', error);
      setErrorMessage(`Erreur lors de la suppression: ${error.message}`);
      setDebugLog(currentDebugLog + `\nErreur générale: ${error.message}`);
      return false;
    } finally {
      setIsClearing(false);
    }
  };
/**
   * Calcule la distribution optimale des calories pour chaque type de repas
   * en fonction du nombre de repas par jour
   */
  const calculateCalorieDistribution = (mealTypes) => {
    const distribution = {};
    
    // Initialiser tous les types de repas standardisés avec des valeurs par défaut
    Object.values(MEAL_TYPES).forEach(mealType => {
      distribution[mealType.id] = 0;
    });
    
    // Distribution en fonction du nombre de types de repas
    if (mealTypes.length === 1) {
      // Si un seul repas, il prend 100% des calories
      distribution[mealTypes[0]] = 1.0;
    } else if (mealTypes.length === 2) {
      // Répartition pour deux repas
      if (mealTypes.includes(MEAL_TYPES.DEJEUNER.id) && mealTypes.includes(MEAL_TYPES.SOUPER.id)) {
        distribution[MEAL_TYPES.DEJEUNER.id] = 0.55; // 55% pour le déjeuner
        distribution[MEAL_TYPES.SOUPER.id] = 0.45; // 45% pour le souper
      } else {
        // Distribution équitable si ce n'est pas le couple déjeuner/souper
        mealTypes.forEach(type => distribution[type] = 1.0 / mealTypes.length);
      }
    } else if (mealTypes.length === 3) {
      // Répartition pour trois repas
      if (mealTypes.includes(MEAL_TYPES.PETIT_DEJEUNER.id) && 
          mealTypes.includes(MEAL_TYPES.DEJEUNER.id) && 
          mealTypes.includes(MEAL_TYPES.SOUPER.id)) {
        distribution[MEAL_TYPES.PETIT_DEJEUNER.id] = 0.25; // 25% pour le petit déjeuner
        distribution[MEAL_TYPES.DEJEUNER.id] = 0.40; // 40% pour le déjeuner
        distribution[MEAL_TYPES.SOUPER.id] = 0.35; // 35% pour le souper
      } else {
        // Distribution équitable pour d'autres combinaisons
        mealTypes.forEach(type => distribution[type] = 1.0 / mealTypes.length);
      }
    } else if (mealTypes.length === 4) {
      // Répartition pour quatre repas
      if (mealTypes.includes(MEAL_TYPES.PETIT_DEJEUNER.id)) distribution[MEAL_TYPES.PETIT_DEJEUNER.id] = 0.2;
      if (mealTypes.includes(MEAL_TYPES.DEJEUNER.id)) distribution[MEAL_TYPES.DEJEUNER.id] = 0.35;
      if (mealTypes.includes(MEAL_TYPES.COLLATION_APREM.id)) distribution[MEAL_TYPES.COLLATION_APREM.id] = 0.15;
      if (mealTypes.includes(MEAL_TYPES.SOUPER.id)) distribution[MEAL_TYPES.SOUPER.id] = 0.3;
    } else if (mealTypes.length === 5) {
      // Répartition pour cinq repas
      distribution[MEAL_TYPES.PETIT_DEJEUNER.id] = 0.2; // 20%
      distribution[MEAL_TYPES.COLLATION_MATIN.id] = 0.1; // 10%
      distribution[MEAL_TYPES.DEJEUNER.id] = 0.3; // 30%
      distribution[MEAL_TYPES.COLLATION_APREM.id] = 0.1; // 10%
      distribution[MEAL_TYPES.SOUPER.id] = 0.3; // 30%
    } else {
      // Distribution équitable pour tout autre nombre de repas
      mealTypes.forEach(type => distribution[type] = 1.0 / mealTypes.length);
    }
    
    // Normaliser pour s'assurer que la somme fait exactement 1.0 pour les types présents
    let totalPercentage = 0;
    mealTypes.forEach(type => {
      totalPercentage += distribution[type];
    });
    
    if (totalPercentage !== 0 && totalPercentage !== 1.0) {
      mealTypes.forEach(type => {
        distribution[type] = distribution[type] / totalPercentage;
      });
    }
    
    return distribution;
  };
/**
   * Génère des repas pour toute la semaine en fonction des options sélectionnées
   * Version améliorée pour respecter la fréquence des repas et forcer l'ordre d'affichage
   */
  const generateWeeklyMeals = async () => {
    if (!currentPlan || !currentPlan.days || currentPlan.days.length === 0) {
      setErrorMessage('Vous devez d\'abord créer un plan pour pouvoir générer des repas.');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setErrorMessage('');
    setSuccessMessage('');
    setStatsMessage('');
    setDebugLog('');
    
    let currentDebugLog = "Génération des repas - Log de debug\n";
    currentDebugLog += `Fréquence de repas définie: ${mealFrequency}\n`;
    
    try {
      // Déterminer les types de repas à générer en fonction des options et de la fréquence
      let mealTypes = [];
      
      if (generationOptions.generateDinnerOnly) {
        mealTypes = [MEAL_TYPES.SOUPER.id];
        currentDebugLog += "Option sélectionnée: Soupers uniquement\n";
      } else if (generationOptions.generateLunchOnly) {
        mealTypes = [MEAL_TYPES.DEJEUNER.id];
        currentDebugLog += "Option sélectionnée: Déjeuners uniquement\n";
      } else {
        // Utiliser la fonction getMealTypes pour obtenir les types de repas selon la fréquence
        mealTypes = getMealTypes(mealFrequency);
        currentDebugLog += `Distribution selon fréquence: ${mealFrequency} repas/jour\n`;
      }
      
      // CORRECTION: Vérifier qu'on n'a pas plus de types que la fréquence demandée
      if (mealTypes.length > mealFrequency) {
        currentDebugLog += `ATTENTION: Nombre de types (${mealTypes.length}) supérieur à la fréquence (${mealFrequency}). Limitation appliquée.\n`;
        mealTypes = mealTypes.slice(0, mealFrequency);
      }
      
      // Trier les types de repas selon l'ordre prédéfini
      mealTypes.sort((a, b) => {
        const orderA = getMealOrder(a);
        const orderB = getMealOrder(b);
        return orderA - orderB;
      });
      
      currentDebugLog += `Types de repas à générer (dans l'ordre): ${mealTypes.map(type => getMealLabel(type)).join(', ')}\n`;
      
      // Si l'option est activée, supprimer d'abord les repas existants des types concernés
      if (generationOptions.clearExistingMeals) {
        setGenerationProgress(5); // Commencer à 5% pour montrer que quelque chose se passe
        currentDebugLog += "Suppression des repas existants...\n";
        const clearResult = await clearExistingMeals(mealTypes);
        currentDebugLog += `Résultat de la suppression: ${clearResult ? "Succès" : "Échec"}\n`;
        setGenerationProgress(10); // Après la suppression, marquer 10% de progrès
      }
      
      // Calculer le nombre total d'opérations pour la barre de progression
      const totalOperations = currentPlan.days.length * mealTypes.length;
      let completedOperations = 0;
      let successfulAdditions = 0;
      
      currentDebugLog += `Nombre total d'opérations: ${totalOperations}\n`;
      
      // Calculer la distribution des calories par repas
      const calorieDistribution = calculateCalorieDistribution(mealTypes);
      currentDebugLog += "Distribution des calories:\n";
      Object.entries(calorieDistribution).forEach(([type, percentage]) => {
        if (percentage > 0) {
          currentDebugLog += `  ${getMealLabel(type)}: ${Math.round(percentage * 100)}% (${Math.round(calorieTarget * percentage)} kcal)\n`;
        }
      });
      
      // CORRECTION: Suivi des repas déjà générés par jour et par type
      const generatedMeals = {};
      
      // Pour chaque jour du plan
      for (let dayIndex = 0; dayIndex < currentPlan.days.length; dayIndex++) {
        currentDebugLog += `\nJour ${dayIndex}: ${currentPlan.days[dayIndex].date}\n`;
        
        // Initialiser le compteur pour ce jour
        generatedMeals[dayIndex] = new Set();
        
        // Pour chaque type de repas à générer, dans l'ordre défini
        for (const mealType of mealTypes) {
          try {
            // CORRECTION: Vérifier si ce type de repas a déjà été généré pour ce jour
            if (generatedMeals[dayIndex].has(mealType)) {
              currentDebugLog += `  IGNORÉ: Type de repas ${getMealLabel(mealType)} déjà généré pour ce jour\n`;
              completedOperations++;
              continue;
            }
            
            currentDebugLog += `  Génération du repas de type: ${getMealLabel(mealType)}\n`;
            
            // Calculer les calories cibles en fonction du type de repas
            const mealCalorieTarget = calorieTarget * (calorieDistribution[mealType] || 0.2);
            
            currentDebugLog += `    Calories cibles: ${mealCalorieTarget}\n`;
            
            // Calculer les macros cibles
            const mealMacros = {
              protein: macroTargets.protein * (calorieDistribution[mealType] || 0.2),
              fat: macroTargets.fat * (calorieDistribution[mealType] || 0.2),
              carbs: macroTargets.carbs * (calorieDistribution[mealType] || 0.2)
            };
            
            // Générer un repas approprié selon le type de régime
            const meal = generateRealMeal(mealType, mealCalorieTarget, mealMacros, dietType, dayIndex);
            currentDebugLog += `    Repas généré: ${meal.name}\n`;
            
            // CORRECTION: S'assurer que le displayType est bien défini
            if (!meal.displayType || meal.displayType === 'repas') {
              meal.displayType = getMealLabel(mealType);
              currentDebugLog += `    Correction du displayType: ${meal.displayType}\n`;
            }
            
            // Ajouter le repas au plan
            const newMealId = await addMealToCurrentPlan(meal, dayIndex, mealType);
            if (newMealId) {
              successfulAdditions++;
              generatedMeals[dayIndex].add(mealType); // Marquer ce type comme généré pour ce jour
              currentDebugLog += `    Repas ajouté avec succès, ID: ${newMealId}\n`;
            } else {
              currentDebugLog += `    ÉCHEC de l'ajout du repas\n`;
            }
            
            // Mise à jour de la progression
            completedOperations++;
            // Répartir la progression entre 10% et 100%
            const progressValue = 10 + Math.floor((completedOperations / totalOperations) * 90);
            setGenerationProgress(progressValue);
            currentDebugLog += `    Progression: ${completedOperations}/${totalOperations} (${progressValue}%)\n`;
            
            // Petite pause pour éviter de bloquer l'interface utilisateur
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Erreur lors de la génération du repas ${mealType} pour le jour ${dayIndex}:`, error);
            currentDebugLog += `    ERREUR: ${error.message}\n`;
            // On continue avec les autres repas même en cas d'erreur
            completedOperations++;
            const progressValue = 10 + Math.floor((completedOperations / totalOperations) * 90);
            setGenerationProgress(progressValue);
          }
        }
      }
      
      // Log final
      currentDebugLog += `\nRécapitulatif:\n`;
      currentDebugLog += `Total des repas ajoutés avec succès: ${successfulAdditions}/${totalOperations}\n`;
      setDebugLog(currentDebugLog);
      
      // Message de succès avec statistiques
      if (successfulAdditions > 0) {
        setSuccessMessage(`${successfulAdditions} repas ont été générés et ajoutés à votre plan avec succès!`);
        // Adapter le message à la sélection des types de repas
        const typesLabel = mealTypes.map(type => getMealLabel(type)).join(' et ');
        setStatsMessage(`${typesLabel} générés pour ${currentPlan.days.length} jours.`);
      } else {
        setErrorMessage('Aucun repas n\'a pu être généré. Veuillez vérifier vos données d\'aliments et de recettes.');
      }
    } catch (error) {
      console.error('Erreur lors de la génération des repas:', error);
      setErrorMessage(`Une erreur est survenue: ${error.message}`);
      currentDebugLog += `\nERREUR GÉNÉRALE: ${error.message}\n`;
      setDebugLog(currentDebugLog);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };
return (
    <div className="weekly-meal-generator">
      <div className="generator-header">
        <h2>Générateur automatique de repas hebdomadaires</h2>
        <p className="subheading">Générez en un clic tous les repas de votre semaine</p>
      </div>

      {!currentPlan ? (
        <div className="empty-plan-message">
          <p>Vous devez d'abord créer un plan pour pouvoir générer des repas.</p>
        </div>
      ) : (
        <>
          <div className="generator-options">
            <h3>Options de génération</h3>
            
            <div className="options-grid">
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.preferLowCarbs} 
                    onChange={(e) => handleOptionChange('preferLowCarbs', e.target.checked)}
                  />
                  <span className="checkbox-text">Privilégier les faibles glucides</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.maximizeProtein} 
                    onChange={(e) => handleOptionChange('maximizeProtein', e.target.checked)}
                  />
                  <span className="checkbox-text">Maximiser les protéines</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.balancedMacros} 
                    onChange={(e) => handleOptionChange('balancedMacros', e.target.checked)}
                  />
                  <span className="checkbox-text">Équilibrer les macronutriments</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.generateLunchOnly} 
                    onChange={(e) => handleOptionChange('generateLunchOnly', e.target.checked)}
                  />
                  <span className="checkbox-text">Déjeuners uniquement</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.generateDinnerOnly} 
                    onChange={(e) => handleOptionChange('generateDinnerOnly', e.target.checked)}
                  />
                  <span className="checkbox-text">Soupers uniquement</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.clearExistingMeals} 
                    onChange={(e) => handleOptionChange('clearExistingMeals', e.target.checked)}
                  />
                  <span className="checkbox-text">Effacer les repas existants</span>
                </label>
              </div>
            </div>
            
            <button 
              className="weekly-generate-button" 
              onClick={generateWeeklyMeals}
              disabled={isGenerating || isClearing}
            >
              {isClearing ? (
                <>
                  <FaTrashAlt className="spinner-icon" />
                  <span>Effacement des repas existants...</span>
                </>
              ) : isGenerating ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  <span>Génération en cours... {generationProgress}%</span>
                </>
              ) : (
                'Générer tous les repas de la semaine'
              )}
            </button>
            
            {(isGenerating || isClearing) && (
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          
          {errorMessage && (
            <div className="error-message">
              <FaExclamationTriangle className="message-icon" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="success-message">
              <FaCheckCircle className="message-icon" />
              <span>{successMessage}</span>
              {statsMessage && <p className="stats-message">{statsMessage}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeeklyMealGenerator;
