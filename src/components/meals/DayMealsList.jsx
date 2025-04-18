import React from 'react';
import MealItem from './MealItem';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant affichant la liste des repas pour un jour spécifique
 * Avec résumé nutritionnel du jour
 */
const DayMealsList = ({ day, dayNutrition, getFoodById, getRecipeById }) => {
  // Si le jour n'a pas de repas
  if (!day.meals || day.meals.length === 0) {
    return (
      <div className="day-meals-empty">
        <p>Aucun repas prévu pour cette journée.</p>
        <p className="text-text-secondary">Vous pouvez ajouter des repas manuellement à votre plan.</p>
      </div>
    );
  }

  return (
    <div className="day-meals">
      {/* Résumé nutritionnel du jour */}
      {dayNutrition && (
        <div className="day-nutrition-summary">
          <h3 className="font-medium text-lg mb-2">Nutrition du jour</h3>
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">{dayNutrition.calories} kcal</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Lipides</span>
              <span className="nutrition-value">{dayNutrition.fat}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Protéines</span>
              <span className="nutrition-value">{dayNutrition.protein}g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">Glucides nets</span>
              <span className="nutrition-value">{dayNutrition.netCarbs}g</span>
            </div>
            {dayNutrition.pHValue && (
              <div className="nutrition-item">
                <span className="nutrition-label">pH moyen</span>
                <span className="nutrition-value">{dayNutrition.pHValue}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liste des repas */}
      <div className="meals-list">
        {day.meals.map((meal, index) => (
          <MealItem 
            key={meal.id || index} 
            meal={meal} 
            getFoodById={getFoodById}
            getRecipeById={getRecipeById}
          />
        ))}
      </div>
    </div>
  );
};

export default DayMealsList;