import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useMealPlan } from '../../contexts/MealPlanContext';
import './MealGenerator.css';

/**
 * Générateur de repas pour le plan hebdomadaire 
 * Ce composant ne dépend pas du FridgeProvider
 * Il crée des repas basés sur les besoins nutritionnels et les préférences
 */
const MealGeneratorForPlan = () => {
  const { calorieTarget, macroTargets, dietType } = useUser();
  const { currentPlan, addMealToCurrentPlan } = useMealPlan();
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [mealType, setMealType] = useState('déjeuner');
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Options du générateur
  const [generationOptions, setGenerationOptions] = useState({
    preferLowCarbs: true,
    maximizeProtein: false,
    balancedMacros: true,
  });
  
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
  
  // Fonction pour générer un repas en fonction du type (déjeuner, dîner)
  const generateMealForPlan = () => {
    setIsGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Simulation d'un délai pour montrer le spinner
      setTimeout(() => {
        // Calculer les calories cibles en fonction du type de repas
        const mealCalorieTarget = mealType === 'déjeuner' 
          ? calorieTarget * 0.4  // 40% des calories pour le déjeuner
          : calorieTarget * 0.3;  // 30% des calories pour le dîner
        
        // Calculer les macros cibles
        const mealMacros = {
          protein: mealType === 'déjeuner' ? macroTargets.protein * 0.4 : macroTargets.protein * 0.3,
          fat: mealType === 'déjeuner' ? macroTargets.fat * 0.4 : macroTargets.fat * 0.3,
          carbs: mealType === 'déjeuner' ? macroTargets.carbs * 0.4 : macroTargets.carbs * 0.3
        };
        
        // Pour ce composant simplifié, nous allons créer un repas générique
        // Dans une application réelle, vous appelleriez un algorithme de génération
        // ou une API pour obtenir des suggestions de repas
        
        // Générer un repas approprié selon le type de régime
        const meal = generateSampleMeal(mealType, mealCalorieTarget, mealMacros, dietType);
        
        setGeneratedMeal(meal);
        setIsGenerating(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de la génération du repas:', error);
      setErrorMessage('Une erreur est survenue lors de la génération du repas.');
      setIsGenerating(false);
    }
  };
  
  // Fonction pour générer un repas d'exemple (à remplacer par un vrai algorithme)
  const generateSampleMeal = (type, calories, macros, dietType) => {
    // Noms de repas keto standard
    const ketoStandardMeals = {
      déjeuner: [
        'Salade César au poulet', 
        'Omelette aux légumes et fromage', 
        'Burger keto sans pain',
        'Wrap de laitue au thon'
      ],
      dîner: [
        'Saumon grillé et légumes', 
        'Poêlée de bœuf et brocoli', 
        'Poulet rôti et courgettes',
        'Steak et champignons sautés'
      ]
    };
    
    // Noms de repas keto alcalin
    const ketoAlkalineMeals = {
      déjeuner: [
        'Bowl avocat et légumes verts', 
        'Salade méditerranéenne à l\'huile d\'olive', 
        'Velouté d\'épinards et graines',
        'Sauté de tofu et légumes verts'
      ],
      dîner: [
        'Darne de poisson blanc et asperges', 
        'Poulet aux herbes et légumes alcalins', 
        'Bouillon miso et légumes',
        'Aubergine farcie aux noix'
      ]
    };
    
    // Choisir un repas selon le type de régime
    const meals = dietType === 'keto_standard' ? ketoStandardMeals : ketoAlkalineMeals;
    const mealNames = meals[type];
    const randomIndex = Math.floor(Math.random() * mealNames.length);
    const mealName = mealNames[randomIndex];
    
    // Créer un objet repas avec des valeurs nutritionnelles légèrement aléatoires
    // autour des cibles
    const variation = 0.1; // 10% de variation
    const protein = macros.protein * (1 + (Math.random() * variation * 2 - variation));
    const fat = macros.fat * (1 + (Math.random() * variation * 2 - variation));
    const carbs = macros.carbs * (1 + (Math.random() * variation * 2 - variation));
    
    return {
      name: mealName,
      type: type,
      totalNutrition: {
        calories: Math.round(calories),
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        netCarbs: Math.round(carbs * 10) / 10
      },
      // Ces ingrédients seraient normalement générés par l'algorithme
      items: [
        {
          name: 'Ingrédient principal',
          quantity: Math.round(calories / 5),
          unit: 'g'
        },
        {
          name: 'Légumes',
          quantity: Math.round(calories / 10),
          unit: 'g'
        },
        {
          name: 'Matière grasse',
          quantity: Math.round(calories / 30),
          unit: 'g'
        }
      ]
    };
  };
  
  // Fonction pour ajouter le repas généré au plan
  const addMealToPlan = () => {
    if (!generatedMeal) return;
    
    try {
      // Appeler la fonction du context pour ajouter le repas au plan
      addMealToCurrentPlan(generatedMeal, selectedDay, mealType);
      setSuccessMessage(`Le repas "${generatedMeal.name}" a été ajouté à votre plan.`);
      setGeneratedMeal(null); // Réinitialiser après ajout
    } catch (error) {
      console.error('Erreur lors de l\'ajout du repas:', error);
      setErrorMessage('Impossible d\'ajouter ce repas à votre plan.');
    }
  };
  
  // Calculer les jours du plan
  const getDaysOfWeek = () => {
    if (!currentPlan || !currentPlan.startDate) return [];
    
    const days = [];
    const startDate = new Date(currentPlan.startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        index: i,
        name: new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date),
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })
      });
    }
    
    return days;
  };
  
  const daysOfWeek = getDaysOfWeek();
  
  return (
    <div className="meal-generator">
      <div className="generator-header">
        <h2>Générateur de repas pour le plan</h2>
        <p className="subheading">Créez des repas équilibrés pour votre plan hebdomadaire</p>
      </div>
      
      {!currentPlan ? (
        <div className="empty-plan-message">
          <p>Vous devez d'abord créer un plan pour pouvoir générer des repas.</p>
        </div>
      ) : (
        <>
          <div className="generator-options">
            <h3>Options de génération</h3>
            
            <div className="option-row">
              <label htmlFor="daySelect">Jour:</label>
              <select 
                id="daySelect" 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(parseInt(e.target.value, 10))}
                className="day-select"
              >
                {daysOfWeek.map(day => (
                  <option key={day.index} value={day.index}>
                    {day.name} ({day.date})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="option-row">
              <label htmlFor="mealTypeSelect">Type de repas:</label>
              <select 
                id="mealTypeSelect" 
                value={mealType} 
                onChange={(e) => setMealType(e.target.value)}
                className="meal-type-select"
              >
                <option value="déjeuner">Déjeuner</option>
                <option value="dîner">Dîner</option>
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
              onClick={generateMealForPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="loading-spinner"></span>
                  Génération en cours...
                </>
              ) : (
                'Générer un repas'
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
      
      {generatedMeal && (
        <div className="generated-meals">
          <h3>Repas généré</h3>
          <div className="meals-list">
            <div className="meal-card">
              <div className="meal-header">
                <h4>{generatedMeal.name}</h4>
                <span className="meal-calorie">{generatedMeal.totalNutrition.calories} kcal</span>
              </div>
              
              <div className="meal-macros">
                <div className="macro">
                  <span className="macro-label">Protéines</span>
                  <span className="macro-value protein">{generatedMeal.totalNutrition.protein}g</span>
                </div>
                <div className="macro">
                  <span className="macro-label">Lipides</span>
                  <span className="macro-value fat">{generatedMeal.totalNutrition.fat}g</span>
                </div>
                <div className="macro">
                  <span className="macro-label">Glucides</span>
                  <span className="macro-value carbs">{generatedMeal.totalNutrition.netCarbs}g</span>
                </div>
              </div>
              
              <div className="meal-ingredients">
                <h5>Ingrédients suggérés:</h5>
                <ul>
                  {generatedMeal.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - {item.quantity}{item.unit}
                    </li>
                  ))}
                </ul>
                <p className="ingredients-note">Note: Ces ingrédients sont donnés à titre indicatif.</p>
              </div>
              
              <div className="meal-actions">
                <button 
                  className="save-meal-button"
                  onClick={addMealToPlan}
                >
                  Ajouter au plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealGeneratorForPlan;