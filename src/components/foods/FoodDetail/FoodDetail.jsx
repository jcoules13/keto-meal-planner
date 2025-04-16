import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiHeart, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './FoodDetail.css';

const FoodDetail = ({ food, onClose, isFavorite }) => {
  // Calcul du pourcentage des macronutriments pour le graphique
  const calculateMacroPercentage = () => {
    const { protein, fat, netCarbs } = food.nutritionPer100g;
    const total = protein + fat + netCarbs;
    
    return {
      protein: Math.round((protein / total) * 100),
      fat: Math.round((fat / total) * 100),
      netCarbs: Math.round((netCarbs / total) * 100)
    };
  };
  
  const macroPercentages = calculateMacroPercentage();
  
  // Déterminer la classe de pH en fonction de la valeur
  const getPHClass = () => {
    if (!food.pHValue) return '';
    
    if (food.pHValue < 7) return 'acidic';
    if (food.pHValue === 7) return 'neutral';
    return 'alkaline';
  };
  
  return (
    <div className="food-detail-overlay">
      <div className="food-detail-container">
        <div className="food-detail-header">
          <h2 className="food-detail-name">{food.name}</h2>
          <div className="food-detail-actions">
            {isFavorite && <FiHeart className="favorite-icon" />}
            <button className="close-btn" onClick={onClose} aria-label="Fermer">
              <FiX />
            </button>
          </div>
        </div>
        
        <div className="food-detail-content">
          <div className="food-detail-info">
            <div className="food-category-badge">{food.category}</div>
            
            <div className="food-compatibility">
              <div className={`compatibility-item ${food.isKeto ? 'is-compatible' : 'not-compatible'}`}>
                {food.isKeto ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{food.isKeto ? 'Compatible Keto' : 'Non Keto'}</span>
              </div>
              
              <div className={`compatibility-item ${food.isAlkaline ? 'is-compatible' : 'not-compatible'}`}>
                {food.isAlkaline ? <FiCheckCircle /> : <FiAlertCircle />}
                <span>{food.isAlkaline ? 'Alcalin' : 'Acide'}</span>
              </div>
            </div>
            
            {food.seasons && (
              <div className="food-seasonality">
                <h3>Saisonnalité</h3>
                <div className="seasons-list">
                  {['printemps', 'été', 'automne', 'hiver'].map(season => (
                    <div 
                      key={season}
                      className={`season-badge ${food.seasons.includes(season) ? 'in-season' : 'out-season'}`}
                    >
                      {season}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {food.pHValue && (
              <div className="food-ph-info">
                <h3>Valeur pH</h3>
                <div className={`ph-value ${getPHClass()}`}>
                  {food.pHValue.toFixed(1)}
                </div>
                <div className="ph-scale">
                  <div className="ph-scale-bar">
                    <div 
                      className={`ph-marker ${getPHClass()}`} 
                      style={{ left: `${(food.pHValue / 14) * 100}%` }}
                    />
                  </div>
                  <div className="ph-scale-labels">
                    <span>0</span>
                    <span>7</span>
                    <span>14</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="food-nutrition">
            <h3>Valeurs nutritionnelles (pour 100g)</h3>
            
            <div className="nutrition-summary">
              <div className="nutrition-item">
                <span className="nutrition-value">{food.nutritionPer100g.calories}</span>
                <span className="nutrition-label">Calories</span>
              </div>
              
              <div className="nutrition-item">
                <span className="nutrition-value">{food.nutritionPer100g.protein}g</span>
                <span className="nutrition-label">Protéines</span>
              </div>
              
              <div className="nutrition-item">
                <span className="nutrition-value">{food.nutritionPer100g.fat}g</span>
                <span className="nutrition-label">Lipides</span>
              </div>
              
              <div className="nutrition-item">
                <span className="nutrition-value">{food.nutritionPer100g.netCarbs}g</span>
                <span className="nutrition-label">Glucides nets</span>
              </div>
            </div>
            
            <div className="macro-chart">
              <div 
                className="macro-bar protein" 
                style={{ width: `${macroPercentages.protein}%` }}
                title={`Protéines: ${macroPercentages.protein}%`}
              />
              <div 
                className="macro-bar fat" 
                style={{ width: `${macroPercentages.fat}%` }}
                title={`Lipides: ${macroPercentages.fat}%`}
              />
              <div 
                className="macro-bar carbs" 
                style={{ width: `${macroPercentages.netCarbs}%` }}
                title={`Glucides: ${macroPercentages.netCarbs}%`}
              />
            </div>
            
            <div className="macro-legend">
              <div className="legend-item">
                <div className="legend-color protein" />
                <span>Protéines</span>
              </div>
              <div className="legend-item">
                <div className="legend-color fat" />
                <span>Lipides</span>
              </div>
              <div className="legend-item">
                <div className="legend-color carbs" />
                <span>Glucides</span>
              </div>
            </div>
            
            {food.nutritionPer100g.fiber > 0 && (
              <div className="fiber-info">
                <span className="fiber-label">Fibres:</span>
                <span className="fiber-value">{food.nutritionPer100g.fiber}g</span>
              </div>
            )}
          </div>
          
          {food.commonUnitWeight && (
            <div className="serving-info">
              <h3>Portion commune</h3>
              <p>
                1 {food.unitName || 'portion'} = {food.commonUnitWeight}g
                <br />
                <span className="serving-calories">
                  {Math.round(food.nutritionPer100g.calories * food.commonUnitWeight / 100)} calories par {food.unitName || 'portion'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FoodDetail.propTypes = {
  food: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    nutritionPer100g: PropTypes.shape({
      calories: PropTypes.number.isRequired,
      protein: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      carbs: PropTypes.number,
      fiber: PropTypes.number,
      netCarbs: PropTypes.number.isRequired
    }).isRequired,
    pHValue: PropTypes.number,
    isKeto: PropTypes.bool.isRequired,
    isAlkaline: PropTypes.bool,
    seasons: PropTypes.arrayOf(PropTypes.string),
    commonUnitWeight: PropTypes.number,
    unitName: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool
};

FoodDetail.defaultProps = {
  isFavorite: false
};

export default FoodDetail;