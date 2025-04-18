import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import DayNavigator from './DayNavigator';
import DayMealsList from './DayMealsList';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant d'affichage du plan de repas hebdomadaire
 * Permet de visualiser et naviguer entre les jours du plan
 */
const WeeklyMealPlanDisplay = () => {
  const { currentPlan, getDayNutritionTotals } = useMealPlan();
  const { getFoodById } = useFood();
  const { getRecipeById } = useRecipe();
  
  // État pour le jour sélectionné (index)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // Mise à jour de l'index sélectionné si le nombre de jours change
  useEffect(() => {
    if (!currentPlan || !currentPlan.days || currentPlan.days.length === 0) {
      return;
    }
    
    // S'assurer que l'index sélectionné est valide
    if (selectedDayIndex >= currentPlan.days.length) {
      setSelectedDayIndex(0);
    }
  }, [currentPlan, selectedDayIndex]);
  
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
  
  // Jour actuellement sélectionné
  const selectedDay = currentPlan.days[selectedDayIndex];
  
  // Totaux nutritionnels du jour sélectionné
  const dayNutrition = getDayNutritionTotals(currentPlan.id, selectedDayIndex);
  
  return (
    <div className="weekly-meal-plan">
      <h2 className="text-xl font-bold text-text-primary mb-4">Plan de repas hebdomadaire</h2>
      
      {/* Informations sur le plan */}
      <div className="plan-info mb-4 p-3 bg-bg-secondary rounded">
        <h3 className="font-medium">{currentPlan.name}</h3>
        <p className="text-text-secondary text-sm">
          {currentPlan.startDate && currentPlan.endDate 
            ? `Du ${new Date(currentPlan.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentPlan.endDate).toLocaleDateString('fr-FR')}` 
            : 'Dates non définies'}
        </p>
      </div>
      
      {/* Navigateur de jours */}
      <DayNavigator 
        days={currentPlan.days} 
        selectedDayIndex={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
      />
      
      {/* Liste des repas du jour sélectionné */}
      <DayMealsList 
        day={selectedDay} 
        dayNutrition={dayNutrition}
        getFoodById={getFoodById}
        getRecipeById={getRecipeById}
      />
    </div>
  );
};

export default WeeklyMealPlanDisplay;