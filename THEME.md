# Guide de Gestion des Thèmes - Keto Meal Planner

Ce document explique comment les thèmes sont implémentés et comment les utiliser correctement dans l'application Keto Meal Planner.

## Architecture des thèmes

L'application utilise un système de thème basé sur des classes CSS et des variables CSS personnalisées. Les principaux éléments sont :

1. **ThemeContext** : Un contexte React qui gère l'état du thème (`light`, `dark`, et les variantes saisonnières)
2. **Variables CSS** : Définies dans `index.css` pour les couleurs, espacements, etc.
3. **Classes de thème** : `.light`, `.dark`, etc. appliquées à la racine des composants

## Structure des thèmes

### Variables CSS globales

Le fichier `index.css` définit des variables CSS pour les couleurs principales, qui sont ensuite redéfinies pour chaque thème :

```css
:root {
  /* Couleurs de base */
  --primary-50: #f0fdf4;
  --primary-100: #dcfce7;
  /* ... autres couleurs primaires ... */
  
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  /* ... autres couleurs neutres ... */
  
  /* Variables thématiques par défaut (thème clair) */
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-700);
  --bg-primary: var(--neutral-50);
  --bg-secondary: var(--neutral-100);
  --border-color: var(--neutral-200);
}

/* Thème sombre - redéfinit les variables */
.dark {
  --text-primary: var(--neutral-100);
  --text-secondary: var(--neutral-300);
  --bg-primary: var(--neutral-900);
  --bg-secondary: var(--neutral-800);
  --border-color: var(--neutral-700);
}
```

## Comment implémenter un nouveau composant avec support de thème

### Approche 1 : Via MainLayout (recommandé)

Les pages principales bénéficient automatiquement du thème grâce au composant `MainLayout` qui applique la classe de thème à la racine. Vous n'avez qu'à utiliser les variables CSS dans votre CSS de composant :

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Approche 2 : Utilisation directe du hook useTheme

Pour les composants qui ne sont pas directement enveloppés par `MainLayout`, utilisez le hook `useTheme` :

```jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './MyComponent.css';

const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`my-component ${theme}`}>
      {/* Contenu du composant */}
    </div>
  );
};
```

### CSS spécifique au thème

Pour les règles CSS qui nécessitent des valeurs différentes selon le thème, utilisez les sélecteurs de classe :

```css
/* Style par défaut (thème clair) */
.my-element {
  /* styles communs */
}

/* Styles spécifiques au thème clair */
.light .my-element {
  background-color: white;
  color: black;
}

/* Styles spécifiques au thème sombre */
.dark .my-element {
  background-color: #1e1e1e;
  color: white;
}
```

## Bonnes pratiques

1. **Utilisez les variables CSS** au lieu de coder en dur les couleurs
2. **Testez toujours les deux thèmes** lors du développement de nouveaux composants
3. **Utilisez des contrastes suffisants** pour garantir la lisibilité dans les deux thèmes
4. **Ajoutez des transitions** pour les changements de thème (`transition: color 0.3s, background-color 0.3s`)
5. **Évitez d'ajouter manuellement des classes** comme `.dark:text-white` - utilisez les variables CSS

## Dépannage

Si le thème ne fonctionne pas correctement sur une page ou un composant :

1. Vérifiez que le composant utilise soit `MainLayout`, soit le hook `useTheme`
2. Vérifiez que vous utilisez les variables CSS ou les sélecteurs de thème dans votre CSS
3. Inspectez l'élément dans les outils de développement pour vous assurer que la classe de thème est bien appliquée

## Exemple complet

Voici un exemple de composant avec support complet du thème :

**MonComposant.jsx**
```jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './MonComposant.css';

const MonComposant = () => {
  const { theme } = useTheme();

  return (
    <div className={`mon-composant ${theme}`}>
      <h2 className="titre">Titre du composant</h2>
      <div className="contenu">
        <p>Contenu du composant...</p>
      </div>
    </div>
  );
};

export default MonComposant;
```

**MonComposant.css**
```css
.mon-composant {
  padding: 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.titre {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--primary-600);
}

.light .titre {
  border-bottom: 1px solid var(--primary-200);
}

.dark .titre {
  border-bottom: 1px solid var(--primary-800);
}

.contenu {
  line-height: 1.5;
}
```