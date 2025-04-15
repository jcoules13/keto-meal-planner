# Prompt pour développer l'application Keto Meal Planner

## Contexte du projet

Je souhaite développer une application web React appelée "Keto Meal Planner - Édition Française" qui permet aux utilisateurs de générer et suivre des plans de repas cétogènes (standard et alcalin), avec calcul automatique des besoins caloriques, liste de courses interactive et suivi de progression.

## Instructions générales

Veuillez m'aider à créer cette application React en suivant une approche méthodique et professionnelle. Tous les textes et l'interface utilisateur doivent être en français. L'application doit être modulaire, maintenable et performante.

## Architecture technique

L'application suivra une architecture basée sur:
- React comme framework principal
- API Context pour la gestion d'état
- LocalStorage pour la persistance des données
- Design responsive pour mobile et desktop
- Approche composants modulaires

## Fonctionnalités principales à développer

1. **Profil utilisateur**
   - Calcul de l'IMC et besoins caloriques
   - Objectifs de poids
   - Préférences alimentaires
   - Allergies et exclusions
   - Configuration du jeûne intermittent

2. **Générateur de plan de repas**
   - Plans keto standard ou keto alcalin
   - Distribution des repas selon préférences
   - Respect des macronutriments et calories
   - Variété des aliments
   - Rotation des protéines

3. **Base de données d'aliments**
   - Valeurs nutritionnelles détaillées
   - Valeurs pH (acidité/alcalinité)
   - Saisonnalité des aliments
   - Filtrages et recherche

4. **Gestion des recettes**
   - Création/modification de recettes personnelles
   - Calcul automatique des valeurs nutritionnelles
   - Bibliothèque de recettes prédéfinies
   - Favoris et étiquettes

5. **Liste de courses**
   - Génération automatique depuis le plan de repas
   - Regroupement par catégories
   - Cases à cocher interactives
   - Ajout d'articles manuels

6. **Suivi du poids**
   - Graphique d'évolution
   - Entrées périodiques
   - Tendances et prédictions
   - Indicateur de progression

## Structure des contextes React

Pour la gestion d'état, nous utiliserons les contextes React suivants:
- `UserContext` - Profil utilisateur et objectifs
- `FoodContext` - Base de données d'aliments
- `RecipeContext` - Recettes et favoris
- `MealPlanContext` - Plans de repas et liste de courses
- `ThemeContext` - Préférences de thème (clair/sombre)

## Modèle de données

Les principales structures de données sont:
- Utilisateur (profil, préférences, objectifs)
- Aliment (valeurs nutritionnelles, pH, saisonnalité)
- Recette (ingrédients, instructions, calculs nutritionnels)
- Repas (composition, timing, macronutriments)
- Plan de repas (collection de repas organisés par jour)
- Liste de courses (aliments agrégés du plan)

## Algorithme de génération de repas

L'algorithme doit:
1. Calculer les besoins caloriques personnalisés
2. Distribuer les calories selon la fréquence des repas
3. Sélectionner des aliments/recettes respectant les contraintes
4. Assurer la variété et éviter les répétitions
5. Équilibrer le pH pour le régime keto alcalin
6. Générer une liste de courses optimisée

## Interface utilisateur

L'interface doit être intuitive, moderne et responsive avec:
- Un design épuré et professionnel
- Des visualisations claires des macronutriments (graphiques)
- Une navigation simple et cohérente
- Support des thèmes clair et sombre
- Adaptation mobile et desktop

## Technologies requises

Veuillez utiliser:
- React 18+
- React Hooks (useState, useEffect, useContext, useReducer)
- React Router pour la navigation
- Recharts pour les graphiques
- LocalStorage pour la persistance
- Tailwind CSS ou équivalent pour les styles

## Demandes spécifiques de code

Pour chaque étape du développement, veuillez fournir:
1. Des composants React modulaires et bien structurés
2. Le code des contextes et des hooks personnalisés
3. La logique de calcul des macronutriments et valeurs nutritionnelles
4. La mise en œuvre de l'algorithme de génération de repas
5. Les composants de visualisation des données
6. La gestion de la persistance des données

## Livrables attendus

À chaque étape, je souhaite:
- Le code source complet et commenté
- Des explications sur les choix techniques
- Des instructions pour tester les fonctionnalités
- Des suggestions d'améliorations possibles

## Points d'attention particuliers

Merci de porter une attention particulière à:
1. La performance (éviter les re-rendus inutiles)
2. L'accessibilité (respecter les normes WCAG)
3. La gestion des erreurs
4. Les validations de données
5. L'expérience utilisateur fluide

## Exemple d'un plan de repas keto

Pour référence, voici l'exemple d'un plan de repas keto typique:

```
Jour 1
Déjeuner (1250 kcal)
- Filet de saumon grillé (200g)
- Asperges vertes rôties (150g) avec huile d'olive
- Sauce hollandaise
- Avocat (1/2)
- Olives vertes (50g)

Dîner (1250 kcal)
- Poulet rôti aux herbes (200g)
- Épinards sautés (200g) avec ail et huile d'olive
- Purée de chou-fleur avec beurre et crème
- Fromage râpé (30g)
```

Merci d'appliquer une méthodologie structurée et professionnelle pour développer cette application, en justifiant vos choix techniques à chaque étape.
