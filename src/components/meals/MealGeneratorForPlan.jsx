import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './MealGenerator.css';

/**
 * Générateur de repas pour le plan hebdomadaire 
 * Ce composant ne dépend pas du FridgeProvider
 * Il crée des repas basés sur les besoins nutritionnels et les préférences
 * Version améliorée avec meilleure récupération des données
 */
const MealGeneratorForPlan = () => {
  const { calorieTarget, macroTargets, dietType, preferences } = useUser();
  const { currentPlan, addMealToCurrentPlan } = useMealPlan();
  const { foods, getFoodById } = useFood();
  const { recipes } = useRecipe();
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealType, setMealType] = useState('déjeuner');
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Options du générateur
  const [generationOptions, setGenerationOptions] = useState({
    preferLowCarbs: true,
    maximizeProtein: false,
    balancedMacros: true,
  });
  
  // Effacer les messages après un délai
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  const handleOptionChange = (option, value) => {
    setGenerationOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Fonction pour générer un repas en fonction du type (déjeuner, dîner)
  const generateMealForPlan = () => {
    setIsGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Simulation d'un délai pour montrer le spinner
      setTimeout(() => {
        // Calculer les calories cibles en fonction du type de repas
        const mealCalorieTarget = mealType === 'déjeuner' 
          ? calorieTarget * 0.4  // 40% des calories pour le déjeuner
          : calorieTarget * 0.3;  // 30% des calories pour le dîner
        
        // Calculer les macros cibles
        const mealMacros = {
          protein: mealType === 'déjeuner' ? macroTargets.protein * 0.4 : macroTargets.protein * 0.3,
          fat: mealType === 'déjeuner' ? macroTargets.fat * 0.4 : macroTargets.fat * 0.3,
          carbs: mealType === 'déjeuner' ? macroTargets.carbs * 0.4 : macroTargets.carbs * 0.3
        };
        
        // Générer un repas approprié selon le type de régime
        const meal = generateRealMeal(mealType, mealCalorieTarget, mealMacros, dietType, selectedDay);
        
        setGeneratedMeal(meal);
        setIsGenerating(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la génération du repas:', error);
      setErrorMessage('Une erreur est survenue lors de la génération du repas.');
      setIsGenerating(false);
    }
  };
  
  /**
   * Génère un repas réel basé sur les données d'aliments et de recettes
   * Version améliorée avec meilleure récupération des aliments
   * @param {string} type - Type de repas (déjeuner, dîner)
   * @param {number} calories - Calories cibles pour le repas
   * @param {Object} macros - Objectifs de macronutriments
   * @param {string} dietType - Type de régime (keto_standard ou keto_alcalin)
   * @param {number} dayIndex - Index du jour dans la semaine (0-6)
   * @returns {Object} Objet repas généré
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
    const useRecipe = (Math.random() < 0.7) && recipes.length > 0;
    
    // Si on utilise une recette
    if (useRecipe) {
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
        return recipe.tags && recipe.tags.includes(type === 'déjeuner' ? 'déjeuner' : 'dîner');
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
      mealName = `Plat keto ${type === 'déjeuner' ? 'du midi' : 'du soir'}`;
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
  
  // Fonction pour ajouter le repas généré au plan
  const addMealToPlan = () => {
    if (!generatedMeal) return;
    
    try {
      // Appeler la fonction du context pour ajouter le repas au plan
      addMealToCurrentPlan(generatedMeal, selectedDay, mealType);
      setSuccessMessage(`Le repas "${generatedMeal.name}" a été ajouté à votre plan.`);
      setGeneratedMeal(null); // Réinitialiser après ajout
    } catch (error) {
      console.error('Erreur lors de l\'ajout du repas:', error);
      setErrorMessage('Impossible d\'ajouter ce repas à votre plan.');
    }
  };
  
  // Calculer les jours du plan
  const getDaysOfWeek = () => {
    if (!currentPlan || !currentPlan.startDate) return [];
    
    const days = [];
    const startDate = new Date(currentPlan.startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        index: i,
        name: new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date),
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })
      });
    }
    
    return days;
  };
  
  const daysOfWeek = getDaysOfWeek();
  
  return (
    <div className="meal-generator">
      <div className="generator-header">
        <h2>Générateur de repas pour le plan</h2>
        <p className="subheading">Créez des repas équilibrés pour votre plan hebdomadaire</p>
      </div>
      
      {!currentPlan ? (
        <div className="empty-plan-message">
          <p>Vous devez d'abord créer un plan pour pouvoir générer des repas.</p>
        </div>
      ) : (
        <>
          <div className="generator-options">
            <h3>Options de génération</h3>
            
            <div className="option-row">
              <label htmlFor="daySelect">Jour:</label>
              <select 
                id="daySelect" 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
                className="day-select"
              >
                {daysOfWeek.map(day => (
                  <option key={day.index} value={day.index}>
                    {day.name} ({day.date})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="option-row">
              <label htmlFor="mealTypeSelect">Type de repas:</label>
              <select 
                id="mealTypeSelect" 
                value={mealType} 
                onChange={(e) => setMealType(e.target.value)}
                className="meal-type-select"
              >
                <option value="déjeuner">Déjeuner</option>
                <option value="dîner">Dîner</option>
              </select>
            </div>
            
            <div className="options-grid">
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.preferLowCarbs} 
                    onChange={(e) => handleOptionChange('preferLowCarbs', e.target.checked)}
                  />
                  <span className="checkbox-text">Préférer les repas faibles en glucides</span>
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
            </div>
            
            <button 
              className="generate-button" 
              onClick={generateMealForPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="spinner-icon" />
                  Génération en cours...
                </>
              ) : (
                'Générer un repas'
              )}
            </button>
          </div>
        </>
      )}
      
      {errorMessage && (
        <div className="error-message">
          <FaExclamationTriangle className="message-icon" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <FaCheck className="message-icon" />
          <span>{successMessage}</span>
        </div>
      )}
      
      {generatedMeal && (
        <div className="generated-meals">
          <h3>Repas généré</h3>
          <div className="meals-list">
            <div className="meal-card">
              <div className="meal-header">
                <h4>{generatedMeal.name}</h4>
                <span className="meal-calorie">{generatedMeal.totaux.calories} kcal</span>
              </div>
              
              <div className="meal-macros">
                <div className="macro">
                  <span className="macro-label">Protéines</span>
                  <span className="macro-value protein">{generatedMeal.totaux.macros.protein}g</span>
                </div>
                <div className="macro">
                  <span className="macro-label">Lipides</span>
                  <span className="macro-value fat">{generatedMeal.totaux.macros.fat}g</span>
                </div>
                <div className="macro">
                  <span className="macro-label">Glucides</span>
                  <span className="macro-value carbs">{generatedMeal.totaux.macros.netCarbs}g</span>
                </div>
              </div>
              
              <div className="meal-ingredients">
                <h5>Ingrédients suggérés:</h5>
                <ul>
                  {generatedMeal.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - {item.quantity}{item.unit}
                    </li>
                  ))}
                </ul>
                {generatedMeal.isRecipe && (
                  <p className="recipe-note">Ce repas est basé sur une recette complète de notre base de données.</p>
                )}
                <p className="ingredients-note">Note: Ces ingrédients sont donnés à titre indicatif.</p>
              </div>
              
              <div className="meal-actions">
                <button 
                  className="save-meal-button"
                  onClick={addMealToPlan}
                >
                  Ajouter au plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealGeneratorForPlan;
