import React, { useState } from 'react';
import MealItem from './MealItem';
import { useMealPlan } from '../../contexts/MealPlanContext';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant pour afficher la liste des repas d'un jour
 * Optimisé pour la nouvelle interface avec les repas déroulés par défaut
 * et des titres de repas clairement visibles
 */
const DayMealsList = ({ day, dayNutrition, getFoodById, getRecipeById }) => {
  const { addMealToCurrentPlan, currentPlan, deleteMeal } = useMealPlan();
  const [addingMeal, setAddingMeal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('dejeuner');
  
  // Trouver l'index du jour actuel dans le plan
  const findDayIndex = () => {
    if (!currentPlan || !currentPlan.days) return -1;
    return currentPlan.days.findIndex(d => d.date === day.date);
  };
  
  // Gestionnaire pour le bouton Ajouter un repas
  const handleAddMeal = () => {
    setAddingMeal(true);
  };
  
  // Gestionnaire pour confirmer l'ajout d'un repas
  const handleConfirmAddMeal = () => {
    const dayIndex = findDayIndex();
    if (dayIndex === -1) return;
    
    // Créer un repas vide avec le type sélectionné
    const newMeal = {
      name: `Nouveau ${selectedMealType === 'dejeuner' ? 'déjeuner' : 'souper'}`,
      type: selectedMealType,
      items: [],
      totaux: {
        calories: 0,
        macros: {
          protein: 0,
          fat: 0,
          netCarbs: 0
        }
      }
    };
    
    // Ajouter le repas au plan
    addMealToCurrentPlan(newMeal, dayIndex, selectedMealType);
    setAddingMeal(false);
  };
  
  // Gestionnaire pour annuler l'ajout d'un repas
  const handleCancelAddMeal = () => {
    setAddingMeal(false);
  };
  
  // Gestionnaire pour supprimer un repas
  const handleDeleteMeal = (mealId) => {
    const dayIndex = findDayIndex();
    if (dayIndex === -1 || !currentPlan || !currentPlan.id) return;
    
    // Confirmation avant suppression
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      deleteMeal(currentPlan.id, dayIndex, mealId);
    }
  };
  
  // Organiser les repas par type
  const organizeByType = (meals) => {
    const mealsByType = {};
    
    // Types de repas standard en ordre chronologique
    const mealTypes = [
  'petit_dejeuner', 
  'collation_matin', 
  'dejeuner', 
  'collation_aprem', 
  'souper'
];
    
    // Initialiser les types de repas
    mealTypes.forEach(type => {
      mealsByType[type] = [];
    });
    
    // Classer les repas par type
    meals.forEach(meal => {
      const type = meal.type || 'autre';
      if (!mealsByType[type]) {
        mealsByType[type] = [];
      }
      mealsByType[type].push(meal);
    });
    
    return mealsByType;
  };
  
  // Si le jour n'a pas de repas, afficher un message
  if (!day.meals || day.meals.length === 0) {
    return (
      <div className="day-meals-empty">
        <p>Aucun repas planifié pour cette journée.</p>
        <button 
          className="btn-primary mt-4"
          onClick={handleAddMeal}
        >
          Ajouter un repas
        </button>
        
        {addingMeal && (
          <div className="meal-type-selector mt-4">
            <h4>Sélectionner le type de repas</h4>
            <div className="meal-type-options">
              <label>
                <input
                  type="radio"
                  name="meal-type"
                  value="dejeuner"
                  checked={selectedMealType === 'dejeuner'}
                  onChange={() => setSelectedMealType('dejeuner')}
                />
                Déjeuner
              </label>
              <label>
                <input
                  type="radio"
                  name="meal-type"
                  value="souper"
                  checked={selectedMealType === 'souper'}
                  onChange={() => setSelectedMealType('souper')}
                />
                souper
              </label>
            </div>
            <div className="meal-type-actions mt-4">
              <button 
                className="btn-secondary mr-2"
                onClick={handleCancelAddMeal}
              >
                Annuler
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmAddMeal}
              >
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Organiser les repas par type
  const mealsByType = organizeByType(day.meals);
  
  // Obtenir les noms en français des types de repas
  const getTypeName = (type) => {
  const typeNames = {
    'petit_dejeuner': 'Petit déjeuner',
    'dejeuner': 'Déjeuner',
    'collation_matin': 'Collation du matin',
    'collation_aprem': 'Collation après-midi',
    'souper': 'Souper'    
  };
  
  return typeNames[type] || 'Repas';
};


  return (
    <div className="day-meals">
      {/* Afficher les repas organisés par type */}
      {Object.entries(mealsByType).map(([type, meals]) => 
        meals.length > 0 && (
          <div key={type} className="meal-type-group">
            <h3 className="meal-type-title">{getTypeName(type)}</h3>
            <div className="meal-items-by-type">
              {meals.map((meal, index) => (
                <div key={meal.id || index} className="day-meal-item">
                  <MealItem 
                    meal={meal} 
                    getFoodById={getFoodById}
                    getRecipeById={getRecipeById}
                    onDeleteMeal={handleDeleteMeal}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      )}
      
      <div className="add-meal-button-container">
        <button 
          className="add-meal-button"
          onClick={handleAddMeal}
        >
          Ajouter un repas
        </button>
      </div>
      
      {addingMeal && (
        <div className="meal-type-selector mt-4">
          <h4>Sélectionner le type de repas</h4>
          <div className="meal-type-options">
            <label>
              <input
                type="radio"
                name="meal-type"
                value="dejeuner"
                checked={selectedMealType === 'dejeuner'}
                onChange={() => setSelectedMealType('dejeuner')}
              />
              Déjeuner
            </label>
            <label>
              <input
                type="radio"
                name="meal-type"
                value="souper"
                checked={selectedMealType === 'souper'}
                onChange={() => setSelectedMealType('souper')}
              />
              souper
            </label>
          </div>
          <div className="meal-type-actions mt-4">
            <button 
              className="btn-secondary mr-2"
              onClick={handleCancelAddMeal}
            >
              Annuler
            </button>
            <button 
              className="btn-primary"
              onClick={handleConfirmAddMeal}
            >
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayMealsList;