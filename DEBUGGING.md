# Guide de débogage - Keto Meal Planner

Ce document fournit des informations pour tester et déboguer les différentes fonctionnalités de l'application.

## RecipeContext - Gestion des recettes

### Points à vérifier

1. **Chargement initial des recettes**
   - Les recettes prédéfinies du fichier `recipes.json` sont correctement chargées
   - L'état de chargement (`loading`) est correctement géré
   - Les erreurs éventuelles sont capturées et affichées
   - Les favoris sont correctement récupérés depuis localStorage

2. **Filtrage des recettes**
   - Les filtres par texte fonctionnent correctement (insensibles à la casse)
   - Les filtres par type de repas filtrent correctement selon les tags
   - Les filtres keto et alcalin fonctionnent selon les propriétés `isKeto` et `isAlkaline`
   - Les filtres de temps de préparation et valeurs nutritionnelles appliquent correctement les seuils
   - Le filtre favoris affiche uniquement les recettes marquées comme favorites

3. **Gestion des recettes personnalisées**
   - Les nouvelles recettes sont ajoutées avec un ID unique et la propriété `isUserCreated: true`
   - Les recettes personnalisées sont correctement sauvegardées dans localStorage
   - Les recettes personnalisées sont correctement chargées au démarrage de l'application
   - Les modifications et suppressions de recettes personnalisées sont correctement gérées
   - Les favoris sont correctement gérés (ajout/suppression)

4. **Calculs nutritionnels**
   - Le calcul des valeurs nutritionnelles d'une recette fonctionne correctement
   - Le calcul du pH moyen est pondéré selon les quantités des ingrédients
   - Les propriétés dérivées (isKeto, isAlkaline) sont mises à jour après modification

5. **Intégration avec FoodContext**
   - Les calculs nutritionnels accèdent correctement aux données d'aliments via FoodContext
   - Les changements dans la base alimentaire sont reflétés dans les calculs des recettes

### Tests à effectuer

1. **Test de chargement**
   ```javascript
   const { recipes, loading, error } = useRecipe();
   
   // Vérifier que recipes contient les recettes et que loading est à false
   console.log(recipes.length > 0 && !loading);
   
   // Vérifier qu'il n'y a pas d'erreur
   console.log(error === null);
   ```

2. **Test de filtrage**
   ```javascript
   const { setFilter, filteredRecipes } = useRecipe();
   
   // Tester le filtre par texte
   setFilter('query', 'avocat');
   console.log(filteredRecipes); // Devrait inclure les recettes avec avocat
   
   // Tester le filtre par type de repas
   setFilter('mealType', 'déjeuner');
   console.log(filteredRecipes); // Devrait inclure les recettes pour le déjeuner
   
   // Tester le filtre de temps de préparation
   setFilter('maxPrepTime', 15);
   console.log(filteredRecipes); // Devrait inclure uniquement les recettes rapides
   
   // Réinitialiser les filtres
   resetFilters();
   ```

3. **Test d'ajout de recette**
   ```javascript
   const { addRecipe, recipes } = useRecipe();
   
   // Ajouter une nouvelle recette
   const newRecipe = {
     name: "Ma recette test",
     description: "Une recette de test",
     prepTime: 10,
     cookTime: 20,
     servings: 2,
     ingredients: [
       { foodId: "poulet-blanc", quantity: 200, unit: "g" },
       { foodId: "huile-olive", quantity: 15, unit: "g" }
     ],
     instructions: [
       "Étape 1: faire revenir le poulet",
       "Étape 2: servir"
     ],
     tags: ["dîner", "viande", "rapide"]
   };
   
   const newRecipeId = addRecipe(newRecipe);
   
   // Vérifier que la recette a été ajoutée
   console.log(recipes.some(r => r.id === newRecipeId));
   
   // Vérifier que les valeurs nutritionnelles ont été calculées
   const addedRecipe = recipes.find(r => r.id === newRecipeId);
   console.log(addedRecipe.nutritionPerServing);
   
   // Rafraîchir la page et vérifier que la recette est toujours là (persistance)
   ```

