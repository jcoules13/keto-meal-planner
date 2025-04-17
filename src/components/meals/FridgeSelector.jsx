import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { useFood } from '../../contexts/FoodContext';
import { useFridge } from '../../contexts/FridgeContext';
import './FridgeSelector.css';

/**
 * Composant permettant de sélectionner les aliments disponibles dans le frigo
 */
const FridgeSelector = () => {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  
  // Contextes
  const { foods, categories, searchFoods, getFoodById } = useFood();
  const { 
    selectedFoodDetails, 
    availableMacros, 
    foodCount,
    foodsByCategory,
    addFood, 
    updateFoodQuantity, 
    removeFood, 
    clearFridge,
    isInFridge
  } = useFridge();
  
  // Mettre à jour les résultats de recherche lorsque le terme de recherche change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = searchFoods(searchTerm);
    
    // Si une catégorie est sélectionnée, filtrer par catégorie
    const filteredResults = selectedCategory 
      ? results.filter(food => food.category === selectedCategory)
      : results;
    
    setSearchResults(filteredResults);
  }, [searchTerm, selectedCategory, searchFoods]);
  
  // Gestionnaires d'événements
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };
  
  const handleAddFood = (food) => {
    setSelectedFood(food);
    setQuantity(100); // Quantité par défaut
    setShowAddModal(true);
  };
  
  const handleConfirmAdd = () => {
    if (selectedFood && quantity > 0) {
      addFood(selectedFood.id, quantity);
      setShowAddModal(false);
      setSelectedFood(null);
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const handleUpdateQuantity = (foodId, currentQuantity, increment) => {
    const newQuantity = increment 
      ? currentQuantity + 50 
      : Math.max(50, currentQuantity - 50);
    
    updateFoodQuantity(foodId, newQuantity);
  };
  
  // Formater les valeurs nutritionnelles
  const formatValue = (value) => {
    return Math.round(value * 10) / 10;
  };
  
  return (
    <div className="fridge-selector">
      <div className="fridge-header">
        <h2>Sélection des aliments disponibles</h2>
        {foodCount > 0 && (
          <button 
            className="clear-fridge-button"
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir vider le frigo ?')) {
                clearFridge();
              }
            }}
          >
            Vider le frigo
          </button>
        )}
      </div>
      
      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Rechercher un aliment..."
            className="search-input"
          />
        </div>
        
        {/* Filtrage par catégorie */}
        <div className="category-filter">
          <span className="filter-label">Filtrer par:</span>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Résultats de recherche</h3>
          <div className="food-list">
            {searchResults.map(food => (
              <div key={food.id} className="food-item">
                <div className="food-info">
                  <h4>{food.name}</h4>
                  <span className="food-category">{food.category}</span>
                  <div className="food-macros">
                    <span>{food.nutritionPer100g.calories} kcal</span>
                    <span>{food.nutritionPer100g.protein}g prot</span>
                    <span>{food.nutritionPer100g.fat}g lip</span>
                    <span>{food.nutritionPer100g.netCarbs || food.nutritionPer100g.carbs}g gluc</span>
                  </div>
                </div>
                {isInFridge(food.id) ? (
                  <span className="in-fridge-badge">✓ Dans le frigo</span>
                ) : (
                  <button 
                    className="add-food-button" 
                    onClick={() => handleAddFood(food)}
                  >
                    <FaPlus /> Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Liste des aliments dans le frigo */}
      <div className="fridge-content">
        <h3>
          Aliments dans mon frigo 
          <span className="food-count">({foodCount})</span>
        </h3>
        
        {foodCount === 0 ? (
          <div className="empty-fridge">
            <p>Votre frigo est vide. Recherchez et ajoutez des aliments pour commencer.</p>
          </div>
        ) : (
          <div className="selected-foods">
            {Object.entries(foodsByCategory).map(([category, foods]) => (
              <div key={category} className="category-group">
                <h4 className="category-title">{category}</h4>
                <div className="category-foods">
                  {foods.map(item => (
                    <div key={item.foodId} className="selected-food-item">
                      <div className="selected-food-info">
                        <h5>{item.food.name}</h5>
                        <div className="food-quantity">
                          <button 
                            className="quantity-button"
                            onClick={() => handleUpdateQuantity(item.foodId, item.quantity, false)}
                          >
                            <FaMinus />
                          </button>
                          <span>{item.quantity}g</span>
                          <button 
                            className="quantity-button"
                            onClick={() => handleUpdateQuantity(item.foodId, item.quantity, true)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                      <button 
                        className="remove-food-button"
                        onClick={() => removeFood(item.foodId)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Récapitulatif des macronutriments */}
        {foodCount > 0 && (
          <div className="macros-summary">
            <h4>Macronutriments disponibles</h4>
            <div className="macros-grid">
              <div className="macro-item">
                <span className="macro-label">Calories</span>
                <span className="macro-value">{formatValue(availableMacros.calories)} kcal</span>
              </div>
              <div className="macro-item">
                <span className="macro-label">Protéines</span>
                <span className="macro-value protein">{formatValue(availableMacros.protein)}g</span>
              </div>
              <div className="macro-item">
                <span className="macro-label">Lipides</span>
                <span className="macro-value fat">{formatValue(availableMacros.fat)}g</span>
              </div>
              <div className="macro-item">
                <span className="macro-label">Glucides nets</span>
                <span className="macro-value carbs">{formatValue(availableMacros.netCarbs)}g</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal pour ajouter un aliment */}
      {showAddModal && selectedFood && (
        <div className="add-food-modal">
          <div className="modal-content">
            <h3>Ajouter au frigo</h3>
            <div className="modal-food-info">
              <h4>{selectedFood.name}</h4>
              <span className="food-category">{selectedFood.category}</span>
            </div>
            
            <div className="quantity-input-container">
              <label htmlFor="quantity">Quantité (g):</label>
              <input
                id="quantity"
                type="number"
                min="10"
                value={quantity}
                onChange={handleQuantityChange}
                className="quantity-input"
              />
            </div>
            
            <div className="nutrition-preview">
              <p>Valeurs nutritionnelles (pour {quantity}g):</p>
              <div className="preview-macros">
                <span>{formatValue(selectedFood.nutritionPer100g.calories * quantity / 100)} kcal</span>
                <span>{formatValue(selectedFood.nutritionPer100g.protein * quantity / 100)}g protéines</span>
                <span>{formatValue(selectedFood.nutritionPer100g.fat * quantity / 100)}g lipides</span>
                <span>
                  {formatValue((selectedFood.nutritionPer100g.netCarbs || selectedFood.nutritionPer100g.carbs) * quantity / 100)}g glucides
                </span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
              <button 
                className="confirm-button"
                onClick={handleConfirmAdd}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FridgeSelector;
