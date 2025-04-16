// src/components/ui/ThemeIndicator.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import * as FaIcons from 'react-icons/fa';

/**
 * Composant qui affiche l'indicateur du thème actuel
 */
const ThemeIndicator: React.FC = () => {
  const { theme } = useTheme();
  
  // Fonction pour rendre l'icône correspondant au thème actuel
  const renderThemeIcon = () => {
    switch (theme) {
      case 'light':
        return React.createElement(FaIcons.FaSun, { className: "text-yellow-400" });
      case 'dark':
        return React.createElement(FaIcons.FaMoon, { className: "text-indigo-300" });
      case 'spring':
        return React.createElement(FaIcons.FaLeaf, { className: "text-green-400" });
      case 'summer':
        return React.createElement(FaIcons.FaUmbrella, { className: "text-cyan-400" });
      case 'autumn':
        return React.createElement(FaIcons.FaMapLeaf || FaIcons.FaLeaf, { className: "text-orange-500" });
      case 'winter':
        return React.createElement(FaIcons.FaSnowflake, { className: "text-blue-300" });
      case 'halloween':
        return React.createElement(FaIcons.FaGhost, { className: "text-purple-400" });
      case 'christmas':
        return React.createElement(FaIcons.FaTree, { className: "text-green-500" });
      default:
        return React.createElement(FaIcons.FaSun, { className: "text-yellow-400" });
    }
  };

  // Fonction pour obtenir le libellé du thème actuel
  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Thème Clair';
      case 'dark':
        return 'Thème Sombre';
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
        return 'Thème Clair';
    }
  };

  // Obtenir la couleur de fond pour le badge selon le thème
  const getBadgeColor = () => {
    switch (theme) {
      case 'light':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dark':
        return 'bg-indigo-900 text-indigo-100 border-indigo-700';
      case 'spring':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'summer':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'autumn':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'winter':
        return 'bg-blue-900 text-blue-100 border-blue-700';
      case 'halloween':
        return 'bg-purple-900 text-purple-100 border-purple-700';
      case 'christmas':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center">
      <div className={`flex items-center gap-1.5 rounded-full py-0.5 px-2.5 border ${getBadgeColor()} transition-colors`}>
        <span className="text-sm">{renderThemeIcon()}</span>
        <span className="text-xs font-medium">{getThemeLabel()}</span>
      </div>
    </div>
  );
};

export default ThemeIndicator;
