import React, { useState, useEffect } from 'react';
import { useFood } from '../../contexts/FoodContext';
import { useUser } from '../../contexts/UserContext';
// Correction des imports pour utiliser les chemins corrects vers les composants
import FoodCard from '../../components/foods/FoodCard';
import FoodDetail from '../../components/foods/FoodDetail';
import SearchBar from '../../components/ui/SearchBar';
import FilterPanel from '../../components/ui/FilterPanel';
// Import direct du composant PageLayout au lieu d'utiliser un import indexé
import PageLayout from '../../components/layout/PageLayout';
import './FoodsPage.css';

const FoodsPage = () => {
  const { foods, categories, filters, setFilter, resetFilters, loading, error } = useFood();
  const { preferences, dietType } = useUser();
  
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Obtenir les aliments filtrés
  const filteredFoods = React.useMemo(() => {
    if (!foods || foods.length === 0) return [];
    
    return foods.filter(food => {
      // Filtre de recherche
      if (filters.query && !food.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      // Filtre de catégorie
      if (filters.category && food.category !== filters.category) {
        return false;
      }
      
      // Filtre keto
      if (filters.isKeto && !food.isKeto) {
        return false;
      }
      
      // Filtre alcalin
      if (filters.isAlkaline && !food.isAlkaline) {
        return false;
      }
      
      // Filtre de saison
      if (filters.seasonal && food.seasons && !food.seasons.includes(filters.currentSeason)) {
        return false;
      }
      
      // Filtre de glucides nets
      if (filters.maxNetCarbs !== null && 
          food.nutritionPer100g && 
          food.nutritionPer100g.netCarbs > filters.maxNetCarbs) {
        return false;
      }
      
      // Filtre de protéines
      if (filters.minProtein !== null && 
          food.nutritionPer100g && 
          food.nutritionPer100g.protein < filters.minProtein) {
        return false;
      }
      
      // Filtre de lipides
      if (filters.minFat !== null && 
          food.nutritionPer100g && 
          food.nutritionPer100g.fat < filters.minFat) {
        return false;
      }
      
      // Filtre de pH
      if (filters.minpH !== null && food.pHValue < filters.minpH) {
        return false;
      }
      
      if (filters.maxpH !== null && food.pHValue > filters.maxpH) {
        return false;
      }
      
      return true;
    });
  }, [foods, filters]);
  
  // Initialiser le filtre du régime en fonction du type de régime de l'utilisateur
  useEffect(() => {
    if (dietType === 'keto_alcalin') {
      setFilter('isAlkaline', true);
    }
  }, [dietType, setFilter]);
  
  const handleFoodClick = (food) => {
    setSelectedFood(food);
  };
  
  const closeDetail = () => {
    setSelectedFood(null);
  };
  
  const handleSearchChange = (value) => {
    setFilter('query', value);
  };
  
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };
  
  const handleCategoryChange = (category) => {
    setFilter('category', category);
  };
  
  const handleFilterChange = (name, value) => {
    setFilter(name, value);
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="loading-spinner">Chargement de la base de données alimentaire...</div>;
    }
    
    if (error) {
      return <div className="error-message">Une erreur est survenue : {error}</div>;
    }
    
    if (filteredFoods.length === 0) {
      return (
        <div className="no-results">
          <p>Aucun aliment ne correspond à vos critères de recherche.</p>
          <button onClick={resetFilters} className="reset-filters-btn">
            Réinitialiser les filtres
          </button>
        </div>
      );
    }
    
    return (
      <div className="foods-grid">
        {filteredFoods.map((food) => (
          <FoodCard 
            key={food.id} 
            food={food} 
            onClick={() => handleFoodClick(food)}
            isFavorite={preferences?.favoriteFoods?.includes(food.id) || false}
            isAlkaline={food.isAlkaline}
            isKeto={food.isKeto}
            currentSeason={filters.currentSeason}
          />
        ))}
      </div>
    );
  };
  
  return (
    <PageLayout title="Base de données alimentaire">
      <div className="foods-page">
        <div className="foods-header">
          <h1>Base de données alimentaire</h1>
          <p>Explorez notre sélection d'aliments compatibles avec le régime keto.</p>
          
          <div className="foods-tools">
            <SearchBar 
              value={filters.query} 
              onChange={handleSearchChange} 
              placeholder="Rechercher un aliment..." 
            />
            
            <button 
              className="filter-toggle-btn"
              onClick={toggleFilterPanel}
            >
              {showFilterPanel ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
          </div>
          
          {showFilterPanel && (
            <FilterPanel>
              <div className="filter-section">
                <h3>Catégories</h3>
                <div className="categories-filter">
                  <button 
                    className={`category-btn ${filters.category === '' ? 'active' : ''}`}
                    onClick={() => handleCategoryChange('')}
                  >
                    Tous
                  </button>
                  {categories && categories.map((category) => (
                    <button 
                      key={category}
                      className={`category-btn ${filters.category === category ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="filter-section">
                <h3>Type de régime</h3>
                <div className="diet-filters">
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox"
                      checked={filters.isKeto}
                      onChange={(e) => handleFilterChange('isKeto', e.target.checked)}
                    />
                    Keto standard
                  </label>
                  
                  <label className="filter-checkbox">
                    <input 
                      type="checkbox"
                      checked={filters.isAlkaline}
                      onChange={(e) => handleFilterChange('isAlkaline', e.target.checked)}
                    />
                    Keto alcalin
                  </label>
                </div>
              </div>
              
              <div className="filter-section">
                <h3>Saisonnalité</h3>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox"
                    checked={filters.seasonal}
                    onChange={(e) => handleFilterChange('seasonal', e.target.checked)}
                  />
                  De saison uniquement
                </label>
                <p className="season-info">Saison actuelle : {filters.currentSeason}</p>
              </div>
              
              <div className="filter-section">
                <h3>Valeurs nutritionnelles</h3>
                <div className="macro-filters">
                  <div className="filter-range">
                    <label>Max. glucides nets (g)</label>
                    <input 
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={filters.maxNetCarbs || 20}
                      onChange={(e) => handleFilterChange('maxNetCarbs', parseInt(e.target.value) || null)}
                    />
                    <span>{filters.maxNetCarbs || 'Tous'}</span>
                  </div>
                  
                  <div className="filter-range">
                    <label>Min. protéines (g)</label>
                    <input 
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={filters.minProtein || 0}
                      onChange={(e) => handleFilterChange('minProtein', parseInt(e.target.value) || null)}
                    />
                    <span>{filters.minProtein || '0'}</span>
                  </div>
                  
                  <div className="filter-range">
                    <label>Min. lipides (g)</label>
                    <input 
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={filters.minFat || 0}
                      onChange={(e) => handleFilterChange('minFat', parseInt(e.target.value) || null)}
                    />
                    <span>{filters.minFat || '0'}</span>
                  </div>
                </div>
              </div>
              
              {dietType === 'keto_alcalin' && (
                <div className="filter-section">
                  <h3>Valeur pH</h3>
                  <div className="ph-filter">
                    <div className="filter-range">
                      <label>pH minimum</label>
                      <input 
                        type="range"
                        min="0"
                        max="14"
                        step="0.5"
                        value={filters.minpH || 0}
                        onChange={(e) => handleFilterChange('minpH', parseFloat(e.target.value) || null)}
                      />
                      <span>{filters.minpH || 'Tous'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="filter-actions">
                <button 
                  className="reset-filters-btn"
                  onClick={resetFilters}
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            </FilterPanel>
          )}
        </div>
        
        <div className="foods-content">
          {renderContent()}
        </div>
        
        {selectedFood && (
          <FoodDetail 
            food={selectedFood} 
            onClose={closeDetail}
            isFavorite={preferences?.favoriteFoods?.includes(selectedFood.id) || false}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default FoodsPage;