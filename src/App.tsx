import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { FoodProvider } from './contexts/FoodContext';
import { RecipeProvider } from './contexts/RecipeContext';
import MainLayout from './components/layout/MainLayout';
import ThemeSwitcher from './components/ui/ThemeSwitcher';
import ProfilePage from './pages/ProfilePage';
import FoodsPage from './pages/FoodsPage'; // Importe FoodsPage depuis le dossier approprié

// Pages temporaires pour démarrer
const HomePage = () => (
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-title font-bold text-primary-600 dark:text-primary-400 mb-6">
      Bienvenue sur Keto Meal Planner
    </h1>
    <p className="mb-4 text-lg">
      Votre assistant personnel pour la planification de repas keto standard et keto alcalin.
    </p>
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-title font-semibold mb-4">Fonctionnalités à venir:</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Calcul personnalisé des besoins caloriques et macronutriments</li>
        <li>Génération de plans de repas équilibrés</li>
        <li>Base de données d'aliments avec valeurs nutritionnelles et pH</li>
        <li>Recettes keto avec calcul automatique des valeurs nutritionnelles</li>
        <li>Liste de courses générée à partir de votre plan de repas</li>
        <li>Suivi de poids et progression vers vos objectifs</li>
      </ul>
    </div>
  </div>
);

// Page placeholder
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-title font-bold mb-4">{title}</h1>
    <p className="text-neutral-600 dark:text-neutral-400">
      Cette fonctionnalité est en cours de développement.
    </p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <FoodProvider>
          <RecipeProvider>
            {/* Bouton flottant de changement de thème, visible sur toutes les pages */}
            <ThemeSwitcher />
            
            <Routes>
              <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
              <Route path="/meal-planner" element={<MainLayout><PlaceholderPage title="Planificateur de repas" /></MainLayout>} />
              <Route path="/recipes" element={<MainLayout><PlaceholderPage title="Recettes" /></MainLayout>} />
              {/* Utiliser le composant FoodsPage */}
              <Route path="/foods" element={<MainLayout><FoodsPage /></MainLayout>} />
              <Route path="/shopping-list" element={<MainLayout><PlaceholderPage title="Liste de courses" /></MainLayout>} />
              <Route path="/weight-tracker" element={<MainLayout><PlaceholderPage title="Suivi de poids" /></MainLayout>} />
              <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </RecipeProvider>
        </FoodProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;