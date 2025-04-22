import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaTrash, FaPrint, FaShoppingBasket, FaArrowLeft } from 'react-icons/fa';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { formatShoppingListForPrint } from '../../utils/shoppingListGenerator';
import ShoppingCategorySection from './ShoppingCategorySection';
import ShoppingProgressBar from './ShoppingProgressBar';
import './ShoppingListPage.css';

/**
 * Page Liste de courses
 * Permet de visualiser et gérer la liste de courses générée à partir du plan de repas
 */
const ShoppingListPage = () => {
  const { 
    shoppingList, 
    currentPlan, 
    generateShoppingListFromPlan, 
    clearShoppingList,
    updateShoppingItem,
    shoppingListProgress
  } = useMealPlan();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'name', 'unchecked'

  // Générer une nouvelle liste à partir du plan actuel
  const handleGenerateList = async () => {
    if (!currentPlan) return;
    
    setIsGenerating(true);
    await generateShoppingListFromPlan(currentPlan.id);
    setIsGenerating(false);
  };

  // Effacer la liste de courses
  const handleClearList = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer la liste de courses ?')) {
      clearShoppingList();
    }
  };

  // Imprimer la liste de courses
  const handlePrintList = () => {
    if (!shoppingList) return;
    
    const formattedList = formatShoppingListForPrint(shoppingList);
    
    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Liste de courses - ${shoppingList.planName || 'Keto Meal Planner'}</title>
          <style>
            body {
              font-family: 'Open Sans', sans-serif;
              line-height: 1.5;
              padding: 20px;
            }
            h1 {
              font-family: 'Montserrat', sans-serif;
              margin-bottom: 10px;
            }
            h2 {
              font-family: 'Montserrat', sans-serif;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              margin-top: 20px;
            }
            .item {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .checkbox {
              width: 12px;
              height: 12px;
              border: 1px solid #000;
              display: inline-block;
              margin-right: 10px;
            }
          </style>
        </head>
        <body>
          <h1>Liste de courses - ${shoppingList.planName || 'Keto Meal Planner'}</h1>
          <p>Plan du ${new Date(shoppingList.startDate).toLocaleDateString('fr-FR')} 
            au ${new Date(shoppingList.endDate).toLocaleDateString('fr-FR')}</p>
          
          ${Object.entries(shoppingList.categories).map(([category, items]) => `
            <h2>${category}</h2>
            ${items.map(item => `
              <div class="item">
                <span class="checkbox"></span>
                <span>${item.name} (${item.quantity} ${item.unit})</span>
              </div>
            `).join('')}
          `).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Gérer le changement d'état d'un élément (coché/décoché)
  const handleItemToggle = (categoryKey, itemId, checked) => {
    updateShoppingItem(categoryKey, itemId, checked);
  };

  // Trier les catégories en fonction de l'ordre sélectionné
  const sortedCategories = () => {
    if (!shoppingList) return [];

    const categories = Object.entries(shoppingList.categories);

    return categories.sort((a, b) => {
      // Tri par défaut: alphabétique par catégorie
      if (sortOrder === 'default') {
        return a[0].localeCompare(b[0]);
      }
      
      // Autres options de tri possibles (non implémentées dans cet exemple)
      return a[0].localeCompare(b[0]); // Fallback sur tri alphabétique
    });
  };

  return (
    <div className="shopping-list-page max-w-4xl mx-auto">
      <Helmet>
        <title>Liste de courses | Keto Meal Planner</title>
      </Helmet>
      
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-heading">Liste de courses</h1>
        <p className="text-text-secondary max-w-3xl">
          Gérez votre liste de courses générée à partir de votre plan de repas.
          Vous pouvez cocher les éléments au fur et à mesure de vos achats.
        </p>
      </header>

      {/* Actions principales */}
      <div className="shopping-list-actions mb-6 flex flex-wrap gap-3">
        <button
          className="btn-primary flex items-center"
          onClick={handleGenerateList}
          disabled={isGenerating || !currentPlan}
        >
          <FaClipboardList className="mr-2" />
          <span>{shoppingList ? 'Régénérer la liste' : 'Générer une liste'}</span>
        </button>
        
        {shoppingList && (
          <>
            <button 
              className="btn-outline flex items-center text-error"
              onClick={handleClearList}
            >
              <FaTrash className="mr-2" />
              <span>Effacer la liste</span>
            </button>
            
            <button 
              className="btn-outline flex items-center"
              onClick={handlePrintList}
            >
              <FaPrint className="mr-2" />
              <span>Imprimer</span>
            </button>
          </>
        )}
      </div>

      {/* Contenu principal */}
      {shoppingList ? (
        <div className="shopping-list-content animate-fadeIn">
          {/* En-tête de la liste avec informations sur le plan */}
          <div className="shopping-list-header card mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-xl font-semibold mb-1">{shoppingList.planName}</h2>
                <p className="text-sm text-text-secondary">
                  Du {new Date(shoppingList.startDate).toLocaleDateString('fr-FR')} 
                  au {new Date(shoppingList.endDate).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  Générée le {new Date(shoppingList.generatedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4">
                <ShoppingProgressBar progress={shoppingListProgress} />
              </div>
            </div>
          </div>
          
          {/* Liste des catégories */}
          <div className="shopping-categories">
            {sortedCategories().map(([category, items]) => (
              <ShoppingCategorySection 
                key={category}
                category={category}
                items={items}
                onItemToggle={(itemId, checked) => handleItemToggle(category, itemId, checked)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="shopping-list-empty card py-8 text-center">
          <div className="flex justify-center mb-4 text-neutral-400">
            <FaShoppingBasket className="text-6xl" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Aucune liste de courses</h2>
          <p className="mb-6 text-text-secondary mx-auto max-w-md">
            {currentPlan 
              ? "Vous n'avez pas encore généré de liste de courses pour votre plan actuel."
              : "Vous devez d'abord sélectionner ou créer un plan de repas pour générer une liste de courses."}
          </p>
          
          {!currentPlan && (
            <Link to="/meal-planner" className="btn-primary inline-flex items-center">
              <FaArrowLeft className="mr-2" />
              <span>Aller au planificateur</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingListPage;