import React, { useState } from 'react';
import { FridgeProvider } from '../contexts/FridgeContext';
import FridgeSelector from '../components/meals/FridgeSelector';
import MealGenerator from '../components/meals/MealGenerator';
import './MealPlannerPage.css';

/**
 * Page de planification de repas intégrant :
 * - Un sélecteur d'aliments du frigo
 * - Un générateur de repas basé sur les aliments disponibles
 */
const MealPlannerPage = () => {
  const [activeTab, setActiveTab] = useState('fridge-selector');

  return (
    <FridgeProvider>
      <div className="meal-planner-page">
        <div className="page-header">
          <h1>Planificateur de repas</h1>
          <p className="page-description">
            Générez des repas keto personnalisés en fonction de vos besoins nutritionnels
            et des aliments disponibles dans votre frigo.
          </p>
        </div>

        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'fridge-selector' ? 'active' : ''}`}
            onClick={() => setActiveTab('fridge-selector')}
          >
            1. Mon frigo
          </button>
          <button
            className={`tab-button ${activeTab === 'meal-generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('meal-generator')}
          >
            2. Générer des repas
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'fridge-selector' && (
            <div className="tab-panel">
              <FridgeSelector />
              <div className="navigation-actions">
                <button
                  className="next-step-button"
                  onClick={() => setActiveTab('meal-generator')}
                >
                  Étape suivante : Générer des repas
                </button>
              </div>
            </div>
          )}

          {activeTab === 'meal-generator' && (
            <div className="tab-panel">
              <MealGenerator />
              <div className="navigation-actions">
                <button
                  className="back-button"
                  onClick={() => setActiveTab('fridge-selector')}
                >
                  Retour : Mon frigo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FridgeProvider>
  );
};

export default MealPlannerPage;