# Guide de débogage - Keto Meal Planner

Ce document fournit des informations pour tester et déboguer les différentes fonctionnalités de l'application.

## ThemeContext - Système de thèmes

### Points à vérifier

1. **Initialisation et changement de thème**
   - Le thème est correctement chargé depuis localStorage au démarrage
   - La préférence système est utilisée comme fallback
   - La classe de thème (`light`, `dark`, etc.) est correctement appliquée à l'élément racine
   - Le changement de thème fonctionne instantanément et sans erreurs
   - Les thèmes sont persistants entre les sessions

2. **Application du thème par composant**
   - Le thème est correctement appliqué à tous les composants de page
   - Le composant MainLayout applique la classe de thème à toute la page
   - Les composants qui utilisent useTheme() directement reçoivent et utilisent le thème correctement

3. **Variables CSS de thème**
   - Les variables CSS `--bg-primary`, `--bg-secondary`, `--text-primary`, etc. sont correctement redéfinies
   - Les transitions entre thèmes sont fluides
   - Les contrastes sont suffisants pour une bonne lisibilité dans chaque thème

### Tests à effectuer

1. **Test de basculement de thème**
   ```javascript
   const { theme, toggleTheme, setTheme } = useTheme();
   
   // Vérifier le thème actuel
   console.log(`Thème actuel: ${theme}`);
   
   // Basculer le thème
   toggleTheme();
   
   // Vérifier que le thème a changé
   console.log(`Nouveau thème: ${theme}`);
   
   // Définir un thème spécifique
   setTheme('dark');
   console.log(`Thème défini: ${theme}`);
   ```

2. **Test de persistance du thème**
   ```javascript
   // Vérifier le localStorage
   const savedTheme = localStorage.getItem('keto-meal-planner-theme');
   console.log(`Thème sauvegardé: ${savedTheme}`);
   
   // Le thème devrait être cohérent avec celui affiché
   const { theme } = useTheme();
   console.log(`Thème cohérent: ${savedTheme === theme}`);
   ```

3. **Test des variables CSS du thème**
   ```javascript
   // Inspecter l'élément racine pour vérifier la classe de thème
   const rootClasses = document.documentElement.classList;
   console.log(`Classes racine: ${[...rootClasses].join(', ')}`);
   
   // Vérifier les variables CSS de thème
   const computedStyle = getComputedStyle(document.documentElement);
   console.log(`Couleur de fond primaire: ${computedStyle.getPropertyValue('--bg-primary')}`);
   console.log(`Couleur de texte primaire: ${computedStyle.getPropertyValue('--text-primary')}`);
   ```

### Erreurs courantes

1. **Incohérence visuelle entre les pages**
   - Certaines pages peuvent ne pas utiliser le hook useTheme() correctement
   - Vérifier que MainLayout est bien utilisé pour toutes les pages principales
   - S'assurer que les composants spécifiques utilisent les variables CSS de thème

2. **Variables CSS codées en dur**
   - Rechercher les couleurs définies directement dans le CSS au lieu d'utiliser des variables
   - Vérifier l'utilisation de valeurs Tailwind directement (comme bg-white) au lieu des classes adaptées au thème

3. **Classes de thème manquantes**
   - Vérifier que la classe de thème (light/dark) est bien présente sur le conteneur parent
   - S'assurer que les sélecteurs CSS incluent correctement le préfixe de thème (`.light .element`, `.dark .element`)

4. **Problèmes de localStorage**
   - Vérifier que la clé 'keto-meal-planner-theme' est utilisée correctement
   - S'assurer que le thème est sauvegardé à chaque changement
   - Vérifier les erreurs dans la console liées à localStorage

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

## MealPlanContext - Gestion des plans de repas et listes de courses

### Points à vérifier

1. **Chargement initial des plans de repas**
   - Les plans de repas sont correctement chargés depuis localStorage
   - L'état de chargement (`isGenerating`) est correctement géré
   - Les erreurs éventuelles sont capturées et affichées
   - Le plan actif est correctement restauré

2. **Gestion des plans de repas**
   - Création d'un nouveau plan avec un ID unique
   - Validation correcte des données du plan
   - Modification et suppression des plans existants
   - Persistance dans localStorage

