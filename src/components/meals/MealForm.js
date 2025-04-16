import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { FaPlus, FaTrash, FaSearch, FaUtensils, FaCarrot } from 'react-icons/fa';

/**
 * Formulaire d'ajout ou de modification d'un repas
 * Permet de composer un repas à partir d'aliments et/ou de recettes
 */
const MealForm = ({ planId, dayIndex, mealId = null, onSave, onCancel }) => {
  const { mealPlans, addMeal, updateMeal } = useMealPlan();
  const { foods, setFilter: setFoodFilter, filteredFoods } = useFood();
  const { recipes, setFilter: setRecipeFilter, filteredRecipes } = useRecipe();
  
  // État local du formulaire
  const [mealData, setMealData] = useState({
    type: 'déjeuner', // Type de repas (petit-déjeuner, déjeuner, dîner, etc.)
    items: [], // Liste des aliments et recettes qui composent le repas
    notes: '' // Notes éventuelles sur le repas
  });
  
  // États pour la recherche et l'ajout d'éléments
  const [searchMode, setSearchMode] = useState('food'); // 'food' ou 'recipe'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [selectedFoodQuantity, setSelectedFoodQuantity] = useState(100);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [selectedRecipeServings, setSelectedRecipeServings] = useState(1);
  
  // Récupérer le repas existant si on est en mode édition
  useEffect(() => {
    if (mealId && planId && dayIndex !== undefined) {
      const plan = mealPlans.find(p => p.id === planId);
      if (plan && plan.days[dayIndex]) {
        const meal = plan.days[dayIndex].meals.find(m => m.id === mealId);
        if (meal) {
          setMealData({
            type: meal.type || 'déjeuner',
            items: meal.items || [],
            notes: meal.notes || ''
          });
        }
      }
    }
  }, [mealId, planId, dayIndex, mealPlans]);
  
  // Mettre à jour les filtres de recherche
  useEffect(() => {
    if (searchMode === 'food' && searchQuery) {
      setFoodFilter('query', searchQuery);
    } else if (searchMode === 'recipe' && searchQuery) {
      setRecipeFilter('query', searchQuery);
    }
  }, [searchQuery, searchMode, setFoodFilter, setRecipeFilter]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valider les données
    if (mealData.items.length === 0) {
      alert('Veuillez ajouter au moins un aliment ou une recette au repas');
      return;
    }
    
    // Calculer les totaux nutritionnels
    const totals = calculateMealTotals(mealData.items);
    
    // Préparer les données du repas
    const finalMealData = {
      ...mealData,
      ...totals
    };
    
    // Ajouter ou mettre à jour le repas
    if (mealId) {
      updateMeal(planId, dayIndex, mealId, finalMealData);
    } else {
      addMeal(planId, dayIndex, finalMealData);
    }
    
    // Fermer le formulaire
    if (onSave) onSave();
  };
  
  // Calculer les totaux nutritionnels d'un repas
  const calculateMealTotals = (items) => {
    const totals = {
      calories: 0,
      macros: {
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        netCarbs: 0
      },
      pHValue: 0,
      totalWeight: 0
    };
    
    // Parcourir tous les éléments
    items.forEach(item => {
      if (item.type === 'food') {
        const food = foods.find(f => f.id === item.id);
        if (food) {
          const quantity = item.quantity / 100; // Ratio par rapport à 100g
          
          totals.calories += food.nutritionPer100g.calories * quantity;
          totals.macros.protein += food.nutritionPer100g.protein * quantity;
          totals.macros.fat += food.nutritionPer100g.fat * quantity;
          totals.macros.carbs += food.nutritionPer100g.carbs * quantity;
          totals.macros.fiber += food.nutritionPer100g.fiber * quantity;
          totals.macros.netCarbs += (food.nutritionPer100g.carbs - food.nutritionPer100g.fiber) * quantity;
          
          // Contribution au pH pondérée par le poids
          totals.pHValue += food.pHValue * item.quantity;
          totals.totalWeight += item.quantity;
        }
      } else if (item.type === 'recipe') {
        const recipe = recipes.find(r => r.id === item.id);
        if (recipe) {
          totals.calories += recipe.nutritionPerServing.calories * item.servings;
          totals.macros.protein += recipe.nutritionPerServing.protein * item.servings;
          totals.macros.fat += recipe.nutritionPerServing.fat * item.servings;
          totals.macros.carbs += recipe.nutritionPerServing.carbs * item.servings;
          totals.macros.fiber += recipe.nutritionPerServing.fiber * item.servings;
          totals.macros.netCarbs += recipe.nutritionPerServing.netCarbs * item.servings;
          
          // Contribution au pH pondérée par les calories
          const recipeCalories = recipe.nutritionPerServing.calories * item.servings;
          totals.pHValue += recipe.averagePHValue * recipeCalories;
          totals.totalWeight += recipeCalories; // Utilisation des calories comme poids pour les recettes
        }
      }
    });
    
    // Calculer la moyenne du pH
    if (totals.totalWeight > 0) {
      totals.pHValue = totals.pHValue / totals.totalWeight;
    } else {
      totals.pHValue = 7.0; // pH neutre par défaut
    }
    
    // Arrondir les valeurs
    totals.calories = Math.round(totals.calories);
    totals.macros.protein = Math.round(totals.macros.protein * 10) / 10;
    totals.macros.fat = Math.round(totals.macros.fat * 10) / 10;
    totals.macros.carbs = Math.round(totals.macros.carbs * 10) / 10;
    totals.macros.fiber = Math.round(totals.macros.fiber * 10) / 10;
    totals.macros.netCarbs = Math.round(totals.macros.netCarbs * 10) / 10;
    totals.pHValue = Math.round(totals.pHValue * 10) / 10;
    
    return {
      calories: totals.calories,
      macros: totals.macros,
      pHValue: totals.pHValue
    };
  };
  
  // Ajouter un aliment au repas
  const handleAddFood = () => {
    if (!selectedFoodId || selectedFoodQuantity <= 0) return;
    
    const food = foods.find(f => f.id === selectedFoodId);
    if (!food) return;
    
    // Ajouter l'aliment à la liste
    setMealData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: food.id,
        type: 'food',
        name: food.name,
        quantity: selectedFoodQuantity,
        unit: 'g'
      }]
    }));
    
    // Réinitialiser les champs
    setSelectedFoodId('');
    setSelectedFoodQuantity(100);
    setSearchQuery('');
    setShowSearchResults(false);
  };
  
  // Ajouter une recette au repas
  const handleAddRecipe = () => {
    if (!selectedRecipeId || selectedRecipeServings <= 0) return;
    
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;
    
    // Ajouter la recette à la liste
    setMealData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: recipe.id,
        type: 'recipe',
        name: recipe.name,
        servings: selectedRecipeServings
      }]
    }));
    
    // Réinitialiser les champs
    setSelectedRecipeId('');
    setSelectedRecipeServings(1);
    setSearchQuery('');
    setShowSearchResults(false);
  };
  
  // Supprimer un élément du repas
  const handleRemoveItem = (index) => {
    setMealData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 text-gray-300">
      <h2 className="text-xl font-semibold mb-4">
        {mealId ? 'Modifier le repas' : 'Ajouter un repas'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {/* Type de repas */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Type de repas</label>
          <select
            value={mealData.type}
            onChange={(e) => setMealData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="petit-déjeuner">Petit-déjeuner</option>
            <option value="déjeuner">Déjeuner</option>
            <option value="dîner">Dîner</option>
            <option value="collation">Collation</option>
          </select>
        </div>
        
        {/* Éléments du repas */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Composition du repas</label>
          
          {mealData.items.length > 0 ? (
            <ul className="mb-4 divide-y divide-gray-700">
              {mealData.items.map((item, index) => (
                <li key={index} className="py-2 flex items-center">
                  <div className="flex-grow">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-gray-400">
                      {item.type === 'food' 
                        ? `${item.quantity} g` 
                        : `${item.servings} portion${item.servings > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="ml-2 p-1 text-red-500 hover:text-red-400"
                  >
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-center py-4 bg-gray-700 rounded-md mb-4">
              Aucun élément ajouté
            </div>
          )}
          
          {/* Onglets de sélection */}
          <div className="mb-3 border-b border-gray-700">
            <div className="flex">
              <button
                type="button"
                className={`py-2 px-4 ${
                  searchMode === 'food' 
                    ? 'border-b-2 border-primary-500 text-primary-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setSearchMode('food')}
              >
                <FaCarrot className="inline mr-2" />
                Aliments
              </button>
              <button
                type="button"
                className={`py-2 px-4 ${
                  searchMode === 'recipe' 
                    ? 'border-b-2 border-primary-500 text-primary-500' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                onClick={() => setSearchMode('recipe')}
              >
                <FaUtensils className="inline mr-2" />
                Recettes
              </button>
            </div>
          </div>
          
          {/* Recherche d'aliments */}
          {searchMode === 'food' && (
            <div>
              <div className="flex mb-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    placeholder="Rechercher un aliment..."
                    className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-500" />
                </div>
                <button
                  type="button"
                  onClick={handleAddFood}
                  disabled={!selectedFoodId}
                  className="ml-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus />
                </button>
              </div>
              
              {selectedFoodId && (
                <div className="flex items-center mb-3">
                  <span className="mr-2">Quantité:</span>
                  <input
                    type="number"
                    value={selectedFoodQuantity}
                    onChange={(e) => setSelectedFoodQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                  />
                  <span className="ml-1">g</span>
                </div>
              )}
              
              {showSearchResults && searchQuery && (
                <div className="mt-1 max-h-60 overflow-y-auto bg-gray-700 rounded-md">
                  {filteredFoods.length > 0 ? (
                    <ul className="divide-y divide-gray-600">
                      {filteredFoods.slice(0, 10).map(food => (
                        <li
                          key={food.id}
                          onClick={() => {
                            setSelectedFoodId(food.id);
                            setSearchQuery(food.name);
                            setShowSearchResults(false);
                          }}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-600 ${
                            selectedFoodId === food.id ? 'bg-gray-600' : ''
                          }`}
                        >
                          {food.name}
                          <span className="text-xs text-gray-400 ml-2">
                            {food.nutritionPer100g.calories} kcal / 100g
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-gray-400">
                      Aucun aliment trouvé
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Recherche de recettes */}
          {searchMode === 'recipe' && (
            <div>
              <div className="flex mb-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    placeholder="Rechercher une recette..."
                    className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-500" />
                </div>
                <button
                  type="button"
                  onClick={handleAddRecipe}
                  disabled={!selectedRecipeId}
                  className="ml-2 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus />
                </button>
              </div>
              
              {selectedRecipeId && (
                <div className="flex items-center mb-3">
                  <span className="mr-2">Portions:</span>
                  <input
                    type="number"
                    value={selectedRecipeServings}
                    onChange={(e) => setSelectedRecipeServings(Math.max(0.5, parseFloat(e.target.value) || 0))}
                    min="0.5"
                    step="0.5"
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                  />
                </div>
              )}
              
              {showSearchResults && searchQuery && (
                <div className="mt-1 max-h-60 overflow-y-auto bg-gray-700 rounded-md">
                  {filteredRecipes.length > 0 ? (
                    <ul className="divide-y divide-gray-600">
                      {filteredRecipes.slice(0, 10).map(recipe => (
                        <li
                          key={recipe.id}
                          onClick={() => {
                            setSelectedRecipeId(recipe.id);
                            setSearchQuery(recipe.name);
                            setShowSearchResults(false);
                          }}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-600 ${
                            selectedRecipeId === recipe.id ? 'bg-gray-600' : ''
                          }`}
                        >
                          {recipe.name}
                          <span className="text-xs text-gray-400 ml-2">
                            {recipe.nutritionPerServing?.calories} kcal / portion
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-gray-400">
                      Aucune recette trouvée
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
          <textarea
            value={mealData.notes}
            onChange={(e) => setMealData(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ajoutez des notes ou instructions spéciales pour ce repas..."
          ></textarea>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            {mealId ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealForm;
