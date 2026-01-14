import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import { useMealPlan } from '../contexts/MealPlanContext';
import { useUser } from '../contexts/UserContext';
import { generatePlanDates, getPreferredStartDay } from '../utils/dateUtils';
import WeeklyMealPlanDisplay from '../components/meals/WeeklyMealPlanDisplay';
import WeeklyMealGenerator from '../components/meals/WeeklyMealGenerator';
import './MealPlannerPage.css';

/**
 * Page de planification de repas
 * Version progressive avec réactivation des composants optimisés
 */
const MealPlannerPage = () => {
  // États locaux
  const [activeTab, setActiveTab] = useState('weekly');
  const [planCreated, setPlanCreated] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Contextes
  const { dietType, calorieTarget, macroTargets } = useUser();
  const { createEmptyPlan, currentPlan, deleteMealPlan, mealPlans } = useMealPlan();

  // Création d'un plan vide
  const handleCreateEmptyPlan = useCallback(() => {
    try {
      // Si un plan existe déjà, le supprimer
      if (currentPlan) {
        deleteMealPlan(currentPlan.id);
      }

      // Obtenir le jour de départ (lundi par défaut)
      const startDayOfWeek = getPreferredStartDay(1);
      const planDates = generatePlanDates(startDayOfWeek, null);

      // Créer le plan
      const planId = createEmptyPlan(
        planDates.displayName,
        planDates.startDate,
        planDates.endDate,
        dietType,
        null
      );

      if (planId) {
        setPlanCreated(true);
        // Réinitialiser après 3 secondes
        setTimeout(() => setPlanCreated(false), 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la création du plan:", error);
      alert("Erreur lors de la création du plan: " + error.message);
    }
  }, [currentPlan, deleteMealPlan, createEmptyPlan, dietType]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Helmet>
        <title>Planificateur de repas | Keto Meal Planner</title>
      </Helmet>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-heading">
          Planificateur de repas
        </h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Générez des plans de repas adaptés à vos besoins nutritionnels.
        </p>
      </div>

      {/* Informations nutritionnelles */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-bg-secondary p-4">
          <h3 className="font-medium text-lg text-text-primary mb-2">Régime</h3>
          <p className="text-primary-600 font-medium">
            {dietType === 'keto_standard' ? 'Keto Standard' : 'Keto Alcalin'}
          </p>
        </div>

        <div className="card bg-bg-secondary p-4">
          <h3 className="font-medium text-lg text-text-primary mb-2">Calories</h3>
          <p className="text-primary-600 font-medium">{calorieTarget} kcal/jour</p>
        </div>

        <div className="card bg-bg-secondary p-4">
          <h3 className="font-medium text-lg text-text-primary mb-2">Macros quotidiennes</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge bg-amber-100 text-amber-800">
              Lipides: {macroTargets.fat}g
            </span>
            <span className="badge bg-red-100 text-red-800">
              Protéines: {macroTargets.protein}g
            </span>
            <span className="badge bg-blue-100 text-blue-800">
              Glucides: {macroTargets.carbs}g
            </span>
          </div>
        </div>
      </div>

      {/* Message de succès */}
      {planCreated && (
        <div className="bg-success bg-opacity-10 border-l-4 border-success text-success p-4 rounded mb-8">
          <p>✅ Votre plan a été créé avec succès!</p>
        </div>
      )}

      {/* Actions principales */}
      {!currentPlan ? (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center mb-4 text-primary-500 text-3xl">
              <FaCalendarAlt />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-4 text-center">
              Créer un plan vide
            </h3>
            <p className="text-text-secondary mb-6 text-center">
              Commencez avec un plan vide pour la semaine et ajoutez vos repas manuellement.
            </p>
            <button className="btn-primary w-full mt-auto" onClick={handleCreateEmptyPlan}>
              Créer un plan vide
            </button>
          </div>

          <div className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-center mb-4 text-primary-500 text-3xl">
              <FaUtensils />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-4 text-center">
              Créer un plan avec génération automatique
            </h3>
            <p className="text-text-secondary mb-6 text-center">
              Créez un plan ET générez automatiquement les repas de la semaine.
            </p>
            <button
              className="btn-primary w-full mt-auto"
              onClick={() => {
                handleCreateEmptyPlan();
                setShowGenerator(true);
              }}
            >
              Créer et générer
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Affichage du plan actif */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">
                Plan actif: {currentPlan.name}
              </h2>
              <button
                className="btn-secondary"
                onClick={() => {
                  if (window.confirm('Supprimer ce plan?')) {
                    deleteMealPlan(currentPlan.id);
                  }
                }}
              >
                Supprimer le plan
              </button>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700">
                ✅ <strong>Composant d'affichage réactivé!</strong>
                Vous pouvez maintenant visualiser vos repas planifiés.
              </p>
              <p className="text-green-700 mt-2 text-sm">
                Plan: {currentPlan.days?.length || 0} jours
                ({currentPlan.startDate} → {currentPlan.endDate})
              </p>
            </div>
          </div>

          {/* Génération automatique de repas */}
          {showGenerator && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Génération automatique de repas
              </h3>
              <WeeklyMealGenerator />
            </div>
          )}

          {/* Affichage du plan hebdomadaire */}
          <WeeklyMealPlanDisplay />
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold text-blue-800 mb-2">🔄 Réactivation Progressive</h3>
        <p className="text-blue-700 mb-2">
          Composants réactivés avec optimisations:
        </p>
        <ul className="list-disc ml-6 mb-3 text-blue-700">
          <li className="text-green-700">✅ WeeklyMealPlanDisplay (affichage) - React.memo</li>
          <li className="text-green-700">✅ WeeklyMealGenerator (génération) - React.memo + constantes consolidées</li>
        </ul>
        <p className="text-blue-700 mb-2">
          En attente de réactivation:
        </p>
        <ul className="list-disc ml-6 text-yellow-700">
          <li>MealGeneratorForPlan (génération individuelle)</li>
          <li>FridgeSelector et MealGeneratorFromFridge</li>
        </ul>
        <p className="mt-3 text-blue-700 text-sm">
          💡 Testez l'affichage avant de continuer. Si tout fonctionne, les autres composants seront réactivés.
        </p>
      </div>
    </div>
  );
};

export default MealPlannerPage;