3. **Gestion des repas dans le plan**
   - Ajout de repas à un jour spécifique
   - Modification et suppression de repas existants
   - Attribution d'ID uniques aux repas

4. **Génération de liste de courses**
   - Extraction correcte des ingrédients à partir des recettes et aliments
   - Agrégation des quantités pour les ingrédients identiques
   - Conversion en unités pratiques (ex: œufs au lieu de grammes)
   - Organisation par catégories
   - Gestion des cases à cocher

5. **Intégration avec autres contextes**
   - Accès correct aux données de FoodContext et RecipeContext
   - Calculs nutritionnels cohérents avec le reste de l'application

### Tests à effectuer

1. **Test de création de plan de repas**
   ```javascript
   const { createEmptyPlan, mealPlans } = useMealPlan();
   
   // Créer un nouveau plan vide pour une semaine
   const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
   const endDate = new Date();
   endDate.setDate(endDate.getDate() + 6);
   const endDateStr = endDate.toISOString().split('T')[0];
   
   const planId = createEmptyPlan(
     "Mon plan hebdomadaire",
     today,
     endDateStr,
     "keto_standard"
   );
   
   // Vérifier que le plan a été créé
   console.log(mealPlans.some(p => p.id === planId));
   console.log(mealPlans.find(p => p.id === planId));
   
   // Vérifier que le plan a 7 jours
   const createdPlan = mealPlans.find(p => p.id === planId);
   console.log(createdPlan.days.length === 7);
   ```

2. **Test d'ajout de repas au plan**
   ```javascript
   const { addMeal, mealPlans, currentPlan } = useMealPlan();
   
   // Utiliser le plan actif ou le premier plan disponible
   const planId = currentPlan?.id || mealPlans[0]?.id;
   if (!planId) {
     console.error("Aucun plan disponible pour le test");
     return;
   }
   
   // Ajouter un repas au premier jour du plan
   const meal = {
     type: "déjeuner",
     items: [
       {
         type: "recipe",
         id: "salade-avocat-saumon", // ID d'une recette existante
         servings: 1
       }
     ]
   };
   
   const mealId = addMeal(planId, 0, meal);
   
   // Vérifier que le repas a été ajouté
   const updatedPlan = mealPlans.find(p => p.id === planId);
   console.log(updatedPlan.days[0].meals.some(m => m.id === mealId));
   ```

3. **Test de génération de liste de courses**
   ```javascript
   const { generateShoppingListFromPlan, shoppingList, currentPlan } = useMealPlan();
   
   // Utiliser le plan actif ou le premier plan disponible
   const planId = currentPlan?.id || mealPlans[0]?.id;
   if (!planId) {
     console.error("Aucun plan disponible pour le test");
     return;
   }
   
   // Générer la liste de courses
   generateShoppingListFromPlan(planId);
   
   // Vérifier que la liste a été générée
   console.log(shoppingList !== null);
   console.log(shoppingList);
   
   // Vérifier la structure de la liste
   console.log(Object.keys(shoppingList.categories).length > 0);
   ```

4. **Test de mise à jour d'un élément de la liste de courses**
   ```javascript
   const { updateShoppingItem, shoppingList } = useMealPlan();
   
   // S'assurer qu'une liste existe
   if (!shoppingList || Object.keys(shoppingList.categories).length === 0) {
     console.error("Aucune liste de courses disponible pour le test");
     return;
   }
   
   // Prendre la première catégorie et le premier élément
   const firstCategory = Object.keys(shoppingList.categories)[0];
   const firstItem = shoppingList.categories[firstCategory][0];
   
   // Cocher l'élément
   updateShoppingItem(firstCategory, firstItem.id, true);
   
   // Vérifier que l'élément est coché
   console.log(shoppingList.categories[firstCategory].find(item => item.id === firstItem.id).checked);
   ```

