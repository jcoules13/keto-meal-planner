import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { FoodProvider } from './contexts/FoodContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FoodsPage from './pages/FoodsPage';
import WeightTrackerPage from './pages/WeightTrackerPage';
import RecipesPage from './pages/RecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import ShoppingListPage from './pages/ShoppingListPage';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <FoodProvider>
          <RecipeProvider>
            <MealPlanProvider>
              <Routes>
                <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                <Route path="/meal-planner" element={<MainLayout><MealPlannerPage /></MainLayout>} />
                <Route path="/recipes" element={<MainLayout><RecipesPage /></MainLayout>} />
                {/* Utiliser le composant FoodsPage */}
                <Route path="/foods" element={<MainLayout><FoodsPage /></MainLayout>} />
                <Route path="/shopping-list" element={<MainLayout><ShoppingListPage /></MainLayout>} />
                {/* Utiliser le composant WeightTrackerPage */}
                <Route path="/weight-tracker" element={<MainLayout><WeightTrackerPage /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MealPlanProvider>
          </RecipeProvider>
        </FoodProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;