import React, { useState } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { FaPlus, FaEdit, FaTrashAlt, FaUtensils, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import MealForm from './MealForm';

/**
 * Composant pour afficher et gérer les détails d'un plan de repas
 * Permet de visualiser, ajouter, modifier et supprimer des repas dans le plan
 */
const MealPlanDetail = ({ planId }) => {
  const { 
    mealPlans, 
    getDayNutritionTotals,
    deleteMeal
  } = useMealPlan();
  
  // États locaux
  const [expandedDays, setExpandedDays] = useState({});
  const [showMealForm, setShowMealForm] = useState(false);
  const [currentMealFormData, setCurrentMealFormData] = useState({
    dayIndex: null,
    mealId: null
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Récupérer le plan demandé
  const plan = mealPlans.find(p => p.id === planId);
  if (!plan) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-gray-400 text-center">
        Plan de repas non trouvé
      </div>
    );
  }
  
  // Basculer l'état d'expansion d'un jour
  const toggleDayExpansion = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };
  
  // Ouvrir le formulaire pour ajouter un repas
  const handleAddMeal = (dayIndex) => {
    setCurrentMealFormData({
      dayIndex,
      mealId: null
    });
    setShowMealForm(true);
  };
  
  // Ouvrir le formulaire pour modifier un repas
  const handleEditMeal = (dayIndex, mealId) => {
    setCurrentMealFormData({
      dayIndex,
      mealId
    });
    setShowMealForm(true);
  };
  
  // Demander confirmation pour supprimer un repas
  const handleDeleteMealConfirm = (dayIndex, mealId) => {
    setConfirmDelete({ dayIndex, mealId });
  };
  
  // Supprimer un repas
  const handleDeleteMeal = () => {
    const { dayIndex, mealId } = confirmDelete;
    deleteMeal(plan.id, dayIndex, mealId);
    setConfirmDelete(null);
  };
  
  // Fermer le formulaire de repas
  const handleMealFormClose = () => {
    setShowMealForm(false);
    setCurrentMealFormData({
      dayIndex: null,
      mealId: null
    });
  };
  
  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Obtenir le nom du jour de la semaine
  const getDayOfWeek = (dateString) => {
    if (!dateString) return '';
    
    const options = { weekday: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Récupérer le type de repas en français
  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'petit-déjeuner':
        return 'Petit-déjeuner';
      case 'déjeuner':
        return 'Déjeuner';
      case 'dîner':
        return 'Dîner';
      case 'collation':
        return 'Collation';
      default:
        return type || 'Repas';
    }
  };
  
  // Rendre une barre de macronutriments
  const renderMacroBar = (macros) => {
    if (!macros) return null;
    
    const { fat, protein, carbs } = macros;
    
    return (
      <div className="w-full h-3 flex rounded-full overflow-hidden">
        <div 
          style={{ width: `${fat}%` }} 
          className="bg-yellow-500 h-full"
          title={`Lipides: ${fat}%`}
        ></div>
        <div 
          style={{ width: `${protein}%` }} 
          className="bg-red-500 h-full"
          title={`Protéines: ${protein}%`}
        ></div>
        <div 
          style={{ width: `${carbs}%` }} 
          className="bg-green-500 h-full"
          title={`Glucides: ${carbs}%`}
        ></div>
      </div>
    );
  };
  
  // Vérifier si les ratios de macros respectent le régime keto
  const isKetoCompliant = (macros) => {
    if (!macros) return false;
    
    const { fat, protein, carbs } = macros;
    return fat >= 65 && carbs <= 10;
  };
  
  return (
    <div className="space-y-4">
      {/* Jours du plan */}
      {plan.days.map((day, dayIndex) => {
        const isExpanded = expandedDays[dayIndex] || false;
        const dayTotals = getDayNutritionTotals(plan.id, dayIndex);
        const hasMeals = day.meals && day.meals.length > 0;
        
        return (
          <div key={dayIndex} className="bg-gray-800 rounded-lg overflow-hidden shadow">
            {/* En-tête du jour */}
            <div 
              className={`p-4 flex justify-between items-center cursor-pointer ${
                isExpanded ? 'bg-gray-700' : ''
              }`}
              onClick={() => toggleDayExpansion(dayIndex)}
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-100">
                  {formatDate(day.date)}
                </h3>
                
                {hasMeals ? (
                  <div className="text-sm text-gray-400 mt-1">
                    {day.meals.length} repas • {dayTotals.calories} kcal
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-1">
                    Aucun repas planifié
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                {hasMeals && (
                  <div className="hidden sm:block mr-6 w-32">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className="text-yellow-500">{dayTotals.macroRatios.fat}% lipides</span>
                      <span className="text-red-500">{dayTotals.macroRatios.protein}% protéines</span>
                      <span className="text-green-500">{dayTotals.macroRatios.carbs}% glucides</span>
                    </div>
                    {renderMacroBar(dayTotals.macroRatios)}
                    
                    {isKetoCompliant(dayTotals.macroRatios) ? (
                      <div className="text-xs text-green-500 mt-1 text-right">✓ Keto</div>
                    ) : (
                      <div className="text-xs text-yellow-500 mt-1 text-right">⚠ Non keto</div>
                    )}
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddMeal(dayIndex);
                  }}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 mr-3"
                  title="Ajouter un repas"
                >
                  <FaPlus />
                </button>
                
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
            
            {/* Contenu du jour (repas) */}
            {isExpanded && (
              <div className="p-4 border-t border-gray-700">
                {hasMeals ? (
                  <div className="space-y-4">
                    {day.meals.map(meal => (
                      <div key={meal.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-100">
                              {getMealTypeLabel(meal.type)}
                            </h4>
                            <div className="text-sm text-gray-400 mt-1">
                              {meal.calories} kcal
                            </div>
                          </div>
                          
                          <div className="flex">
                            <button
                              onClick={() => handleEditMeal(dayIndex, meal.id)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 mr-2"
                              title="Modifier ce repas"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteMealConfirm(dayIndex, meal.id)}
                              className="p-1.5 text-red-400 hover:text-red-300"
                              title="Supprimer ce repas"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                        
                        {/* Contenu du repas */}
                        <div className="mt-3">
                          {meal.items && meal.items.length > 0 ? (
                            <ul className="divide-y divide-gray-600">
                              {meal.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="py-2 flex justify-between">
                                  <div className="flex items-center">
                                    <FaUtensils className="text-gray-500 mr-2" />
                                    <span>{item.name}</span>
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    {item.type === 'food' 
                                      ? `${item.quantity} ${item.unit || 'g'}`
                                      : `${item.servings} portion${item.servings !== 1 ? 's' : ''}`
                                    }
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-500 italic">
                              Aucun élément dans ce repas
                            </div>
                          )}
                        </div>
                        
                        {/* Notes */}
                        {meal.notes && (
                          <div className="mt-3 p-2 bg-gray-800 rounded text-sm text-gray-400 italic">
                            {meal.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FaUtensils className="text-gray-600 text-3xl mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">Aucun repas planifié pour cette journée</p>
                    <button
                      onClick={() => handleAddMeal(dayIndex)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 inline-flex items-center"
                    >
                      <FaPlus className="mr-2" /> Ajouter un repas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Modal formulaire de repas */}
      {showMealForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-100">
                {currentMealFormData.mealId ? 'Modifier le repas' : 'Ajouter un repas'}
              </h3>
              <button
                onClick={handleMealFormClose}
                className="text-gray-400 hover:text-gray-300 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <MealForm
                planId={plan.id}
                dayIndex={currentMealFormData.dayIndex}
                mealId={currentMealFormData.mealId}
                onSave={handleMealFormClose}
                onCancel={handleMealFormClose}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmation de suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer ce repas ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMeal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanDetail;
