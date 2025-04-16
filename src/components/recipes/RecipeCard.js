import React from 'react';
import { useRecipe } from '../../contexts/RecipeContext';
import './RecipeCard.css';

/**
 * Composant d'affichage d'une recette sous forme de carte
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.recipe - Données de la recette à afficher
 * @param {Function} props.onClick - Fonction appelée au clic sur la carte
 */
const RecipeCard = ({ recipe, onClick }) => {
  const { toggleFavorite } = useRecipe();
  
  // Gérer le clic sur le bouton de favori
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Éviter de déclencher onClick du parent
    toggleFavorite(recipe.id);
  };
  
  // Formatage du temps total de préparation + cuisson
  const getTotalTime = () => {
    const total = recipe.prepTime + recipe.cookTime;
    if (total >= 60) {
      const hours = Math.floor(total / 60);
      const minutes = total % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${total} min`;
  };
  
  // Formater les macronutriments sous forme de pourcentages
  const formatMacros = () => {
    const { protein, fat, netCarbs } = recipe.nutritionPerServing;
    const totalCal = 
      (protein * 4) + (fat * 9) + (netCarbs * 4);
      
    const proteinPercent = Math.round((protein * 4 / totalCal) * 100);
    const fatPercent = Math.round((fat * 9 / totalCal) * 100);
    const carbsPercent = Math.round((netCarbs * 4 / totalCal) * 100);
    
    return { proteinPercent, fatPercent, carbsPercent };
  };
  
  const { proteinPercent, fatPercent, carbsPercent } = formatMacros();
  
  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card-header">
        <h3 className="recipe-card-title">{recipe.name}</h3>
        <button 
          className={`favorite-button ${recipe.isFavorite ? 'is-favorite' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={recipe.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          {recipe.isFavorite ? '★' : '☆'}
        </button>
      </div>
      
      <p className="recipe-card-description">{recipe.description}</p>
      
      <div className="recipe-card-meta">
        <div className="recipe-meta-item">
          <span className="meta-icon">⏱️</span>
          <span className="meta-text">{getTotalTime()}</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">🍽️</span>
          <span className="meta-text">{recipe.servings} {recipe.servings > 1 ? 'portions' : 'portion'}</span>
        </div>
        <div className="recipe-meta-item">
          <span className="meta-icon">🔥</span>
          <span className="meta-text">{recipe.nutritionPerServing.calories} kcal</span>
        </div>
      </div>
      
      <div className="recipe-card-macros">
        <div className="macro-bar">
          <div className="macro-segment" style={{ width: `${fatPercent}%`, backgroundColor: 'var(--fat-color)' }}></div>
          <div className="macro-segment" style={{ width: `${proteinPercent}%`, backgroundColor: 'var(--protein-color)' }}></div>
          <div className="macro-segment" style={{ width: `${carbsPercent}%`, backgroundColor: 'var(--carbs-color)' }}></div>
        </div>
        <div className="macro-legend">
          <div className="macro-legend-item">
            <span className="macro-color" style={{ backgroundColor: 'var(--fat-color)' }}></span>
            <span className="macro-label">Lipides {fatPercent}%</span>
          </div>
          <div className="macro-legend-item">
            <span className="macro-color" style={{ backgroundColor: 'var(--protein-color)' }}></span>
            <span className="macro-label">Protéines {proteinPercent}%</span>
          </div>
          <div className="macro-legend-item">
            <span className="macro-color" style={{ backgroundColor: 'var(--carbs-color)' }}></span>
            <span className="macro-label">Glucides {carbsPercent}%</span>
          </div>
        </div>
      </div>
      
      <div className="recipe-card-footer">
        <div className="recipe-tags">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="recipe-tag">{tag}</span>
          ))}
          {recipe.tags.length > 3 && <span className="recipe-tag">+{recipe.tags.length - 3}</span>}
        </div>
        
        <div className="recipe-indicators">
          {recipe.isKeto && (
            <span className="recipe-indicator keto-indicator" title="Recette keto">K</span>
          )}
          {recipe.isAlkaline && (
            <span className="recipe-indicator alkaline-indicator" title="Recette alcaline">A</span>
          )}
          {recipe.isUserCreated && (
            <span className="recipe-indicator custom-indicator" title="Recette personnalisée">P</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;