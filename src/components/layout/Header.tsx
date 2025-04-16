import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import * as FaIcons from 'react-icons/fa';

/**
 * Composant d'en-tête de l'application
 * Contient la navigation principale et le contrôle du thème
 */
const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Vérifie si le lien est actif
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-500 font-medium' : 'text-gray-300 hover:text-white';
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/" className="text-xl font-bold flex items-center">
            Keto Meal Planner
          </Link>
        </div>
        
        <nav className="flex flex-wrap justify-center">
          <Link to="/" className={`px-3 py-2 rounded-md text-sm ${isActive('/')}`}>
            Accueil
          </Link>
          <Link to="/foods" className={`px-3 py-2 rounded-md text-sm ${isActive('/foods')}`}>
            Aliments
          </Link>
          <Link to="/recipes" className={`px-3 py-2 rounded-md text-sm ${isActive('/recipes')}`}>
            Recettes
          </Link>
          <Link to="/meal-plans" className={`px-3 py-2 rounded-md text-sm ${isActive('/meal-plans')}`}>
            Plans de repas
          </Link>
          <Link to="/weight-tracker" className={`px-3 py-2 rounded-md text-sm ${isActive('/weight-tracker')}`}>
            Suivi de poids
          </Link>
          <Link to="/profile" className={`px-3 py-2 rounded-md text-sm ${isActive('/profile')}`}>
            Profil
          </Link>
        </nav>
        
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
        >
          {theme === 'dark' ? (
            <span className="text-yellow-300">
              <FaIcons.FaSun />
            </span>
          ) : (
            <span className="text-blue-300">
              <FaIcons.FaMoon />
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;