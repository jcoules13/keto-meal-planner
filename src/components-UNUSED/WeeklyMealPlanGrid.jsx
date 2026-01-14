import React, { useState } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import MealItem from './MealItem';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant d'affichage en grille du plan de repas hebdomadaire
 * Vue interactive avec sélection des jours en haut et détails en dessous
 */
const WeeklyMealPlanGrid = () => {
  const { currentPlan, getDayNutritionTotals } = useMealPlan();
  const { getFoodById } = useFood();
  const { getRecipeById } = useRecipe();
  
  // État pour le jour sélectionné (index)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // Si aucun plan n'est actif, afficher un message
  if (!currentPlan) {
    return (
      <div className="weekly-meal-plan-empty">
        <p>Aucun plan de repas actif. Veuillez créer ou générer un plan.</p>
      </div>
    );
  }
  
  // Si le plan n'a pas de jours, afficher un message
  if (!currentPlan.days || currentPlan.days.length === 0) {
    return (
      <div className="weekly-meal-plan-empty">
        <p>Le plan actif ne contient aucun jour. Veuillez créer un nouveau plan.</p>
      </div>
    );
  }
  
  // Formatage des dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
  };
  
  // Obtenir le jour de la semaine (format court)
  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  // Jour sélectionné
  const selectedDay = currentPlan.days[selectedDayIndex];
  const dayNutrition = getDayNutritionTotals(currentPlan.id, selectedDayIndex);

  return (
    <div className="weekly-meal-plan">
      {/* Informations sur le plan */}
      <div className="plan-info mb-4">
        <h3 className="font-medium">{currentPlan.name}</h3>
        <p className="text-text-secondary text-sm">
          {currentPlan.startDate && currentPlan.endDate 
            ? `Du ${formatDate(currentPlan.startDate)} au ${formatDate(currentPlan.endDate)}` 
            : 'Dates non définies'}
        </p>
      </div>
      
      {/* Navigation par jour - nouvelle UI */}
      <div className="day-tabs-container">
        <div className="day-tabs">
          {currentPlan.days.map((day, index) => (
            <button
              key={index}
              className={`day-tab ${selectedDayIndex === index ? 'active' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
              aria-selected={selectedDayIndex === index}
              aria-controls={`day-panel-${index}`}
            >
              <div className="day-name">{getDayOfWeek(day.date)}</div>
              <div className="day-date">{formatDate(day.date)}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Détails du jour sélectionné */}
      <div className="day-panel" id={`day-panel-${selectedDayIndex}`}>
        <div className="day-header">
          <h3 className="day-title">
            {new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
        </div>
        
        {/* Résumé nutritionnel du jour */}
        {dayNutrition && (
          <div className="day-nutrition-summary">
            <h4 className="nutrition-header">Macros Quotidiennes</h4>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-value">{dayNutrition.calories}</span>
                <span className="nutrition-label">calories</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value protein-value">{dayNutrition.protein}g</span>
                <span className="nutrition-label">protéines</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value fat-value">{dayNutrition.fat}g</span>
                <span className="nutrition-label">lipides</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-value carbs-value">{dayNutrition.netCarbs}g</span>
                <span className="nutrition-label">glucides</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Liste des repas du jour */}
        <div className="meals-section">
          <h4 className="meals-header">Repas du jour</h4>
          <div className="day-meal-list">
            {selectedDay.meals && selectedDay.meals.length > 0 ? (
              selectedDay.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="day-meal-item">
                  <MealItem 
                    meal={meal} 
                    getFoodById={getFoodById}
                    getRecipeById={getRecipeById}
                  />
                </div>
              ))
            ) : (
              <p className="empty-items">Aucun repas pour cette journée.</p>
            )}
          </div>
        </div>
        
        {/* Bouton pour ajouter un repas */}
        <div className="add-meal-button-container">
          <button className="add-meal-button">
            Ajouter un repas
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMealPlanGrid;
