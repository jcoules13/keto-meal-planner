import React from 'react';

/**
 * Formulaire pour ajouter une nouvelle entrée de poids
 * 
 * @param {Object} props
 * @param {string} props.newWeight - Valeur actuelle du champ de saisie
 * @param {boolean} props.submitting - État de soumission du formulaire
 * @param {string} props.error - Message d'erreur éventuel
 * @param {Function} props.handleWeightChange - Gestionnaire de changement du champ
 * @param {Function} props.handleSubmit - Gestionnaire de soumission du formulaire
 */
const WeightEntryForm = ({ 
  newWeight, 
  submitting, 
  error, 
  handleWeightChange, 
  handleSubmit 
}) => {
  return (
    <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-title font-semibold mb-3">Enregistrer un nouveau poids</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="weightInput" 
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Poids actuel (kg)
          </label>
          
          <div className="relative">
            <input
              id="weightInput"
              type="text"
              value={newWeight}
              onChange={handleWeightChange}
              placeholder="Entrez votre poids"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md 
                        shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500
                        focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700
                        text-neutral-900 dark:text-neutral-100"
              disabled={submitting}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-neutral-500 dark:text-neutral-400">kg</span>
            </div>
          </div>
          
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Enregistrez votre poids quotidiennement pour un meilleur suivi.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                     dark:bg-primary-500 dark:hover:bg-primary-600 dark:focus:ring-primary-400"
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        <p className="mb-1">Conseils pour des mesures précises :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pesez-vous toujours au même moment de la journée</li>
          <li>Idéalement le matin, à jeun et après être allé aux toilettes</li>
          <li>Utilisez la même balance et portez des vêtements similaires</li>
        </ul>
      </div>
    </div>
  );
};

export default WeightEntryForm;