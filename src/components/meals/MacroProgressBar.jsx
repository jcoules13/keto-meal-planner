import React from 'react';
import './MacroProgressBar.css';

/**
 * Composant de barre de progression pour les macronutriments
 * Affiche une barre de progression pour un macronutriment avec valeur actuelle/cible
 * 
 * @param {Object} props 
 * @param {string} props.type - Type de macro ('calories', 'protein', 'fat', 'carbs')
 * @param {number} props.current - Valeur actuelle
 * @param {number} props.target - Valeur cible
 * @param {string} props.label - Étiquette à afficher (optionnel)
 * @param {string} props.unit - Unité de mesure (optionnel, par défaut 'g', 'kcal' pour calories)
 */
const MacroProgressBar = ({ type, current, target, label, unit }) => {
  // Valeurs par défaut
  const defaultUnit = type === 'calories' ? 'kcal' : 'g';
  const displayUnit = unit || defaultUnit;
  const displayLabel = label || type;
  
  // Calculer le pourcentage avec une limite à 100%
  const percentage = Math.min(100, ((current || 0) / (target || 1)) * 100);
  
  // Déterminer les classes CSS selon le type
  const barClassNames = {
    calories: 'calories-fill',
    protein: 'protein-fill',
    fat: 'fat-fill',
    carbs: 'carbs-fill'
  };
  
  // Déterminer la classe pour la couleur de texte selon le type
  const textClassNames = {
    calories: 'calories-text',
    protein: 'protein-text',
    fat: 'fat-text',
    carbs: 'carbs-text'
  };
  
  return (
    <div className="macro-progress">
      <div className="progress-label">
        <span className={textClassNames[type] || ''}>
          {displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1)}
        </span>
        <span>
          <span className={textClassNames[type] || ''}>{current || 0}</span> / {target || 0} {displayUnit}
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${barClassNames[type] || ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MacroProgressBar;