5. **Test de calcul nutritionnel d'un jour**
   ```javascript
   const { getDayNutritionTotals, currentPlan } = useMealPlan();
   
   // S'assurer qu'un plan existe avec au moins un repas
   if (!currentPlan || !currentPlan.days[0].meals.length) {
     console.error("Aucun repas disponible pour le test");
     return;
   }
   
   // Calculer les totaux nutritionnels pour le premier jour
   const totals = getDayNutritionTotals(currentPlan.id, 0);
   
   // Vérifier les totaux
   console.log(totals);
   console.log("Calories:", totals.calories);
   console.log("Ratio de lipides:", totals.macroRatios.fat, "%");
   console.log("Ratio de protéines:", totals.macroRatios.protein, "%");
   console.log("Ratio de glucides:", totals.macroRatios.carbs, "%");
   ```

### Erreurs courantes

1. **Erreurs de référence circulaire entre contextes**
   - Assurez-vous que les dépendances entre les contextes sont correctement déclarées
   - Vérifiez que les fonctions externes (getFoodById, getRecipeById) sont passées aux utilitaires

2. **Problèmes avec la génération de liste de courses**
   - Vérifier que toutes les recettes et aliments référencés existent
   - S'assurer que les structures d'objets (day, meal, item) sont correctes
   - Vérifier que la conversion d'unités est appropriée

3. **Erreurs de calcul nutritionnel**
   - Vérifier la cohérence des calculs pour les recettes et les aliments
   - S'assurer que les ratios de macronutriments totalisent 100%
   - Vérifier que les propriétés nutritionnelles attendues sont présentes

4. **Problèmes de validation des plans de repas**
   - Vérifiez les dates (format et validité)
   - Assurez-vous que toutes les propriétés requises sont présentes
   - Vérifiez que les ID sont uniques

5. **Problèmes de persistance**
   - Vérifier les noms de clés localStorage (`keto-meal-planner-meal-plans`, etc.)
   - S'assurer que la structure des objets est compatible avec JSON.stringify()
   - Vérifier les limites de taille de localStorage pour les grands plans

## RecipesPage et FoodsPage - Problèmes d'affichage de thème

Si vous rencontrez des problèmes d'incohérence de thème entre les pages, suivez ces étapes de débogage:

### Points à vérifier

1. **Structure HTML et classes de thème**
   - Vérifier que chaque composant de page inclut la classe de thème (`${theme}`) dans son conteneur principal
   - S'assurer que MainLayout enveloppe correctement toutes les pages principales

2. **Variables CSS et hardcoding**
   - Rechercher les valeurs CSS hardcodées à remplacer par des variables
   - Vérifier l'utilisation cohérente de `var(--bg-primary)`, `var(--text-primary)`, etc.
   - Rechercher les classes Tailwind directes sans préfixe de thème (`dark:`)

3. **Styles spécifiques au thème**
   - S'assurer que les sélecteurs `.light` et `.dark` sont utilisés pour les styles spécifiques
   - Vérifier la spécificité des sélecteurs CSS pour éviter les écrasements

### Tests à effectuer

1. **Inspection visuelle de cohérence**
   - Naviguer entre toutes les pages et vérifier visuellement la cohérence du thème
   - Basculer entre les thèmes clair et sombre sur chaque page

2. **Validation des classes**
   - Inspecter l'élément dans les outils de développement et vérifier la présence des classes de thème
   - Comparer les styles calculés entre différentes pages pour les mêmes éléments

3. **Test de localStorage**
   - Vérifier que le thème est correctement sauvegardé en naviguant entre les pages
   - Rafraîchir la page et s'assurer que le thème est conservé

### Solutions rapides pour les problèmes courants

1. **Page ne réagissant pas au changement de thème**
   - Ajouter `const { theme } = useTheme();` au composant de page
   - Ajouter la classe de thème au conteneur principal: `<div className={`page-container ${theme}`}>`

2. **Couleurs incohérentes entre les pages**
   - Remplacer les couleurs hardcodées par des variables CSS
   - Utiliser les sélecteurs `.light` et `.dark` dans le CSS

3. **Problème de contraste ou lisibilité**
   - Ajuster les variables de couleur de premier plan/arrière-plan pour chaque thème
   - Vérifier les ratios de contraste pour l'accessibilité

Pour plus de détails sur l'implémentation des thèmes, consultez le fichier THEME.md à la racine du projet.