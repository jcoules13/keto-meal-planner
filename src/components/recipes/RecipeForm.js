import React, { useState, useEffect } from 'react';
import { useRecipe } from '../../contexts/RecipeContext';
import { useFood } from '../../contexts/FoodContext';
import './RecipeForm.css';

/**
 * Composant de formulaire pour la création ou la modification de recettes
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.initialRecipe - Recette initiale (pour modification) ou null (pour création)
 * @param {Function} props.onSubmit - Fonction à appeler lors de la soumission du formulaire
 * @param {Function} props.onCancel - Fonction à appeler lors de l'annulation
 */
const RecipeForm = ({ initialRecipe = null, onSubmit, onCancel }) => {
  const { addRecipe, updateRecipe, calculateRecipeNutrition, calculateRecipePH } = useRecipe();
  const { foods, setFilter, filteredFoods, resetFilters } = useFood();
  const [searchTerm, setSearchTerm] = useState('');
  
  // État du formulaire
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    ingredients: [],
    instructions: [],
    tags: []
  });
  
  // État pour la gestion des ingrédients et instructions
  const [currentIngredient, setCurrentIngredient] = useState({
    foodId: '',
    quantity: 100,
    unit: 'g'
  });
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  
  // État pour le calcul des valeurs nutritionnelles
  const [nutrition, setNutrition] = useState(null);
  const [phValue, setPhValue] = useState(7.0);
  
  // Si une recette est fournie (mode édition), l'utiliser pour initialiser le formulaire
  useEffect(() => {
    if (initialRecipe) {
      setRecipe({
        ...initialRecipe,
        // Créer des copies profondes pour éviter de modifier l'original
        ingredients: [...initialRecipe.ingredients],
        instructions: [...initialRecipe.instructions],
        tags: [...initialRecipe.tags]
      });
      
      // Calculer immédiatement les valeurs nutritionnelles
      updateNutritionalValues(initialRecipe.ingredients);
    }
  }, [initialRecipe]);
  
  // Mise à jour des valeurs nutritionnelles lorsque les ingrédients changent
  useEffect(() => {
    if (recipe.ingredients.length > 0) {
      updateNutritionalValues(recipe.ingredients);
    }
  }, [recipe.ingredients, foods]);
  
  // Fonction pour recalculer les valeurs nutritionnelles
  const updateNutritionalValues = (ingredients) => {
    const calculatedNutrition = calculateRecipeNutrition(ingredients);
    const calculatedPH = calculateRecipePH(ingredients);
    
    setNutrition(calculatedNutrition);
    setPhValue(calculatedPH);
  };
  
  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Pour les champs numériques, convertir en nombre
    if (name === 'prepTime' || name === 'cookTime' || name === 'servings') {
      setRecipe({
        ...recipe,
        [name]: parseInt(value) || 0
      });
    } else {
      setRecipe({
        ...recipe,
        [name]: value
      });
    }
  };
  
  // Gestion des changements pour l'ingrédient en cours
  const handleIngredientChange = (e) => {
    const { name, value } = e.target;
    
    // Convertir la quantité en nombre
    if (name === 'quantity') {
      setCurrentIngredient({
        ...currentIngredient,
        [name]: parseFloat(value) || 0
      });
    } else {
      setCurrentIngredient({
        ...currentIngredient,
        [name]: value
      });
    }
  };
  
  // Ajout d'un ingrédient à la recette
  const handleAddIngredient = (e) => {
    e.preventDefault();
    
    // Validation minimale
    if (!currentIngredient.foodId || currentIngredient.quantity <= 0) {
      alert('Veuillez sélectionner un aliment et spécifier une quantité valide.');
      return;
    }
    
    // Ajouter l'ingrédient à la liste
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { ...currentIngredient }]
    });
    
    // Réinitialiser le formulaire d'ingrédient
    setCurrentIngredient({
      foodId: '',
      quantity: 100,
      unit: 'g'
    });
  };
  
  // Suppression d'un ingrédient
  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients.splice(index, 1);
    
    setRecipe({
      ...recipe,
      ingredients: updatedIngredients
    });
  };
  
  // Ajout d'une instruction à la recette
  const handleAddInstruction = (e) => {
    e.preventDefault();
    
    // Validation minimale
    if (!currentInstruction.trim()) {
      alert('Veuillez entrer une instruction valide.');
      return;
    }
    
    // Ajouter l'instruction à la liste
    setRecipe({
      ...recipe,
      instructions: [...recipe.instructions, currentInstruction.trim()]
    });
    
    // Réinitialiser le champ d'instruction
    setCurrentInstruction('');
  };
  
  // Suppression d'une instruction
  const handleRemoveInstruction = (index) => {
    const updatedInstructions = [...recipe.instructions];
    updatedInstructions.splice(index, 1);
    
    setRecipe({
      ...recipe,
      instructions: updatedInstructions
    });
  };
  
  // Ajout d'un tag à la recette
  const handleAddTag = (e) => {
    e.preventDefault();
    
    // Validation minimale
    if (!currentTag.trim()) {
      return;
    }
    
    // Vérifier si le tag existe déjà
    if (recipe.tags.includes(currentTag.trim())) {
      alert('Ce tag existe déjà dans la recette.');
      return;
    }
    
    // Ajouter le tag à la liste
    setRecipe({
      ...recipe,
      tags: [...recipe.tags, currentTag.trim()]
    });
    
    // Réinitialiser le champ de tag
    setCurrentTag('');
  };
  
  // Suppression d'un tag
  const handleRemoveTag = (index) => {
    const updatedTags = [...recipe.tags];
    updatedTags.splice(index, 1);
    
    setRecipe({
      ...recipe,
      tags: updatedTags
    });
  };
  
  // Recherche d'aliments
  const handleFoodSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      setFilter('query', value);
    } else {
      resetFilters();
    }
  };
  
  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!recipe.name.trim()) {
      alert('Veuillez donner un nom à votre recette.');
      return;
    }
    
    if (recipe.ingredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient.');
      return;
    }
    
    if (recipe.instructions.length === 0) {
      alert('Veuillez ajouter au moins une instruction.');
      return;
    }
    
    // Si c'est une recette existante, la mettre à jour
    if (initialRecipe) {
      updateRecipe(recipe);
      if (onSubmit) onSubmit(recipe);
      return;
    }
    
    // Sinon, ajouter une nouvelle recette
    const recipeId = addRecipe(recipe);
    if (onSubmit) onSubmit({ ...recipe, id: recipeId });
  };
  
  // Annulation du formulaire
  const handleCancel = () => {
    if (onCancel) onCancel();
  };
  
  // Rendu des valeurs nutritionnelles calculées
  const renderNutritionSummary = () => {
    if (!nutrition) return null;
    
    const macroTotal = nutrition.protein + nutrition.fat + nutrition.netCarbs;
    const proteinPercent = Math.round((nutrition.protein * 4 / (nutrition.calories || 1)) * 100);
    const fatPercent = Math.round((nutrition.fat * 9 / (nutrition.calories || 1)) * 100);
    const carbsPercent = Math.round((nutrition.netCarbs * 4 / (nutrition.calories || 1)) * 100);
    
    const isKeto = nutrition.netCarbs <= 10 && fatPercent >= 70;
    const isAlkaline = phValue >= 7.0;
    
    return (
      <div className="nutrition-summary">
        <h3>Valeurs nutritionnelles (par portion)</h3>
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <span className="nutrition-label">Calories:</span>
            <span className="nutrition-value">{Math.round(nutrition.calories / recipe.servings)} kcal</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Protéines:</span>
            <span className="nutrition-value">{Math.round(nutrition.protein / recipe.servings)}g ({proteinPercent}%)</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Lipides:</span>
            <span className="nutrition-value">{Math.round(nutrition.fat / recipe.servings)}g ({fatPercent}%)</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Glucides nets:</span>
            <span className="nutrition-value">{Math.round(nutrition.netCarbs / recipe.servings)}g ({carbsPercent}%)</span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Valeur pH:</span>
            <span className="nutrition-value">{phValue.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="diet-indicators">
          <span className={`diet-badge ${isKeto ? 'keto' : 'not-keto'}`}>
            {isKeto ? 'Keto ✓' : 'Non Keto ✗'}
          </span>
          <span className={`diet-badge ${isAlkaline ? 'alkaline' : 'not-alkaline'}`}>
            {isAlkaline ? 'Alcalin ✓' : 'Non Alcalin ✗'}
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="recipe-form-container">
      <h2>{initialRecipe ? 'Modifier la recette' : 'Créer une nouvelle recette'}</h2>
      
      <form onSubmit={handleSubmit} className="recipe-form">
        {/* Informations générales */}
        <div className="form-section">
          <h3>Informations générales</h3>
          <div className="form-group">
            <label htmlFor="name">Nom de la recette *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={recipe.name} 
              onChange={handleChange}
              required
              placeholder="Ex: Poulet aux épinards à la crème"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description" 
              name="description" 
              value={recipe.description} 
              onChange={handleChange}
              placeholder="Une description courte et appétissante de votre recette"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepTime">Temps de préparation (min)</label>
              <input 
                type="number" 
                id="prepTime" 
                name="prepTime" 
                value={recipe.prepTime} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cookTime">Temps de cuisson (min)</label>
              <input 
                type="number" 
                id="cookTime" 
                name="cookTime" 
                value={recipe.cookTime} 
                onChange={handleChange}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="servings">Nombre de portions</label>
              <input 
                type="number" 
                id="servings" 
                name="servings" 
                value={recipe.servings} 
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
        </div>
        
        {/* Ingrédients */}
        <div className="form-section">
          <h3>Ingrédients</h3>
          
          <div className="ingredients-list">
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => {
                const food = foods.find(f => f.id === ingredient.foodId);
                return (
                  <div key={index} className="ingredient-item">
                    <span>{ingredient.quantity} {ingredient.unit} de {food ? food.name : ingredient.foodId}</span>
                    <button 
                      type="button" 
                      className="remove-button"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      &times;
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="empty-message">Aucun ingrédient ajouté</p>
            )}
          </div>
          
          <div className="add-ingredient-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="foodSearch">Rechercher un aliment</label>
                <input 
                  type="text" 
                  id="foodSearch" 
                  value={searchTerm} 
                  onChange={handleFoodSearch}
                  placeholder="Rechercher un aliment..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="foodId">Aliment *</label>
                <select 
                  id="foodId" 
                  name="foodId" 
                  value={currentIngredient.foodId} 
                  onChange={handleIngredientChange}
                  required
                >
                  <option value="">Sélectionner un aliment</option>
                  {filteredFoods.map(food => (
                    <option key={food.id} value={food.id}>
                      {food.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="quantity">Quantité *</label>
                <input 
                  type="number" 
                  id="quantity" 
                  name="quantity" 
                  value={currentIngredient.quantity} 
                  onChange={handleIngredientChange}
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="unit">Unité</label>
                <select 
                  id="unit" 
                  name="unit" 
                  value={currentIngredient.unit} 
                  onChange={handleIngredientChange}
                >
                  <option value="g">grammes (g)</option>
                  <option value="ml">millilitres (ml)</option>
                  <option value="cuillère à café">cuillère à café</option>
                  <option value="cuillère à soupe">cuillère à soupe</option>
                  <option value="tasse">tasse</option>
                  <option value="unité">unité</option>
                </select>
              </div>
            </div>
            
            <button 
              type="button" 
              className="add-button"
              onClick={handleAddIngredient}
            >
              Ajouter l'ingrédient
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="form-section">
          <h3>Instructions</h3>
          
          <div className="instructions-list">
            {recipe.instructions.length > 0 ? (
              <ol>
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="instruction-item">
                    <span>{instruction}</span>
                    <button 
                      type="button" 
                      className="remove-button"
                      onClick={() => handleRemoveInstruction(index)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="empty-message">Aucune instruction ajoutée</p>
            )}
          </div>
          
          <div className="add-instruction-form">
            <div className="form-group">
              <label htmlFor="instruction">Nouvelle instruction</label>
              <textarea 
                id="instruction" 
                value={currentInstruction} 
                onChange={(e) => setCurrentInstruction(e.target.value)}
                placeholder="Décrivez une étape de préparation..."
                rows="2"
              />
            </div>
            
            <button 
              type="button" 
              className="add-button"
              onClick={handleAddInstruction}
            >
              Ajouter l'instruction
            </button>
          </div>
        </div>
        
        {/* Tags */}
        <div className="form-section">
          <h3>Tags</h3>
          
          <div className="tags-list">
            {recipe.tags.length > 0 ? (
              <div className="tags-container">
                {recipe.tags.map((tag, index) => (
                  <div key={index} className="tag-item">
                    <span>{tag}</span>
                    <button 
                      type="button" 
                      className="remove-button-small"
                      onClick={() => handleRemoveTag(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucun tag ajouté</p>
            )}
          </div>
          
          <div className="add-tag-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tag">Nouveau tag</label>
                <input 
                  type="text" 
                  id="tag" 
                  value={currentTag} 
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Ex: déjeuner, rapide, végétarien..."
                />
              </div>
              
              <button 
                type="button" 
                className="add-button-small"
                onClick={handleAddTag}
              >
                Ajouter
              </button>
            </div>
          </div>
          
          <div className="tag-suggestions">
            <span className="tag-suggestion" onClick={() => setCurrentTag('petit-déjeuner')}>petit-déjeuner</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('déjeuner')}>déjeuner</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('dîner')}>dîner</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('collation')}>collation</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('dessert')}>dessert</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('rapide')}>rapide</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('viande')}>viande</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('poisson')}>poisson</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('végétarien')}>végétarien</span>
            <span className="tag-suggestion" onClick={() => setCurrentTag('sans cuisson')}>sans cuisson</span>
          </div>
        </div>
        
        {/* Aperçu nutritionnel */}
        {renderNutritionSummary()}
        
        {/* Boutons de soumission */}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Annuler
          </button>
          <button type="submit" className="submit-button">
            {initialRecipe ? 'Mettre à jour la recette' : 'Créer la recette'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;