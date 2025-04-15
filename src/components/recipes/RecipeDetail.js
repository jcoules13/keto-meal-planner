import React from 'react';
import { useRecipe } from '../../contexts/RecipeContext';
import { useFood } from '../../contexts/FoodContext';
import './RecipeDetail.css';

/**
 * Composant pour afficher les détails d'une recette
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.recipe - La recette à afficher
 * @param {Function} props.onEdit - Fonction appelée lorsque l'utilisateur souhaite modifier la recette
 * @param {Function} props.onClose - Fonction appelée lorsque l'utilisateur ferme les détails
 */
const RecipeDetail = ({ recipe, onEdit, onClose }) => {
  const { toggleFavorite, deleteRecipe } = useRecipe();
  const { foods } = useFood();
  
  // Si pas de recette, ne rien afficher
  if (!recipe) return null;
  
  // Gérer le clic sur le bouton favori
  const handleFavoriteClick = () => {
    toggleFavorite(recipe.id);
  };
  
  // Gérer la suppression de la recette
  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la recette "${recipe.name}" ?`)) {
      deleteRecipe(recipe.id);
      onClose();
    }
  };
  
  // Obtenir le temps total (préparation + cuisson)
  const getTotalTime = () => {
    const total = recipe.prepTime + recipe.cookTime;
    if (total >= 60) {
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${total} min`;
  };
  
  // Calculer les pourcentages de macronutriments
  const calculateMacroPercentages = () => {
    const { protein, fat, netCarbs } = recipe.nutritionPerServing;
    const proteinCal = protein * 4;
    const fatCal = fat * 9;
    const carbsCal = netCarbs * 4;
    const totalCal = proteinCal + fatCal + carbsCal;
    
    return {
      protein: Math.round((proteinCal / totalCal) * 100) || 0,
      fat: Math.round((fatCal / totalCal) * 100) || 0,
      carbs: Math.round((carbsCal / totalCal) * 100) || 0
    };
  };
  
  const macroPercentages = calculateMacroPercentages();
  
  // Récupérer les noms des aliments à partir des IDs
  const getFoodName = (foodId) => {
    const food = foods.find(f => f.id === foodId);
    return food ? food.name : foodId;
  };
  
  return (
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <button className="close-button" onClick={onClose} aria-label="Fermer">
          &times;
        </button>
        <h2 className="recipe-detail-title">{recipe.name}</h2>
        <div className="recipe-actions">
          <button 
            className={`favorite-button ${recipe.isFavorite ? 'is-favorite' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={recipe.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {recipe.isFavorite ? '★' : '☆'}
          </button>
          {recipe.isUserCreated && (
            <>
              <button className="edit-button" onClick={onEdit} aria-label="Modifier">
                ✎
              </button>
              <button className="delete-button" onClick={handleDelete} aria-label="Supprimer">
                🗑
              </button>
            </>
          )}
        </div>
      </div>
      
      <p className="recipe-detail-description">{recipe.description}</p>
      
      <div className="recipe-meta-grid">
        <div className="recipe-meta-item">
          <span className="meta-icon">⏱️</span>
          <span className="meta-label">Temps total</span>
          <span className="meta-value">{getTotalTime()}</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">⚙️</span>
          <span className="meta-label">Préparation</span>
          <span className="meta-value">{recipe.prepTime} min</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">🔥</span>
          <span className="meta-label">Cuisson</span>
          <span className="meta-value">{recipe.cookTime} min</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">🍽️</span>
          <span className="meta-label">Portions</span>
          <span className="meta-value">{recipe.servings}</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">📊</span>
          <span className="meta-label">Calories/portion</span>
          <span className="meta-value">{recipe.nutritionPerServing.calories} kcal</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">🧪</span>
          <span className="meta-label">pH moyen</span>
          <span className="meta-value">{recipe.averagePHValue.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="recipe-detail-section">
        <h3 className="section-title">Macronutriments</h3>
        <div className="nutrition-bar">
          <div 
            className="nutrition-segment nutrition-fat" 
            style={{ width: `${macroPercentages.fat}%` }}
            title={`Lipides: ${recipe.nutritionPerServing.fat}g (${macroPercentages.fat}%)`}
          ></div>
          <div 
            className="nutrition-segment nutrition-protein" 
            style={{ width: `${macroPercentages.protein}%` }}
            title={`Protéines: ${recipe.nutritionPerServing.protein}g (${macroPercentages.protein}%)`}
          ></div>
          <div 
            className="nutrition-segment nutrition-carbs" 
            style={{ width: `${macroPercentages.carbs}%` }}
            title={`Glucides: ${recipe.nutritionPerServing.netCarbs}g (${macroPercentages.carbs}%)`}
          ></div>
        </div>
        
        <div className="nutrition-legend">
          <div className="legend-item">
            <div className="legend-color nutrition-fat"></div>
            <div className="legend-text">
              <div className="legend-label">Lipides</div>
              <div className="legend-value">{recipe.nutritionPerServing.fat}g ({macroPercentages.fat}%)</div>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-color nutrition-protein"></div>
            <div className="legend-text">
              <div className="legend-label">Protéines</div>
              <div className="legend-value">{recipe.nutritionPerServing.protein}g ({macroPercentages.protein}%)</div>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-color nutrition-carbs"></div>
            <div className="legend-text">
              <div className="legend-label">Glucides nets</div>
              <div className="legend-value">{recipe.nutritionPerServing.netCarbs}g ({macroPercentages.carbs}%)</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="recipe-detail-section">
        <h3 className="section-title">Ingrédients</h3>
        <ul className="ingredients-list">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="ingredient-item">
              <span className="ingredient-quantity">{ingredient.quantity} {ingredient.unit}</span>
              <span className="ingredient-name">{getFoodName(ingredient.foodId)}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="recipe-detail-section">
        <h3 className="section-title">Instructions</h3>
        <ol className="instructions-list">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="instruction-item">
              {instruction}
            </li>
          ))}
        </ol>
      </div>
      
      {recipe.tags.length > 0 && (
        <div className="recipe-detail-section">
          <h3 className="section-title">Tags</h3>
          <div className="tags-container">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="tag-item">{tag}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="recipe-indicators">
        <div className={`recipe-diet-indicator ${recipe.isKeto ? 'is-keto' : 'not-keto'}`}>
          {recipe.isKeto ? 'Keto ✓' : 'Non Keto ✗'}
        </div>
        <div className={`recipe-diet-indicator ${recipe.isAlkaline ? 'is-alkaline' : 'not-alkaline'}`}>
          {recipe.isAlkaline ? 'Alcalin ✓' : 'Non Alcalin ✗'}
        </div>
      </div>
      
      {recipe.isUserCreated && (
        <div className="recipe-custom-badge">
          Recette personnalisée
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;