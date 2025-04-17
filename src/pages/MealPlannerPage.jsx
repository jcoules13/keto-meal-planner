import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useUser } from '../contexts/UserContext';
import { FridgeProvider } from '../contexts/FridgeContext';
import FridgeSelector from '../components/meals/FridgeSelector';
import MealGenerator from '../components/meals/MealGenerator';
import './MealPlannerPage.css';

/**
 * Page de planification de repas intelligente
 * Permet de générer des repas en fonction des besoins nutritionnels
 * et des aliments disponibles dans le frigo
 */
const MealPlannerPage = () => {
  // États locaux
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' ou 'fridge'
  const [planCreated, setPlanCreated] = useState(false);
  const [planName, setPlanName] = useState('');
  
  // Contextes
  const { dietType, ketoProfile, calorieTarget, macroTargets } = useUser();
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
    
    // Créer le plan
    const planId = createEmptyPlan(
      displayName,
      startDateStr,
      endDateStr,
      dietType
    );
    
    if (planId) {
      setPlanCreated(true);
      setPlanName(displayName);
    }
  };
  
  // Génération d'un plan personnalisé (à implémenter ultérieurement)
  const handleGeneratePlan = () => {
    // Pour l'instant, créer un plan vide par défaut
    handleCreateEmptyPlan();
    
    // Ici, vous pourriez implémenter une logique de génération de plan plus avancée
    console.log("Génération de plan personnalisé - fonctionnalité à implémenter");
  };
  
  // Changement d'onglet
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="meal-planner-page">
      <Helmet>
        <title>Planificateur de repas | Keto Meal Planner</title>
      </Helmet>
      
      <div className="page-header">
        <h1>Planificateur de repas</h1>
        <p className="page-description">
          Générez des plans de repas adaptés à vos besoins nutritionnels et préférences alimentaires.
        </p>
      </div>
      
      {/* Navigation par onglets */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => handleTabChange('weekly')}
          >
            <FaCalendarAlt />
            <span>Planification hebdomadaire</span>
          </button>
          <button 
            className={`tab ${activeTab === 'fridge' ? 'active' : ''}`}
            onClick={() => handleTabChange('fridge')}
          >
            <FaUtensils />
            <span>Quoi dans mon frigo ?</span>
          </button>
        </div>
      </div>
      
      {/* Contenu de l'onglet actif */}
      <div className="tab-content">
        {activeTab === 'weekly' && (
          <div className="weekly-planner">
            <div className="planner-intro">
              <h2>Planification hebdomadaire</h2>
              <p>
                Créez un plan de repas complet pour la semaine en fonction de vos besoins caloriques 
                et vos objectifs nutritionnels.
              </p>
              <div className="nutrition-summary">
                <div className="nutrition-goal">
                  <h3>Régime</h3>
                  <p className="diet-type">{dietType === 'keto_standard' ? 'Keto Standard' : 'Keto Alcalin'}</p>
                  <p className="keto-profile">Profil: {ketoProfile || 'prise_masse'}</p>
                </div>
                <div className="nutrition-goal">
                  <h3>Calories</h3>
                  <p className="target">{calorieTarget} kcal/jour</p>
                </div>
                <div className="nutrition-goal">
                  <h3>Macros quotidiennes</h3>
                  <div className="macro-targets">
                    <span className="macro fat">Lipides: {macroTargets.fat}g</span>
                    <span className="macro protein">Protéines: {macroTargets.protein}g</span>
                    <span className="macro carbs">Glucides: {macroTargets.carbs}g</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="action-container">
              <div className="action-card">
                <div className="action-icon">
                  <FaUtensils />
                </div>
                <h3>Générer un plan personnalisé</h3>
                <p>
                  Créez un plan de repas complet pour la semaine en fonction de vos besoins nutritionnels.
                </p>
                <button 
                  className="primary-button"
                  onClick={handleGeneratePlan}
                >
                  Générer mon plan
                </button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">
                  <FaCalendarAlt />
                </div>
                <h3>Créer un plan vide</h3>
                <p>
                  Commencez avec un plan vide et ajoutez vos propres repas manuellement.
                </p>
                <button 
                  className="secondary-button"
                  onClick={handleCreateEmptyPlan}
                >
                  Créer un plan vide
                </button>
              </div>
            </div>
            
            {/* Message de plan créé si nécessaire */}
            {planCreated && (
              <div className="success-message">
                <p>
                  Votre plan "{planName}" a été créé avec succès. 
                  Vous pouvez maintenant ajouter des repas.
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'fridge' && (
          <FridgeProvider>
            <div className="fridge-planner">
              <div className="tab-navigation">
                <button
                  className="tab-button active"
                >
                  1. Mon frigo
                </button>
                <button
                  className="tab-button"
                >
                  2. Générer des repas
                </button>
              </div>
              
              <div className="tab-content">
                <div className="tab-panel">
                  <FridgeSelector />
                  <div className="navigation-actions">
                    <button
                      className="next-step-button"
                    >
                      Étape suivante : Générer des repas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FridgeProvider>
        )}
      </div>
    </div>
  );
};

export default MealPlannerPage;