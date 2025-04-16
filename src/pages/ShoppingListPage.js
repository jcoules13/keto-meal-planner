import React from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import ShoppingList from '../components/meals/ShoppingList';
import './ShoppingListPage.css';

const ShoppingListPage = () => {
  const { currentPlan } = useMealPlan();
  const shoppingList = currentPlan ? currentPlan.shoppingList : [];

  return (
    <div className="shopping-list-page">
      <h1 className="shopping-list-title">Ma liste de courses</h1>
      <ShoppingList shoppingList={shoppingList} />
    </div>
  );
};

export default ShoppingListPage;