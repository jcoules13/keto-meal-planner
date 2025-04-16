// src/components/ui/ThemeIndicator.tsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Composant qui affiche l'indicateur du thème actuel
 */
const ThemeIndicator: React.FC = () => {
  const { theme } = useTheme();
  
  // Fonction pour obtenir l'emoji correspondant au thème actuel
  const getThemeEmoji = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'spring':
        return '🌱';
      case 'summer':
        return '🏖️';
      case 'autumn':
        return '🍂';
      case 'winter':
        return '❄️';
      case 'halloween':
        return '👻';
      case 'christmas':
        return '🎄';
      default:
        return '☀️';
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
        <span className="text-base">{getThemeEmoji()}</span>
        <span className="text-xs font-medium">{getThemeLabel()}</span>
      </div>
    </div>
  );
};

export default ThemeIndicator;
