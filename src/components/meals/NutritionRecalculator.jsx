import React, { useEffect, useCallback } from 'react';
import { useMealPlan } from '../../contexts/MealPlanContext';

/**
 * Composant utilitaire qui recalcule automatiquement les valeurs nutritionnelles
 * des repas au chargement de la page. Ce composant ne rend rien visuellement,
 * il effectue uniquement des opérations de calcul en arrière-plan.
 */
const NutritionRecalculator = () => {
  const { 
    currentPlan, 
    recalculatePlanNutrition 
  } = useMealPlan();
  
  // Fonction pour recalculer les macros du plan courant
  const recalculateCurrentPlan = useCallback(() => {
    if (currentPlan) {
      recalculatePlanNutrition(currentPlan.id);
    }
  }, [currentPlan, recalculatePlanNutrition]);
  
  // Recalculer les macros au chargement et quand le plan change
  useEffect(() => {
    recalculateCurrentPlan();
  }, [recalculateCurrentPlan]);
  
  // Ce composant ne rend rien visuellement
  return null;
};

export default NutritionRecalculator;