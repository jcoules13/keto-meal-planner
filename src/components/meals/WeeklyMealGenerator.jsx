import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle, FaTrashAlt } from 'react-icons/fa';
import './MealGenerator.css';

/**
 * Générateur de repas pour la semaine entière
 * Génère automatiquement des repas pour déjeuner et dîner pour chaque jour du plan
 */
const WeeklyMealGenerator = () => {
  const { calorieTarget, macroTargets, dietType, preferences, mealFrequency } = useUser();
  const { currentPlan, addMealToCurrentPlan, deleteMeal } = useMealPlan();
  const { foods, getFoodById } = useFood();
  const { recipes } = useRecipe();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statsMessage, setStatsMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
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
        return recipe.tags && recipe.tags.includes(type === 'dejeuner' ? 'dejeuner' : 'diner');
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
          type: type,
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
          items: items
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
      mealName = `Plat keto ${type === 'dejeuner' ? 'du midi' : 'du soir'}`;
    }
    
    // Créer l'objet repas final
    return {
      name: mealName,
      type: type,
      isRecipe: false,
      totaux: {
        calories: Math.round(totalCalories),
        macros: {
          protein: Math.round(totalProtein * 10) / 10,
          fat: Math.round(totalFat * 10) / 10,
          netCarbs: Math.round(totalNetCarbs * 10) / 10
        }
      },
      items: items
    };
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
    let debugLog = "";
    
    try {
      // Normaliser les types de repas à supprimer
      const normalizedTypes = mealTypes.map(type => normalizeType(type));
      debugLog += `Types normalisés à supprimer: ${normalizedTypes.join(', ')}\n`;
      
      // Pour chaque jour du plan
      for (let dayIndex = 0; dayIndex < currentPlan.days.length; dayIndex++) {
        const day = currentPlan.days[dayIndex];
        debugLog += `Jour ${dayIndex}: ${day.meals.length} repas\n`;
        
        // Récupérer tous les IDs des repas qui correspondent aux types à supprimer
        const mealIdsToDelete = [];
        
        day.meals.forEach(meal => {
          const mealType = meal.type || '';
          const normalizedMealType = normalizeType(mealType);
          debugLog += `  Repas: ${meal.name}, Type: ${mealType} (normalisé: ${normalizedMealType})\n`;
          
          // Vérifier si ce type de repas doit être supprimé
          if (normalizedTypes.some(type => normalizedMealType.includes(type))) {
            mealIdsToDelete.push(meal.id);
            debugLog += `    À supprimer: OUI\n`;
          } else {
            debugLog += `    À supprimer: NON\n`;
          }
        });
        
        // Supprimer chaque repas identifié, un par un
        debugLog += `  IDs à supprimer: ${mealIdsToDelete.join(', ')}\n`;
        for (const mealId of mealIdsToDelete) {
          try {
            await deleteMeal(currentPlan.id, dayIndex, mealId);
            deletedCount++;
            debugLog += `  Repas ${mealId} supprimé avec succès\n`;
          } catch (err) {
            debugLog += `  ERREUR lors de la suppression du repas ${mealId}: ${err.message}\n`;
          }
        }
      }
      
      // Mettre à jour le message de succès
      if (deletedCount > 0) {
        setSuccessMessage(`${deletedCount} repas ont été supprimés avant la génération.`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
      
      // Conserver les informations de debug
      setDebugInfo(debugLog);
      console.log("Debug: Suppression des repas", debugLog);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des repas existants:', error);
      setErrorMessage(`Erreur lors de la suppression: ${error.message}`);
      setDebugInfo(debugLog + `\nErreur générale: ${error.message}`);
      return false;
    } finally {
      setIsClearing(false);
    }
  };
  
  /**
   * Génère des repas pour toute la semaine en fonction des options sélectionnées
   * Version améliorée pour respecter la fréquence des repas
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
    setDebugInfo('');
    
    let debugLog = "Génération des repas - Log de debug\n";
    debugLog += `Fréquence de repas définie: ${mealFrequency}\n`;
    
    try {
      // Déterminer les types de repas à générer en fonction des options et de la fréquence
      let mealTypes = [];
      
      if (generationOptions.generateDinnerOnly) {
        mealTypes = ['diner'];
        debugLog += "Option sélectionnée: Dîners uniquement\n";
      } else if (generationOptions.generateLunchOnly) {
        mealTypes = ['dejeuner'];
        debugLog += "Option sélectionnée: Déjeuners uniquement\n";
      } else {
        // Distribuer les repas selon la fréquence utilisateur
        debugLog += `Distribution selon fréquence: ${mealFrequency} repas/jour\n`;
        switch (mealFrequency) {
          case 1:
            mealTypes = ['diner']; // Un seul repas: dîner
            break;
          case 2:
            mealTypes = ['dejeuner', 'diner']; // Deux repas: déjeuner et dîner
            break;
          case 3:
            mealTypes = ['petit_dejeuner', 'dejeuner', 'diner']; // Trois repas
            break;
          // Ajouter d'autres cas selon les besoins
          default:
            mealTypes = ['dejeuner', 'diner']; // Par défaut: déjeuner et dîner
        }
      }
      
      debugLog += `Types de repas à générer: ${mealTypes.join(', ')}\n`;
      
      // Si l'option est activée, supprimer d'abord les repas existants des types concernés
      if (generationOptions.clearExistingMeals) {
        setGenerationProgress(5); // Commencer à 5% pour montrer que quelque chose se passe
        debugLog += "Suppression des repas existants...\n";
        const clearResult = await clearExistingMeals(mealTypes);
        debugLog += `Résultat de la suppression: ${clearResult ? "Succès" : "Échec"}\n`;
        setGenerationProgress(10); // Après la suppression, marquer 10% de progrès
      }
      
      // Calculer le nombre total d'opérations pour la barre de progression
      const totalOperations = currentPlan.days.length * mealTypes.length;
      let completedOperations = 0;
      let successfulAdditions = 0;
      
      debugLog += `Nombre total d'opérations: ${totalOperations}\n`;
      
      // Pour chaque jour du plan
      for (let dayIndex = 0; dayIndex < currentPlan.days.length; dayIndex++) {
        debugLog += `\nJour ${dayIndex}: ${currentPlan.days[dayIndex].date}\n`;
        
        // Pour chaque type de repas à générer
        for (const mealType of mealTypes) {
          try {
            debugLog += `  Génération du repas de type: ${mealType}\n`;
            
            // Calculer les calories cibles en fonction du type de repas
            const mealCalorieTarget = mealType === 'dejeuner' 
              ? calorieTarget * 0.4  // 40% des calories pour le déjeuner
              : (mealType === 'diner' ? calorieTarget * 0.3 : calorieTarget * 0.3);  // 30% des calories pour le dîner
            
            debugLog += `    Calories cibles: ${mealCalorieTarget}\n`;
            
            // Calculer les macros cibles
            const mealMacros = {
              protein: mealType === 'dejeuner' ? macroTargets.protein * 0.4 : macroTargets.protein * 0.3,
              fat: mealType === 'dejeuner' ? macroTargets.fat * 0.4 : macroTargets.fat * 0.3,
              carbs: mealType === 'dejeuner' ? macroTargets.carbs * 0.4 : macroTargets.carbs * 0.3
            };
            
            // Générer un repas approprié selon le type de régime
            const meal = generateRealMeal(mealType, mealCalorieTarget, mealMacros, dietType, dayIndex);
            debugLog += `    Repas généré: ${meal.name}\n`;
            
            // Ajouter le repas au plan
            const newMealId = await addMealToCurrentPlan(meal, dayIndex, mealType);
            if (newMealId) {
              successfulAdditions++;
              debugLog += `    Repas ajouté avec succès, ID: ${newMealId}\n`;
            } else {
              debugLog += `    ÉCHEC de l'ajout du repas\n`;
            }
            
            // Mise à jour de la progression
            completedOperations++;
            // Répartir la progression entre 10% et 100%
            const progressValue = 10 + Math.floor((completedOperations / totalOperations) * 90);
            setGenerationProgress(progressValue);
            debugLog += `    Progression: ${completedOperations}/${totalOperations} (${progressValue}%)\n`;
            
            // Petite pause pour éviter de bloquer l'interface utilisateur
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Erreur lors de la génération du repas ${mealType} pour le jour ${dayIndex}:`, error);
            debugLog += `    ERREUR: ${error.message}\n`;
            // On continue avec les autres repas même en cas d'erreur
            completedOperations++;
            const progressValue = 10 + Math.floor((completedOperations / totalOperations) * 90);
            setGenerationProgress(progressValue);
          }
        }
      }
      
      // Log final
      debugLog += `\nRécapitulatif:\n`;
      debugLog += `Total des repas ajoutés avec succès: ${successfulAdditions}/${totalOperations}\n`;
      setDebugInfo(debugLog);
      
      // Message de succès avec statistiques
      if (successfulAdditions > 0) {
        setSuccessMessage(`${successfulAdditions} repas ont été générés et ajoutés à votre plan avec succès!`);
        // Adapter le message à la sélection des types de repas
        const typesLabel = mealTypes.map(type => 
          type === 'dejeuner' ? 'Déjeuners' : 
          type === 'diner' ? 'Dîners' : 
          type === 'petit_dejeuner' ? 'Petits déjeuners' : 
          'Repas'
        ).join(' et ');
        setStatsMessage(`${typesLabel} générés pour ${currentPlan.days.length} jours.`);
      } else {
        setErrorMessage('Aucun repas n\'a pu être généré. Veuillez vérifier vos données d\'aliments et de recettes.');
      }
    } catch (error) {
      console.error('Erreur lors de la génération des repas:', error);
      setErrorMessage(`Une erreur est survenue: ${error.message}`);
      debugLog += `\nERREUR GÉNÉRALE: ${error.message}\n`;
      setDebugInfo(debugLog);
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
                  <span className="checkbox-text">Dîners uniquement</span>
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
