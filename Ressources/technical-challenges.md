class FoodDatabase {
  constructor(initialFoods = []) {
    // Collection principale
    this.foods = initialFoods;
    
    // Index secondaires pour recherche rapide
    this.foodsByCategory = new Map();
    this.foodsByName = new Map();
    this.foodsById = new Map();
    
    // Cache pour les résultats de recherche
    this.searchCache = new Map();
    
    // Initialiser les index
    this.rebuildIndexes();
  }
  
  rebuildIndexes() {
    // Vider les index existants
    this.foodsByCategory.clear();
    this.foodsByName.clear();
    this.foodsById.clear();
    this.searchCache.clear();
    
    // Reconstruire les index
    for (const food of this.foods) {
      // Index par ID
      this.foodsById.set(food.id, food);
      
      // Index par nom (toLowerCase pour recherche insensible à la casse)
      this.foodsByName.set(food.name.toLowerCase(), food);
      
      // Index par catégorie
      if (!this.foodsByCategory.has(food.category)) {
        this.foodsByCategory.set(food.category, []);
      }
      this.foodsByCategory.get(food.category).push(food);
    }
  }
  
  addFood(food) {
    this.foods.push(food);
    
    // Mettre à jour les index
    this.foodsById.set(food.id, food);
    this.foodsByName.set(food.name.toLowerCase(), food);
    
    if (!this.foodsByCategory.has(food.category)) {
      this.foodsByCategory.set(food.category, []);
    }
    this.foodsByCategory.get(food.category).push(food);
    
    // Invalider le cache de recherche
    this.searchCache.clear();
  }
  
  updateFood(updatedFood) {
    const index = this.foods.findIndex(f => f.id === updatedFood.id);
    if (index === -1) return false;
    
    // Mettre à jour la collection principale
    this.foods[index] = updatedFood;
    
    // Reconstruire les index (plus simple que de mettre à jour de manière sélective)
    this.rebuildIndexes();
    
    return true;
  }
  
  deleteFood(foodId) {
    const index = this.foods.findIndex(f => f.id === foodId);
    if (index === -1) return false;
    
    // Supprimer de la collection principale
    this.foods.splice(index, 1);
    
    // Reconstruire les index
    this.rebuildIndexes();
    
    return true;
  }
  
  search(query, filters = {}) {
    // Créer une clé de cache unique pour cette recherche
    const cacheKey = JSON.stringify({ query, filters });
    
    // Vérifier si le résultat est en cache
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }
    
    // Appliquer d'abord les filtres de catégorie (plus efficace)
    let candidates = [];
    if (filters.category) {
      candidates = this.foodsByCategory.get(filters.category) || [];
    } else {
      candidates = this.foods;
    }
    
    // Filtrer par autres critères
    const results = candidates.filter(food => {
      // Recherche par texte (si spécifiée)
      if (query && !food.name.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      // Filtre keto
      if (filters.isKeto === true && !food.isKeto) {
        return false;
      }
      
      // Filtre alcalin
      if (filters.isAlkaline === true && !food.isAlkaline) {
        return false;
      }
      
      // Filtre saisonnier
      if (filters.season && !food.seasons.includes(filters.season)) {
        return false;
      }
      
      // Filtres nutritionnels
      if (filters.maxNetCarbs !== undefined && 
          food.nutritionPer100g.netCarbs > filters.maxNetCarbs) {
        return false;
      }
      
      if (filters.minProtein !== undefined && 
          food.nutritionPer100g.protein < filters.minProtein) {
        return false;
      }
      
      if (filters.minFat !== undefined && 
          food.nutritionPer100g.fat < filters.minFat) {
        return false;
      }
      
      // Filtre pH
      if (filters.minpH !== undefined && food.pHValue < filters.minpH) {
        return false;
      }
      
      if (filters.maxpH !== undefined && food.pHValue > filters.maxpH) {
        return false;
      }
      
      return true;
    });
    
    // Mettre en cache le résultat pour les futures recherches
    this.searchCache.set(cacheKey, results);
    
    return results;
  }
  
  getById(id) {
    return this.foodsById.get(id) || null;
  }
  
  getCategories() {
    return Array.from(this.foodsByCategory.keys());
  }
}
```

## 5. Persistance des données et gestion hors ligne

### Défi
Assurer la persistance des données utilisateur (profils, recettes personnalisées, plans de repas) et permettre l'utilisation de l'application hors ligne.

### Solutions
- **LocalStorage structuré** : Organiser les données persistantes en compartiments logiques
- **Synchronisation automatique** : Sauvegarder automatiquement les changements d'état
- **Gestion des quotas** : Surveiller l'utilisation du stockage et gérer les dépassements
- **Compression des données** : Réduire la taille des données stockées pour les grands ensembles
- **Stratégie de mise en cache** : Mettre en cache les ressources essentielles pour usage hors ligne

#### Exemple de mise en œuvre
```javascript
class StorageService {
  constructor(storagePrefix = 'keto-meal-planner') {
    this.prefix = storagePrefix;
    this.compressionThreshold = 100000; // Taille en caractères à partir de laquelle compresser
  }
  
