import React from 'react';
import { getBMICategory } from '../../utils/weightUtils';

/**
 * Composant d'affichage de l'IMC avec interprétation
 * 
 * @param {Object} props
 * @param {number} props.bmi - Valeur de l'IMC
 * @param {number} props.weight - Poids actuel en kg
 * @param {number} props.height - Taille en cm
 */
const BMICalculator = ({ bmi, weight, height }) => {
  // Si les données ne sont pas disponibles, afficher un message
  if (!bmi || !weight || !height) {
    return (
      <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-title font-semibold mb-2">Indice de Masse Corporelle</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Données insuffisantes pour calculer votre IMC. Veuillez compléter votre profil avec votre taille et votre poids.
        </p>
      </div>
    );
  }
  
  // Obtenir la catégorie d'IMC et ses informations
  const bmiInfo = getBMICategory(bmi);
  
  return (
    <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-title font-semibold mb-2">Indice de Masse Corporelle</h3>
      
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-bold">{bmi.toFixed(1)}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {height} cm, {weight} kg
          </p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-white text-sm font-medium"
          style={{ backgroundColor: bmiInfo.color }}
        >
          {bmiInfo.description}
        </div>
      </div>
      
      {/* Barre de visualisation d'IMC */}
      <div className="relative h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-2">
        {/* Zones de classification */}
        <div className="absolute top-0 left-0 h-full w-1/6 bg-red-500 opacity-70"></div>
        <div className="absolute top-0 left-1/6 h-full w-1/12 bg-amber-500 opacity-70"></div>
        <div className="absolute top-0 left-1/4 h-full w-1/3 bg-green-500 opacity-70"></div>
        <div className="absolute top-0 left-7/12 h-full w-1/6 bg-amber-500 opacity-70"></div>
        <div className="absolute top-0 left-3/4 h-full w-1/4 bg-red-500 opacity-70"></div>
        
        {/* Marqueur d'IMC */}
        <div 
          className="absolute top-0 h-full w-1 bg-white dark:bg-neutral-200"
          style={{ 
            left: `${Math.min(Math.max((bmi / 40) * 100, 0), 100)}%`,
            transform: 'translateX(-50%)'
          }}
        ></div>
        
        {/* Étiquettes */}
        <div className="absolute bottom-0 left-0 text-[10px] text-white">15</div>
        <div className="absolute bottom-0 left-1/4 text-[10px] text-white">18.5</div>
        <div className="absolute bottom-0 left-7/12 text-[10px] text-white">25</div>
        <div className="absolute bottom-0 left-3/4 text-[10px] text-white">30</div>
        <div className="absolute bottom-0 right-0 text-[10px] text-white">40</div>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          L'IMC est une mesure qui permet d'évaluer votre corpulence à partir de votre taille et de votre poids. Il s'agit d'un indicateur courant mais qui ne tient pas compte de facteurs comme la masse musculaire ou la répartition des graisses.
        </p>
      </div>
    </div>
  );
};

export default BMICalculator;