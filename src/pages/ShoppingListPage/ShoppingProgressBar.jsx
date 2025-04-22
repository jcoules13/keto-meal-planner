import React from 'react';

/**
 * Barre de progression pour la liste de courses
 * @param {Object} props - Propriétés du composant
 * @param {number} props.progress - Pourcentage de progression (0-100)
 */
const ShoppingProgressBar = ({ progress }) => {
  // Déterminer le statut de la progression
  const getProgressStatus = () => {
    if (progress === 0) return 'Pas commencé';
    if (progress < 25) return 'Juste commencé';
    if (progress < 50) return 'En cours';
    if (progress < 75) return 'Bien avancé';
    if (progress < 100) return 'Presque terminé';
    return 'Terminé !';
  };
  
  return (
    <div className="shopping-progress">
      <span className="text-sm font-medium">{getProgressStatus()}</span>
      <div className="shopping-progress-bar">
        <div 
          className="shopping-progress-bar-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="shopping-progress-label">
        {progress}% terminé
      </div>
    </div>
  );
};

export default ShoppingProgressBar;