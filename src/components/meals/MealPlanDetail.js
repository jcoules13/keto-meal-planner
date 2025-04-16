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
                      <span className="text-yellow-500">{dayTotals.macroRatios.fat}%</span>
                      <span className="text-red-500">{dayTotals.macroRatios.protein}%</span>
                      <span className="text-green-500">{dayTotals.macroRatios.carbs}%</span>
                    </div>
                    {renderMacroBar(dayTotals.macroRatios)}
                  </div>
                )}
                
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMeal(dayIndex);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-200 rounded-full mr-2"
                    title="Ajouter un repas"
                  >
                    <FaPlus />
                  </button>
                  {isExpanded ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Contenu du jour (conditionnellement affiché) */}
            {isExpanded && (
              <div className="p-4 border-t border-gray-700">
                {hasMeals ? (
                  <div className="space-y-4">
                    {day.meals.map(meal => (
                      <div key={meal.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-100">
                              {getMealTypeLabel(meal.type)}
                              {meal.notes && (
                                <span className="ml-2 text-sm font-normal text-gray-400">
                                  {meal.notes}
                                </span>
                              )}
                            </div>
                            
                            {/* Liste des aliments/recettes */}
                            <ul className="mt-2 space-y-1 text-sm text-gray-400">
                              {meal.items && meal.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center">
                                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                  <span>
                                    {item.name}
                                    {item.type === 'food' && (
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({item.quantity} g)
                                      </span>
                                    )}
                                    {item.type === 'recipe' && item.servings && (
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({item.servings} portion{item.servings > 1 ? 's' : ''})
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex">
                            <button
                              onClick={() => handleEditMeal(dayIndex, meal.id)}
                              className="p-2 text-gray-400 hover:text-gray-200 rounded-full"
                              title="Modifier ce repas"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteMealConfirm(dayIndex, meal.id)}
                              className="p-2 text-red-400 hover:text-red-300 rounded-full"
                              title="Supprimer ce repas"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                        
                        {/* Informations nutritionnelles */}
                        <div className="mt-3 pt-3 border-t border-gray-600 flex flex-wrap justify-between items-center">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-400">
                              {meal.calories} kcal
                            </span>
                            
                            {meal.macros && (
                              <>
                                <span className="text-xs px-2 py-0.5 bg-gray-600 rounded text-yellow-400">
                                  {meal.macros.fat.toFixed(1)}g lipides
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-gray-600 rounded text-red-400">
                                  {meal.macros.protein.toFixed(1)}g protéines
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-gray-600 rounded text-green-400">
                                  {meal.macros.netCarbs.toFixed(1)}g glucides
                                </span>
                              </>
                            )}
                          </div>
                          
                          {meal.pHValue && (
                            <span 
                              className={`text-xs px-2 py-0.5 rounded ${
                                meal.pHValue >= 7 
                                  ? 'bg-blue-900 text-blue-200' 
                                  : 'bg-orange-900 text-orange-200'
                              }`}
                              title={meal.pHValue >= 7 ? 'Alcalin' : 'Acide'}
                            >
                              pH {meal.pHValue.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Résumé du jour */}
                    {hasMeals && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-300">Résumé du jour</h4>
                          <span 
                            className={`text-xs px-2 py-1 rounded-full ${
                              isKetoCompliant(dayTotals.macroRatios)
                                ? 'bg-green-900 text-green-200'
                                : 'bg-red-900 text-red-200'
                            }`}
                          >
                            {isKetoCompliant(dayTotals.macroRatios) 
                              ? 'Keto compliant' 
                              : 'Non keto'}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-sm text-gray-400">Calories</div>
                            <div className="text-lg font-semibold text-gray-100">
                              {dayTotals.calories}
                            </div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-sm text-yellow-400">Lipides</div>
                            <div className="text-lg font-semibold text-gray-100">
                              {dayTotals.macros.fat.toFixed(1)}g ({dayTotals.macroRatios.fat}%)
                            </div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-sm text-red-400">Protéines</div>
                            <div className="text-lg font-semibold text-gray-100">
                              {dayTotals.macros.protein.toFixed(1)}g ({dayTotals.macroRatios.protein}%)
                            </div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-sm text-green-400">Glucides nets</div>
                            <div className="text-lg font-semibold text-gray-100">
                              {dayTotals.macros.netCarbs.toFixed(1)}g ({dayTotals.macroRatios.carbs}%)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaUtensils className="mx-auto text-3xl text-gray-600 mb-2" />
                    <p className="text-gray-400">Aucun repas planifié pour cette journée</p>
                    <button
                      onClick={() => handleAddMeal(dayIndex)}
                      className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md flex items-center gap-2 hover:bg-primary-700 mx-auto"
                    >
                      <FaPlus /> Ajouter un repas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Formulaire de repas (modal) */}
      {showMealForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <MealForm
              planId={plan.id}
              dayIndex={currentMealFormData.dayIndex}
              mealId={currentMealFormData.mealId}
              onSave={handleMealFormClose}
              onCancel={handleMealFormClose}
            />
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
