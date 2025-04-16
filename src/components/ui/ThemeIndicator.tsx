// src/components/ui/ThemeIndicator.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FaSun, FaMoon, FaLeaf, FaUmbrella, 
  FaCanadianMapleLeaf, FaSnowflake, FaGhost, FaTree 
} from 'react-icons/fa';

/**
 * Composant qui affiche l'indicateur du thème actuel
 * Utilise des icônes différentes selon le thème
 */
const ThemeIndicator: React.FC = () => {
  const { theme } = useTheme();
  
  // Fonction pour obtenir l'icône correspondant au thème actuel
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <FaSun className="text-yellow-400" />;
      case 'dark':
        return <FaMoon className="text-indigo-300" />;
      case 'spring':
        return <FaLeaf className="text-green-400" />;
      case 'summer':
        return <FaUmbrella className="text-cyan-400" />;
      case 'autumn':
        return <FaCanadianMapleLeaf className="text-orange-500" />;
      case 'winter':
        return <FaSnowflake className="text-blue-300" />;
      case 'halloween':
        return <FaGhost className="text-purple-400" />;
      case 'christmas':
        return <FaTree className="text-green-500" />;
      default:
        return <FaSun className="text-yellow-400" />;
    }
  };

  // Fonction pour obtenir le libellé du thème actuel
  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Clair';
      case 'dark':
        return 'Sombre';
      case 'spring':
        return 'Printemps';
      case 'summer':
        return 'Été';
      case 'autumn':
        return 'Automne';
      case 'winter':
        return 'Hiver';
      case 'halloween':
        return 'Halloween';
      case 'christmas':
        return 'Noël';
      default:
        return 'Clair';
    }
  };

  // Obtenir la couleur de fond pour le badge selon le thème
  const getBadgeColor = () => {
    switch (theme) {
      case 'light':
        return 'bg-yellow-100 text-yellow-800';
      case 'dark':
        return 'bg-indigo-900 text-indigo-100';
      case 'spring':
        return 'bg-green-100 text-green-800';
      case 'summer':
        return 'bg-cyan-100 text-cyan-800';
      case 'autumn':
        return 'bg-orange-100 text-orange-800';
      case 'winter':
        return 'bg-blue-900 text-blue-100';
      case 'halloween':
        return 'bg-purple-900 text-purple-100';
      case 'christmas':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-3 flex items-center">
      <div className={`flex items-center gap-2 rounded-full py-1 px-3 ${getBadgeColor()}`}>
        <span className="text-sm">{getThemeIcon()}</span>
        <span className="text-xs font-medium">{getThemeLabel()}</span>
      </div>
    </div>
  );
};

export default ThemeIndicator;