  // Clé avec préfixe pour éviter les collisions
  getKey(key) {
    return `${this.prefix}-${key}`;
  }
  
  // Sauvegarder des données
  save(key, data) {
    try {
      const fullKey = this.getKey(key);
      let valueToStore = JSON.stringify(data);
      
      // Compresser les grandes données si nécessaire
      if (valueToStore.length > this.compressionThreshold) {
        valueToStore = this._compress(valueToStore);
        localStorage.setItem(`${fullKey}-compressed`, 'true');
      } else {
        localStorage.removeItem(`${fullKey}-compressed`);
      }
      
      localStorage.setItem(fullKey, valueToStore);
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Gérer les erreurs de quota dépassé
      if (error.name === 'QuotaExceededError') {
        this._handleQuotaExceeded();
      }
      
      return false;
    }
  }
  
  // Charger des données
  load(key, defaultValue = null) {
    try {
      const fullKey = this.getKey(key);
      const isCompressed = localStorage.getItem(`${fullKey}-compressed`) === 'true';
      const value = localStorage.getItem(fullKey);
      
      if (value === null) return defaultValue;
      
      // Décompresser si nécessaire
      const decompressedValue = isCompressed ? this._decompress(value) : value;
      return JSON.parse(decompressedValue);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      return defaultValue;
    }
  }
  
  // Supprimer des données
  remove(key) {
    try {
      const fullKey = this.getKey(key);
      localStorage.removeItem(fullKey);
      localStorage.removeItem(`${fullKey}-compressed`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }
  
  // Vérifier si l'élément existe
  exists(key) {
    return localStorage.getItem(this.getKey(key)) !== null;
  }
  
  // Obtenir la taille d'utilisation actuelle (en octets)
  getUsageSize() {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        totalSize += localStorage.getItem(key).length * 2; // UTF-16 = 2 octets par caractère
      }
    }
    return totalSize;
  }
  
