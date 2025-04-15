import React from 'react';
import PropTypes from 'prop-types';
import { FiHeart, FiAlertCircle, FiCheck } from 'react-icons/fi';
import './FoodCard.css';

const FoodCard = ({ 
  food, 
  onClick, 
  isFavorite, 
  isAlkaline, 
  isKeto, 
  currentSeason 
}) => {
  // Vérifier si l'aliment est de saison
  const isSeasonal = food.seasons && food.seasons.includes(currentSeason);
  
  return (
    <div className="food-card" onClick={onClick}>
      <div className="food-card-header">
        <h3 className="food-name">{food.name}</h3>
        {isFavorite && <FiHeart className="favorite-icon" />}
      </div>
      
      <div className="food-card-badges">
        {isKeto && <span className="badge badge-keto">Keto</span>}
        {isAlkaline && <span className="badge badge-alkaline">Alcalin</span>}
        {isSeasonal && <span className="badge badge-seasonal">De saison</span>}
      </div>
      
      <div className="food-card-content">
        <div className="food-category">{food.category}</div>
        
        <div className="food-macros">
          <div className="macro-item">
            <span className="macro-value">{food.nutritionPer100g.calories}</span>
            <span className="macro-label">kcal</span>
          </div>
          <div className="macro-item">
            <span className="macro-value">{food.nutritionPer100g.protein}g</span>
            <span className="macro-label">Prot.</span>
          </div>
          <div className="macro-item">
            <span className="macro-value">{food.nutritionPer100g.fat}g</span>
            <span className="macro-label">Lipides</span>
          </div>
          <div className="macro-item">
            <span className="macro-value">{food.nutritionPer100g.netCarbs}g</span>
            <span className="macro-label">G. nets</span>
          </div>
        </div>
        
        {food.pHValue && (
          <div className="food-ph">
            <div 
              className={`ph-indicator ${
                food.pHValue < 7 ? 'acidic' : 
                food.pHValue === 7 ? 'neutral' : 'alkaline'
              }`}
            >
              pH {food.pHValue.toFixed(1)}
            </div>
          </div>
        )}
      </div>
      
      <div className="food-card-footer">
        <div className="food-compatibility">
          {isKeto ? (
            <div className="compatibility-item is-compatible">
              <FiCheck />
              <span>Compatible Keto</span>
            </div>
          ) : (
            <div className="compatibility-item not-compatible">
              <FiAlertCircle />
              <span>Non Keto</span>
            </div>
          )}
        </div>
        
        <button className="view-details-btn">Détails</button>
      </div>
    </div>
  );
};

FoodCard.propTypes = {
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
    seasons: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool,
  isAlkaline: PropTypes.bool,
  isKeto: PropTypes.bool,
  currentSeason: PropTypes.string
};

FoodCard.defaultProps = {
  isFavorite: false,
  isAlkaline: false,
  isKeto: true,
  currentSeason: 'été'
};

export default FoodCard;
