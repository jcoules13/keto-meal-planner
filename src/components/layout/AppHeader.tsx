import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import ThemeIndicator from '../ui/ThemeIndicator';
import { useTheme } from '../../contexts/ThemeContext';

const AppHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Nouvelle barre supérieure pour l'indicateur de thème */}
      <div className="bg-card-bg border-b border-border-color py-1 dark:bg-neutral-900 dark:border-neutral-700">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <ThemeIndicator />
          <div className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
            {/* Texte informatif optionnel */}
            {theme === 'dark' || theme === 'light' 
              ? 'Mode standard' 
              : 'Thème saisonnier activé'}
          </div>
        </div>
      </div>
      
      {/* Header principal (conservé avec ses fonctionnalités) */}
      <header className="bg-white dark:bg-neutral-800 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-primary-600 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </span>
              <span className="text-xl font-title font-bold text-neutral-800 dark:text-white">
                Keto Meal Planner
              </span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/meal-planner"
                className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Planificateur
              </Link>
              <Link
                to="/recipes"
                className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Recettes
              </Link>
              <Link
                to="/foods"
                className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Aliments
              </Link>
              <Link
                to="/shopping-list"
                className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Liste de courses
              </Link>
              <Link
                to="/weight-tracker"
                className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Suivi de poids
              </Link>

              <div className="border-l border-neutral-200 dark:border-neutral-700 h-6 mx-2" />

              <Link
                to="/profile"
                className="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Profil
              </Link>

              <ThemeToggle />
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-4 md:hidden">
              <ThemeToggle />
              <button
                onClick={toggleMenu}
                className="text-neutral-700 dark:text-neutral-200 focus:outline-none"
                aria-label="Ouvrir le menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <nav className="mt-4 pb-4 space-y-3 md:hidden">
              <Link
                to="/meal-planner"
                className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Planificateur
              </Link>
              <Link
                to="/recipes"
                className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Recettes
              </Link>
              <Link
                to="/foods"
                className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Aliments
              </Link>
              <Link
                to="/shopping-list"
                className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Liste de courses
              </Link>
              <Link
                to="/weight-tracker"
                className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Suivi de poids
              </Link>
              <div className="border-t border-neutral-200 dark:border-neutral-700 my-2" />
              <Link
                to="/profile"
                className="block text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Profil
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default AppHeader;
