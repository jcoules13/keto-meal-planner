import React, { useState } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { exportShoppingListAsText } from '../../services/shoppingListGenerator';
import { FaClipboard, FaTrashAlt, FaFilter, FaShoppingBasket, FaCheck } from 'react-icons/fa';

/**
 * Composant d'affichage de liste de courses
 * Permet d'afficher, filtrer et gérer une liste de courses générée à partir d'un plan de repas
 */
const ShoppingList = ({ planId }) => {
  const { 
    mealPlans, 
    shoppingList, 
    generateShoppingListFromPlan, 
    updateShoppingItem,
    isGenerating 
  } = useMealPlan();
  
  const [showChecked, setShowChecked] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [message, setMessage] = useState('');
  
  // Fonction pour générer la liste de courses
  const handleGenerateList = () => {
    if (!planId) return;
    generateShoppingListFromPlan(planId);
  };
  
  // Fonction pour copier la liste au format texte
  const handleCopyToClipboard = () => {
    if (!shoppingList) return;
    
    try {
      const textList = exportShoppingListAsText(shoppingList);
      navigator.clipboard.writeText(textList);
      showMessage('Liste copiée dans le presse-papier');
    } catch (error) {
      showMessage('Erreur lors de la copie : ' + error.message);
    }
  };
  
  // Fonction pour afficher un message temporaire
  const showMessage = (text, duration = 3000) => {
    setMessage(text);
    setTimeout(() => setMessage(''), duration);
  };
  
  // Fonction pour marquer/démarquer un élément
  const handleToggleItem = (category, itemId, checked) => {
    updateShoppingItem(category, itemId, !checked);
  };
  
  // Si aucun plan n'est sélectionné
  if (!planId) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-gray-300">
        <h2 className="text-xl font-semibold mb-4">Liste de courses</h2>
        <p>Veuillez sélectionner un plan de repas pour générer une liste de courses</p>
      </div>
    );
  }
  
  // Si la liste n'a pas encore été générée
  if (!shoppingList) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-gray-300">
        <h2 className="text-xl font-semibold mb-4">Liste de courses</h2>
        <button 
          onClick={handleGenerateList}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <FaShoppingBasket />
          {isGenerating ? 'Génération...' : 'Générer la liste de courses'}
        </button>
      </div>
    );
  }
  
  // Récupérer les catégories disponibles
  const categories = Object.keys(shoppingList.categories);
  
  // Filtrer les éléments selon les préférences d'affichage
  const getFilteredItems = (category) => {
    const items = shoppingList.categories[category] || [];
    return showChecked ? items : items.filter(item => !item.checked);
  };
  
  return (
    <div className="p-4 bg-gray-800 rounded-lg text-gray-300">
      {/* En-tête et actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste de courses</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyToClipboard}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            title="Copier la liste"
          >
            <FaClipboard />
          </button>
          <button 
            onClick={handleGenerateList}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            title="Régénérer la liste"
          >
            <FaShoppingBasket />
          </button>
        </div>
      </div>
      
      {/* Informations du plan */}
      <div className="mb-4 p-3 bg-gray-700 rounded-md">
        <h3 className="font-medium text-lg">{shoppingList.planName || 'Plan sans nom'}</h3>
        <p className="text-sm text-gray-400">
          Du {new Date(shoppingList.startDate).toLocaleDateString('fr-FR')} 
          au {new Date(shoppingList.endDate).toLocaleDateString('fr-FR')}
        </p>
      </div>
      
      {/* Message de confirmation */}
      {message && (
        <div className="mb-4 p-2 bg-green-600 text-white rounded-md">
          {message}
        </div>
      )}
      
      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="flex items-center text-sm">
          <FaFilter className="mr-2" /> Filtrer:
        </span>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              activeCategory === 'all' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Tous
          </button>
          
          {categories.map(category => (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-sm rounded-full ${
                activeCategory === category 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {formatCategoryName(category)}
            </button>
          ))}
        </div>
        
        <div className="ml-auto">
          <label className="flex items-center text-sm">
            <input 
              type="checkbox" 
              checked={showChecked} 
              onChange={() => setShowChecked(!showChecked)}
              className="mr-2" 
            />
            Afficher les articles cochés
          </label>
        </div>
      </div>
      
      {/* Liste des articles */}
      <div className="space-y-4">
        {(activeCategory === 'all' ? categories : [activeCategory]).map(category => {
          const items = getFilteredItems(category);
          if (items.length === 0) return null;
          
          return (
            <div key={category} className="bg-gray-700 rounded-md overflow-hidden">
              <div className="bg-gray-600 px-4 py-2 font-medium">
                {formatCategoryName(category)}
                <span className="ml-2 text-sm text-gray-400">
                  ({items.length} article{items.length > 1 ? 's' : ''})
                </span>
              </div>
              
              <ul className="divide-y divide-gray-600">
                {items.map(item => (
                  <li 
                    key={item.id} 
                    className={`px-4 py-3 flex items-center ${
                      item.checked ? 'opacity-60' : ''
                    }`}
                  >
                    <button 
                      onClick={() => handleToggleItem(category, item.id, item.checked)}
                      className={`w-6 h-6 flex-shrink-0 rounded border ${
                        item.checked 
                          ? 'bg-green-600 border-green-700' 
                          : 'bg-gray-800 border-gray-600'
                      } flex items-center justify-center mr-3`}
                    >
                      {item.checked && <FaCheck className="text-white text-xs" />}
                    </button>
                    
                    <div className="flex-grow">
                      <span className={`${item.checked ? 'line-through' : ''}`}>
                        {item.name}
                      </span>
                      <span className="ml-2 text-gray-400">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      
      {/* Message si aucun élément */}
      {categories.length === 0 && (
        <div className="text-center p-8 text-gray-400">
          Aucun article dans la liste de courses
        </div>
      )}
    </div>
  );
};

/**
 * Formate un nom de catégorie pour l'affichage
 * @param {string} category - Le nom de catégorie brut
 * @returns {string} Le nom formaté
 */
function formatCategoryName(category) {
  // Remplace les underscores par des espaces
  const withSpaces = category.replace(/_/g, ' ');
  
  // Met la première lettre en majuscule
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export default ShoppingList;