  // Vérifier si le stockage est disponible
  isAvailable() {
    try {
      const testKey = this.getKey('storage-test');
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Compression simple (dans une application réelle, utiliser une bibliothèque dédiée)
  _compress(string) {
    // Méthode simplifiée pour l'exemple - utiliser LZString ou similaire en production
    return btoa(string);
  }
  
  // Décompression
  _decompress(compressed) {
    return atob(compressed);
  }
  
  // Gestion du dépassement de quota
  _handleQuotaExceeded() {
    // Stratégies pour libérer de l'espace:
    // 1. Supprimer d'abord les données temporaires
    this.remove('search-cache');
    
    // 2. Demander à l'utilisateur de libérer de l'espace en supprimant d'anciens plans
    alert('L\'espace de stockage est plein. Veuillez supprimer d\'anciens plans de repas ou recettes non utilisées pour libérer de l\'espace.');
    
    // 3. Alternative: Supprimer automatiquement les plans les plus anciens
    // Implémentation omise pour simplifier
  }
}
```

## 6. Gestion des performances avec de grands ensembles de données

### Défi
Maintenir des performances fluides avec des listes potentiellement longues (aliments, recettes, plans de repas) et des calculs intensifs.

### Solutions
- **Virtualisation des listes** : N'afficher que les éléments visibles à l'écran pour les longues listes
- **Pagination** : Diviser les grands ensembles de données en pages
- **Chargement progressif** : Charger les données par lots au fur et à mesure du défilement
- **Memoïsation** : Mettre en cache les résultats des calculs coûteux
- **Traitements asynchrones** : Déplacer les calculs intensifs hors du thread principal

#### Exemple de mise en œuvre
```javascript
import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

function FoodList({ foods, onSelectFood }) {
  const [page, setPage] = useState(1);
  const pageSize = 50;
  
  // Memoïsation de la liste paginée
  const paginatedFoods = useMemo(() => {
    const start = (page - 1) * pageSize;
    return foods.slice(start, start + pageSize);
  }, [foods, page, pageSize]);
  
  // Virtualisation pour l'affichage efficace des éléments
  const Row = useCallback(({ index, style }) => {
    const food = paginatedFoods[index];
    return (
      <div className="food-item" style={style} onClick={() => onSelectFood(food)}>
        <h3>{food.name}</h3>
        <div className="food-macros">
          <span>{food.nutritionPer100g.calories} kcal</span>
          <span>{food.nutritionPer100g.protein}g protéines</span>
          <span>{food.nutritionPer100g.fat}g lipides</span>
          <span>{food.nutritionPer100g.netCarbs}g glucides nets</span>
        </div>
      </div>
    );
  }, [paginatedFoods, onSelectFood]);
  
  const totalPages = Math.ceil(foods.length / pageSize);
  
  return (
    <div className="food-list-container">
      {foods.length > 0 ? (
        <>
          <List
            height={500}
            width="100%"
            itemCount={paginatedFoods.length}
            itemSize={80}
          >
            {Row}
          </List>
          
          <div className="pagination">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Précédent
            </button>
            
            <span>Page {page} sur {totalPages}</span>
            
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Suivant
            </button>
          </div>
        </>
      ) : (
        <p>Aucun aliment ne correspond à vos critères.</p>
      )}
    </div>
  );
}

// Utilisation dans un composant parent
function FoodBrowser() {
  const { foods, filters, setFilter } = useFood();
  
  // Calcul coûteux memoïsé
  const filteredFoods = useMemo(() => {
    // Logique de filtrage complexe ici
    return foods.filter(/* ... */);
  }, [foods, filters]);
  
  // Traitement asynchrone pour calculs intensifs
  const analyzeFoods = async (foodList) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulation d'un traitement lourd
        const result = foodList.map(food => {
          // Calculs complexes...
          return { ...food, analysisResult: /* ... */ };
        });
        resolve(result);
      }, 0); // Utilisation de setTimeout pour ne pas bloquer le thread principal
    });
  };
  
  // Gestionnaire avec calcul asynchrone
  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    try {
      const results = await analyzeFoods(filteredFoods);
      setAnalysisResults(results);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reste du composant...
}
```

## 7. Expérience utilisateur cohérente et réactive

### Défi
Offrir une expérience utilisateur fluide et réactive tout en gérant des fonctionnalités complexes et des données volumineuses.

### Solutions
- **Feedback immédiat** : Fournir un retour visuel instantané pour chaque action utilisateur
- **États de chargement optimistes** : Mettre à jour l'interface avant que l'opération soit terminée
- **Microtransitions** : Utiliser de subtiles animations pour guider l'attention
- **Design progressif** : Révéler la complexité progressivement selon les besoins
- **Mode squelette** : Afficher des placeholders pendant le chargement des données

#### Exemple de mise en œuvre
```javascript
function MealPlanGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimisticPlan, setOptimisticPlan] = useState(null);
  const { generatePlan } = useMealPlan();
  
  const handleGeneratePlan = async () => {
    // Démarrer l'état de génération
    setIsGenerating(true);
    setProgress(0);
    
    // Créer un plan optimiste immédiatement pour montrer le squelette
    const optimistic = createOptimisticPlan();
    setOptimisticPlan(optimistic);
    
    try {
      // Simuler une progression pour l'expérience utilisateur
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 15; // Progression aléatoire
          return Math.min(prev + increment, 90); // Jamais tout à fait 100%
        });
      }, 300);
      
      // Vraie génération du plan
      const actualPlan = await generatePlan();
      
      // Nettoyage
      clearInterval(progressInterval);
      setProgress(100);
      
      // Transition douce vers le vrai plan
      setTimeout(() => {
        setOptimisticPlan(null);
        setIsGenerating(false);
      }, 500);
      
      return actualPlan;
    } catch (error) {
      // Gestion de l'erreur
      setProgress(0);
      setOptimisticPlan(null);
      setIsGenerating(false);
      throw error;
    }
  };
  
  // Rendu conditionnel basé sur l'état
  if (isGenerating) {
    return (
      <div className="generating-container">
        <ProgressBar value={progress} />
        <p>Génération de votre plan de repas...</p>
        
        {/* Affichage du squelette du plan pendant la génération */}
        {optimisticPlan && (
          <div className="meal-plan-skeleton">
            {optimisticPlan.days.map(day => (
              <div key={day.id} className="day-skeleton">
                <h3>{day.name}</h3>
                {day.meals.map(meal => (
                  <div key={meal.id} className="meal-skeleton">
                    <h4>{meal.name}</h4>
                    <div className="meal-items-skeleton">
                      {/* Placeholders pour les éléments du repas */}
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line"></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // Rendu normal quand pas en génération
  return (
    <div className="meal-plan-generator">
      <h2>Générateur de plan de repas</h2>
      <PlanOptions />
      <button 
        className="generate-button"
        onClick={handleGeneratePlan}
      >
        Générer mon plan
      </button>
    </div>
  );
}

// Fonction pour créer un plan squelette temporaire
function createOptimisticPlan() {
  const days = [];
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  for (let i = 0; i < 7; i++) {
    const meals = [];
    
    // 2-3 repas par jour pour le squelette
    const mealCount = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < mealCount; j++) {
      meals.push({
        id: `skeleton-meal-${i}-${j}`,
        name: j === 0 ? 'Déjeuner' : 'Dîner'
      });
    }
    
    days.push({
      id: `skeleton-day-${i}`,
      name: dayNames[i],
      meals
    });
  }
  
  return { days };
}
```

## 8. Mise en œuvre du régime keto alcalin

### Défi
Intégrer la dimension d'alcalinité au régime keto traditionnel tout en maintenant la cohérence nutritionnelle et la variété des repas.

### Solutions
- **Base de données pH** : Associer des valeurs pH précises à chaque aliment
- **Calcul de pH pondéré** : Déterminer l'alcalinité globale d'une recette ou d'un repas
- **Visualisation du pH** : Créer des indicateurs visuels de l'équilibre acido-basique
- **Algorithme d'équilibrage** : Ajuster automatiquement les plans de repas pour maintenir un pH global alcalin
- **Recommandations intelligentes** : Suggérer des substitutions d'aliments pour améliorer l'alcalinité

#### Exemple de mise en œuvre
```javascript
// Fonction pour calculer le pH moyen pondéré d'une recette
function calculateRecipePH(ingredients, foods) {
  if (!ingredients || ingredients.length === 0) return 7.0; // Neutre par défaut
  
  let totalWeight = 0;
  let weightedpH = 0;
  
  ingredients.forEach(ingredient => {
    const food = foods.find(f => f.id === ingredient.foodId);
    if (food) {
      const weight = ingredient.quantity; // En grammes ou autre unité consistante
      totalWeight += weight;
      weightedpH += food.pHValue * weight;
    }
  });
  
  if (totalWeight === 0) return 7.0;
  
  // pH moyen pondéré
  return weightedpH / totalWeight;
}

// Composant d'affichage de pH
function PHIndicator({ value }) {
  // Déterminer la couleur basée sur la valeur du pH
  const getColor = (pH) => {
    if (pH < 6.0) return '#ff5722'; // Très acide - orange-rouge
    if (pH < 6.5) return '#ff9800'; // Acide - orange
    if (pH < 7.0) return '#ffc107'; // Légèrement acide - jaune
    if (pH === 7.0) return '#9e9e9e'; // Neutre - gris
    if (pH < 7.5) return '#8bc34a'; // Légèrement alcalin - vert clair
    if (pH < 8.0) return '#4caf50'; // Alcalin - vert
    return '#009688'; // Très alcalin - vert-bleu
  };
  
  // Texte descriptif
  const getDescription = (pH) => {
    if (pH < 6.0) return 'Très acide';
    if (pH < 6.5) return 'Acide';
    if (pH < 7.0) return 'Légèrement acide';
    if (pH === 7.0) return 'Neutre';
    if (pH < 7.5) return 'Légèrement alcalin';
    if (pH < 8.0) return 'Alcalin';
    return 'Très alcalin';
  };
  
  const color = getColor(value);
  const description = getDescription(value);
  
  return (
    <div className="ph-indicator">
      <div className="ph-value" style={{ backgroundColor: color }}>
        pH {value.toFixed(1)}
      </div>
      <div className="ph-description">{description}</div>
      
      {/* Échelle visuelle */}
      <div className="ph-scale">
        <div className="ph-scale-bar">
          <div className="ph-scale-fill" style={{ width: `${(value / 14) * 100}%`, backgroundColor: color }}></div>
        </div>
        <div className="ph-scale-markers">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>
    </div>
  );
}

// Fonction pour équilibrer le pH d'un repas
function balanceMealPH(meal, foods, targetpH = 7.2) {
  const currentpH = calculateMealpH(meal, foods);
  
  // Si déjà suffisamment alcalin, ne rien changer
  if (currentpH >= targetpH) return meal;
  
  // Calculer l'écart à combler
  const pHGap = targetpH - currentpH;
  
  // Trouver des aliments alcalins compatibles
  const alkalineFoods = foods.filter(food => 
    food.isKeto && food.pHValue > 7.5 && !meal.items.some(item => item.id === food.id)
  );
  
  if (alkalineFoods.length === 0) return meal; // Pas d'option disponible
  
  // Trier par impact pH (la différence entre leur pH et le pH actuel)
  alkalineFoods.sort((a, b) => (b.pHValue - currentpH) - (a.pHValue - currentpH));
  
  // Choisir le meilleur candidat
  const bestFood = alkalineFoods[0];
  
  // Déterminer la quantité optimale à ajouter (simplification - une implémentation réelle serait plus complexe)
  const estimatedQuantity = Math.min(50, Math.ceil(pHGap * 100));
  
  // Ajouter le nouvel aliment au repas
  const balancedMeal = {
    ...meal,
    items: [
      ...meal.items,
      {
        id: bestFood.id,
        type: 'food',
        name: bestFood.name,
        quantity: estimatedQuantity,
        unit: 'g',
        calories: bestFood.nutritionPer100g.calories * estimatedQuantity / 100,
        macros: {
          protein: bestFood.nutritionPer100g.protein * estimatedQuantity / 100,
          fat: bestFood.nutritionPer100g.fat * estimatedQuantity / 100,
          carbs: bestFood.nutritionPer100g.carbs * estimatedQuantity / 100,
          fiber: bestFood.nutritionPer100g.fiber * estimatedQuantity / 100,
          netCarbs: bestFood.nutritionPer100g.netCarbs * estimatedQuantity / 100
        },
        pHValue: bestFood.pHValue
      }
    ]
  };
  
  // Recalculer les totaux
  balancedMeal.totalNutrition = calculateMealTotals(balancedMeal.items);
  balancedMeal.averagePHValue = calculateMealpH(balancedMeal, foods);
  
  return balancedMeal;
}
```

## 9. Tests et assurance qualité

### Défi
Assurer la robustesse d'une application avec de nombreux calculs, transformations de données et interactions utilisateur complexes.

### Solutions
- **Tests unitaires** : Vérifier le comportement des fonctions isolées
- **Tests d'intégration** : Valider l'interaction entre les différents modules
- **Tests de composants** : Tester le rendu et le comportement des composants UI
- **Validation des données** : Mettre en place des schémas de validation rigoureux
- **Code défensif** : Anticiper et gérer les cas limites et erreurs potentielles

#### Exemple de mise en œuvre
```javascript
// Tests unitaires pour les calculs nutritionnels
import { calculateRecipeNutrition, calculateBMR, calculatePH } from '../src/utils/nutritionCalculator';

describe('Calculateur nutritionnel', () => {
  test('calcule correctement les valeurs nutritionnelles d\'une recette', () => {
    const mockIngredients = [
      { foodId: 'salmon', quantity: 150 },
      { foodId: 'olive-oil', quantity: 15 },
      { foodId: 'spinach', quantity: 100 }
    ];
    
    const mockFoods = [
      { 
        id: 'salmon', 
        nutritionPer100g: { 
          calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, netCarbs: 0 
        } 
      },
      { 
        id: 'olive-oil', 
        nutritionPer100g: { 
          calories: 884, protein: 0, fat: 100, carbs: 0, fiber: 0, netCarbs: 0 
        } 
      },
      { 
        id: 'spinach', 
        nutritionPer100g: { 
          calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, netCarbs: 1.4 
        } 
      }
    ];
    
    const result = calculateRecipeNutrition(mockIngredients, mockFoods, 2);
    
    // Vérification des résultats (avec tolérance)
    expect(result.calories).toBeCloseTo(204, 0); // Par portion
    expect(result.protein).toBeCloseTo(16.15, 1);
    expect(result.fat).toBeCloseTo(13.7, 1);
    expect(result.netCarbs).toBeCloseTo(0.7, 1);
  });
  
  test('gère correctement les ingrédients manquants', () => {
    const mockIngredients = [
      { foodId: 'salmon', quantity: 150 },
      { foodId: 'nonexistent-food', quantity: 100 } // Aliment qui n'existe pas
    ];
    
    const mockFoods = [
      { 
        id: 'salmon', 
        nutritionPer100g: { 
          calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, netCarbs: 0 
        } 
      }
    ];
    
    // Ne devrait pas échouer, mais ignorer l'aliment manquant
    const result = calculateRecipeNutrition(mockIngredients, mockFoods, 1);
    
    // Vérifier que seul le saumon a été comptabilisé
    expect(result.calories).toBeCloseTo(312, 0);
    expect(result.protein).toBeCloseTo(30, 0);
  });
  
  test('calcule correctement le métabolisme de base', () => {
    // Homme
    const maleResult = calculateBMR({
      gender: 'homme',
      weight: 80,
      height: 180,
      age:# Défis techniques et solutions

Ce document identifie les principaux défis techniques du projet Keto Meal Planner et propose des solutions concrètes pour y répondre.

## 1. Algorithme de génération de plans de repas

### Défi
Créer un algorithme qui génère des plans de repas nutritionnellement équilibrés, variés et respectant toutes les contraintes utilisateur (calories, macros, préférences, restrictions) représente un défi majeur de complexité algorithmique.

### Solutions
- **Approche par étapes** : Diviser l'algorithme en phases distinctes (calcul des besoins, distribution des repas, sélection des aliments)
- **Système de pondération** : Attribuer des scores aux combinaisons d'aliments/recettes selon leur adéquation aux contraintes
- **Optimisation par contraintes** : Utiliser une approche de satisfaction de contraintes avec backtracking pour trouver des solutions viables
- **Variation contrôlée** : Intégrer un mécanisme de "mémoire" pour éviter la répétition excessive d'aliments
- **Approche itérative** : Générer d'abord un plan de base, puis l'affiner par itérations successives pour respecter toutes les contraintes

#### Exemple de mise en œuvre
```javascript
function generateMealPlan(userProfile, constraints) {
  // Phase 1: Calcul des besoins nutritionnels quotidiens
  const dailyNeeds = calculateNutritionalNeeds(userProfile);
  
  // Phase 2: Distribution par repas
  const mealDistribution = distributeMeals(dailyNeeds, userProfile.mealFrequency);
  
  // Phase 3: Sélection initiale pour chaque repas
  let initialPlan = [];
  for (const day of Array(7).keys()) {
    const dayPlan = [];
    for (const meal of mealDistribution) {
      // Étape 3.1: Sélection des protéines principales (éviter répétitions)
      const protein = selectProtein(userProfile, initialPlan, constraints);
      
      // Étape 3.2: Sélection des légumes/accompagnements
      const vegetables = selectVegetables(userProfile, constraints);
      
      // Étape 3.3: Sélection des sources de gras
      const fats = selectFats(userProfile, constraints);
      
      // Assembler le repas
      dayPlan.push({ meal, items: [protein, ...vegetables, ...fats] });
    }
    initialPlan.push({ day, meals: dayPlan });
  }
  
  // Phase 4: Optimisation et ajustements
  const optimizedPlan = optimizePlan(initialPlan, userProfile, constraints);
  
  return optimizedPlan;
}
```

## 2. Calculs nutritionnels précis

### Défi
Assurer la précision des calculs nutritionnels pour les recettes complexes, la génération de plans et l'adaptation aux besoins caloriques est essentiel mais complexe.

### Solutions
- **Base de données nutritionnelles fiable** : Partir d'une source de données nutritionnelles validée scientifiquement
- **Système de conversion d'unités** : Implémenter un système robuste de conversion entre différentes unités (g, ml, cuillères, etc.)
- **Formules validées** : Utiliser des formules reconnues pour le calcul du métabolisme de base (Mifflin-St Jeor)
- **Cache de calculs** : Mettre en cache les résultats des calculs intensifs pour optimiser les performances
- **Arrondi contrôlé** : Standardiser l'arrondi des valeurs nutritionnelles pour éviter les erreurs d'accumulation

#### Exemple de mise en œuvre
```javascript
class NutritionCalculator {
  constructor(foodDatabase) {
    this.foods = foodDatabase;
    this.cache = new Map(); // Cache pour les calculs récurrents
  }
  
  calculateRecipeNutrition(recipe, servings = 1) {
    const cacheKey = `recipe-${recipe.id}-${servings}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    
    const totalNutrition = {
      calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, netCarbs: 0
    };
    
    recipe.ingredients.forEach(ingredient => {
      const food = this.foods.find(f => f.id === ingredient.foodId);
      if (!food) return;
      
      const quantity = this.convertToGrams(ingredient.quantity, ingredient.unit, food);
      const ratio = quantity / 100; // Valeurs nutritionnelles pour 100g
      
      totalNutrition.calories += food.nutritionPer100g.calories * ratio;
      totalNutrition.protein += food.nutritionPer100g.protein * ratio;
      totalNutrition.fat += food.nutritionPer100g.fat * ratio;
      totalNutrition.carbs += food.nutritionPer100g.carbs * ratio;
      totalNutrition.fiber += food.nutritionPer100g.fiber * ratio;
    });
    
    // Calculer les glucides nets
    totalNutrition.netCarbs = Math.max(0, totalNutrition.carbs - totalNutrition.fiber);
    
    // Diviser par le nombre de portions
    const nutritionPerServing = {};
    Object.keys(totalNutrition).forEach(key => {
      nutritionPerServing[key] = this.roundValue(totalNutrition[key] / servings);
    });
    
    // Stocker dans le cache pour réutilisation
    this.cache.set(cacheKey, nutritionPerServing);
    
    return nutritionPerServing;
  }
  
  convertToGrams(quantity, unit, food) {
    // Conversion des unités en grammes
    switch (unit) {
      case 'g': return quantity;
      case 'ml': return quantity; // Pour les liquides, approximation 1ml = 1g
      case 'cuillère à café': return quantity * 5;
      case 'cuillère à soupe': return quantity * 15;
      case 'tasse': return quantity * 240;
      case 'unité': return quantity * (food.commonUnitWeight || 100);
      default: return quantity;
    }
  }
  
  roundValue(value) {
    // Arrondi standard à 1 décimale pour la cohérence
    return Math.round(value * 10) / 10;
  }
}
```

## 3. Gestion d'état complexe

### Défi
La gestion de l'état global d'une application avec de multiples fonctionnalités interdépendantes peut devenir rapidement complexe et source de bugs.

### Solutions
- **Architecture de contextes modulaires** : Diviser l'état global en contextes spécifiques aux domaines
- **Reducers avec actions typées** : Utiliser le pattern reducer pour une gestion d'état prévisible
- **Sélecteurs memoïsés** : Optimiser les performances avec des sélecteurs qui ne recalculent que si les dépendances changent
- **Persistence automatique** : Synchroniser l'état avec localStorage pour une expérience utilisateur continue
- **Imbrication intelligente des providers** : Organiser les providers pour éviter les dépendances circulaires

#### Exemple de mise en œuvre
```javascript
// Exemple de structure de reducer typé
function recipeReducer(state, action) {
  switch (action.type) {
    case 'LOAD_RECIPES':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'LOAD_RECIPES_SUCCESS':
      return {
        ...state,
        recipes: action.payload,
        loading: false
      };
    
    case 'ADD_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, action.payload]
      };
    
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(recipe => 
          recipe.id === action.payload.id ? action.payload : recipe
        )
      };
    
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value
        }
      };
    
    default:
      return state;
  }
}

// Exemple de sélecteur memoïsé
function useFilteredRecipes() {
  const { recipes, filters } = useRecipe();
  
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (filters.query && !recipe.name.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      if (filters.isKeto && !recipe.isKeto) {
        return false;
      }
      
      // Autres filtres...
      
      return true;
    });
  }, [recipes, filters]);
  
  return filteredRecipes;
}
```

## 4. Gestion de la base de données alimentaire

### Défi
Gérer une base de données d'aliments complète avec des valeurs nutritionnelles précises et des fonctionnalités de recherche/filtrage performantes.

### Solutions
- **Structure de données optimisée** : Organiser les données pour faciliter la recherche et le filtrage
- **Indexation multiple** : Créer des indexes secondaires pour accélérer les recherches fréquentes
- **Chargement paresseux** : Charger les détails complets uniquement quand nécessaire
- **Mise en cache** : Stocker les résultats des requêtes fréquentes
- **Stratégie de recherche hybride** : Combiner recherche exacte et par pertinence

#### Exemple de mise en œuvre
```javascript
class FoodDatabase {
  constructor(initialFoods = []) {
    // Collection principale
    this.foods = initialFoods;
    
    // Index secondaires pour recherche rapide
    this.foodsByCategory = new Map