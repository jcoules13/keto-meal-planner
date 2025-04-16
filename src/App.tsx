import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FoodsPage from './pages/FoodsPage';
import RecipesPage from './pages/RecipesPage';
import MealPlanPage from './pages/MealPlanPage';
import WeightTrackerPage from './pages/WeightTrackerPage';
import NotFoundPage from './pages/NotFoundPage';

// Contextes
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { FoodProvider } from './contexts/FoodContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { MealPlanProvider } from './contexts/MealPlanContext';

/**
 * Composant principal de l'application
 * Gère le routing et les providers de contexte
 */
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <FoodProvider>
          <RecipeProvider>
            <MealPlanProvider>
              <Router>
                <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
                  <Helmet>
                    <title>Keto Meal Planner - Édition Française</title>
                    <meta name="description" content="Application de planification de repas keto standard et keto alcalin" />
                  </Helmet>
                  
                  <Header />
                  
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/foods" element={<FoodsPage />} />
                      <Route path="/recipes" element={<RecipesPage />} />
                      <Route path="/meal-plans" element={<MealPlanPage />} />
                      <Route path="/weight-tracker" element={<WeightTrackerPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  
                  <Footer />
                </div>
              </Router>
            </MealPlanProvider>
          </RecipeProvider>
        </FoodProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
