import React from 'react';

/**
 * Composant pour afficher un élément individuel de la liste de courses
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.item - Données de l'élément (id, name, quantity, unit, checked)
 * @param {Function} props.onToggle - Fonction appelée quand l'élément est coché/décoché
 */
const ShoppingItem = ({ item, onToggle }) => {
  const { name, quantity, unit, checked } = item;
  
  // Gérer le changement d'état de la case à cocher
  const handleCheckboxChange = (e) => {
    onToggle(e.target.checked);
  };
  
  return (
    <div className={`shopping-item ${checked ? 'checked' : ''}`}>
      <input
        type="checkbox"
        className="shopping-item-checkbox"
        checked={checked}
        onChange={handleCheckboxChange}
        aria-label={`Marquer ${name} comme ${checked ? 'non acheté' : 'acheté'}`}
      />
      
      <span className="shopping-item-name">
        {name}
      </span>
      
      <span className="shopping-item-quantity">
        {quantity} {unit}
      </span>
    </div>
  );
};

export default ShoppingItem;