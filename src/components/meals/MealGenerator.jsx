import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useFridge } from '../../contexts/FridgeContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { generateMealsFromFridge } from '../../utils/mealGeneratorAlgorithm';
import './MealGenerator.css';

const MealGenerator = () => {
  const { selectedFoodDetails, availableMacros, foodCount } = useFridge();
  const { dailyNutritionNeeds } = useUser();
  const { addMealToDay } = useMealPlan();
  
  const [generationOptions, setGenerationOptions] = useState({
    mealCount: 3,
    preferLowCarbs: true,
    maximizeProtein: false,
    balancedMacros: true,
  });
  
  const [generatedMeals, setGeneratedMeals] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Effacer les messages après un délai
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  const handleOptionChange = (option, value) => {
    setGenerationOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  const handleMealCountChange = (event) => {
    const count = parseInt(event.target.value, 10);
    setGenerationOptions(prev => ({
      ...prev,
      mealCount: count
    }));
  };
  
  const generateMeals = async () => {
    if (foodCount === 0) {
      setErrorMessage('Votre frigo est vide. Ajoutez des aliments pour générer des repas.');
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Simulation d'un délai pour montrer le spinner
      setTimeout(() => {
        const meals = generateMealsFromFridge(
          selectedFoodDetails, 
          dailyNutritionNeeds, 
          generationOptions
        );
        
        setGeneratedMeals(meals);
        setIsGenerating(false);
        
        if (meals.length === 0) {
          setErrorMessage('Impossible de générer des repas avec les aliments disponibles. Essayez d\'ajouter plus d\'aliments variés.');
        }
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la génération des repas:', error);
      setErrorMessage('Une erreur est survenue lors de la génération des repas.');
      setIsGenerating(false);
    }
  };
  
  const saveMealToDay = (meal, dayIndex = 0) => {
    try {
      addMealToDay(meal, dayIndex);
      setSuccessMessage(`Le repas "${meal.name}" a été ajouté à votre plan.`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du repas:', error);
      setErrorMessage('Impossible d\'ajouter ce repas à votre plan.');
    }
  };
  
  const getMacroPercentage = (macroValue, calories) => {
    if (!calories) return 0;
    
    let caloriesFromMacro;
    if (macroValue === availableMacros.protein) {
      caloriesFromMacro = macroValue * 4; // 4 cal/g pour les protéines
    } else if (macroValue === availableMacros.fat) {
      caloriesFromMacro = macroValue * 9; // 9 cal/g pour les lipides
    } else {
      caloriesFromMacro = macroValue * 4; // 4 cal/g pour les glucides
    }
    
    return Math.round((caloriesFromMacro / calories) * 100);
  };
  
  return (
    <div className="meal-generator">
      <div className="generator-header">
        <h2>Générateur de repas</h2>
        <p className="subheading">Créez des repas équilibrés avec les aliments de votre frigo</p>
      </div>
      
      {foodCount === 0 ? (
        <div className="empty-fridge-message">
          <p>Votre frigo est vide. Ajoutez d'abord des aliments pour pouvoir générer des repas.</p>
        </div>
      ) : (
        <>
          <div className="available-macros">
            <h3>Nutrition disponible dans votre frigo</h3>
            <div className="macros-summary">
              <div className="macro-item">
                <span className="macro-label">Calories</span>
                <span className="macro-value">{availableMacros.calories} kcal</span>
              </div>
              <div className="macro-item">
                <span className="macro-label">Protéines</span>
                <span className="macro-value protein">{availableMacros.protein}g ({getMacroPercentage(availableMacros.protein, availableMacros.calories)}%)</span>
              </div>
              <div className="macro-item">
                <span className="macro-label">Lipides</span>
                <span className="macro-value fat">{availableMacros.fat}g ({getMacroPercentage(availableMacros.fat, availableMacros.calories)}%)</span>
              </div>
              <div className="macro-item">
                <span className="macro-label">Glucides nets</span>
                <span className="macro-value carbs">{availableMacros.netCarbs}g ({getMacroPercentage(availableMacros.netCarbs, availableMacros.calories)}%)</span>
              </div>
            </div>
          </div>
          
          <div className="generator-options">
            <h3>Options de génération</h3>
            
            <div className="option-row">
              <label htmlFor="mealCount">Nombre de repas à générer:</label>
              <select 
                id="mealCount" 
                value={generationOptions.mealCount} 
                onChange={handleMealCountChange}
                className="meal-count-select"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} repas</option>
                ))}
              </select>
            </div>
            
            <div className="options-grid">
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.preferLowCarbs} 
                    onChange={(e) => handleOptionChange('preferLowCarbs', e.target.checked)}
                  />
                  <span className="checkbox-text">Préférer les repas faibles en glucides</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.maximizeProtein} 
                    onChange={(e) => handleOptionChange('maximizeProtein', e.target.checked)}
                  />
                  <span className="checkbox-text">Maximiser les protéines</span>
                </label>
              </div>
              
              <div className="option-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generationOptions.balancedMacros} 
                    onChange={(e) => handleOptionChange('balancedMacros', e.target.checked)}
                  />
                  <span className="checkbox-text">Équilibrer les macronutriments</span>
                </label>
              </div>
            </div>
            
            <button 
              className="generate-button" 
              onClick={generateMeals}
              disabled={isGenerating || foodCount === 0}
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner"></span>
                  Génération en cours...
                </>
              ) : (
                'Générer des repas'
              )}
            </button>
          </div>
        </>
      )}
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {generatedMeals.length > 0 && (
        <div className="generated-meals">
          <h3>Repas générés</h3>
          <div className="meals-list">
            {generatedMeals.map((meal, index) => (
              <div key={index} className="meal-card">
                <div className="meal-header">
                  <h4>{meal.name}</h4>
                  <span className="meal-calorie">{meal.totalNutrition.calories} kcal</span>
                </div>
                
                <div className="meal-macros">
                  <div className="macro">
                    <span className="macro-label">Protéines</span>
                    <span className="macro-value protein">{meal.totalNutrition.protein}g</span>
                  </div>
                  <div className="macro">
                    <span className="macro-label">Lipides</span>
                    <span className="macro-value fat">{meal.totalNutrition.fat}g</span>
                  </div>
                  <div className="macro">
                    <span className="macro-label">Glucides</span>
                    <span className="macro-value carbs">{meal.totalNutrition.netCarbs}g</span>
                  </div>
                </div>
                
                <div className="meal-ingredients">
                  <h5>Ingrédients:</h5>
                  <ul>
                    {meal.items.map((item, idx) => (
                      <li key={idx}>
                        {item.food.name} - {item.quantity}g
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="meal-actions">
                  <button 
                    className="save-meal-button"
                    onClick={() => saveMealToDay(meal)}
                  >
                    Ajouter au plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealGenerator;