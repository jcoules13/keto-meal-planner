import React, { useState, useEffect } from 'react';
import { useRecipe } from '../contexts/RecipeContext';
import RecipeCard from '../components/recipes/RecipeCard';
import RecipeDetail from '../components/recipes/RecipeDetail';
import RecipeForm from '../components/recipes/RecipeForm';
import './RecipesPage.css';

const RecipesPage = () => {
  const { 
    recipes, 
    filteredRecipes, 
    loading, 
    error, 
    setFilter, 
    resetFilters 
  } = useRecipe();
  
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
  
  // Mettre à jour les filtres lorsqu'ils changent
  useEffect(() => {
    Object.entries(activeFilters).forEach(([name, value]) => {
      if (value !== undefined) {
        setFilter(name, value);
      }
    });
  }, [activeFilters, setFilter]);
  
  // Gérer la recherche
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilter('query', value);
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
    resetFilters();
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
  
  // Fermer le formulaire
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };
  
  // Rendu de la page
  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <h1 className="page-title">Recettes</h1>
        <button className="new-recipe-button" onClick={handleNewRecipe}>
          Nouvelle recette
        </button>
      </div>
      
      <div className="recipes-toolbar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher une recette..."
            value={searchTerm}
            onChange={handleSearch}
          />
          
          {searchTerm && (
            <button className="clear-search-button" onClick={() => {
              setSearchTerm('');
              setFilter('query', '');
            }}>
              &times;
            </button>
          )}
        </div>
        
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Type de repas</label>
            <select 
              className="filter-select"
              value={activeFilters.mealType}
              onChange={(e) => handleFilterChange('mealType', e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="petit-déjeuner">Petit-déjeuner</option>
              <option value="déjeuner">Déjeuner</option>
              <option value="dîner">Dîner</option>
              <option value="collation">Collation</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">Temps de préparation</label>
            <select 
              className="filter-select"
              value={activeFilters.maxPrepTime || ''}
              onChange={(e) => handleFilterChange('maxPrepTime', e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous les temps</option>
              <option value="15">Rapide (≤ 15 min)</option>
              <option value="30">Moyen (≤ 30 min)</option>
              <option value="60">Long (≤ 1h)</option>
            </select>
          </div>
          
          <div className="filter-group filter-checkboxes">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={activeFilters.isKeto} 
                onChange={(e) => handleFilterChange('isKeto', e.target.checked)}
              />
              Keto
            </label>
            
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={activeFilters.isAlkaline} 
                onChange={(e) => handleFilterChange('isAlkaline', e.target.checked)}
              />
              Alcalin
            </label>
            
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={activeFilters.isFavorite} 
                onChange={(e) => handleFilterChange('isFavorite', e.target.checked)}
              />
              Favoris
            </label>
          </div>
          
          <button className="reset-filters-button" onClick={handleResetFilters}>
            Réinitialiser les filtres
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des recettes...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>Une erreur est survenue lors du chargement des recettes:</p>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      ) : (
        <div className="recipes-content">
          {showForm ? (
            <div className="recipe-form-wrapper">
              <RecipeForm 
                initialRecipe={editingRecipe}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          ) : selectedRecipe ? (
            <div className="recipe-detail-wrapper">
              <RecipeDetail 
                recipe={selectedRecipe}
                onEdit={handleEditRecipe}
                onClose={handleCloseDetail}
              />
            </div>
          ) : (
            <>
              <div className="recipes-stats">
                <p>
                  {filteredRecipes.length} recette{filteredRecipes.length !== 1 ? 's' : ''} 
                  {searchTerm || activeFilters.mealType || activeFilters.isAlkaline || activeFilters.isFavorite || activeFilters.maxPrepTime ? ' (filtré)' : ''}
                </p>
              </div>
              
              {filteredRecipes.length > 0 ? (
                <div className="recipes-grid">
                  {filteredRecipes.map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onClick={() => handleSelectRecipe(recipe)}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-recipes">
                  <p>Aucune recette ne correspond à vos critères de recherche.</p>
                  {(searchTerm || activeFilters.mealType || activeFilters.isAlkaline || activeFilters.isFavorite || activeFilters.maxPrepTime) && (
                    <button className="reset-filters-button" onClick={handleResetFilters}>
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipesPage;