import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaUtensils, FaShoppingBasket, FaCalendarAlt } from 'react-icons/fa';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useUser } from '../contexts/UserContext';
import { FridgeProvider } from '../contexts/FridgeContext';
import './MealPlannerPage.css';

// Composants à importer une fois créés
// import FridgeSelector from '../components/meals/FridgeSelector';
// import MealGenerator from '../components/meals/MealGenerator';

/**
 * Page de planification de repas intelligente
 * Permet de générer des repas en fonction des besoins nutritionnels
 * et des aliments disponibles dans le frigo
 */
const MealPlannerPage = () => {
  // États locaux
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' ou 'fridge'
  
  // Contextes
  const { dietType, ketoProfile, calorieTarget, macroTargets } = useUser();
  const { createEmptyPlan } = useMealPlan();
  
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
            <FaShoppingBasket />
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
                  <p className="keto-profile">Profil: {ketoProfile || 'Standard'}</p>
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
                <button className="primary-button">
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
                <button className="secondary-button">
                  Créer un plan vide
                </button>
              </div>
            </div>
            
            {/* Composant à implémenter */}
            {/* <MealGenerator mode="weekly" /> */}
          </div>
        )}
        
        {activeTab === 'fridge' && (
          <FridgeProvider>
            <div className="fridge-planner">
              <div className="planner-intro">
                <h2>Quoi dans mon frigo ?</h2>
                <p>
                  Sélectionnez les aliments disponibles dans votre réfrigérateur et vos placards, 
                  et nous générerons des repas adaptés à vos besoins nutritionnels avec ces ingrédients.
                </p>
              </div>
              
              {/* Composants à implémenter */}
              <div className="fridge-content">
                <p className="temporary-message">
                  Fonctionnalité en cours de développement. Cette section vous permettra de:
                </p>
                <ul className="feature-list">
                  <li>Sélectionner les aliments disponibles chez vous</li>
                  <li>Spécifier les quantités approximatives</li>
                  <li>Générer des repas pour la journée en utilisant ces ingrédients</li>
                  <li>Ajouter ces repas à votre plan hebdomadaire</li>
                </ul>
              </div>
              {/* <FridgeSelector /> */}
              {/* <MealGenerator mode="fridge" /> */}
            </div>
          </FridgeProvider>
        )}
      </div>
    </div>
  );
};

export default MealPlannerPage;
