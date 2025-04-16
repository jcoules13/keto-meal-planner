import React from 'react';
import './MacronutrientChart.css';

/**
 * Composant pour afficher les proportions de macronutriments sous forme de barres
 * @param {Object} props - Les propriétés du composant
 * @param {number} props.protein - Pourcentage de protéines
 * @param {number} props.fat - Pourcentage de lipides
 * @param {number} props.carbs - Pourcentage de glucides
 * @param {string} props.size - Taille du graphique ('small', 'medium', 'large')
 */
const MacronutrientChart = ({ protein, fat, carbs, size = 'medium' }) => {
  // Vérifier que les pourcentages totalisent 100%
  const total = protein + fat + carbs;
  
  let adjustedProtein = protein;
  let adjustedFat = fat;
  let adjustedCarbs = carbs;
  
  if (total !== 100) {
    // Ajuster proportionnellement
    const factor = 100 / total;
    adjustedProtein = Math.round(protein * factor);
    adjustedFat = Math.round(fat * factor);
    adjustedCarbs = 100 - adjustedProtein - adjustedFat; // Pour s'assurer que le total est 100
  }
  
  // Déterminer si le ratio est conforme au régime keto
  // Critères keto: au moins 65% de lipides et maximum 10% de glucides
  const isKetogenic = adjustedFat >= 65 && adjustedCarbs <= 10;
  
  return (
    <div className={`macronutrient-chart ${size}`}>
      <div className="chart-header">
        <span className="chart-title">Macronutriments</span>
        <span className={`keto-badge ${isKetogenic ? 'ketogenic' : 'non-ketogenic'}`}>
          {isKetogenic ? 'Keto' : 'Non Keto'}
        </span>
      </div>
      
      <div className="chart-bars">
        <div className="chart-bar-container">
          <div className="chart-bar-label">
            <span className="macro-name">Protéines</span>
            <span className="macro-value">{adjustedProtein}%</span>
          </div>
          <div className="chart-bar">
            <div 
              className="chart-bar-fill protein-bar" 
              style={{ width: `${adjustedProtein}%` }}
            ></div>
          </div>
        </div>
        
        <div className="chart-bar-container">
          <div className="chart-bar-label">
            <span className="macro-name">Lipides</span>
            <span className="macro-value">{adjustedFat}%</span>
          </div>
          <div className="chart-bar">
            <div 
              className="chart-bar-fill fat-bar" 
              style={{ width: `${adjustedFat}%` }}
            ></div>
          </div>
        </div>
        
        <div className="chart-bar-container">
          <div className="chart-bar-label">
            <span className="macro-name">Glucides</span>
            <span className="macro-value">{adjustedCarbs}%</span>
          </div>
          <div className="chart-bar">
            <div 
              className="chart-bar-fill carbs-bar" 
              style={{ width: `${adjustedCarbs}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {size !== 'small' && (
        <div className="chart-footer">
          <div className="ideal-range">
            <span className="ideal-range-label">Cible Keto:</span>
            <span className="macro-ideal protein-ideal">20-25%</span>
            <span className="macro-ideal fat-ideal">70-75%</span>
            <span className="macro-ideal carbs-ideal">5-10%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MacronutrientChart;