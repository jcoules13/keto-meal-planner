# Guide de débogage - Keto Meal Planner

Ce document fournit des informations pour résoudre les problèmes courants rencontrés lors du développement de l'application Keto Meal Planner.

## Installation et configuration

### Problème : Erreur "tailwind n'est pas reconnu" lors de l'exécution de npx tailwindcss init -p

**Symptômes** : La commande `npx tailwindcss init -p` échoue avec l'erreur :
```
'tailwind' n'est pas reconnu en tant que commande interne ou externe, un programme exécutable ou un fichier de commandes.
```

**Solutions possibles** :
1. Installer Tailwind CSS globalement : `npm install -g tailwindcss`
2. Vérifier que l'installation locale de Tailwind a réussi : `npm list tailwindcss`
3. Utiliser le chemin complet : `./node_modules/.bin/tailwindcss init -p`
4. Réinstaller les dépendances : `npm install`

**Solution appliquée** :
- Les fichiers de configuration ont été créés manuellement (tailwind.config.js et postcss.config.js)

### Problème : Fichier package.json manquant

**Symptômes** : L'erreur suivante s'affiche lors de l'exécution de `npm install` :
```
npm error code ENOENT
npm error syscall open
npm error path [...]/keto-meal-planner/package.json
npm error errno -4058
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '[...]/keto-meal-planner/package.json'
npm error enoent This is related to npm not being able to find a file.
```

**Solutions possibles** :
1. Créer manuellement un fichier package.json avec les dépendances nécessaires
2. Réinitialiser le projet avec `npm init` ou `npx create-react-app`

**Solution appliquée** :
- Création manuelle du fichier package.json avec les dépendances nécessaires pour React, TypeScript, Tailwind CSS, React Router, etc.
- Liste complète des dépendances ajoutées :
  - React et React DOM
  - React Router DOM
  - Recharts pour les graphiques
  - TypeScript
  - Tailwind CSS, PostCSS, Autoprefixer
  - HeadlessUI et HeroIcons pour les composants d'interface
  - React Scripts pour les commandes de développement

**Procédure d'installation après résolution** :
1. Cloner le dépôt
2. Exécuter `npm install` pour installer toutes les dépendances
3. Lancer le projet avec `npm start`

## Problèmes courants et solutions

### Thème sombre ne s'applique pas correctement

**Symptômes** : Le thème sombre ne change pas les couleurs ou ne persiste pas entre les rafraîchissements.

**Solutions possibles** :
1. Vérifier que les classes conditionnelles dark: sont correctement définies dans Tailwind
2. S'assurer que la classe "dark" est bien ajoutée à l'élément HTML
3. Vérifier le localStorage pour la persistance du thème

```javascript
// Vérifier si le thème est correctement stocké
const storedTheme = localStorage.getItem('keto-meal-planner-theme');
console.log('Thème stocké:', storedTheme);

// Vérifier si la classe est présente sur l'élément HTML
const isDarkMode = document.documentElement.classList.contains('dark');
console.log('Mode sombre actif:', isDarkMode);
```

### Problèmes de routage

**Symptômes** : Navigation qui ne fonctionne pas, URL qui changent mais le contenu ne se met pas à jour.

**Solutions possibles** :
1. Vérifier que `<BrowserRouter>` englobe bien votre application
2. S'assurer que les composants `<Route>` sont correctement définis
3. Vérifier les chemins d'accès pour d'éventuelles erreurs de frappe

### Calculs nutritionnels incorrects

**Symptômes** : Les valeurs caloriques ou les macronutriments affichés sont inexacts.

**Solutions possibles** :
1. Vérifier les formules dans le fichier `src/utils/nutritionCalculator.ts`
2. S'assurer que les unités sont cohérentes (grammes, kilogrammes, etc.)
3. Ajouter des journaux de débogage pour tracer les valeurs intermédiaires

```javascript
// Exemple de débogage des calculs
console.log('Données utilisateur:', userData);
const bmr = calculateBMR(userData);
console.log('BMR calculé:', bmr);
const activityFactor = getActivityFactor(userData.activityLevel);
console.log('Facteur d\'activité:', activityFactor);
const calorieNeeds = bmr * activityFactor;
console.log('Besoins caloriques avant ajustement:', calorieNeeds);
```

### Problèmes de stockage local

**Symptômes** : Les données ne persistent pas entre les sessions, erreurs dans localStorage.

**Solutions possibles** :
1. Vérifier que localStorage est disponible avec `isStorageAvailable()`
2. Utiliser le préfixe correct pour toutes les clés : `keto-meal-planner-[key]`
3. S'assurer que les données sont correctement sérialisées avant stockage

## Astuces de développement

### Mode débogage de React

Installer l'extension React Developer Tools pour Chrome ou Firefox pour inspecter les composants et leur état.

### Débogage des performances

Pour identifier les problèmes de performance :
```javascript
// Mesurer le temps d'exécution
console.time('nomOperation');
// Code à mesurer
console.timeEnd('nomOperation');

// Profiler un composant React
<React.Profiler id="monComposant" onRender={callback}>
  <MonComposant />
</React.Profiler>
```

### Vérification de l'accessibilité

Utiliser les outils suivants pour vérifier l'accessibilité :
- Extension axe DevTools pour Chrome
- Fonction de test de contraste dans les outils de développement du navigateur

## Problèmes connus à résoudre

1. **Initialisation Tailwind** : La commande `npx tailwindcss init -p` ne fonctionne pas directement - résolu en créant manuellement les fichiers de configuration.
2. **Fichier package.json manquant** : Erreur lors de l'installation - résolu en créant manuellement le fichier package.json avec les dépendances nécessaires.

## Ressources utiles

- [Documentation officielle de React](https://reactjs.org/docs/getting-started.html)
- [Documentation de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation de React Router](https://reactrouter.com/docs/en/v6)