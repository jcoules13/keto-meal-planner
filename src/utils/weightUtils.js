/**
 * Utilitaires pour les calculs liés au poids, IMC et tendances
 */

/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 * @param {number} height - Taille en cm
 * @param {number} weight - Poids en kg
 * @returns {number} - IMC avec une décimale
 */
export function calculateBMI(height, weight) {
  if (!height || !weight || height <= 0 || weight <= 0) return 0;
  
  // IMC = poids (kg) / taille² (m)
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Arrondir à 1 décimale
  return Math.round(bmi * 10) / 10;
}

/**
 * Obtient l'interprétation de l'IMC selon les catégories standards
 * @param {number} bmi - Indice de Masse Corporelle
 * @returns {Object} - Objet contenant la catégorie, la description et la couleur associée
 */
export function getBMICategory(bmi) {
  if (bmi < 16.5) {
    return {
      category: 'dénutrition',
      description: 'Dénutrition sévère',
      color: '#ef4444' // rouge
    };
  } else if (bmi < 18.5) {
    return {
      category: 'maigreur',
      description: 'Maigreur',
      color: '#fb923c' // orange
    };
  } else if (bmi < 25) {
    return {
      category: 'normal',
      description: 'Corpulence normale',
      color: '#22c55e' // vert
    };
  } else if (bmi < 30) {
    return {
      category: 'surpoids',
      description: 'Surpoids',
      color: '#fb923c' // orange
    };
  } else if (bmi < 35) {
    return {
      category: 'obésité_modérée',
      description: 'Obésité modérée (Classe 1)',
      color: '#ef4444' // rouge
    };
  } else if (bmi < 40) {
    return {
      category: 'obésité_sévère',
      description: 'Obésité sévère (Classe 2)',
      color: '#dc2626' // rouge foncé
    };
  } else {
    return {
      category: 'obésité_morbide',
      description: 'Obésité morbide (Classe 3)',
      color: '#b91c1c' // rouge très foncé
    };
  }
}

/**
 * Calcule le pourcentage d'avancement vers l'objectif de poids
 * @param {number} startWeight - Poids de départ en kg
 * @param {number} currentWeight - Poids actuel en kg
 * @param {number} targetWeight - Poids cible en kg
 * @returns {number} - Pourcentage d'avancement (0-100)
 */
export function calculateWeightProgress(startWeight, currentWeight, targetWeight) {
  // Si les données sont invalides ou l'objectif est atteint
  if (!startWeight || !currentWeight || !targetWeight) return 0;
  if (startWeight === targetWeight) return 100;
  
  // Calcul différent selon si l'objectif est de perdre ou prendre du poids
  const totalChange = Math.abs(targetWeight - startWeight);
  const currentChange = Math.abs(currentWeight - startWeight);
  
  // Si l'utilisateur s'éloigne de son objectif
  if ((startWeight > targetWeight && currentWeight > startWeight) || 
      (startWeight < targetWeight && currentWeight < startWeight)) {
    return 0;
  }
  
  // Calculer le pourcentage d'avancement
  const progress = (currentChange / totalChange) * 100;
  
  // Limiter à 100%
  return Math.min(Math.round(progress), 100);
}

/**
 * Calcule la variation de poids sur une période donnée
 * @param {Array} weightEntries - Tableau d'entrées de poids [{date, weight}, ...]
 * @param {number} days - Nombre de jours à considérer
 * @returns {Object} - Objet contenant la variation, le pourcentage et le rythme
 */
export function calculateWeightChange(weightEntries, days = 30) {
  if (!weightEntries || weightEntries.length < 2) {
    return { change: 0, percentage: 0, rate: 0 };
  }
  
  // Trier les entrées par date (plus récente en premier)
  const sortedEntries = [...weightEntries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Obtenir le poids actuel
  const currentWeight = sortedEntries[0].weight;
  
  // Trouver l'entrée la plus proche du nombre de jours spécifié
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // Trouver l'entrée la plus proche de la date limite
  let previousEntry = sortedEntries[sortedEntries.length - 1]; // entrée la plus ancienne par défaut
  for (let i = 1; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    if (entryDate <= cutoffDate) {
      previousEntry = sortedEntries[i];
      break;
    }
  }
  
  // Calculer la différence de poids
  const weightChange = currentWeight - previousEntry.weight;
  
  // Calculer le pourcentage de changement
  const weightPercentage = (weightChange / previousEntry.weight) * 100;
  
  // Calculer le nombre réel de jours entre les mesures
  const daysBetween = Math.max(1, Math.round(
    (new Date(sortedEntries[0].date) - new Date(previousEntry.date)) / (1000 * 60 * 60 * 24)
  ));
  
  // Calculer le rythme de perte/prise de poids (kg par semaine)
  const weeklyRate = (weightChange / daysBetween) * 7;
  
  return {
    change: Math.round(weightChange * 10) / 10, // arrondi à 1 décimale
    percentage: Math.round(weightPercentage * 10) / 10, // arrondi à 1 décimale
    rate: Math.round(weeklyRate * 10) / 10 // arrondi à 1 décimale
  };
}

/**
 * Prédit la date d'atteinte de l'objectif de poids basée sur le rythme actuel
 * @param {number} currentWeight - Poids actuel en kg
 * @param {number} targetWeight - Poids cible en kg
 * @param {number} weeklyRate - Rythme hebdomadaire de perte/prise de poids
 * @returns {Date|null} - Date estimée d'atteinte de l'objectif ou null si impossible
 */
export function predictGoalDate(currentWeight, targetWeight, weeklyRate) {
  if (!currentWeight || !targetWeight || weeklyRate === 0) return null;
  
  // Si le taux va dans la mauvaise direction par rapport à l'objectif
  if ((currentWeight > targetWeight && weeklyRate > 0) || 
      (currentWeight < targetWeight && weeklyRate < 0)) {
    return null;
  }
  
  // Calculer la différence à combler
  const weightDifference = Math.abs(targetWeight - currentWeight);
  
  // Calculer le nombre de semaines nécessaires
  const weeksRequired = weightDifference / Math.abs(weeklyRate);
  
  // Si plus d'un an est nécessaire, considérer comme trop lointain pour une prédiction fiable
  if (weeksRequired > 52) return null;
  
  // Calculer la date prévue
  const predictedDate = new Date();
  predictedDate.setDate(predictedDate.getDate() + Math.round(weeksRequired * 7));
  
  return predictedDate;
}

/**
 * Formate une date au format français (JJ/MM/AAAA)
 * @param {Date|string} date - Date à formater
 * @returns {string} - Date formatée
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  
  // Vérifier si la date est valide
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}
