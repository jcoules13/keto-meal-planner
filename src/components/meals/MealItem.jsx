import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaUtensils, FaAppleAlt } from 'react-icons/fa';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant affichant un repas individuel avec ses détails
 * Permet d'afficher/masquer les détails
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
        const recipe = getRecipeById(item.id);
        if (!recipe) return { name: 'Recette inconnue', isUnknown: true };
        
        return {
          name: recipe.name,
          quantity: `${item.servings} portion${item.servings > 1 ? 's' : ''}`,
          calories: item.calories || (recipe.nutritionPerServing?.calories * item.servings),
          macros: item.macros || {
            fat: recipe.nutritionPerServing?.fat * item.servings,
            protein: recipe.nutritionPerServing?.protein * item.servings,
            carbs: recipe.nutritionPerServing?.netCarbs * item.servings
          },
          isRecipe: true
        };
      } else { // type === 'food'
        const food = getFoodById(item.id);
        if (!food) return { name: 'Aliment inconnu', isUnknown: true };
        
        return {
          name: food.name,
          quantity: `${item.quantity}${item.unit || 'g'}`,
          calories: item.calories,
          macros: item.macros,
          isFood: true
        };
      }
    });
  };
  
  const mealItems = getMealItemDetails();
  
  return (
    <div className="meal-item">
      <div className="meal-header" onClick={toggleDetails}>
        <div className="meal-title-time">
          <h3 className="meal-title">{meal.name || 'Repas'}</h3>
          {meal.time && <span className="meal-time">{formatTime(meal.time)}</span>}
        </div>
        
        {/* Macros résumées */}
        <div className="meal-macros-summary">
          {meal.totaux && (
            <>
              <span className="macro-pill calories">{meal.totaux.calories || '--'} kcal</span>
              <span className="macro-pill fat">{meal.totaux.macros?.fat || '--'}g lipides</span>
              <span className="macro-pill protein">{meal.totaux.macros?.protein || '--'}g protéines</span>
              <span className="macro-pill carbs">{meal.totaux.macros?.netCarbs || '--'}g glucides nets</span>
            </>
          )}
        </div>
        
        <button className="details-toggle">
          {showDetails ? <FaChevronUp /> : <FaChevronDown />}
        </button>
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
                    <span className="item-calories">{item.calories || '--'} kcal</span>
                    {item.macros && (
                      <div className="item-macros">
                        <span className="macro fat">{item.macros.fat || '--'}g L</span>
                        <span className="macro protein">{item.macros.protein || '--'}g P</span>
                        <span className="macro carbs">{item.macros.carbs || '--'}g G</span>
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