4. **Test de calcul nutritionnel**
   ```javascript
   const { calculateRecipeNutrition } = useRecipe();
   
   const ingredients = [
     { foodId: "saumon", quantity: 200, unit: "g" },
     { foodId: "avocat", quantity: 100, unit: "g" }
   ];
   
   const nutrition = calculateRecipeNutrition(ingredients);
   console.log(nutrition); // Vérifier les valeurs nutritionnelles calculées
   ```

5. **Test de favoris**
   ```javascript
   const { toggleFavorite, recipes } = useRecipe();
   
   // Ajouter une recette aux favoris
   const recipeId = recipes[0].id;
   toggleFavorite(recipeId);
   
   // Vérifier que la recette est marquée comme favorite
   console.log(recipes.find(r => r.id === recipeId).isFavorite);
   
   // Rafraîchir la page et vérifier que le favori est conservé
   ```

### Erreurs courantes

1. **Erreurs de calcul nutritionnel**
   - Vérifier que tous les aliments référencés existent dans la base de données
   - S'assurer que les quantités sont positives et numériques
   - Vérifier que la conversion d'unités est correcte

2. **Problèmes de synchronisation avec FoodContext**
   - Vérifier que FoodContext est correctement initialisé avant les calculs
   - S'assurer que useFood() est appelé dans le bon contexte (à l'intérieur d'un FoodProvider)

3. **Erreurs de filtrage**
   - Vérifier que les noms des filtres correspondent exactement aux propriétés attendues
   - S'assurer que les valeurs sont du bon type (string, number, boolean)
   - Vérifier que les propriétés nécessaires (tags, nutritionPerServing) existent sur toutes les recettes

4. **Problèmes avec localStorage**
   - Vérifier que les noms des clés localStorage sont cohérents
   - Tester dans une fenêtre de navigation privée pour détecter les problèmes de quota
   - Vérifier les erreurs de parsing JSON dans la console

## FoodContext - Base de données alimentaire

### Points à vérifier

1. **Chargement initial des aliments**
   - Les aliments prédéfinis du fichier `foods.json` sont correctement chargés
   - Les catégories sont automatiquement extraites et disponibles dans `state.categories`
   - L'état de chargement (`loading`) est correctement géré
   - Les erreurs éventuelles sont capturées et affichées

2. **Filtrage des aliments**
   - Les filtres par texte fonctionnent correctement (insensibles à la casse)
   - Les filtres par catégorie sélectionnent uniquement les aliments de la catégorie choisie
   - Les filtres keto et alcalin fonctionnent selon les propriétés `isKeto` et `isAlkaline`
   - Le filtre saisonnier tient compte de la saison actuelle et de la propriété `seasons`
   - Les filtres numériques (macronutriments, pH) fonctionnent avec les seuils définis

3. **Gestion des aliments personnalisés**
   - Les nouveaux aliments sont ajoutés avec un ID unique et la propriété `isCustom: true`
   - Les aliments personnalisés sont correctement sauvegardés dans localStorage
   - Les aliments personnalisés sont correctement chargés au démarrage de l'application
   - Les modifications et suppressions d'aliments personnalisés sont correctement gérées

4. **Méthodes utilitaires**
   - `getFoodById` retourne l'aliment correspondant à l'ID ou null si non trouvé
   - `searchFoods` retourne les aliments correspondant au terme de recherche

### Tests à effectuer

1. **Test de chargement**
   ```javascript
   const { foods, loading, error } = useFood();
   
   // Vérifier que foods contient les aliments et que loading est à false
   console.log(foods.length > 0 && !loading);
   
   // Vérifier qu'il n'y a pas d'erreur
   console.log(error === null);
   ```

