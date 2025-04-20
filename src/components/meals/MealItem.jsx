import React, { useState } from 'react';
import { FaUtensils, FaLeaf, FaChevronDown, FaChevronUp, FaMugHot, FaSun, FaMoon, FaCookie } from 'react-icons/fa';
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
        return recipe ? recipe.name : (item.name || 'Recette inconnue');
      } else {
        const food = getFoodById ? getFoodById(item.id) : null;
        return food ? food.name : (item.name || 'Aliment inconnu');
      }
    });
    
    let preview = previewItems.join(', ');
    
    if (meal.items.length > 2) {
      preview += ` et ${meal.items.length - 2} autres...`;
    }
    
    return preview;
  };
  
  // Obtenir l'icône et le nom du type de repas
  const getMealTypeInfo = () => {
    const mealTypeMap = {
      'petit_dejeuner': { icon: <FaMugHot />, name: 'Petit déjeuner' },
      'dejeuner': { icon: <FaSun />, name: 'Déjeuner' },
      'diner': { icon: <FaMoon />, name: 'Dîner' },
      'collation': { icon: <FaCookie />, name: 'Collation' },
      'default': { icon: <FaUtensils />, name: 'Repas' }
    };
    
    const type = meal.type || 'default';
    
    // Correction pour le type dejeuner/déjeuner
    if (type === 'déjeuner') return mealTypeMap['dejeuner'];
    
    return mealTypeMap[type] || mealTypeMap['default'];
  };
  
  const mealTypeInfo = getMealTypeInfo();
  
  return (
    <div className="meal-item">
      <div className="meal-type-badge">
        {mealTypeInfo.icon}
        <span>{mealTypeInfo.name}</span>
      </div>
      
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
                // Récupérer les informations détaillées sur l'item
                let detailedItem = null;
                let name = item.name || 'Item inconnu';
                let icon = <FaLeaf />;
                
                if (item.type === 'recipe') {
                  // Trouver la recette correspondante
                  const recipe = getRecipeById ? getRecipeById(item.id) : null;
                  if (recipe) {
                    detailedItem = recipe;
                    name = recipe.name; // Priorité au nom de la recette dans la base de données
                    icon = <FaUtensils className="item-icon recipe" />;
                  } else {
                    // Garder le nom de l'item si défini, sinon "Recette inconnue"
                    name = item.name || 'Recette inconnue';
                    icon = <FaUtensils className="item-icon recipe" />;
                  }
                } else {
                  // Trouver l'aliment correspondant
                  const food = getFoodById ? getFoodById(item.id) : null;
                  if (food) {
                    detailedItem = food;
                    name = food.name; // Priorité au nom de l'aliment dans la base de données
                    icon = <FaLeaf className="item-icon food" />;
                  } else {
                    // Garder le nom de l'item si défini, sinon "Aliment inconnu"
                    name = item.name || 'Aliment inconnu';
                    icon = <FaLeaf className="item-icon food" />;
                  }
                }
                
                // S'assurer que les macros sont définies
                const itemMacros = item.macros || (detailedItem && item.type === 'food' && detailedItem.nutritionPer100g ? {
                  protein: (detailedItem.nutritionPer100g.protein * (item.quantity || 0)) / 100,
                  fat: (detailedItem.nutritionPer100g.fat * (item.quantity || 0)) / 100,
                  netCarbs: ((detailedItem.nutritionPer100g.netCarbs || 
                    (detailedItem.nutritionPer100g.carbs - detailedItem.nutritionPer100g.fiber)) * (item.quantity || 0)) / 100
                } : (detailedItem && item.type === 'recipe' && detailedItem.nutritionPerServing ? {
                  protein: detailedItem.nutritionPerServing.protein * (item.servings || 1),
                  fat: detailedItem.nutritionPerServing.fat * (item.servings || 1),
                  netCarbs: detailedItem.nutritionPerServing.netCarbs * (item.servings || 1)
                } : { protein: 0, fat: 0, netCarbs: 0 }));
                
                // Calories de l'item
                const itemCalories = item.calories || 
                  (detailedItem && item.type === 'food' && detailedItem.nutritionPer100g ? 
                    (detailedItem.nutritionPer100g.calories * (item.quantity || 0)) / 100 : 
                    (detailedItem && item.type === 'recipe' && detailedItem.nutritionPerServing ?
                      detailedItem.nutritionPerServing.calories * (item.servings || 1) : 0));
                
                return (
                  <div key={index} className="meal-detail-item">
                    <div className="item-icon-name">
                      {icon}
                      <span className="item-name">{name}</span>
                      <span className="item-quantity">
                        {item.quantity || item.servings || 0} {item.unit || (item.type === 'recipe' ? 'portion(s)' : 'g')}
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