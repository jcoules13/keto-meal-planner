import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiHeart, FiShare2, FiPlus } from 'react-icons/fi';
import { useUser } from '../../../contexts/UserContext';
import PHIndicator from '../../ui/PHIndicator';
import SeasonalityIndicator from '../../ui/SeasonalityIndicator';
import './FoodDetail.css';

const FoodDetail = ({ food, onClose, isFavorite }) => {
  const { updatePreferences } = useUser();
  
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    // Implémentation à compléter avec la logique de gestion des favoris
    // updatePreferences({ ...preferences, favoriteFoods: [...] });
  };
  
  const handleAddToMeal = (e) => {
    e.stopPropagation();
    // Implémentation à compléter avec la logique d'ajout à un repas
  };
  
  const handleShare = (e) => {
    e.stopPropagation();
    // Implémentation à compléter avec la logique de partage
  };
  
  return (
    <div className="food-detail-overlay" onClick={onClose}>
      <div className="food-detail-container" onClick={(e) => e.stopPropagation()}>
        <div className="food-detail-header">
          <h2>{food.name}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="food-detail-content">
          <div className="food-detail-main">
            <div className="food-meta">
              <div className="food-category-tag">{food.category}</div>
              
              <div className="food-diet-tags">
                {food.isKeto && <div className="diet-tag keto">Keto</div>}
                {food.isAlkaline && <div className="diet-tag alkaline">Alcalin</div>}
              </div>
            </div>
            
            <div className="food-actions">
              <button 
                className={`action-btn favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
                onClick={handleFavoriteToggle}
              >
                <FiHeart />
                <span>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
              </button>
              
              <button className="action-btn add-btn" onClick={handleAddToMeal}>
                <FiPlus />
                <span>Ajouter à un repas</span>
              </button>
              
              <button className="action-btn share-btn" onClick={handleShare}>
                <FiShare2 />
                <span>Partager</span>
              </button>
            </div>
            
            <div className="food-description">
              <h3>Description</h3>
              <p>{food.description || "Aucune description disponible pour cet aliment."}</p>
            </div>
            
            <div className="food-nutrition">
              <h3>Valeurs nutritionnelles (pour 100g)</h3>
              
              <div className="nutrition-table">
                <div className="nutrition-row">
                  <div className="nutrition-label">Calories</div>
                  <div className="nutrition-value">{food.nutritionPer100g.calories} kcal</div>
                </div>
                
                <div className="nutrition-row">
                  <div className="nutrition-label">Protéines</div>
                  <div className="nutrition-value">{food.nutritionPer100g.protein} g</div>
                </div>
                
                <div className="nutrition-row">
                  <div className="nutrition-label">Lipides</div>
                  <div className="nutrition-value">{food.nutritionPer100g.fat} g</div>
                </div>
                
                <div className="nutrition-row">
                  <div className="nutrition-label">Glucides totaux</div>
                  <div className="nutrition-value">{food.nutritionPer100g.carbs} g</div>
                </div>
                
                <div className="nutrition-row">
                  <div className="nutrition-label">Fibres</div>
                  <div className="nutrition-value">{food.nutritionPer100g.fiber} g</div>
                </div>
                
                <div className="nutrition-row highlight">
                  <div className="nutrition-label">Glucides nets</div>
                  <div className="nutrition-value">{food.nutritionPer100g.netCarbs} g</div>
                </div>
                
                {food.nutritionPer100g.sodium && (
                  <div className="nutrition-row">
                    <div className="nutrition-label">Sodium</div>
                    <div className="nutrition-value">{food.nutritionPer100g.sodium} mg</div>
                  </div>
                )}
                
                {food.nutritionPer100g.potassium && (
                  <div className="nutrition-row">
                    <div className="nutrition-label">Potassium</div>
                    <div className="nutrition-value">{food.nutritionPer100g.potassium} mg</div>
                  </div>
                )}
                
                {food.nutritionPer100g.magnesium && (
                  <div className="nutrition-row">
                    <div className="nutrition-label">Magnésium</div>
                    <div className="nutrition-value">{food.nutritionPer100g.magnesium} mg</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="food-ph-section">
              <h3>Équilibre acido-basique</h3>
              <PHIndicator value={food.pHValue} />
              <p className="ph-explanation">
                {food.pHValue < 7 ? 
                  "Cet aliment est acidifiant pour l'organisme." : 
                  food.pHValue === 7 ? 
                  "Cet aliment est neutre pour l'équilibre acido-basique." : 
                  "Cet aliment est alcalinisant pour l'organisme."}
              </p>
            </div>
            
            <div className="food-seasonality">
              <h3>Saisonnalité</h3>
              <SeasonalityIndicator seasons={food.seasons} />
            </div>
            
            {food.commonUnitWeight && (
              <div className="food-serving">
                <h3>Portion typique</h3>
                <p>1 {food.unitName || "unité"} = environ {food.commonUnitWeight}g</p>
              </div>
            )}
            
            {food.allergens && food.allergens.length > 0 && (
              <div className="food-allergens">
                <h3>Allergènes</h3>
                <div className="allergens-list">
                  {food.allergens.map((allergen, index) => (
                    <span key={index} className="allergen-tag">{allergen}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="food-detail-sidebar">
            <div className="macros-chart">
              <h3>Répartition des macronutriments</h3>
              <div className="macro-bars">
                <div className="macro-bar">
                  <div className="macro-bar-label">Lipides</div>
                  <div className="macro-bar-container">
                    <div 
                      className="macro-bar-fill fat"
                      style={{ 
                        width: `${(food.nutritionPer100g.fat * 9 / food.nutritionPer100g.calories) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="macro-bar-value">{Math.round((food.nutritionPer100g.fat * 9 / food.nutritionPer100g.calories) * 100)}%</div>
                </div>
                
                <div className="macro-bar">
                  <div className="macro-bar-label">Protéines</div>
                  <div className="macro-bar-container">
                    <div 
                      className="macro-bar-fill protein"
                      style={{ 
                        width: `${(food.nutritionPer100g.protein * 4 / food.nutritionPer100g.calories) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="macro-bar-value">{Math.round((food.nutritionPer100g.protein * 4 / food.nutritionPer100g.calories) * 100)}%</div>
                </div>
                
                <div className="macro-bar">
                  <div className="macro-bar-label">Glucides</div>
                  <div className="macro-bar-container">
                    <div 
                      className="macro-bar-fill carbs"
                      style={{ 
                        width: `${(food.nutritionPer100g.netCarbs * 4 / food.nutritionPer100g.calories) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="macro-bar-value">{Math.round((food.nutritionPer100g.netCarbs * 4 / food.nutritionPer100g.calories) * 100)}%</div>
                </div>
              </div>
            </div>
            
            <div className="keto-compatibility">
              <h3>Compatibilité régime keto</h3>
              <div className={`compatibility-indicator ${food.isKeto ? 'compatible' : 'not-compatible'}`}>
                {food.isKeto ? 'Compatible' : 'Non compatible'}
              </div>
              <p className="compatibility-explanation">
                {food.isKeto ? 
                  `Cet aliment est approprié pour un régime keto avec seulement ${food.nutritionPer100g.netCarbs}g de glucides nets pour 100g.` : 
                  `Cet aliment contient ${food.nutritionPer100g.netCarbs}g de glucides nets pour 100g, ce qui est trop élevé pour un régime keto.`}
              </p>
            </div>
            
            {food.isAlkaline !== undefined && (
              <div className="alkaline-compatibility">
                <h3>Compatibilité régime keto alcalin</h3>
                <div className={`compatibility-indicator ${food.isAlkaline ? 'compatible' : 'not-compatible'}`}>
                  {food.isAlkaline ? 'Compatible' : 'Non compatible'}
                </div>
                <p className="compatibility-explanation">
                  {food.isAlkaline ? 
                    `Cet aliment est approprié pour un régime keto alcalin avec un pH de ${food.pHValue}.` : 
                    `Cet aliment a un pH de ${food.pHValue}, ce qui est trop acide pour un régime keto alcalin optimal.`}
                </p>
              </div>
            )}
          </div>
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
    description: PropTypes.string,
    nutritionPer100g: PropTypes.shape({
      calories: PropTypes.number.isRequired,
      protein: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      carbs: PropTypes.number,
      fiber: PropTypes.number,
      netCarbs: PropTypes.number.isRequired,
      sodium: PropTypes.number,
      potassium: PropTypes.number,
      magnesium: PropTypes.number
    }).isRequired,
    pHValue: PropTypes.number,
    isKeto: PropTypes.bool.isRequired,
    isAlkaline: PropTypes.bool,
    seasons: PropTypes.arrayOf(PropTypes.string),
    commonUnitWeight: PropTypes.number,
    unitName: PropTypes.string,
    allergens: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool
};

FoodDetail.defaultProps = {
  isFavorite: false
};

export default FoodDetail;