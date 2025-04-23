import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useFood } from '../../contexts/FoodContext';
import { useRecipe } from '../../contexts/RecipeContext';
import { useUser } from '../../contexts/UserContext';
import { getPreferredStartDay } from '../../utils/dateUtils';
import DayMealsList from './DayMealsList';
import MacroProgressBar from './MacroProgressBar';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant d'affichage du plan de repas hebdomadaire
 * Permet de visualiser et naviguer entre les jours du plan
 * Version améliorée avec barres de progression pour les macros
 * et correction de l'affichage des dates
 */
const WeeklyMealPlanDisplay = () => {
  const { currentPlan, getDayNutritionTotals } = useMealPlan();
  const { getFoodById } = useFood();
  const { getRecipeById } = useRecipe();
  const { calorieTarget, macroTargets } = useUser();
  
  // État pour le jour sélectionné (index)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  // État pour les dates corrigées
  const [correctedDates, setCorrectedDates] = useState(null);
  
  // Générer des dates corrigées basées sur la date actuelle
  useEffect(() => {
    if (currentPlan && currentPlan.days && currentPlan.days.length > 0) {
      const today = new Date();
      const dates = [];
      
      // Récupérer le jour de début préféré de l'utilisateur (0 = dimanche par défaut)
      const targetStartDay = getPreferredStartDay(0); // 0 = dimanche par défaut
      
      // Calculer le premier jour de la semaine en fonction de la préférence
      const currentDay = today.getDay(); // 0=dim, 1=lun, ...
      
      // Calculer le nombre de jours à ajouter/soustraire pour atteindre le jour de début
      let daysToAdd = 0;
      if (currentDay !== targetStartDay) {
        daysToAdd = (targetStartDay - currentDay + 7) % 7;
      }
      
      // Créer la date de début
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + daysToAdd);
      
      // Générer toutes les dates de la semaine
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('fr-FR', {day: 'numeric', month: 'numeric'}),
          weekday: date.toLocaleDateString('fr-FR', {weekday: 'short'}),
          fullDate: date.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})
        });
      }
      
      setCorrectedDates({
        startDate: dates[0].date,
        endDate: dates[6].date,
        displayName: `Plan du ${dates[0].displayDate} au ${dates[6].displayDate}`,
        days: dates
      });
    }
  }, [currentPlan]);
  
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
  const dayNutrition = getDayNutritionTotals(currentPlan.id, selectedDayIndex) || {
    calories: 0,
    protein: 0,
    fat: 0,
    netCarbs: 0
  };
  
  return (
    <div className="weekly-meal-plan">
      {/* Informations sur le plan - avec dates corrigées si disponibles */}
      <div className="plan-info mb-4">
        <h3 className="font-medium">{correctedDates ? correctedDates.displayName : currentPlan.name}</h3>
        <p className="text-text-secondary text-sm">
          {correctedDates 
            ? `Du ${new Date(correctedDates.startDate).toLocaleDateString('fr-FR')} au ${new Date(correctedDates.endDate).toLocaleDateString('fr-FR')}` 
            : (currentPlan.startDate && currentPlan.endDate 
                ? `Du ${new Date(currentPlan.startDate).toLocaleDateString('fr-FR')} au ${new Date(currentPlan.endDate).toLocaleDateString('fr-FR')}` 
                : 'Dates non définies')
          }
        </p>
      </div>
      
      {/* Navigation par jour - nouvelle UI avec dates corrigées */}
      <div className="day-tabs-container">
        <div className="day-tabs">
          {(correctedDates ? correctedDates.days : currentPlan.days).map((day, index) => (
            <button
              key={index}
              className={`day-tab ${selectedDayIndex === index ? 'active' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
              aria-selected={selectedDayIndex === index}
              aria-controls={`day-panel-${index}`}
            >
              <div className="day-name">
                {correctedDates ? day.weekday : getDayOfWeek(day.date)}
              </div>
              <div className="day-date">
                {correctedDates ? day.displayDate : formatDate(day.date)}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Panneau de jour sélectionné avec macros en haut */}
      <div className="day-panel" id={`day-panel-${selectedDayIndex}`}>
        <div className="day-header">
          <h3 className="day-title">
            {correctedDates 
              ? correctedDates.days[selectedDayIndex].fullDate
              : new Date(selectedDay.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            }
          </h3>
        </div>
        
        {/* Résumé nutritionnel du jour avec barres de progression */}
        <div className="day-nutrition-summary">
          <h4 className="nutrition-header">Macros Quotidiennes</h4>
          
          {/* Utilisation de notre nouveau composant MacroProgressBar */}
          <div className="macro-progress-bars">
            <MacroProgressBar 
              type="calories" 
              current={dayNutrition.calories} 
              target={calorieTarget} 
              label="Calories"
            />
            <MacroProgressBar 
              type="protein" 
              current={dayNutrition.protein} 
              target={macroTargets.protein} 
              label="Protéines"
            />
            <MacroProgressBar 
              type="fat" 
              current={dayNutrition.fat} 
              target={macroTargets.fat} 
              label="Lipides"
            />
            <MacroProgressBar 
              type="carbs" 
              current={dayNutrition.netCarbs} 
              target={macroTargets.carbs} 
              label="Glucides"
            />
          </div>
        </div>
        
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