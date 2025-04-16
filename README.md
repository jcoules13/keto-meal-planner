# Keto Meal Planner

Une application React moderne pour la planification de repas cétogènes (standard et alcalin), avec calcul automatique des besoins caloriques, liste de courses interactive et suivi de progression.

## 🌟 Fonctionnalités

- Génération de plans de repas personnalisés (keto standard ou keto alcalin)
- Calcul automatique des besoins caloriques et macronutriments
- Base de données d'aliments avec valeurs nutritionnelles et pH
- Recettes keto avec calcul automatique des valeurs nutritionnelles
- Liste de courses générée à partir du plan de repas
- Suivi de poids et progression vers les objectifs
- Interface entièrement en français
- Mode sombre/clair personnalisable

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v16.0.0 ou supérieur)
- npm (v7.0.0 ou supérieur)

### Installation

1. Cloner le dépôt
```bash
git clone https://github.com/jcoules13/keto-meal-planner.git
cd keto-meal-planner
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer l'application en mode développement
```bash
npm start
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## 🧰 Technologies utilisées

- **React 18+** - Bibliothèque UI
- **TypeScript** - Typage statique
- **React Router** - Navigation
- **Tailwind CSS** - Styles et design system
- **Recharts** - Visualisations et graphiques
- **Context API** - Gestion d'état
- **LocalStorage** - Persistance des données

## 📂 Structure du projet

```
src/
├── assets/             # Images, icônes, etc.
├── components/         # Composants React réutilisables
│   ├── layout/         # Composants structurels (Header, Footer, etc.)
│   ├── meals/          # Composants liés aux repas
│   ├── recipes/        # Composants liés aux recettes
│   ├── foods/          # Composants liés aux aliments
│   ├── profile/        # Composants liés au profil utilisateur
│   └── ui/             # Composants d'interface générique
├── contexts/           # Contextes React pour la gestion d'état
├── data/               # Données statiques (base d'aliments initiale)
├── hooks/              # Hooks personnalisés
├── pages/              # Pages principales de l'application
├── services/           # Services pour les opérations complexes
├── styles/             # Styles globaux et variables
└── utils/              # Fonctions utilitaires
```

## 📊 Architecture

L'application utilise une architecture modulaire basée sur les contextes React pour gérer l'état global :

- **ThemeContext** - Gestion des thèmes clair/sombre
- **UserContext** - Profil utilisateur et préférences
- **FoodContext** - Base de données d'aliments et recherche
- **RecipeContext** - Gestion des recettes et favoris
- **MealPlanContext** - Plans de repas et listes de courses

## 🔍 Documentation

Pour plus de détails sur le développement et l'utilisation :

- [Liste des tâches](./CHECKLIST.md) - Suivi de l'avancement du développement
- [Journal des modifications](./CHANGELOG.md) - Historique des changements
- [Guide de débogage](./DEBUGGING.md) - Solutions aux problèmes courants

## 📝 Algorithme de planification des repas

L'algorithme de génération de plans de repas fonctionne en plusieurs étapes :

1. Calcul des besoins nutritionnels personnalisés
2. Distribution des calories entre les repas
3. Sélection intelligente des aliments et recettes
4. Équilibrage des macronutriments
5. Optimisation pour la variété et la saisonnalité
6. Pour le keto alcalin : équilibrage du pH global

## 🌐 Compatibilité

- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design pour mobile, tablette et desktop

## 🛠️ Scripts disponibles

- `npm start` - Lance l'application en mode développement
- `npm build` - Compile l'application pour la production
- `npm test` - Exécute les tests
- `npm eject` - Éjecte la configuration CRA (à utiliser avec prudence)

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez la [checklist de développement](./CHECKLIST.md) pour voir les fonctionnalités à implémenter.

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

---

Développé avec ❤️ pour la communauté keto francophone.