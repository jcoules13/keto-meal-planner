import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Page 404 - Page non trouvée
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <Helmet>
        <title>Page non trouvée | Keto Meal Planner</title>
      </Helmet>
      
      <FaExclamationTriangle className="text-6xl text-yellow-500 mb-6" />
      
      <h1 className="text-4xl font-bold mb-4 text-center">Page non trouvée</h1>
      
      <p className="text-xl text-gray-300 mb-8 text-center max-w-lg">
        Nous n'avons pas trouvé la page que vous recherchez. Elle a peut-être été déplacée ou supprimée.
      </p>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          to="/" 
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg text-center transition duration-200"
        >
          Retour à l'accueil
        </Link>
        
        <Link 
          to="/foods" 
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg text-center transition duration-200"
        >
          Explorer les aliments
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;