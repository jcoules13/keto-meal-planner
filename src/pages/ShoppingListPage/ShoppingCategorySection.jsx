import React, { useState } from 'react';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import ShoppingItem from './ShoppingItem';

/**
 * Composant pour afficher une catégorie d'aliments dans la liste de courses
 * @param {Object} props - Propriétés du composant
 * @param {string} props.category - Nom de la catégorie
 * @param {Array} props.items - Liste des articles dans cette catégorie
 * @param {Function} props.onItemToggle - Fonction appelée quand un article est coché/décoché
 */
const ShoppingCategorySection = ({ category, items, onItemToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Calculer la progression (pourcentage d'articles cochés)
  const progress = items.length > 0
    ? Math.round((items.filter(item => item.checked).length / items.length) * 100)
    : 0;
  
  // Trier les articles (décochés d'abord, puis ordre alphabétique)
  const sortedItems = [...items].sort((a, b) => {
    // D'abord par état (décochés avant cochés)
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1;
    }
    // Ensuite par ordre alphabétique
    return a.name.localeCompare(b.name);
  });
  
  // Formater le nom de la catégorie pour l'affichage
  const formatCategoryName = (name) => {
    // Convertir le premier caractère en majuscule et le reste en minuscules
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };
  
  return (
    <div className="shopping-category">
      {/* En-tête de la catégorie (cliquable pour réduire/déplier) */}
      <div 
        className={`shopping-category-header ${collapsed ? 'collapsed' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <h3 className="text-lg">
          <FaChevronDown className="mr-2 icon" />
          {formatCategoryName(category)}
          <span className="ml-2 text-sm text-text-tertiary">
            ({items.filter(item => item.checked).length}/{items.length})
          </span>
        </h3>
        
        {/* Barre de progression pour cette catégorie */}
        <div className="shopping-category-progress">
          <div className="shopping-category-progress-bar">
            <div 
              className="shopping-category-progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span>{progress}%</span>
          
          {/* Afficher une coche si tous les articles sont cochés */}
          {progress === 100 && (
            <FaCheck className="ml-1 text-success" />
          )}
        </div>
      </div>
      
      {/* Liste des articles (affichée seulement si non réduite) */}
      {!collapsed && (
        <div className="shopping-items">
          {sortedItems.map(item => (
            <ShoppingItem 
              key={item.id}
              item={item}
              onToggle={(checked) => onItemToggle(item.id, checked)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingCategorySection;