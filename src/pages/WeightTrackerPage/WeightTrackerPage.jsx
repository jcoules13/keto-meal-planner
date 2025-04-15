import React from 'react';
import PageLayout from '../../components/layout/PageLayout';
import WeightGraph from '../../components/weight/WeightGraph';
import WeightEntryForm from '../../components/weight/WeightEntryForm';
import ProgressIndicator from '../../components/weight/ProgressIndicator';
import BMICalculator from '../../components/weight/BMICalculator';
import WeightHistory from '../../components/weight/WeightHistory';
import useWeightTracking from '../../hooks/useWeightTracking';

/**
 * Page principale de suivi du poids
 */
const WeightTrackerPage = () => {
  // Utiliser le hook personnalisé pour la logique de suivi du poids
  const weightTracking = useWeightTracking();
  
  const {
    bmi,
    weightProgress,
    weightChange,
    predictedDate,
    newWeight,
    submitting,
    error,
    handleWeightChange,
    handleSubmit,
    currentWeight,
    targetWeight,
    weightHistory
  } = weightTracking;
  
  return (
    <PageLayout title="Suivi de poids">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-title font-bold text-neutral-900 dark:text-neutral-100">
            Suivi de poids
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Suivez votre progression et atteignez vos objectifs de poids.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section principale - Graphique et formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Graphique d'évolution */}
            <WeightGraph 
              weightHistory={weightHistory} 
              targetWeight={targetWeight} 
              timeRange={30} 
            />
            
            {/* Formulaire d'ajout d'une entrée de poids */}
            <WeightEntryForm 
              newWeight={newWeight} 
              submitting={submitting} 
              error={error} 
              handleWeightChange={handleWeightChange} 
              handleSubmit={handleSubmit} 
            />
            
            {/* Historique des poids */}
            <WeightHistory 
              weightHistory={weightHistory} 
              currentWeight={currentWeight} 
            />
          </div>
          
          {/* Barre latérale - IMC et progression */}
          <div className="space-y-6">
            {/* Indicateur de progression */}
            <ProgressIndicator 
              currentWeight={currentWeight} 
              targetWeight={targetWeight} 
              progress={weightProgress} 
              predictedDate={predictedDate} 
              change={weightChange} 
            />
            
            {/* Calculateur d'IMC */}
            <BMICalculator 
              bmi={bmi} 
              weight={currentWeight} 
              height={weightTracking.height} 
            />
            
            {/* Conseils */}
            <div className="card bg-white dark:bg-neutral-800 p-4 shadow-md rounded-lg">
              <h3 className="text-lg font-title font-semibold mb-2">Conseils pour le régime keto</h3>
              <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Pesez-vous toujours au même moment de la journée, idéalement le matin à jeun.</p>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Les variations quotidiennes sont normales. Concentrez-vous sur la tendance à long terme.</p>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>En régime keto, l'eau et les électrolytes sont essentiels pour éviter les crampes et la fatigue.</p>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Une perte de poids saine et durable est généralement de 0,5 à 1 kg par semaine.</p>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p>Utilisez notre planificateur de repas pour maintenir l'équilibre de vos macronutriments.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default WeightTrackerPage;