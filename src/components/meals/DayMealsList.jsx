import React from 'react';
import MealItem from './MealItem';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant pour afficher la liste des repas d'un jour
 * Optimisé pour la nouvelle interface
 */
const DayMealsList = ({ day, dayNutrition, getFoodById, getRecipeById }) => {
  // Si le jour n'a pas de repas, afficher un message
  if (!day.meals || day.meals.length === 0) {
    return (
      <div className="day-meals-empty">
        <p>Aucun repas planifié pour cette journée.</p>
        <button className="btn-primary mt-4">Ajouter un repas</button>
      </div>
    );
  }

  return (
    <div className="day-meals">
      <div className="day-meal-list">
        {day.meals.map((meal, index) => (
          <div key={index} className="day-meal-item">
            <MealItem 
              meal={meal} 
              getFoodById={getFoodById}
              getRecipeById={getRecipeById}
            />
          </div>
        ))}
      </div>
      
      <div className="add-meal-button-container">
        <button className="add-meal-button">
          Ajouter un repas
        </button>
      </div>
    </div>
  );
};

export default DayMealsList;
