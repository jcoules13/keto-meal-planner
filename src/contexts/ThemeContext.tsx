import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
type BaseTheme = 'light' | 'dark';
type SeasonTheme = 'spring' | 'summer' | 'autumn' | 'winter';
type HolidayTheme = 'christmas' | 'halloween';
type Theme = BaseTheme | SeasonTheme | HolidayTheme;

const allThemes: Theme[] = [
  'light', 'dark', 
  'spring', 'summer', 'autumn', 'winter', 
  'christmas', 'halloween'
];

interface ThemeState {
  theme: Theme;
}

interface ThemeContextType extends ThemeState {
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  getNextTheme: () => Theme;
  allThemes: Theme[];
}

type ThemeAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_THEME' }
  | { type: 'NEXT_THEME' };

// État initial
const initialState: ThemeState = {
  theme: 'light'
};

// Reducer
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    case 'NEXT_THEME': {
      const currentIndex = allThemes.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % allThemes.length;
      return {
        ...state,
        theme: allThemes[nextIndex]
      };
    }
    default:
      return state;
  }
}

// Création du contexte
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
}

// Provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Charger le thème depuis localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('keto-meal-planner-theme');
    if (savedTheme && allThemes.includes(savedTheme as Theme)) {
      dispatch({ type: 'SET_THEME', payload: savedTheme as Theme });
    } else {
      // Utiliser la préférence système comme fallback pour light/dark
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch({ type: 'SET_THEME', payload: prefersDark ? 'dark' : 'light' });
    }
  }, []);

  // Appliquer le thème sur le document
  useEffect(() => {
    // Sauvegarder dans localStorage
    localStorage.setItem('keto-meal-planner-theme', state.theme);
    
    // Enlever toutes les classes de thème précédentes
    document.documentElement.classList.remove(...allThemes, 'dark');
    
    // Ajouter la classe du thème actuel
    document.documentElement.classList.add(state.theme);
    
    // Si le thème est saisonnier ou vacances, ajouter aussi le mode clair/sombre approprié
    if (['spring', 'summer', 'autumn', 'winter', 'christmas', 'halloween'].includes(state.theme)) {
      // Winter et Halloween ont un fond sombre
      if (state.theme === 'winter' || state.theme === 'halloween') {
        document.documentElement.classList.add('dark');
      }
    } else if (state.theme === 'dark') {
      // Ajouter la classe 'dark' pour le thème sombre standard
      document.documentElement.classList.add('dark');
    }
    
    // Définition de la couleur du thème pour les appareils mobiles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        ['dark', 'winter', 'halloween'].includes(state.theme) ? '#121212' : '#ffffff'
      );
    }
  }, [state.theme]);

  // Effet pour suivre les changements de préférence du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Fonction de gestion du changement de préférence
    const handleChange = () => {
      // Ne mettre à jour le thème que si l'utilisateur est en mode auto (thème de base)
      if (['light', 'dark'].includes(state.theme)) {
        dispatch({ 
          type: 'SET_THEME', 
          payload: mediaQuery.matches ? 'dark' : 'light' 
        });
      }
    };

    // Ajout de l'écouteur d'événement
    mediaQuery.addEventListener('change', handleChange);
    
    // Nettoyage de l'écouteur à la destruction du composant
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.theme]);

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const getNextTheme = (): Theme => {
    const currentIndex = allThemes.indexOf(state.theme);
    const nextIndex = (currentIndex + 1) % allThemes.length;
    return allThemes[nextIndex];
  };

  const value = {
    ...state,
    toggleTheme,
    setTheme,
    getNextTheme,
    allThemes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
