import React from 'react';

/**
 * Composant de pied de page de l'application
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© {currentYear} Keto Meal Planner - Édition Française</p>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://github.com/jcoules13/keto-meal-planner" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-sm">
              GitHub
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm">
              Politique de confidentialité
            </a>
            <a href="#" className="text-gray-300 hover:text-white text-sm">
              Conditions d'utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;