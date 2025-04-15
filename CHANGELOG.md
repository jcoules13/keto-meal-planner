# Changelog - Keto Meal Planner

Ce fichier retrace l'historique des modifications apportées au projet.

## [Non publié]

### Ajouté
- Implémentation du FoodContext pour la gestion de la base de données alimentaire
- Système de filtrage modulaire pour les aliments (par catégorie, régime, valeurs nutritionnelles, etc.)
- Base de données initiale avec 20 aliments adaptés au régime keto
- Fonction de détection automatique de la saison courante
- Persistance des aliments personnalisés dans le localStorage

### Modifié
- N/A

### Corrigé
- N/A

### Technique
- Utilisation du pattern Context + useReducer pour une gestion d'état prévisible
- Optimisation des recherches avec filtrage à la demande
- Structure des données optimisée pour faciliter les recherches et le filtrage