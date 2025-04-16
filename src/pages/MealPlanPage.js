import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useUser } from '../contexts/UserContext';
import { FaPlus, FaEdit, FaTrashAlt, FaShoppingBasket, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';
import ShoppingList from '../components/meals/ShoppingList';

/**
 * Page principale de gestion des plans de repas
 * Permet de visualiser, créer et gérer les plans de repas
 */
const MealPlanPage = () => {
  const { 
    mealPlans, 
    currentPlan, 
    setCurrentPlan, 
    createEmptyPlan, 
    deletePlan,
    getDayNutritionTotals
  } = useMealPlan();
  
  const { dietType } = useUser();
  
  // États locaux
  const [showNewPlanForm, setShowNewPlanForm] = useState(false);
  const [newPlanData, setNewPlanData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dietType: dietType || 'keto_standard'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('plans'); // 'plans', 'detail', 'shopping'
  
  // Fonctions de gestion du formulaire de création de plan
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlanData(prev => ({ ...prev, [name]: value }));
  };
  
  // Créer un nouveau plan
  const handleCreatePlan = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!newPlanData.name.trim()) {
      alert('Veuillez donner un nom à votre plan de repas');
      return;
    }
    
    if (new Date(newPlanData.startDate) > new Date(newPlanData.endDate)) {
      alert('La date de début doit être antérieure à la date de fin');
      return;
    }
    
    // Créer le plan
    const planId = createEmptyPlan(
      newPlanData.name,
      newPlanData.startDate,
      newPlanData.endDate,
      newPlanData.dietType
    );
    
    // Mettre à jour l'UI
    setShowNewPlanForm(false);
    setNewPlanData({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dietType: dietType || 'keto_standard'
    });
    
    // Sélectionner le nouveau plan
    setCurrentPlan(planId);
    setViewMode('detail');
  };
  
  // Confirmer la suppression d'un plan
  const confirmDeletePlan = (planId) => {
    setPlanToDelete(planId);
    setShowDeleteModal(true);
  };
  
  // Supprimer un plan
  const handleDeletePlan = () => {
    deletePlan(planToDelete);
    setShowDeleteModal(false);
    setPlanToDelete(null);
    
    // Si le plan supprimé était le plan actif, revenir à la liste
    if (currentPlan?.id === planToDelete) {
      setViewMode('plans');
    }
  };
  
  // Sélectionner un plan et passer en mode détail
  const handleSelectPlan = (planId) => {
    setCurrentPlan(planId);
    setViewMode('detail');
  };
  
  // Retour à la liste des plans
  const handleBackToList = () => {
    setViewMode('plans');
  };
  
  // Passer en mode liste de courses
  const handleShowShoppingList = () => {
    setViewMode('shopping');
  };
  
  // Formater une date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Obtenir la durée du plan en jours
  const getPlanDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };
  
  // Obtenir le type de régime en français
  const getDietTypeLabel = (type) => {
    switch (type) {
      case 'keto_standard':
        return 'Keto Standard';
      case 'keto_alcalin':
        return 'Keto Alcalin';
      default:
        return type;
    }
  };
  
  // Obtenir un résumé des macronutriments du plan
  const getPlanMacroSummary = (plan) => {
    if (!plan || !plan.days || plan.days.length === 0) return { calories: 0, fat: 0, protein: 0, carbs: 0 };
    
    // Calculer les moyennes sur tous les jours ayant des repas
    let totalCalories = 0;
    let totalFatRatio = 0;
    let totalProteinRatio = 0;
    let totalCarbsRatio = 0;
    let daysWithMeals = 0;
    
    plan.days.forEach((day, index) => {
      if (day.meals && day.meals.length > 0) {
        const totals = getDayNutritionTotals(plan.id, index);
        if (totals && totals.calories > 0) {
          totalCalories += totals.calories;
          totalFatRatio += totals.macroRatios.fat;
          totalProteinRatio += totals.macroRatios.protein;
          totalCarbsRatio += totals.macroRatios.carbs;
          daysWithMeals++;
        }
      }
    });
    
    if (daysWithMeals === 0) return { calories: 0, fat: 0, protein: 0, carbs: 0 };
    
    // Calculer les moyennes
    return {
      calories: Math.round(totalCalories / daysWithMeals),
      fat: Math.round(totalFatRatio / daysWithMeals),
      protein: Math.round(totalProteinRatio / daysWithMeals),
      carbs: Math.round(totalCarbsRatio / daysWithMeals)
    };
  };
  
  // Rendu des différentes vues
  
  // Vue liste des plans
  const renderPlansList = () => (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Plans de repas</h1>
        <button
          onClick={() => setShowNewPlanForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md flex items-center gap-2 hover:bg-primary-700"
        >
          <FaPlus /> Nouveau plan
        </button>
      </header>
      
      {showNewPlanForm && (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Créer un nouveau plan</h2>
          <form onSubmit={handleCreatePlan}>
            <div className="space-y-4">
              {/* Nom du plan */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du plan
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newPlanData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Plan hebdomadaire du 12 mai"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={newPlanData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={newPlanData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              
              {/* Type de régime */}
              <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-gray-300 mb-1">
                  Type de régime
                </label>
                <select
                  id="dietType"
                  name="dietType"
                  value={newPlanData.dietType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="keto_standard">Keto Standard</option>
                  <option value="keto_alcalin">Keto Alcalin</option>
                </select>
              </div>
              
              {/* Boutons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewPlanForm(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Liste des plans */}
      <div className="space-y-4">
        {mealPlans.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FaCalendarAlt className="mx-auto text-4xl mb-3" />
            <p className="text-lg">Aucun plan de repas trouvé</p>
            <p className="mt-2">Créez votre premier plan en cliquant sur le bouton "Nouveau plan"</p>
          </div>
        ) : (
          mealPlans.map(plan => {
            const macroSummary = getPlanMacroSummary(plan);
            const duration = getPlanDuration(plan.startDate, plan.endDate);
            const daysWithMeals = plan.days.filter(day => day.meals && day.meals.length > 0).length;
            
            return (
              <div key={plan.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="p-4 flex flex-col md:flex-row">
                  {/* Info du plan */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-100">{plan.name}</h3>
                    <div className="mt-2 text-gray-400 text-sm flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                      </span>
                      <span>{duration} jour{duration > 1 ? 's' : ''}</span>
                      <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                        {getDietTypeLabel(plan.dietType)}
                      </span>
                    </div>
                    
                    {/* Progression */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{daysWithMeals} / {duration} jours planifiés</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-primary-500 h-2.5 rounded-full" 
                          style={{ width: `${(daysWithMeals / duration) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Macros moyennes (si disponibles) */}
                    {macroSummary.calories > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="px-2 py-1 bg-gray-700 rounded text-xs">
                          <span className="font-medium">{macroSummary.calories}</span> kcal/jour
                        </div>
                        <div className="px-2 py-1 bg-gray-700 rounded text-xs">
                          <span className="font-medium text-red-400">{macroSummary.protein}%</span> protéines
                        </div>
                        <div className="px-2 py-1 bg-gray-700 rounded text-xs">
                          <span className="font-medium text-yellow-400">{macroSummary.fat}%</span> lipides
                        </div>
                        <div className="px-2 py-1 bg-gray-700 rounded text-xs">
                          <span className="font-medium text-green-400">{macroSummary.carbs}%</span> glucides
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-between md:justify-center gap-3 mt-4 md:mt-0">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      className="px-3 py-1 bg-primary-600 text-white rounded flex items-center gap-1 hover:bg-primary-700"
                    >
                      <FaEdit className="md:mr-1" />
                      <span className="hidden md:inline">Modifier</span>
                    </button>
                    <button
                      onClick={() => confirmDeletePlan(plan.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-1 hover:bg-red-700"
                    >
                      <FaTrashAlt className="md:mr-1" />
                      <span className="hidden md:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
                
                {/* Bouton voir détails (pour mobile) */}
                <div 
                  className="p-3 bg-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  <span className="text-gray-300 font-medium">Voir les détails</span>
                  <FaChevronRight className="text-gray-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer ce plan de repas ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlanToDelete(null);
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleDeletePlan}
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
  
  // Vue détail d'un plan
  const renderPlanDetail = () => {
    if (!currentPlan) return null;
    
    return (
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={handleBackToList}
              className="text-gray-400 hover:text-gray-300 flex items-center gap-1 mb-2"
            >
              <FaChevronRight className="transform rotate-180" /> Retour aux plans
            </button>
            <h1 className="text-2xl font-bold text-gray-100">{currentPlan.name}</h1>
            <div className="text-gray-400 text-sm mt-1">
              {formatDate(currentPlan.startDate)} - {formatDate(currentPlan.endDate)} | 
              {' '}{getDietTypeLabel(currentPlan.dietType)}
            </div>
          </div>
          <button
            onClick={handleShowShoppingList}
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700"
          >
            <FaShoppingBasket /> Liste de courses
          </button>
        </header>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Repas planifiés</h2>
          
          {/* Ici, vous pouvez ajouter le composant MealPlanDetail qui affiche tous les jours et repas */}
          <div className="text-gray-400 text-center py-10">
            <p className="text-lg">Fonctionnalité en cours de développement</p>
            <p className="mt-2">Le composant MealPlanDetail sera implémenté prochainement</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Vue liste de courses
  const renderShoppingList = () => {
    if (!currentPlan) return null;
    
    return (
      <div className="space-y-6">
        <header>
          <button
            onClick={() => setViewMode('detail')}
            className="text-gray-400 hover:text-gray-300 flex items-center gap-1 mb-2"
          >
            <FaChevronRight className="transform rotate-180" /> Retour au plan
          </button>
          <h1 className="text-2xl font-bold text-gray-100">Liste de courses</h1>
          <div className="text-gray-400 text-sm mt-1">
            Pour le plan : {currentPlan.name}
          </div>
        </header>
        
        <ShoppingList planId={currentPlan.id} />
      </div>
    );
  };
  
  // Choisir la vue à afficher
  const renderContent = () => {
    if (viewMode === 'shopping' && currentPlan) {
      return renderShoppingList();
    } else if (viewMode === 'detail' && currentPlan) {
      return renderPlanDetail();
    } else {
      return renderPlansList();
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Plans de repas | Keto Meal Planner</title>
      </Helmet>
      
      {renderContent()}
    </div>
  );
};

export default MealPlanPage;
