import React, { useState } from 'react';
import { FaUtensils, FaLeaf, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import MacroProgressBar from './MacroProgressBar';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant pour afficher un repas individuel
 * Déroulé par défaut et avec affichage amélioré des macros
 */
const MealItem = ({ meal, getFoodById, getRecipeById }) => {
  // État pour contrôler l'expansion, déroulé par défaut
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Valeurs par défaut pour les macros si elles sont manquantes
  const macros = meal.macros || { 
    protein: 0, 
    fat: 0, 
    netCarbs: 0 
  };
  
  // Formater l'heure du repas
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };
  
  // Obtenir un résumé du contenu du repas (premiers éléments)
  const getMealPreview = () => {
    if (!meal.items || meal.items.length === 0) {
      return 'Aucun aliment';
    }
    
    const previewItems = meal.items.slice(0, 2).map(item => {
      if (item.type === 'recipe') {
        const recipe = getRecipeById ? getRecipeById(item.id) : null;
        return recipe ? recipe.name : 'Recette inconnue';
      } else {
        const food = getFoodById ? getFoodById(item.id) : null;
        return food ? food.name : 'Aliment inconnu';
      }
    });
    
    let preview = previewItems.join(', ');
    
    if (meal.items.length > 2) {
      preview += ` et ${meal.items.length - 2} autres...`;
    }
    
    return preview;
  };
  
  return (
    <div className="meal-item">
      <div 
        className="meal-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="meal-title-info">
          <h4 className="meal-title">
            {meal.name}
            {meal.time && <span className="meal-time">{formatTime(meal.time)}</span>}
          </h4>
          <div className="meal-preview">{getMealPreview()}</div>
        </div>
        
        <div className="meal-summary-container">
          <div className="meal-macros-summary">
            <span className="macro-pill calories">{meal.calories || 0} kcal</span>
            <span className="macro-pill protein">P: {macros.protein || 0}g</span>
            <span className="macro-pill fat">L: {macros.fat || 0}g</span>
            <span className="macro-pill carbs">G: {macros.netCarbs || 0}g</span>
          </div>
          
          <button className="details-toggle">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="meal-details">
          {meal.items && meal.items.length > 0 ? (
            <div className="meal-items-list">
              {meal.items.map((item, index) => {
                let name = 'Item inconnu';
                let icon = <FaLeaf />;
                
                // Récupérer les informations détaillées sur l'item
                let detailedItem = null;
                
                if (item.type === 'recipe') {
                  const recipe = getRecipeById ? getRecipeById(item.id) : null;
                  name = recipe ? recipe.name : 'Recette inconnue';
                  icon = <FaUtensils className="item-icon recipe" />;
                  detailedItem = recipe;
                } else {
                  const food = getFoodById ? getFoodById(item.id) : null;
                  name = food ? food.name : 'Aliment inconnu';
                  icon = <FaLeaf className="item-icon food" />;
                  detailedItem = food;
                }
                
                // S'assurer que les macros sont définies
                const itemMacros = item.macros || (detailedItem && detailedItem.nutritionPer100g ? {
                  protein: (detailedItem.nutritionPer100g.protein * (item.quantity || 0)) / 100,
                  fat: (detailedItem.nutritionPer100g.fat * (item.quantity || 0)) / 100,
                  netCarbs: (detailedItem.nutritionPer100g.netCarbs * (item.quantity || 0)) / 100
                } : { protein: 0, fat: 0, netCarbs: 0 });
                
                // Calories de l'item
                const itemCalories = item.calories || (detailedItem && detailedItem.nutritionPer100g ? 
                  (detailedItem.nutritionPer100g.calories * (item.quantity || 0)) / 100 : 0);
                
                return (
                  <div key={index} className="meal-detail-item">
                    <div className="item-icon-name">
                      {icon}
                      <span className="item-name">{name}</span>
                      <span className="item-quantity">
                        {item.quantity || item.servings || 0} {item.unit || 'portion(s)'}
                      </span>
                    </div>
                    
                    <div className="item-nutrition">
                      <span className="item-calories">{Math.round(itemCalories || 0)} kcal</span>
                      <div className="item-macros">
                        <span className="macro protein">P: {Math.round(itemMacros.protein || 0)}g</span>
                        <span className="macro fat">L: {Math.round(itemMacros.fat || 0)}g</span>
                        <span className="macro carbs">G: {Math.round(itemMacros.netCarbs || 0)}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-items">Aucun aliment dans ce repas.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MealItem;
