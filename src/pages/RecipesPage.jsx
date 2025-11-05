import React, { useState, useMemo } from 'react';
import { useRecipe } from '../contexts/RecipeContext';
import { useFood } from '../contexts/FoodContext';
import { useTheme } from '../contexts/ThemeContext';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeDetail from '../components/recipes/RecipeDetail';
import RecipeForm from '../components/recipes/RecipeForm';
import './RecipesPage.css';

const RecipesPage = () => {
  const {
    recipes,
    loading,
    error,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite
  } = useRecipe();

  const { foods } = useFood();
  const { theme } = useTheme();

  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    mealType: '',
    isKeto: true,
    isAlkaline: false,
    isFavorite: false,
    maxPrepTime: null
  });

  // Filtrage côté client avec useMemo pour éviter recalculs
  const filteredRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];

    return recipes.filter(recipe => {
      // Filtre de recherche
      if (searchTerm && !recipe.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtre keto
      if (activeFilters.isKeto && !recipe.isKeto) {
        return false;
      }

      // Filtre alcalin
      if (activeFilters.isAlkaline && !recipe.isAlkaline) {
        return false;
      }

      // Filtre type de repas
      if (activeFilters.mealType && !recipe.tags?.includes(activeFilters.mealType)) {
        return false;
      }

      // Filtre temps de préparation
      if (activeFilters.maxPrepTime !== null && recipe.prepTime > activeFilters.maxPrepTime) {
        return false;
      }

      // Filtre favoris
      if (activeFilters.isFavorite && !recipe.isFavorite) {
        return false;
      }

      return true;
    });
  }, [recipes, searchTerm, activeFilters]);

  // Gérer la recherche
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Gérer les changements de filtres
  const handleFilterChange = (name, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveFilters({
      mealType: '',
      isKeto: true,
      isAlkaline: false,
      isFavorite: false,
      maxPrepTime: null
    });
  };

  // Sélectionner une recette pour voir les détails
  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowForm(false);
  };

  // Fermer les détails d'une recette
  const handleCloseDetail = () => {
    setSelectedRecipe(null);
  };

  // Ouvrir le formulaire de création
  const handleNewRecipe = () => {
    setEditingRecipe(null);
    setShowForm(true);
    setSelectedRecipe(null);
  };

  // Ouvrir le formulaire d'édition
  const handleEditRecipe = () => {
    setEditingRecipe(selectedRecipe);
    setShowForm(true);
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  // Gérer l'annulation du formulaire
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  if (loading) {
    return (
      <div className="recipes-page loading">
        <div className="loading-spinner">Chargement des recettes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recipes-page error">
        <div className="error-message">Erreur : {error}</div>
      </div>
    );
  }

  return (
    <div className={`recipes-page ${theme}`}>
      <div className="recipes-header">
        <h1>Recettes Keto</h1>
        <p>Découvrez et créez des recettes délicieuses adaptées à votre régime.</p>

        <div className="recipes-actions">
          <button className="btn-primary" onClick={handleNewRecipe}>
            + Nouvelle Recette
          </button>
        </div>
      </div>

      <div className="recipes-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher une recette..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={activeFilters.isKeto}
              onChange={(e) => handleFilterChange('isKeto', e.target.checked)}
            />
            Keto uniquement
          </label>

          <label>
            <input
              type="checkbox"
              checked={activeFilters.isAlkaline}
              onChange={(e) => handleFilterChange('isAlkaline', e.target.checked)}
            />
            Alcalin
          </label>

          <label>
            <input
              type="checkbox"
              checked={activeFilters.isFavorite}
              onChange={(e) => handleFilterChange('isFavorite', e.target.checked)}
            />
            Favoris seulement
          </label>

          <select
            value={activeFilters.mealType}
            onChange={(e) => handleFilterChange('mealType', e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="petit_dejeuner">Petit déjeuner</option>
            <option value="dejeuner">Déjeuner</option>
            <option value="souper">Souper</option>
            <option value="collation">Collation</option>
          </select>

          <button className="btn-secondary" onClick={handleResetFilters}>
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="recipes-content">
        {filteredRecipes.length === 0 ? (
          <div className="no-results">
            <p>Aucune recette ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleSelectRecipe(recipe)}
                onToggleFavorite={() => toggleFavorite(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={handleCloseDetail}
          onEdit={handleEditRecipe}
          onDelete={() => {
            deleteRecipe(selectedRecipe.id);
            handleCloseDetail();
          }}
          onToggleFavorite={() => toggleFavorite(selectedRecipe.id)}
        />
      )}

      {showForm && (
        <RecipeForm
          recipe={editingRecipe}
          onSubmit={(recipeData) => {
            if (editingRecipe) {
              updateRecipe(recipeData, foods);
            } else {
              addRecipe(recipeData, foods);
            }
            handleFormSubmit();
          }}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default RecipesPage;
