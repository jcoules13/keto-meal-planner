import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaUtensils, FaAppleAlt } from 'react-icons/fa';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant affichant un repas individuel avec ses détails
 * Version améliorée avec affichage direct des macros et ingredients
 */
const MealItem = ({ meal, getFoodById, getRecipeById }) => {
  // État pour l'affichage des détails
  const [showDetails, setShowDetails] = useState(false);
  
  // Formater l'heure du repas
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };
  
  // Toggle l'affichage des détails
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  // Obtenir les détails des éléments du repas (recettes ou aliments)
  const getMealItemDetails = () => {
    if (!meal.items || meal.items.length === 0) {
      return [];
    }
    
    return meal.items.map(item => {
      if (item.type === 'recipe') {
        const recipe = getRecipeById ? getRecipeById(item.id) : null;
        if (!recipe) return { name: item.name || 'Recette inconnue', isUnknown: true };
        
        return {
          name: recipe.name,
          quantity: `${item.servings || 1} portion${item.servings > 1 ? 's' : ''}`,
          calories: item.calories || (recipe.nutritionPerServing?.calories * (item.servings || 1)),
          macros: item.macros || {
            fat: recipe.nutritionPerServing?.fat * (item.servings || 1),
            protein: recipe.nutritionPerServing?.protein * (item.servings || 1),
            carbs: recipe.nutritionPerServing?.netCarbs * (item.servings || 1)
          },
          isRecipe: true
        };
      } else { // type === 'food' ou non spécifié
        const food = getFoodById ? getFoodById(item.id) : null;
        if (!food) return { name: item.name || 'Aliment inconnu', isUnknown: true };
        
        const ratio = item.quantity ? item.quantity / 100 : 1;
        
        return {
          name: item.name || food.name,
          quantity: `${item.quantity || 100}${item.unit || 'g'}`,
          calories: item.calories || (food.nutritionPer100g?.calories * ratio),
          macros: item.macros || {
            fat: (food.nutritionPer100g?.fat || 0) * ratio,
            protein: (food.nutritionPer100g?.protein || 0) * ratio,
            carbs: (food.nutritionPer100g?.netCarbs || 0) * ratio
          },
          isFood: true
        };
      }
    });
  };
  
  // Calculer les totaux si non fournis
  const calculateTotals = (items) => {
    if (meal.totaux) return meal.totaux;
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalNetCarbs = 0;
    
    items.forEach(item => {
      totalCalories += item.calories || 0;
      totalProtein += item.macros?.protein || 0;
      totalFat += item.macros?.fat || 0;
      totalNetCarbs += item.macros?.carbs || 0;
    });
    
    return {
      calories: Math.round(totalCalories),
      macros: {
        protein: Math.round(totalProtein * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        netCarbs: Math.round(totalNetCarbs * 10) / 10
      }
    };
  };
  
  const mealItems = getMealItemDetails();
  const totals = calculateTotals(mealItems);
  
  // Extraire quelques ingrédients pour l'aperçu (3 max)
  const previewIngredients = mealItems.slice(0, 3).map(item => item.name).join(', ');
  const hasMoreIngredients = mealItems.length > 3;
  
  return (
    <div className="meal-item">
      <div className="meal-header" onClick={toggleDetails}>
        <div className="meal-title-info">
          <h3 className="meal-title">{meal.name || 'Repas'}</h3>
          <div className="meal-preview">
            {previewIngredients}
            {hasMoreIngredients && <span className="more-ingredients">+{mealItems.length - 3} autres</span>}
          </div>
        </div>
        
        {/* Macros résumées toujours visibles */}
        <div className="meal-macros-summary">
          <span className="macro-pill calories">{totals.calories || '--'} kcal</span>
          <span className="macro-pill fat">{totals.macros?.fat || '--'}g L</span>
          <span className="macro-pill protein">{totals.macros?.protein || '--'}g P</span>
          <span className="macro-pill carbs">{totals.macros?.netCarbs || '--'}g G</span>
          <button className="details-toggle">
            {showDetails ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      
      {/* Détails du repas */}
      {showDetails && (
        <div className="meal-details">
          {mealItems.length > 0 ? (
            <div className="meal-items-list">
              {mealItems.map((item, index) => (
                <div key={index} className="meal-detail-item">
                  <div className="item-icon-name">
                    {item.isRecipe ? <FaUtensils className="item-icon recipe" /> : <FaAppleAlt className="item-icon food" />}
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="item-nutrition">
                    <span className="item-calories">{item.calories ? Math.round(item.calories) : '--'} kcal</span>
                    {item.macros && (
                      <div className="item-macros">
                        <span className="macro fat">{item.macros.fat ? Math.round(item.macros.fat * 10) / 10 : '--'}g L</span>
                        <span className="macro protein">{item.macros.protein ? Math.round(item.macros.protein * 10) / 10 : '--'}g P</span>
                        <span className="macro carbs">{item.macros.carbs ? Math.round(item.macros.carbs * 10) / 10 : '--'}g G</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-items">Aucun élément dans ce repas.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MealItem;