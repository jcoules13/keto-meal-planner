import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

interface ThemeContextType extends ThemeState {
  toggleTheme: () => void;
}

type ThemeAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_THEME' };

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
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    } else {
      // Utiliser la préférence système comme fallback
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch({ type: 'SET_THEME', payload: prefersDark ? 'dark' : 'light' });
    }
  }, []);

  // Appliquer le thème sur le document
  useEffect(() => {
    // Sauvegarder dans localStorage
    localStorage.setItem('keto-meal-planner-theme', state.theme);
    
    // Appliquer la classe sur l'élément html
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const value = {
    ...state,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