2. **Test de filtrage**
   ```javascript
   const { setFilter, filteredFoods } = useFood();
   
   // Tester le filtre par texte
   setFilter('query', 'poulet');
   console.log(filteredFoods); // Devrait inclure "Blanc de poulet"
   
   // Tester le filtre par catégorie
   setFilter('category', 'légumes');
   console.log(filteredFoods); // Devrait inclure tous les légumes
   
   // Tester le filtre alcalin
   setFilter('isAlkaline', true);
   console.log(filteredFoods); // Devrait inclure uniquement les aliments alcalins
   
   // Réinitialiser les filtres
   resetFilters();
   ```

3. **Test d'ajout d'aliment personnalisé**
   ```javascript
   const { addCustomFood, foods } = useFood();
   
   // Ajouter un nouvel aliment
   const newFood = {
     name: "Mon aliment test",
     category: "légumes",
     nutritionPer100g: {
       calories: 50,
       protein: 2,
       fat: 1,
       carbs: 5,
       fiber: 2,
       netCarbs: 3
     },
     pHValue: 7.2,
     isKeto: true,
     isAlkaline: true,
     seasons: ["printemps", "été"]
   };
   
   addCustomFood(newFood);
   
   // Vérifier que l'aliment a été ajouté
   console.log(foods.some(f => f.name === "Mon aliment test"));
   
   // Rafraîchir la page et vérifier que l'aliment est toujours là (persistance)
   ```

### Erreurs courantes

1. **Erreur de type undefined**
   - Vérifier que tous les aliments ont la structure attendue avec toutes les propriétés nécessaires
   - S'assurer que les valeurs nutritionnelles suivent la structure `nutritionPer100g`

2. **Filtres ne fonctionnant pas**
   - Vérifier que les noms des filtres correspondent exactement aux propriétés attendues
   - Vérifier que les valeurs sont du bon type (string, number, boolean)

3. **Problèmes avec localStorage**
   - Vérifier que les noms des clés localStorage sont cohérents
   - Tester dans une fenêtre de navigation privée pour détecter les problèmes de quota
   - Vérifier les erreurs de parsing JSON dans la console

## FoodsPage - Page de visualisation des aliments

### Points à vérifier

1. **Intégration avec le routage**
   - La page est correctement reliée à la route `/foods` dans App.tsx
   - La navigation vers la page fonctionne depuis le menu principal
   - Le FoodProvider est bien présent dans l'arbre de composants

2. **Rendu des composants**
   - Tous les composants (FoodCard, FoodDetail, SearchBar, etc.) s'affichent correctement
   - Les états de chargement et d'erreur sont correctement gérés
   - Les filtres fonctionnent comme attendu

3. **Interactions utilisateur**
   - Le clic sur une carte d'aliment ouvre correctement le détail
   - La recherche filtre correctement les aliments affichés
   - Les filtres de catégorie, régime, etc. fonctionnent correctement
   - Le bouton pour réinitialiser les filtres fonctionne

4. **Responsive design**
   - L'interface s'adapte correctement aux différentes tailles d'écran
   - Le panneau de filtres se comporte correctement en mode mobile

### Dépendances requises

Pour que la page FoodsPage fonctionne correctement, les dépendances suivantes doivent être installées:

```
npm install react-icons react-helmet @types/react-helmet
```

### Erreurs courantes

1. **Erreurs liées aux dépendances manquantes**
   - Si les icônes ne s'affichent pas : vérifier que `react-icons` est installé
   - Si des erreurs concernant `react-helmet` apparaissent : vérifier son installation

2. **Problèmes d'affichage des aliments**
   - Vérifier que FoodContext est correctement intégré et initialisé
   - S'assurer que la méthode getFilteredFoods() renvoie les résultats attendus
   - Vérifier que la structure des objets alimentaires correspond à celle attendue par les composants

3. **Problèmes de performance**
   - Si le rendu est lent, vérifier l'utilisation de useMemo et useCallback
   - Pour les listes longues, envisager l'implémentation d'une virtualisation