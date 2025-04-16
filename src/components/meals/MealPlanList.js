import React from 'react';
import { FaCalendarAlt, FaTrashAlt, FaList, FaPlus } from 'react-icons/fa';
import './MealPlanList.css';

/**
 * Affiche la liste des plans de repas existants
 */
const MealPlanList = ({ mealPlans, onSelectPlan, onCreatePlan, onDeletePlan }) => {
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour calculer la durée du plan
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays === 1 
      ? '1 jour' 
      : `${diffDays} jours`;
  };

  // Fonction pour obtenir le texte du type de régime
  const getDietTypeText = (dietType) => {
    return dietType === 'keto_standard' ? 'Keto Standard' : 'Keto Alcalin';
  };

  return (
    <div className="meal-plan-list-container">
      {mealPlans.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <h2>Aucun plan de repas</h2>
          <p>Vous n'avez pas encore créé de plan de repas.</p>
          <button className="create-button" onClick={onCreatePlan}>
            <FaPlus /> Créer un plan
          </button>
        </div>
      ) : (
        <>
          <div className="meal-plans-grid">
            {mealPlans.map(plan => (
              <div key={plan.id} className="meal-plan-card">
                <div className="meal-plan-card-header">
                  <h3>{plan.name}</h3>
                  <span className="diet-type-badge">
                    {getDietTypeText(plan.dietType)}
                  </span>
                </div>
                
                <div className="meal-plan-card-dates">
                  <FaCalendarAlt className="date-icon" />
                  <div>
                    <div>Du {formatDate(plan.startDate)}</div>
                    <div>au {formatDate(plan.endDate)}</div>
                    <div className="duration-text">
                      {calculateDuration(plan.startDate, plan.endDate)}
                    </div>
                  </div>
                </div>
                
                <div className="meal-plan-card-stats">
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
                
                <div className="meal-plan-card-actions">
                  <button
                    className="view-button"
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    Voir le détail
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => onDeletePlan(plan.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="add-plan-button-container">
            <button className="add-plan-button" onClick={onCreatePlan}>
              <FaPlus /> Nouveau plan de repas
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MealPlanList;