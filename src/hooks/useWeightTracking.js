import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  calculateBMI, 
  calculateWeightProgress, 
  calculateWeightChange, 
  predictGoalDate 
} from '../utils/weightUtils';

/**
 * Hook personnalisé pour gérer la logique de suivi du poids
 * @returns {Object} - Un objet contenant les données et méthodes pour le suivi du poids
 */
const useWeightTracking = () => {
  const { 
    weight, 
    height, 
    targetWeight, 
    weightHistory, 
    addWeightEntry 
  } = useUser();
  
  // État local pour les statistiques calculées
  const [stats, setStats] = useState({
    bmi: 0,
    progress: 0,
    change: { change: 0, percentage: 0, rate: 0 },
    predictedDate: null
  });
  
  // État local pour la gestion du formulaire
  const [newWeight, setNewWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Calculer les statistiques lorsque les données de l'utilisateur changent
  useEffect(() => {
    if (!weight || !height) return;
    
    // Calculer l'IMC
    const bmi = calculateBMI(height, weight);
    
    // Déterminer le poids de départ (le premier enregistrement ou le poids actuel si aucun historique)
    const startWeight = weightHistory && weightHistory.length > 0 
      ? weightHistory[0].weight 
      : weight;
    
    // Calculer la progression vers l'objectif
    const progress = calculateWeightProgress(startWeight, weight, targetWeight);
    
    // Calculer le changement de poids sur les 30 derniers jours
    const change = calculateWeightChange(weightHistory, 30);
    
    // Prédire la date d'atteinte de l'objectif
    const predictedDate = predictGoalDate(weight, targetWeight, change.rate);
    
    // Mettre à jour les statistiques
    setStats({
      bmi,
      progress,
      change,
      predictedDate
    });
  }, [weight, height, targetWeight, weightHistory]);
  
  // Gérer le changement du champ de saisie du poids
  const handleWeightChange = useCallback((e) => {
    // Limiter à 2 décimales et éviter les caractères non numériques
    const value = e.target.value;
    
    // Permettre les chiffres, le point/virgule décimal, et un champ vide
    if (value === '' || /^[0-9]*([.,][0-9]{0,2})?$/.test(value)) {
      setNewWeight(value);
      setError('');
    }
  }, []);
  
  // Soumettre une nouvelle entrée de poids
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Valider le poids
    if (!newWeight) {
      setError('Veuillez entrer un poids');
      return;
    }
    
    // Convertir la valeur en nombre (gérer les virgules et les points)
    const weightValue = parseFloat(newWeight.replace(',', '.'));
    
    // Vérifier que le poids est valide
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 500) {
      setError('Veuillez entrer un poids valide entre 0 et 500 kg');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Ajouter l'entrée via le contexte utilisateur
      await addWeightEntry(weightValue);
      
      // Réinitialiser le formulaire
      setNewWeight('');
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }, [newWeight, addWeightEntry]);
  
  return {
    // Données calculées
    bmi: stats.bmi,
    weightProgress: stats.progress,
    weightChange: stats.change,
    predictedDate: stats.predictedDate,
    
    // État du formulaire
    newWeight,
    submitting,
    error,
    
    // Méthodes
    handleWeightChange,
    handleSubmit,
    
    // Données brutes
    currentWeight: weight,
    targetWeight,
    weightHistory
  };
};

export default useWeightTracking;