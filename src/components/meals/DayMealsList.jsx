import React from 'react';
import MealItem from './MealItem';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant pour afficher la liste des repas d'un jour
 * Optimisé pour la nouvelle interface avec les repas déroulés par défaut
 * et des titres de repas clairement visibles
 */
const DayMealsList = ({ day, dayNutrition, getFoodById, getRecipeById }) => {
  // Organiser les repas par type
  const organizeByType = (meals) => {
    const mealsByType = {};
    
    // Types de repas standard en ordre chronologique
    const mealTypes = ['petit_dejeuner', 'dejeuner', 'collation', 'diner'];
    
    // Initialiser les types de repas
    mealTypes.forEach(type => {
      mealsByType[type] = [];
    });
    
    // Classer les repas par type
    meals.forEach(meal => {
      const type = meal.type || 'autre';
      if (!mealsByType[type]) {
        mealsByType[type] = [];
      }
      mealsByType[type].push(meal);
    });
    
    return mealsByType;
  };
  
  // Si le jour n'a pas de repas, afficher un message
  if (!day.meals || day.meals.length === 0) {
    return (
      <div className="day-meals-empty">
        <p>Aucun repas planifié pour cette journée.</p>
        <button className="btn-primary mt-4">Ajouter un repas</button>
      </div>
    );
  }
  
  // Organiser les repas par type
  const mealsByType = organizeByType(day.meals);
  
  // Obtenir les noms en français des types de repas
  const getTypeName = (type) => {
    const typeNames = {
      'petit_dejeuner': 'Petit déjeuner',
      'dejeuner': 'Déjeuner',
      'collation': 'Collation',
      'diner': 'Dîner',
      'autre': 'Autre repas'
    };
    
    return typeNames[type] || 'Repas';
  };

  return (
    <div className="day-meals">
      {/* Afficher les repas organisés par type */}
      {Object.entries(mealsByType).map(([type, meals]) => 
        meals.length > 0 && (
          <div key={type} className="meal-type-group">
            <h3 className="meal-type-title">{getTypeName(type)}</h3>
            <div className="meal-items-by-type">
              {meals.map((meal, index) => (
                <div key={meal.id || index} className="day-meal-item">
                  <MealItem 
                    meal={meal} 
                    getFoodById={getFoodById}
                    getRecipeById={getRecipeById}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      )}
      
      <div className="add-meal-button-container">
        <button className="add-meal-button">
          Ajouter un repas
        </button>
      </div>
    </div>
  );
};

export default DayMealsList;
