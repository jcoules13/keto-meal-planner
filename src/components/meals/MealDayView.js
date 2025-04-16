import React from 'react';
import { 
  FaArrowLeft, 
  FaUtensils, 
  FaPlusCircle, 
  FaEdit, 
  FaTrashAlt 
} from 'react-icons/fa';
import { useMealPlan } from '../../contexts/MealPlanContext';
import MacronutrientChart from './MacronutrientChart';
import './MealDayView.css';

/**
 * Affichage d'une journée de plan de repas avec ses repas
 */
const MealDayView = ({ 
  plan, 
  dayIndex, 
  onAddMeal, 
  onEditMeal, 
  onDeleteMeal, 
  onBack 
}) => {
  const { getDayNutritionTotals } = useMealPlan();
  
  // Récupérer le jour courant
  const day = plan.days[dayIndex];
  if (!day) {
    return (
      <div className="meal-day-error">
        <p>Jour introuvable</p>
        <button onClick={onBack}>Retour</button>
      </div>
    );
  }
  
  // Récupérer les totaux nutritionnels
  const totals = getDayNutritionTotals(plan.id, dayIndex);
  
  // Formatage de la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Formatage de l'heure
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Si l'heure est au format "HH:MM", la retourner directement
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // Sinon, essayer de parser comme une date et formater
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };
  
  // Obtenir le jour de la semaine
  const getDayOfWeek = (dateString) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };
  
  return (
    <div className="meal-day-view">
      <div className="meal-day-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft />
          <span>Retour</span>
        </button>
        
        <div className="day-info">
          <h2>{getDayOfWeek(day.date)}</h2>
          <span className="date-display">{formatDate(day.date)}</span>
        </div>
      </div>
      
      {/* Affichage des macronutriments si des repas existent */}
      {totals && (
        <div className="day-nutrition-summary">
          <MacronutrientChart 
            protein={totals.macroRatios.protein}
            fat={totals.macroRatios.fat}
            carbs={totals.macroRatios.carbs}
            size="large"
          />
          
          <div className="nutrition-totals">
            <div className="total-item">
              <span className="total-label">Calories</span>
              <span className="total-value">{totals.calories} kcal</span>
            </div>
            <div className="total-item">
              <span className="total-label">Protéines</span>
              <span className="total-value">{totals.protein} g</span>
            </div>
            <div className="total-item">
              <span className="total-label">Lipides</span>
              <span className="total-value">{totals.fat} g</span>
            </div>
            <div className="total-item">
              <span className="total-label">Glucides nets</span>
              <span className="total-value">{totals.netCarbs} g</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="day-meals-section">
        <div className="section-header">
          <h3>Repas planifiés</h3>
          <button className="add-meal-button" onClick={onAddMeal}>
            <FaPlusCircle />
            <span>Ajouter un repas</span>
          </button>
        </div>
        
        {day.meals.length === 0 ? (
          <div className="no-meals">
            <FaUtensils className="no-meals-icon" />
            <p>Aucun repas planifié pour cette journée</p>
            <button className="add-first-meal-button" onClick={onAddMeal}>
              Ajouter un repas
            </button>
          </div>
        ) : (
          <div className="meals-list">
            {day.meals.map((meal) => (
              <div key={meal.id} className="meal-card">
                <div className="meal-card-header">
                  <h4 className="meal-type">{meal.type}</h4>
                  {meal.time && (
                    <span className="meal-time">{formatTime(meal.time)}</span>
                  )}
                </div>
                
                <div className="meal-items">
                  {meal.items.map((item, index) => (
                    <div key={index} className="meal-item">
                      <span className="item-name">{item.name || item.id}</span>
                      {item.type === 'recipe' && (
                        <span className="item-portion">
                          {item.servings} portion{item.servings > 1 ? 's' : ''}
                        </span>
                      )}
                      {item.type === 'food' && (
                        <span className="item-quantity">
                          {item.quantity} {item.unit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="meal-card-actions">
                  <button 
                    className="edit-meal-button" 
                    onClick={() => onEditMeal(meal)}
                  >
                    <FaEdit />
                    <span>Modifier</span>
                  </button>
                  <button 
                    className="delete-meal-button" 
                    onClick={() => onDeleteMeal(meal.id)}
                  >
                    <FaTrashAlt />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealDayView;