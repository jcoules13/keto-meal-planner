import React from 'react';
import { formatDate } from '../../utils/weightUtils';

/**
 * Composant d'affichage de l'historique des poids
 * 
 * @param {Object} props
 * @param {Array} props.weightHistory - Tableau d'entrées de poids [{date, weight}, ...]
 * @param {number} props.currentWeight - Poids actuel en kg
 */
const WeightHistory = ({ weightHistory = [], currentWeight }) => {
  // Si aucun historique, afficher un message
  if (!weightHistory || weightHistory.length === 0) {
    return (
      <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-title font-semibold mb-2">Historique des mesures</h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Aucune mesure enregistrée. Commencez à suivre votre poids pour voir votre progression.
        </p>
      </div>
    );
  }
  
  // Trier les entrées par date (plus récente en premier)
  const sortedEntries = [...weightHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  return (
    <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-title font-semibold mb-4">Historique des mesures</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Poids
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Variation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {sortedEntries.map((entry, index) => {
              // Calculer la variation par rapport à l'entrée précédente
              let variation = null;
              if (index < sortedEntries.length - 1) {
                variation = entry.weight - sortedEntries[index + 1].weight;
              }
              
              return (
                <tr key={entry.date} className="hover:bg-neutral-50 dark:hover:bg-neutral-750">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                    {entry.weight} kg
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {variation !== null ? (
                      <span className={
                        variation === 0 ? 'text-neutral-500 dark:text-neutral-400' :
                          variation > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
                      }>
                        {variation > 0 ? '+' : ''}
                        {variation.toFixed(1)} kg
                      </span>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {weightHistory.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Affichage des {sortedEntries.length} dernières mesures.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeightHistory;