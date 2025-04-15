# Composants d'interface utilisateur

L'application Keto Meal Planner utilise une architecture de composants React modulaire et réutilisable. Cette approche favorise la maintenabilité et la cohérence visuelle tout en permettant un développement agile.

## Hiérarchie des composants

```
App
├── ThemeProvider
├── Layouts
│   ├── MainLayout
│   ├── AuthLayout
│   └── PrintLayout
├── Pages
│   ├── HomePage
│   ├── ProfilePage
│   ├── MealPlannerPage
│   ├── RecipesPage
│   ├── FoodsPage
│   ├── ShoppingListPage
│   ├── WeightTrackerPage
│   └── SettingsPage
├── Navigation
│   ├── AppHeader
│   ├── AppFooter
│   ├── Sidebar
│   └── BottomNav (mobile)
└── Modals
    ├── CreateRecipeModal
    ├── EditProfileModal
    ├── AddFoodModal
    └── ConfirmationModal
```

## Composants principaux

### Composants de page

#### `HomePage`
Page d'accueil présentant un tableau de bord avec:
- Résumé du plan de repas actuel
- Graphique d'évolution du poids
- Accès rapides aux fonctionnalités principales

#### `ProfilePage`
Page de profil utilisateur avec:
- Informations personnelles (âge, sexe, poids, taille)
- Calcul de l'IMC
- Objectifs et préférences alimentaires
- Historique des mesures

#### `MealPlannerPage`
Page principale de génération de plans de repas:
- Sélection du type de régime (keto standard/alcalin)
- Choix de la durée du plan (jour, semaine)
- Options de personnalisation
- Visualisation du plan généré avec macronutriments

#### `RecipesPage`
Bibliothèque de recettes avec:
- Filtres avancés (keto standard/alcalin, plats principaux/desserts, etc.)
- Ajout/édition de recettes personnelles
- Calcul automatique des macronutriments et du pH
- Favoris et notation

#### `FoodsPage`
Base de données d'aliments avec:
- Liste catégorisée des aliments
- Filtres par valeurs nutritionnelles, pH, saisonnalité
- Détails nutritionnels complets
- Ajout d'aliments personnalisés

#### `ShoppingListPage`
Liste de courses générée à partir du plan de repas:
- Regroupement par catégories d'aliments
- Cases à cocher interactives
- Ajout manuel d'articles
- Option d'impression ou partage

#### `WeightTrackerPage`
Suivi de poids et mesures corporelles:
- Graphique d'évolution du poids
- Tendances et prédictions
- Enregistrement d'entrées quotidiennes/hebdomadaires
- Indicateur de progression vers l'objectif

#### `SettingsPage`
Configuration de l'application:
- Préférences d'affichage (thème clair/sombre)
- Unités de mesure (métrique/impérial)
- Notifications et rappels
- Importation/exportation de données

### Composants de layout

#### `MainLayout`
Layout principal avec:
- En-tête avec navigation
- Barre latérale (desktop)
- Navigation inférieure (mobile)
- Zone de contenu principale

#### `AuthLayout`
Layout simplifié pour les pages d'authentification.

#### `PrintLayout`
Layout optimisé pour l'impression des plans de repas et listes de courses.

### Composants de navigation

#### `AppHeader`
En-tête de l'application avec:
- Logo et nom de l'application
- Navigation principale
- Menu utilisateur
- Recherche globale

#### `Sidebar`
Barre latérale (desktop) avec:
- Liens vers les pages principales
- Raccourcis personnalisés
- Progression des objectifs

#### `BottomNav`
Navigation inférieure (mobile) avec:
- Icônes d'accès aux pages principales
- Indicateur de page active

### Composants de meal planning

#### `MealPlanGenerator`
Formulaire de génération de plan de repas avec options avancées.

#### `MealPlanCalendar`
Affichage calendrier du plan de repas hebdomadaire.

#### `MealPlanDayView`
Vue détaillée d'une journée du plan de repas.

#### `MealCard`
Carte représentant un repas individuel dans le plan.

#### `MacroSummary`
Résumé des macronutriments d'un repas ou d'une journée.

#### `NutritionTable`
Tableau détaillé des valeurs nutritionnelles.

### Composants de recettes

#### `RecipeCard`
Carte de présentation d'une recette avec image et infos clés.

#### `RecipeForm`
Formulaire d'ajout/édition de recette.

#### `RecipeDetail`
Vue détaillée d'une recette avec ingrédients, instructions et valeurs nutritionnelles.

#### `IngredientList`
Liste des ingrédients d'une recette avec quantités.

#### `InstructionsList`
Liste numérotée des étapes de préparation d'une recette.

### Composants d'aliments

#### `FoodCard`
Carte de présentation d'un aliment avec infos nutritionnelles clés.

#### `FoodDetail`
Vue détaillée d'un aliment avec toutes les valeurs nutritionnelles.

#### `FoodCategoryList`
Liste des aliments regroupés par catégorie.

#### `SeasonalityIndicator`
Indicateur visuel de saisonnalité d'un aliment.

#### `pHIndicator`
Indicateur visuel du niveau d'acidité/alcalinité d'un aliment.

### Composants de suivi

#### `WeightGraph`
Graphique d'évolution du poids dans le temps.

#### `WeightEntryForm`
Formulaire d'ajout d'une nouvelle entrée de poids.

#### `ProgressIndicator`
Indicateur visuel de progression vers l'objectif de poids.

#### `BMICalculator`
Calculateur d'IMC avec interprétation.

### Composants d'interface communs

#### `Button`
Bouton avec différentes variantes (primaire, secondaire, tertiaire, fantôme).

#### `Input`
Champ de saisie avec validation et messages d'erreur.

#### `Select`
Liste déroulante pour sélection d'options.

#### `Checkbox`
Case à cocher avec libellé.

#### `RadioGroup`
Groupe de boutons radio.

#### `Tabs`
Onglets pour la navigation entre différentes sections d'une page.

#### `Card`
Conteneur avec ombre et coins arrondis pour présenter des informations.

#### `Modal`
Fenêtre modale pour l'affichage de formulaires ou de confirmations.

#### `Toast`
Notification temporaire pour informer l'utilisateur d'actions réussies ou d'erreurs.

#### `Loader`
Indicateur de chargement animé.

#### `Avatar`
Image de profil utilisateur avec différentes tailles et variantes.

#### `Badge`
Indicateur numérique ou textuel pour notifications ou étiquettes.

#### `ToggleSwitch`
Interrupteur pour activer/désactiver des fonctionnalités.

#### `Slider`
Curseur pour la sélection de valeurs numériques dans une plage.

#### `ProgressBar`
Barre de progression pour visualiser l'avancement.

#### `Tooltip`
Bulle d'information contextuelle au survol d'un élément.

## Design System

### Palette de couleurs

**Palette principale**
- `primary-50` à `primary-900`: Dégradé de vert (vert keto)
- `secondary-50` à `secondary-900`: Dégradé de bleu-violet (accent)
- `neutral-50` à `neutral-900`: Dégradé de gris pour le texte et les fonds

**Couleurs sémantiques**
- `success`: Vert pour les confirmations
- `warning`: Orange pour les avertissements
- `error`: Rouge pour les erreurs
- `info`: Bleu pour les informations

**Couleurs spécifiques à la fonctionnalité**
- `protein`: Couleur pour représenter les protéines (rouge-rose)
- `fat`: Couleur pour représenter les lipides (jaune-orange)
- `carbs`: Couleur pour représenter les glucides (bleu-vert)
- `acidic`: Couleur pour représenter les aliments acides (orange)
- `alkaline`: Couleur pour représenter les aliments alcalins (vert-bleu)

### Typographie

**Familles de polices**
- Titre: `Montserrat` (sans-serif)
- Corps: `Open Sans` (sans-serif)
- Monospace: `Source Code Pro` (pour les valeurs nutritionnelles)

**Échelle de taille**
- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)
- `text-3xl`: 1.875rem (30px)
- `text-4xl`: 2.25rem (36px)

### Espacement

Système d'espacement basé sur une unité de base de 4px:
- `space-0`: 0
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-3`: 0.75rem (12px)
- `space-4`: 1rem (16px)
- `space-5`: 1.25rem (20px)
- `space-6`: 1.5rem (24px)
- `space-8`: 2rem (32px)
- `space-10`: 2.5rem (40px)
- `space-12`: 3rem (48px)
- `space-16`: 4rem (64px)

### Rayons de bordure

- `rounded-none`: 0
- `rounded-sm`: 0.125rem (2px)
- `rounded`: 0.25rem (4px)
- `rounded-md`: 0.375rem (6px)
- `rounded-lg`: 0.5rem (8px)
- `rounded-xl`: 0.75rem (12px)
- `rounded-2xl`: 1rem (16px)
- `rounded-full`: 9999px (cercle ou pilule)

### Ombres

- `shadow-sm`: Ombre légère
- `shadow`: Ombre moyenne
- `shadow-md`: Ombre prononcée
- `shadow-lg`: Ombre accentuée
- `shadow-xl`: Ombre très accentuée
- `shadow-2xl`: Ombre maximale
- `shadow-inner`: Ombre intérieure

### Breakpoints responsive

- `sm`: 640px (smartphones)
- `md`: 768px (tablettes)
- `lg`: 1024px (petits écrans)
- `xl`: 1280px (grands écrans)
- `2xl`: 1536px (très grands écrans)

## Accessibilité

Tous les composants sont conçus pour respecter les normes WCAG 2.1 AA:

- Contraste de couleur suffisant (rapport minimum de 4.5:1 pour le texte normal)
- Support de la navigation au clavier
- Attributs ARIA appropriés
- Messages d'erreur explicites
- Textes alternatifs pour les images
- Structure de contenu sémantique

## Thèmes

L'application propose deux thèmes principaux:

**Thème clair**
- Fond principal: Blanc
- Fond secondaire: Gris très clair
- Texte principal: Gris très foncé
- Texte secondaire: Gris moyen

**Thème sombre**
- Fond principal: Gris très foncé
- Fond secondaire: Gris foncé
- Texte principal: Blanc
- Texte secondaire: Gris clair

## Animations et transitions

- Transitions douces de 150-300ms pour les états des composants (hover, focus, active)
- Animations d'entrée/sortie pour les modales et notifications
- Animations de chargement pour les états de chargement
- Transitions entre les pages pour une expérience fluide