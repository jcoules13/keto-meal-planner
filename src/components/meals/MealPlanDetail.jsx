import React from 'react';
import { 
  FaCalendarAlt, 
  FaShoppingBasket, 
  FaTrashAlt, 
  FaClipboard, 
  FaArrowRight
} from 'react-icons/fa';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useUser } from '../../contexts/UserContext';
import MacronutrientChart from './MacronutrientChart';
import './MealPlanDetail.css';

/**
 * Affichage détaillé d'un plan de repas
 */
const MealPlanDetail = ({ plan, onViewDay, onGenerateShoppingList, onDelete }) => {
  const { getDayNutritionTotals, hasMeals } = useMealPlan();
  const { calorieTarget, macroTargets } = useUser();
  
  // Formatage de la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Formatage du jour de la semaine
  const getDayOfWeek = (dateString) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };
  
  // Formater le nom du type de régime
  const getDietTypeText = (dietType) => {
    return dietType === 'keto_standard' ? 'Keto Standard' : 'Keto Alcalin';
  };
  
  // Vérifier si un jour a des repas planifiés
  const hasPlannedMeals = (dayIndex) => {
    return hasMeals(plan.id, dayIndex);
  };
  
  // Obtenir les macronutriments pour un jour
  const getDayMacros = (dayIndex) => {
    const totals = getDayNutritionTotals(plan.id, dayIndex);
    if (!totals) return null;
    
    return {
      protein: totals.macroRatios.protein,
      fat: totals.macroRatios.fat,
      carbs: totals.macroRatios.carbs
    };
  };
  
  // Calculer le statut keto d'un jour (basé sur les macros)
  const isKetogenic = (dayIndex) => {
    const macros = getDayMacros(dayIndex);
    if (!macros) return false;
    
    // Critères keto: au moins 65% de lipides et maximum 10% de glucides
    return macros.fat >= 65 && macros.carbs <= 10;
  };
  
  // État de planification d'un jour
  const getDayStatus = (dayIndex) => {
    if (!hasPlannedMeals(dayIndex)) {
      return { status: 'empty', label: 'Non planifié' };
    }
    
    const macros = getDayMacros(dayIndex);
    if (!macros) {
      return { status: 'incomplete', label: 'Incomplet' };
    }
    
    if (isKetogenic(dayIndex)) {
      return { status: 'ketogenic', label: 'Keto' };
    }
    
    return { status: 'non-ketogenic', label: 'Non keto' };
  };
  
  return (
    <div className="meal-plan-detail">
      <div className="meal-plan-header">
        <h2>{plan.name}</h2>
        <span className={`diet-type-badge ${plan.dietType === 'keto_alcalin' ? 'alkaline' : ''}`}>
          {getDietTypeText(plan.dietType)}
        </span>
      </div>
      
      <div className="meal-plan-info">
        <div className="info-group">
          <FaCalendarAlt className="info-icon" />
          <div>
            <div>Du {formatDate(plan.startDate)}</div>
            <div>au {formatDate(plan.endDate)}</div>
          </div>
        </div>
        
        <div className="meal-plan-stats">
          <div className="stat">
            <span className="stat-value">{plan.days.length}</span>
            <span className="stat-label">jours</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {plan.days.reduce((total, day) => total + day.meals.length, 0)}
            </span>
            <span className="stat-label">repas</span>
          </div>
        </div>
        
        <div className="meal-plan-actions">
          <button 
            className="shopping-list-button" 
            onClick={onGenerateShoppingList}
            disabled={plan.days.every((_, i) => !hasPlannedMeals(i))}
          >
            <FaShoppingBasket />
            <span>Liste de courses</span>
          </button>
          <button className="delete-button" onClick={onDelete}>
            <FaTrashAlt />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
      
      <div className="meal-plan-nutrition-target">
        <h3>Objectifs nutritionnels</h3>
        <div className="nutrition-details">
          <div className="calories-target">
            <span className="label">Calories:</span>
            <span className="value">{calorieTarget} kcal</span>
          </div>
          <div className="macros-target">
            <div className="macro">
              <span className="label">Protéines:</span>
              <span className="value">{macroTargets.protein}g</span>
            </div>
            <div className="macro">
              <span className="label">Lipides:</span>
              <span className="value">{macroTargets.fat}g</span>
            </div>
            <div className="macro">
              <span className="label">Glucides:</span>
              <span className="value">{macroTargets.carbs}g</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="meal-plan-days">
        <h3>Jours du plan</h3>
        <div className="days-grid">
          {plan.days.map((day, index) => {
            const dayStatus = getDayStatus(index);
            const dayMacros = getDayMacros(index);
            
            return (
              <div 
                key={day.date} 
                className="day-card"
                onClick={() => onViewDay(index)}
              >
                <div className="day-header">
                  <div className="day-date">
                    <span className="day-of-week">{getDayOfWeek(day.date)}</span>
                    <span className="date">{formatDate(day.date)}</span>
                  </div>
                  <div className={`day-status ${dayStatus.status}`}>
                    {dayStatus.label}
                  </div>
                </div>
                
                <div className="day-content">
                  {hasPlannedMeals(index) ? (
                    <>
                      <div className="meals-summary">
                        <span className="meals-count">{day.meals.length} repas planifiés</span>
                        <ul className="meals-list">
                          {day.meals.map(meal => (
                            <li key={meal.id}>{meal.type}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {dayMacros && (
                        <div className="day-macros">
                          <MacronutrientChart 
                            protein={dayMacros.protein}
                            fat={dayMacros.fat}
                            carbs={dayMacros.carbs}
                            size="small"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="empty-day">
                      <FaClipboard className="empty-icon" />
                      <span>Aucun repas planifié</span>
                    </div>
                  )}
                </div>
                
                <div className="day-action">
                  <FaArrowRight />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetail;