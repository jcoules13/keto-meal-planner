import React, { useState } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import DayMealsList from './DayMealsList';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant d'affichage du plan de repas hebdomadaire
 * Permet de visualiser et naviguer entre les jours du plan
 * Version améliorée avec une navigation par jour en haut
 */
const WeeklyMealPlanDisplay = () => {
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
  
  // Format des jours de la semaine en français
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short' };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };
  
  // Format des dates en français
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
  };
  
  // Jour actuellement sélectionné
  const selectedDay = currentPlan.days[selectedDayIndex];
  
  // Totaux nutritionnels du jour sélectionné
  const dayNutrition = getDayNutritionTotals(currentPlan.id, selectedDayIndex);
  
  return (
    <div className="weekly-meal-plan">
      {/* Informations sur le plan */}
      <div className="plan-info mb-4">
        <h3 className="font-medium">{currentPlan.name}</h3>
        <p className="text-text-secondary text-sm">
          {currentPlan.startDate && currentPlan.endDate 
            ? `Du ${new Date(currentPlan.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentPlan.endDate).toLocaleDateString('fr-FR')}` 
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
      
      {/* Panneau de jour sélectionné avec macros en haut */}
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
            
            {/* Barres de progression pour visualiser l'atteinte des objectifs */}
            <div className="macro-progress-bars">
              <div className="macro-progress">
                <div className="progress-label">
                  <span>Calories</span>
                  <span>{dayNutrition.calories} / 2000</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-bar-fill calories-fill" 
                    style={{ width: `${Math.min(100, (dayNutrition.calories / 2000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Liste des repas du jour sélectionné */}
        <div className="meals-section">
          <h4 className="meals-header">Repas du jour</h4>
          <DayMealsList 
            day={selectedDay} 
            dayNutrition={dayNutrition}
            getFoodById={getFoodById}
            getRecipeById={getRecipeById}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyMealPlanDisplay;
