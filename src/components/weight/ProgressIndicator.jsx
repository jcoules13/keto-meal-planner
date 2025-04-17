import React from 'react';
import { formatDate } from '../../utils/weightUtils';
import { useUser } from '../../contexts/UserContext';

/**
 * Composant d'indicateur de progression vers l'objectif de poids
 * 
 * @param {Object} props
 * @param {number} props.currentWeight - Poids actuel en kg
 * @param {number} props.targetWeight - Poids cible en kg
 * @param {number} props.progress - Pourcentage de progression (0-100)
 * @param {Date|null} props.predictedDate - Date prévue d'atteinte de l'objectif
 * @param {Object} props.change - Objet contenant les informations de changement de poids
 */
const ProgressIndicator = ({ currentWeight, targetWeight, progress, predictedDate, change }) => {
  // Utiliser le contexte utilisateur pour obtenir le poids initial
  const { initialWeight, resetInitialWeight } = useUser();
  
  // Déterminer si l'objectif est de perdre ou de prendre du poids
  const isWeightLoss = targetWeight < initialWeight;
  
  // Si les données ne sont pas disponibles, afficher un message
  if (!currentWeight || !targetWeight) {
    return (
      <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-title font-semibold mb-2">Progression vers votre objectif</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Définissez un objectif de poids dans votre profil pour suivre votre progression.
        </p>
      </div>
    );
  }
  
  // Calculer la différence de poids
  const weightDifference = Math.abs(targetWeight - initialWeight).toFixed(1);
  
  // Déterminer le texte descriptif
  const goalDescription = isWeightLoss 
    ? `Perdre ${weightDifference} kg` 
    : `Prendre ${weightDifference} kg`;
  
  // Déterminer la couleur de la barre de progression
  let progressBarColor = 'bg-amber-500';
  
  if (progress < 25) {
    progressBarColor = 'bg-amber-500';
  } else if (progress < 75) {
    progressBarColor = 'bg-green-500';
  } else {
    progressBarColor = 'bg-primary-600';
  }
  
  // Décrire le rythme de changement de poids
  let rateDescription = '';
  
  if (change && change.rate) {
    const absRate = Math.abs(change.rate);
    
    if (isWeightLoss) {
      if (change.rate < 0) {
        // Perte de poids pour un objectif de perte de poids
        if (absRate < 0.5) {
          rateDescription = `Perte lente (${absRate} kg/semaine)`;
        } else if (absRate < 1) {
          rateDescription = `Perte modérée (${absRate} kg/semaine)`;
        } else {
          rateDescription = `Perte rapide (${absRate} kg/semaine)`;
        }
      } else {
        // Gain de poids pour un objectif de perte de poids
        rateDescription = `Éloignement de l'objectif (+${change.rate} kg/semaine)`;
      }
    } else {
      // Objectif de prise de poids
      if (change.rate > 0) {
        // Gain de poids pour un objectif de prise de poids
        if (absRate < 0.5) {
          rateDescription = `Gain lent (${absRate} kg/semaine)`;
        } else if (absRate < 1) {
          rateDescription = `Gain modéré (${absRate} kg/semaine)`;
        } else {
          rateDescription = `Gain rapide (${absRate} kg/semaine)`;
        }
      } else {
        // Perte de poids pour un objectif de prise de poids
        rateDescription = `Éloignement de l'objectif (${change.rate} kg/semaine)`;
      }
    }
  }
  
  // Calculer la différence entre le poids actuel et le poids initial pour montrer le progrès
  const progressInKg = isWeightLoss 
    ? initialWeight - currentWeight 
    : currentWeight - initialWeight;
  const progressText = progressInKg > 0 
    ? `${progressInKg.toFixed(1)} kg` 
    : "0 kg";
  
  return (
    <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-title font-semibold mb-2">Progression vers votre objectif</h3>
      
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Objectif :</p>
          <p className="text-lg font-bold">{goalDescription}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Progression :</p>
          <p className="text-lg font-bold">{Math.round(progress)}%</p>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="relative h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-3">
        <div 
          className={`absolute top-0 left-0 h-full ${progressBarColor} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-sm mb-3">
        <div>
          <p className="text-neutral-600 dark:text-neutral-400">Actuel</p>
          <p className="font-medium">{currentWeight} kg</p>
        </div>
        <div className="text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Départ</p>
          <p className="font-medium">{initialWeight} kg</p>
          <button
            onClick={resetInitialWeight}
            className="text-xs text-primary-600 mt-1 hover:underline"
            title="Réinitialiser le poids de départ au poids actuel"
          >
            Réinitialiser
          </button>
        </div>
        <div className="text-right">
          <p className="text-neutral-600 dark:text-neutral-400">Objectif</p>
          <p className="font-medium">{targetWeight} kg</p>
        </div>
      </div>
      
      {/* Progrès en kg */}
      <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded mb-2">
        <p className="text-sm text-center">
          {isWeightLoss ? 'Perdu' : 'Pris'} : <strong>{progressText}</strong> sur {weightDifference} kg
        </p>
      </div>
      
      {/* Rythme et prédiction */}
      {rateDescription && (
        <div className="mt-2 p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
          <p className="text-sm">{rateDescription}</p>
          
          {predictedDate && (
            <p className="text-sm mt-1">
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                Date prévue d'atteinte : {formatDate(predictedDate)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;