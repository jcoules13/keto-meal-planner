import React from 'react';
import { getBMICategory } from '../../utils/weightUtils';
import IMCVisualizer from '../profile/IMCVisualizer';

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
      <h3 className="text-lg font-title font-semibold mb-3">Indice de Masse Corporelle</h3>
      
      {/* Nouveau composant de visualisation d'IMC */}
      <IMCVisualizer 
        bmi={bmi} 
        height={height} 
        weight={weight} 
        className="mb-3"
      />
      
      <div className="mt-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          L'IMC est une mesure qui permet d'évaluer votre corpulence à partir de votre taille et de votre poids. Il s'agit d'un indicateur courant mais qui ne tient pas compte de facteurs comme la masse musculaire ou la répartition des graisses.
        </p>
      </div>
    </div>
  );
};

export default BMICalculator;