import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './HomePage.css';

const HomePage = () => {
  const { theme } = useTheme();

  return (
    <div className={`home-page ${theme}`}>
      <div className="home-content">
        <h1 className="page-title">
          Bienvenue sur Keto Meal Planner
        </h1>
        <p className="intro-text">
          Votre assistant personnel pour la planification de repas keto standard et keto alcalin.
        </p>
        <div className="features-card">
          <h2 className="features-title">Fonctionnalités à venir:</h2>
          <ul className="features-list">
            <li>Calcul personnalisé des besoins caloriques et macronutriments</li>
            <li>Génération de plans de repas équilibrés</li>
            <li>Base de données d'aliments avec valeurs nutritionnelles et pH</li>
            <li>Recettes keto avec calcul automatique des valeurs nutritionnelles</li>
            <li>Liste de courses générée à partir de votre plan de repas</li>
            <li>Suivi de poids et progression vers vos objectifs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;