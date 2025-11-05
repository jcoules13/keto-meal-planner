import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useUser } from '../contexts/UserContext';
import MealPlanList from '../components/meals/MealPlanList';
import MealPlanCreator from '../components/meals/MealPlanCreator';
import MealPlanDetail from '../components/meals/MealPlanDetail';
import MealDayView from '../components/meals/MealDayView';
import MealForm from '../components/meals/MealForm';
import './MealPlanPage.css';

const MealPlanPage = () => {
  // Récupérer les contextes
  const { 
    mealPlans, 
    currentPlan, 
    isGenerating, 
    error, 
    selectMealPlan,
    createEmptyPlan,
    deleteMealPlan,
    addMeal,
    updateMeal,
    deleteMeal,
    generateShoppingListFromPlan,
    clearError
  } = useMealPlan();
  
  const { dietType } = useUser();
  
  // États locaux
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'detail', 'day', 'meal'
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editingMeal, setEditingMeal] = useState(null);
  
  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      // Afficher l'erreur, puis la nettoyer après un délai
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);
  
  // Gérer les changements de vue
  const handleViewPlanList = () => {
    setViewMode('list');
    setSelectedDayIndex(0);
    setEditingMeal(null);
  };
  
  const handleCreatePlan = () => {
    setViewMode('create');
  };
  
  const handleViewPlanDetail = (planId) => {
    selectMealPlan(planId);
    setViewMode('detail');
  };
  
  const handleViewDay = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setViewMode('day');
  };
  
  const handleAddMeal = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setEditingMeal(null);
    setViewMode('meal');
  };
  
  const handleEditMeal = (dayIndex, meal) => {
    setSelectedDayIndex(dayIndex);
    setEditingMeal(meal);
    setViewMode('meal');
  };
  
  const handleDeleteMeal = (dayIndex, mealId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      deleteMeal(currentPlan.id, dayIndex, mealId);
    }
  };
  
  const handleDeletePlan = (planId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan de repas ?')) {
      deleteMealPlan(planId);
      handleViewPlanList();
    }
  };
  
  const handleMealFormSubmit = (meal) => {
    if (editingMeal) {
      // Mise à jour d'un repas existant
      updateMeal(currentPlan.id, selectedDayIndex, editingMeal.id, meal);
    } else {
      // Ajout d'un nouveau repas
      addMeal(currentPlan.id, selectedDayIndex, meal);
    }
    
    // Retourner à la vue du jour
    setViewMode('day');
  };
  
  const handleMealFormCancel = () => {
    setViewMode('day');
  };
  
  const handlePlanCreated = (planId) => {
    selectMealPlan(planId);
    setViewMode('detail');
  };
  
  const handleGenerateShoppingList = () => {
    if (currentPlan) {
      generateShoppingListFromPlan(currentPlan.id);
      // Rediriger vers la page de liste de courses
      window.location.href = '/shopping-list';
    }
  };
  
  // Rendu de la page
  return (
    <div className="meal-plan-page">
      <div className="meal-plan-header">
        <h1 className="page-title">Plans de repas</h1>
        {viewMode === 'list' && (
          <button className="create-plan-button" onClick={handleCreatePlan}>
            Nouveau plan
          </button>
        )}
        {viewMode !== 'list' && (
          <button className="back-button" onClick={handleViewPlanList}>
            Retour à la liste
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
      
      {isGenerating && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Opération en cours...</p>
        </div>
      )}
      
      <div className="meal-plan-content">
        {viewMode === 'list' && (
          <MealPlanList 
            mealPlans={mealPlans}
            onSelectPlan={handleViewPlanDetail}
            onCreatePlan={handleCreatePlan}
            onDeletePlan={handleDeletePlan}
          />
        )}
        
        {viewMode === 'create' && (
          <MealPlanCreator 
            dietType={dietType}
            onPlanCreated={handlePlanCreated}
            onCancel={handleViewPlanList}
          />
        )}
        
        {viewMode === 'detail' && currentPlan && (
          <MealPlanDetail 
            plan={currentPlan}
            onViewDay={handleViewDay}
            onGenerateShoppingList={handleGenerateShoppingList}
            onDelete={() => handleDeletePlan(currentPlan.id)}
          />
        )}
        
        {viewMode === 'day' && currentPlan && (
          <MealDayView 
            plan={currentPlan}
            dayIndex={selectedDayIndex}
            onAddMeal={() => handleAddMeal(selectedDayIndex)}
            onEditMeal={(meal) => handleEditMeal(selectedDayIndex, meal)}
            onDeleteMeal={(mealId) => handleDeleteMeal(selectedDayIndex, mealId)}
            onBack={() => setViewMode('detail')}
          />
        )}
        
        {viewMode === 'meal' && currentPlan && (
          <MealForm 
            initialMeal={editingMeal}
            onSubmit={handleMealFormSubmit}
            onCancel={handleMealFormCancel}
          />
        )}
      </div>
    </div>
  );
};

export default MealPlanPage;