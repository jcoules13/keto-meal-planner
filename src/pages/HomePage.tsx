import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as FaIcons from 'react-icons/fa';

/**
 * Page d'accueil de l'application
 */
const HomePage: React.FC = () => {
  // Cast des icônes comme composants React
  const AppleIcon = FaIcons.FaAppleAlt as React.FC<React.SVGProps<SVGSVGElement>>;
  const UtensilsIcon = FaIcons.FaUtensils as React.FC<React.SVGProps<SVGSVGElement>>;
  const ClipboardIcon = FaIcons.FaClipboardList as React.FC<React.SVGProps<SVGSVGElement>>;
  const WeightIcon = FaIcons.FaWeight as React.FC<React.SVGProps<SVGSVGElement>>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Accueil | Keto Meal Planner</title>
      </Helmet>
      
      <section className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Keto Meal Planner</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Votre solution complète pour planifier, organiser et suivre votre régime cétogène.
        </p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <span className="text-4xl text-green-400 mb-4">
            <AppleIcon />
          </span>
          <h2 className="text-xl font-semibold mb-2">Base d'aliments</h2>
          <p className="text-center text-gray-300 mb-4">
            Accédez à notre base de données d'aliments avec valeurs nutritionnelles et pH.
          </p>
          <Link to="/foods" className="mt-auto text-primary-500 hover:text-primary-400 font-medium">
            Explorer les aliments
          </Link>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <span className="text-4xl text-yellow-400 mb-4">
            <UtensilsIcon />
          </span>
          <h2 className="text-xl font-semibold mb-2">Recettes Keto</h2>
          <p className="text-center text-gray-300 mb-4">
            Découvrez des recettes adaptées au régime keto standard et alcalin.
          </p>
          <Link to="/recipes" className="mt-auto text-primary-500 hover:text-primary-400 font-medium">
            Voir les recettes
          </Link>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <span className="text-4xl text-blue-400 mb-4">
            <ClipboardIcon />
          </span>
          <h2 className="text-xl font-semibold mb-2">Plans de repas</h2>
          <p className="text-center text-gray-300 mb-4">
            Créez et gérez vos plans de repas personnalisés avec liste de courses.
          </p>
          <Link to="/meal-plans" className="mt-auto text-primary-500 hover:text-primary-400 font-medium">
            Planifier mes repas
          </Link>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
          <span className="text-4xl text-purple-400 mb-4">
            <WeightIcon />
          </span>
          <h2 className="text-xl font-semibold mb-2">Suivi de poids</h2>
          <p className="text-center text-gray-300 mb-4">
            Suivez votre progression et visualisez vos résultats au fil du temps.
          </p>
          <Link to="/weight-tracker" className="mt-auto text-primary-500 hover:text-primary-400 font-medium">
            Suivre mon poids
          </Link>
        </div>
      </section>
      
      <section className="bg-gray-800 p-8 rounded-lg shadow-lg mb-12">
        <h2 className="text-2xl font-bold mb-4">Qu'est-ce que le régime keto?</h2>
        <p className="mb-3">
          Le régime cétogène (keto) est un régime riche en lipides, modéré en protéines et très pauvre en glucides qui met votre corps en état de cétose, où il brûle les graisses au lieu des glucides comme source d'énergie principale.
        </p>
        <p className="mb-3">
          <strong>Keto standard:</strong> Répartition typique des macronutriments: 70-75% de lipides, 20-25% de protéines, 5-10% de glucides.
        </p>
        <p>
          <strong>Keto alcalin:</strong> Variante qui combine le régime keto avec une approche alcaline pour maintenir l'équilibre du pH corporel.
        </p>
      </section>
      
      <section className="text-center">
        <h2 className="text-2xl font-bold mb-6">Prêt à commencer?</h2>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
          <Link to="/profile" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200">
            Configurer mon profil
          </Link>
          <Link to="/foods" className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200">
            Explorer les aliments
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
