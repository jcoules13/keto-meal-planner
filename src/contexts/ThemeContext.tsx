import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types de thème disponibles
type Theme = 'light' | 'dark';

// Interface définissant la structure du contexte de thème
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Création du contexte avec une valeur par défaut undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props pour le ThemeProvider
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

/**
 * ThemeProvider - Composant fournissant le contexte de thème à l'application
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme 
}) => {
  // État local pour stocker le thème actuel
  const [theme, setThemeState] = useState<Theme>(() => {
    // Récupération du thème depuis localStorage si disponible
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    // Utilisation du thème initial si fourni
    if (initialTheme) {
      return initialTheme;
    }
    
    // Sinon, utiliser le thème sauvegardé ou le thème préféré du système
    return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Fonction pour définir directement un thème
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Effet pour appliquer le thème au document HTML
  useEffect(() => {
    // Sauvegarde du thème dans localStorage
    localStorage.setItem('theme', theme);
    
    // Application des classes CSS au niveau du document
    const root = window.document.documentElement;
    
    // Suppression des classes de thème existantes
    root.classList.remove('light', 'dark');
    
    // Ajout de la classe correspondant au thème actuel
    root.classList.add(theme);
    
    // Définition de la couleur du thème pour les appareils mobiles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#121212' : '#ffffff'
      );
    }
  }, [theme]);

  // Effet pour suivre les changements de préférence du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Fonction de gestion du changement de préférence
    const handleChange = () => {
      // Ne mettre à jour le thème que si l'utilisateur n'a pas explicitement choisi un thème
      if (!localStorage.getItem('theme')) {
        setThemeState(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // Ajout de l'écouteur d'événement
    mediaQuery.addEventListener('change', handleChange);
    
    // Nettoyage de l'écouteur à la destruction du composant
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Valeur du contexte à fournir aux composants enfants
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme - Hook personnalisé pour accéder au contexte de thème
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  // Vérification que le hook est utilisé dans un ThemeProvider
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  
  return context;
};

export default ThemeProvider;
