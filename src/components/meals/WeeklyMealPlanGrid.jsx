import React from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import MealItem from './MealItem';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant d'affichage en grille du plan de repas hebdomadaire
 * Permet de visualiser tous les jours de la semaine en même temps
 */
const WeeklyMealPlanGrid = ({ onViewDay }) => {
  const { currentPlan, getDayNutritionTotals } = useMealPlan();
  const { getFoodById } = useFood();
  const { getRecipeById } = useRecipe();
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Formater le jour de la semaine
  const formatDayName = (dateString) => {
    const options = { weekday: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
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
  
  return (
    <div className="weekly-meal-plan">
      <div className="plan-info">
        <h3 className="font-medium">{currentPlan.name}</h3>
        <p className="text-text-secondary text-sm">
          {currentPlan.startDate && currentPlan.endDate 
            ? `Du ${new Date(currentPlan.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentPlan.endDate).toLocaleDateString('fr-FR')}` 
            : 'Dates non définies'
          }
        </p>
      </div>
      
      <div className="week-grid-view">
        {currentPlan.days.map((day, index) => {
          const dayNutrition = getDayNutritionTotals(currentPlan.id, index);
          
          return (
            <div key={day.date} className="day-card">
              <div className="day-card-header">
                <div className="day-card-title">
                  <span>{formatDayName(day.date)}</span>
                  <span className="day-card-date">{formatDate(day.date)}</span>
                </div>
              </div>
              
              <div className="day-card-content">
                {day.meals && day.meals.length > 0 ? (
                  <div className="day-meal-list">
                    {day.meals.map((meal) => (
                      <div key={meal.id} className="day-meal-item">
                        <MealItem 
                          meal={meal} 
                          getFoodById={getFoodById}
                          getRecipeById={getRecipeById}
                        />
                      </div>
                    ))}
                    
                    {/* Résumé des macros du jour */}
                    {dayNutrition && (
                      <div className="day-nutrition-summary">
                        <h4 className="text-sm font-medium mb-2">Total du jour</h4>
                        <div className="nutrition-grid">
                          <div className="nutrition-item">
                            <span className="nutrition-label">Calories</span>
                            <span className="nutrition-value">{dayNutrition.calories || 0} kcal</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Lipides</span>
                            <span className="nutrition-value">{dayNutrition.fat || 0}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Protéines</span>
                            <span className="nutrition-value">{dayNutrition.protein || 0}g</span>
                          </div>
                          <div className="nutrition-item">
                            <span className="nutrition-label">Glucides</span>
                            <span className="nutrition-value">{dayNutrition.netCarbs || 0}g</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="day-meals-empty">
                    <p>Aucun repas prévu</p>
                    <button 
                      className="add-meal-button"
                      onClick={() => onViewDay(index)}
                    >
                      Ajouter des repas
                    </button>
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