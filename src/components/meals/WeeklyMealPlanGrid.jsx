import React from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import MealItem from './MealItem';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant d'affichage en grille du plan de repas hebdomadaire
 * Permet de visualiser tous les jours de la semaine simultanément
 */
const WeeklyMealPlanGrid = () => {
  const { currentPlan, getDayNutritionTotals } = useMealPlan();
  const { getFoodById } = useFood();
  const { getRecipeById } = useRecipe();
  
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
  
  // Obtenir le jour de la semaine
  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long' });
  };

  return (
    <div className="weekly-meal-plan">
      <h2 className="text-xl font-bold text-text-primary mb-4">Vue d'ensemble de la semaine</h2>
      
      {/* Informations sur le plan */}
      <div className="plan-info mb-4">
        <h3 className="font-medium">{currentPlan.name}</h3>
        <p className="text-text-secondary text-sm">
          {currentPlan.startDate && currentPlan.endDate 
            ? `Du ${formatDate(currentPlan.startDate)} au ${formatDate(currentPlan.endDate)}` 
            : 'Dates non définies'}
        </p>
      </div>
      
      {/* Grille des jours de la semaine */}
      <div className="week-grid-view">
        {currentPlan.days.map((day, dayIndex) => {
          // Obtenir les données nutritionnelles du jour
          const dayNutrition = getDayNutritionTotals(currentPlan.id, dayIndex);
          
          return (
            <div key={dayIndex} className="day-card">
              <div className="day-card-header">
                <div className="day-card-title">
                  <span>{getDayOfWeek(day.date)}</span>
                  <span className="day-card-date">{formatDate(day.date)}</span>
                </div>
              </div>
              
              <div className="day-card-content">
                {day.meals && day.meals.length > 0 ? (
                  <div className="day-meal-list">
                    {day.meals.map((meal, mealIndex) => (
                      <div key={mealIndex} className="day-meal-item">
                        <MealItem 
                          meal={meal} 
                          getFoodById={getFoodById}
                          getRecipeById={getRecipeById}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-items">Aucun repas pour cette journée.</p>
                )}
                
                {/* Résumé nutritionnel du jour */}
                {dayNutrition && (
                  <div className="day-nutrition-summary mt-3">
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyMealPlanGrid;
