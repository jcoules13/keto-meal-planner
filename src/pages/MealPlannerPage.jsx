import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaUtensils, FaCalendarAlt, FaCog, FaListUl, FaThLarge } from 'react-icons/fa';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useUser } from '../contexts/UserContext';
import { FridgeProvider } from '../contexts/FridgeContext';
import FridgeSelector from '../components/meals/FridgeSelector';
// Importer les composants pour la planification des repas
import MealGeneratorForPlan from '../components/meals/MealGeneratorForPlan';
import MealGeneratorFromFridge from '../components/meals/MealGeneratorFromFridge';
import WeeklyMealGenerator from '../components/meals/WeeklyMealGenerator';
import MealPlanOptions from '../components/meals/MealPlanOptions';
import FastingScheduleDisplay from '../components/meals/FastingScheduleDisplay';
import WeeklyMealPlanDisplay from '../components/meals/WeeklyMealPlanDisplay';
import WeeklyMealPlanGrid from '../components/meals/WeeklyMealPlanGrid';
import './MealPlannerPage.css';

/**
 * Page de planification de repas intelligente
 * Permet de générer des repas en fonction des besoins nutritionnels
 * et des aliments disponibles dans le frigo
 * Version améliorée avec génération automatique de repas hebdomadaires
 */
const MealPlannerPage = () => {
  // États locaux
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' ou 'fridge'
  const [planCreated, setPlanCreated] = useState(false);
  const [planName, setPlanName] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [planOptions, setPlanOptions] = useState(null);
  const [generatorMode, setGeneratorMode] = useState('weekly'); // 'weekly', 'individual', 'none'
  const [fridgeStep, setFridgeStep] = useState(1); // 1: Sélection frigo, 2: Génération repas
  const [viewMode, setViewMode] = useState('grid'); // 'list' ou 'grid' pour l'affichage des repas
  
  // Contextes
  const { dietType, ketoProfile, calorieTarget, macroTargets, intermittentFasting } = useUser();
  const { createEmptyPlan, currentPlan } = useMealPlan();
  
  // Réinitialiser le message de succès après un certain temps
  useEffect(() => {
    if (planCreated) {
      const timer = setTimeout(() => {
        setPlanCreated(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [planCreated]);
  
  // Création d'un plan vide
  const handleCreateEmptyPlan = () => {
    // Créer les dates pour cette semaine
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche de cette semaine
    
    // Formater les dates au format YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDateStr = formatDate(startOfWeek);
    const endDateStr = formatDate(endOfWeek);
    
    // Formater les dates pour l'affichage
    const displayStartDate = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
    const displayEndDate = `${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
    const displayName = `Plan du ${displayStartDate} au ${displayEndDate}`;
    
    // Créer le plan avec les options avancées si disponibles
    const planId = createEmptyPlan(
      displayName,
      startDateStr,
      endDateStr,
      dietType,
      planOptions // Passer les options avancées au plan
    );
    
    if (planId) {
      setPlanCreated(true);
      setPlanName(displayName);
      setGeneratorMode('none'); // Réinitialiser le mode de génération
    }
  };
  
  // Génération d'un plan personnalisé avec les options avancées
  const handleGeneratePlan = () => {
    handleCreateEmptyPlan();
    // Afficher le générateur de repas automatique après la création du plan
    setGeneratorMode('weekly');
  };
  
  // Changement d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Réinitialiser l'étape de l'onglet frigo quand on change d'onglet
    if (tab === 'fridge') {
      setFridgeStep(1);
    } else {
      // Si on revient à l'onglet weekly, réinitialiser le mode de générateur
      setGeneratorMode('none');
    }
  };
  
  // Changement du mode d'affichage des repas (liste ou grille)
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list');
  };
  
  // Gestionnaire pour les changements d'options avancées
  const handleOptionsChange = (options) => {
    setPlanOptions(options);
  };
  
  // Passer à l'étape de génération des repas dans l'onglet frigo
  const goToFridgeMealGeneration = () => {
    setFridgeStep(2);
  };
  
  // Afficher le générateur de repas individuel
  const showIndividualGenerator = () => {
    setGeneratorMode('individual');
  };
  
  // Afficher le générateur hebdomadaire
  const showWeeklyGenerator = () => {
    setGeneratorMode('weekly');
  };
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Helmet>
        <title>Planificateur de repas | Keto Meal Planner</title>
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-heading">Planificateur de repas</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Générez des plans de repas adaptés à vos besoins nutritionnels et préférences alimentaires.
        </p>
      </div>
      
      {/* Navigation par onglets */}
      <div className="border-b border-border-color mb-8">
        <div className="flex flex-wrap -mb-px">
          <button 
            className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'weekly' 
                ? 'border-primary-500 text-primary-500' 
                : 'border-transparent text-text-secondary hover:text-primary-600 hover:border-primary-300'
            }`}
            onClick={() => handleTabChange('weekly')}
          >
            <FaCalendarAlt className="mr-2" />
            <span>Planification hebdomadaire</span>
          </button>
          <button 
            className={`mr-4 py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'fridge' 
                ? 'border-primary-500 text-primary-500' 
                : 'border-transparent text-text-secondary hover:text-primary-600 hover:border-primary-300'
            }`}
            onClick={() => handleTabChange('fridge')}
          >
            <FaUtensils className="mr-2" />
            <span>Quoi dans mon frigo ?</span>
          </button>
        </div>
      </div>
      
      {/* Contenu de l'onglet actif */}
      <div className="mt-6">
        {activeTab === 'weekly' && (
          <div className="animate-fadeIn">
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">Planification hebdomadaire</h2>
              <p className="text-text-secondary mb-6">
                Créez un plan de repas complet pour la semaine en fonction de vos besoins caloriques 
                et vos objectifs nutritionnels.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="card bg-bg-secondary p-4">
                  <h3 className="font-medium text-lg text-text-primary mb-2">Régime</h3>
                  <p className="text-primary-600 font-medium">{dietType === 'keto_standard' ? 'Keto Standard' : 'Keto Alcalin'}</p>
                  <p className="text-text-secondary">Profil: {ketoProfile || 'standard'}</p>
                </div>
                
                <div className="card bg-bg-secondary p-4">
                  <h3 className="font-medium text-lg text-text-primary mb-2">Calories</h3>
                  <p className="text-primary-600 font-medium">{calorieTarget} kcal/jour</p>
                </div>
                
                <div className="card bg-bg-secondary p-4">
                  <h3 className="font-medium text-lg text-text-primary mb-2">Macros quotidiennes</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge bg-amber-100 text-amber-800">Lipides: {macroTargets.fat}g</span>
                    <span className="badge bg-red-100 text-red-800">Protéines: {macroTargets.protein}g</span>
                    <span className="badge bg-blue-100 text-blue-800">Glucides: {macroTargets.carbs}g</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Affichage du calendrier de jeûne intermittent si activé */}
            {intermittentFasting.enabled && (
              <FastingScheduleDisplay fastingConfig={intermittentFasting} />
            )}
            
            {/* Section d'options avancées */}
            <div className="mb-6">
              <button
                className="flex items-center text-primary-500 hover:text-primary-700 transition-colors duration-200 mb-4"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              >
                <FaCog className="mr-2" />
                <span className="font-medium">
                  {showAdvancedOptions ? 'Masquer les options avancées' : 'Afficher les options avancées'}
                </span>
              </button>
              
              {showAdvancedOptions && (
                <MealPlanOptions onOptionsChange={handleOptionsChange} />
              )}
            </div>
            
            {/* Boutons de création de plan si aucun plan n'existe encore */}
            {!currentPlan && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-center mb-4 text-primary-500 text-3xl">
                    <FaUtensils />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-4 text-center">Générer un plan personnalisé</h3>
                  <p className="text-text-secondary mb-6 text-center">
                    Créez un plan de repas complet pour la semaine en fonction de vos besoins nutritionnels
                    {showAdvancedOptions && ' et de vos préférences avancées'}.
                  </p>
                  <button 
                    className="btn-primary w-full mt-auto"
                    onClick={handleGeneratePlan}
                  >
                    Générer mon plan
                  </button>
                </div>
                
                <div className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-center mb-4 text-primary-500 text-3xl">
                    <FaCalendarAlt />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-4 text-center">Créer un plan vide</h3>
                  <p className="text-text-secondary mb-6 text-center">
                    Commencez avec un plan vide et ajoutez vos propres repas manuellement.
                  </p>
                  <button 
                    className="btn-outline w-full mt-auto"
                    onClick={handleCreateEmptyPlan}
                  >
                    Créer un plan vide
                  </button>
                </div>
              </div>
            )}
            
            {/* Message de plan créé si nécessaire */}
            {planCreated && (
              <div className="bg-success bg-opacity-10 border-l-4 border-success text-success p-4 rounded mb-8">
                <p>
                  Votre plan "{planName}" a été créé avec succès. 
                  {generatorMode === 'weekly' 
                    ? ' Utilisez le générateur ci-dessous pour remplir automatiquement votre semaine.' 
                    : ' Vous pouvez maintenant ajouter des repas.'}
                </p>
              </div>
            )}
            
            {/* Si un plan existe, afficher les boutons de génération de repas */}
            {currentPlan && generatorMode === 'none' && (
              <div className="meal-generation-options mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-4">Génération de repas</h2>
                <p className="text-text-secondary mb-4">
                  Choisissez comment vous souhaitez générer les repas pour votre plan.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card hover:shadow-md p-5">
                    <h3 className="text-lg font-semibold mb-3">Génération automatique</h3>
                    <p className="text-text-secondary mb-4">
                      Générez automatiquement tous les repas de la semaine en un seul clic.
                    </p>
                    <button 
                      className="btn-primary w-full"
                      onClick={showWeeklyGenerator}
                    >
                      Générer toute la semaine
                    </button>
                  </div>
                  
                  <div className="card hover:shadow-md p-5">
                    <h3 className="text-lg font-semibold mb-3">Génération manuelle</h3>
                    <p className="text-text-secondary mb-4">
                      Générez des repas individuels en choisissant le jour et le type de repas.
                    </p>
                    <button 
                      className="btn-outline w-full"
                      onClick={showIndividualGenerator}
                    >
                      Générer repas par repas
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Afficher le générateur hebdomadaire automatique si sélectionné */}
            {currentPlan && generatorMode === 'weekly' && (
              <div className="meal-generator-container mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-text-primary">Générateur automatique</h2>
                  <button 
                    className="text-text-secondary hover:text-primary-500 text-sm"
                    onClick={() => setGeneratorMode('none')}
                  >
                    Changer de mode &times;
                  </button>
                </div>
                <WeeklyMealGenerator />
              </div>
            )}
            
            {/* Afficher le générateur de repas individuel si sélectionné */}
            {currentPlan && generatorMode === 'individual' && (
              <div className="meal-generator-container mb-8">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-text-primary">Générateur individuel</h2>
                  <button 
                    className="text-text-secondary hover:text-primary-500 text-sm"
                    onClick={() => setGeneratorMode('none')}
                  >
                    Changer de mode &times;
                  </button>
                </div>
                <MealGeneratorForPlan />
              </div>
            )}
            
            {/* Affichage du plan de repas hebdomadaire si un plan existe */}
            {currentPlan && (
              <div className="meal-plan-display">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-text-primary">Plan de repas</h2>
                  
                  {/* Bouton de changement de vue (liste ou grille) */}
                  <button 
                    className="view-toggle-button"
                    onClick={toggleViewMode}
                    title={viewMode === 'list' ? 'Afficher en grille' : 'Afficher en liste'}
                  >
                    {viewMode === 'list' ? <FaThLarge /> : <FaListUl />}
                  </button>
                </div>
                
                {viewMode === 'list' ? (
                  <WeeklyMealPlanDisplay />
                ) : (
                  <WeeklyMealPlanGrid />
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'fridge' && (
          <FridgeProvider>
            <div className="animate-fadeIn">
              <div className="mb-8">
                <div className="border-b border-border-color mb-6">
                  <div className="flex">
                    <button
                      className={`py-3 px-6 border-b-2 ${
                        fridgeStep === 1 
                          ? 'border-primary-500 text-primary-500 font-medium' 
                          : 'border-transparent text-text-secondary'
                      }`}
                      onClick={() => setFridgeStep(1)}
                    >
                      1. Mon frigo
                    </button>
                    <button
                      className={`py-3 px-6 border-b-2 ${
                        fridgeStep === 2 
                          ? 'border-primary-500 text-primary-500 font-medium' 
                          : 'border-transparent text-text-secondary'
                      }`}
                      onClick={() => fridgeStep === 1 ? null : setFridgeStep(2)}
                    >
                      2. Générer des repas
                    </button>
                  </div>
                </div>
                
                {fridgeStep === 1 ? (
                  <div>
                    <FridgeSelector />
                    <div className="flex justify-end mt-6">
                      <button
                        className="btn-primary"
                        onClick={goToFridgeMealGeneration}
                      >
                        Étape suivante : Générer des repas
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <MealGeneratorFromFridge />
                  </div>
                )}
              </div>
            </div>
          </FridgeProvider>
        )}
      </div>
    </div>
  );
};

export default MealPlannerPage;
