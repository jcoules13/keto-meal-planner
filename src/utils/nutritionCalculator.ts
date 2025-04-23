/**
 * Calculateur de besoins nutritionnels et fonctions associées
 */

// Types
export type Gender = 'homme' | 'femme';
export type ActivityLevel = 'sédentaire' | 'légèrement_actif' | 'modérément_actif' | 'très_actif' | 'extrêmement_actif';
export type DietType = 'keto_standard' | 'keto_alcalin';
export type WeightGoal = 'perte_poids' | 'maintien_poids' | 'prise_poids';
export type KetoProfile = 'standard' | 'perte_poids' | 'prise_masse' | 'cyclique' | 'hyperproteine';

export interface UserData {
  gender: Gender;
  age: number;
  weight: number; // en kg
  height: number; // en cm
  activityLevel: ActivityLevel;
  targetWeight: number; // en kg
  weightGoal?: WeightGoal; // objectif de poids
  ketoProfile?: KetoProfile; // profil céto spécifique
}

export interface NutritionalNeeds {
  calories: number;
  macros: {
    protein: number; // en g
    fat: number; // en g
    carbs: number; // en g
  };
}

/**
 * Calcule le métabolisme de base (BMR) selon la formule de Mifflin-St Jeor
 */
export function calculateBMR(userData: UserData): number {
  const { gender, weight, height, age } = userData;
  
  if (gender === 'homme') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Femme ou autre
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Obtient le facteur d'activité basé sur le niveau d'activité
 */
export function getActivityFactor(activityLevel: ActivityLevel): number {
  const activityFactors: Record<ActivityLevel, number> = {
    'sédentaire': 1.2, // Peu ou pas d'exercice
    'légèrement_actif': 1.375, // Exercice léger 1-3 jours/semaine
    'modérément_actif': 1.55, // Exercice modéré 3-5 jours/semaine
    'très_actif': 1.725, // Exercice intense 6-7 jours/semaine
    'extrêmement_actif': 1.9, // Exercice très intense ou travail physique
  };
  
  return activityFactors[activityLevel];
}

/**
 * Calcule les besoins caloriques totaux en tenant compte de l'objectif de poids
 */
export function calculateCalorieNeeds(userData: UserData): number {
  const bmr = calculateBMR(userData);
  const activityFactor = getActivityFactor(userData.activityLevel);
  
  // Besoins caloriques de base
  let calorieNeeds = bmr * activityFactor;
  
  // Ajuster selon l'objectif de poids explicite ou implicite
  if (userData.weightGoal) {
    // Utiliser l'objectif explicite
    switch (userData.weightGoal) {
      case 'perte_poids':
        // Déficit de 20% pour la perte de poids
        calorieNeeds = calorieNeeds * 0.8;
        break;
      case 'prise_poids':
        // Surplus de 10% pour la prise de poids
        calorieNeeds = calorieNeeds * 1.1;
        break;
      case 'maintien_poids':
      default:
        // Aucun ajustement pour le maintien
        break;
    }
  } else {
    // Méthode d'origine basée sur la comparaison des poids
    if (userData.weight > userData.targetWeight) {
      // Objectif de perte de poids (déficit maximum de 20%)
      calorieNeeds = calorieNeeds * 0.8;
    } else if (userData.weight < userData.targetWeight) {
      // Objectif de prise de poids (surplus maximum de 10%)
      calorieNeeds = calorieNeeds * 1.1;
    }
  }
  
  // Arrondir à l'entier le plus proche
  return Math.round(calorieNeeds);
}

/**
 * Calcule les besoins en macronutriments pour un régime keto selon le profil sélectionné
 */
export function calculateMacroNeeds(calories: number, dietType: DietType, ketoProfile: KetoProfile = 'standard'): NutritionalNeeds['macros'] {
  let fatPercentage: number;
  let proteinPercentage: number;
  let carbsPercentage: number;
  
  // Répartition des macros en fonction du profil keto
  switch (ketoProfile) {
    case 'perte_poids': // Régime cétogène classique pour perte de poids
      fatPercentage = 0.75; // 75%
      proteinPercentage = 0.20; // 20%
      carbsPercentage = 0.05; // 5%
      break;
    
    case 'prise_masse': // Prise de masse musculaire
      fatPercentage = 0.65; // 65%
      proteinPercentage = 0.30; // 30%
      carbsPercentage = 0.05; // 5%
      break;
    
    case 'cyclique': // Régime cétogène cyclique (CKD)
      // Note: Le CKD implique normalement une période de recharge en glucides,
      // mais nous utilisons une répartition moyenne ici
      fatPercentage = 0.70; // 70%
      proteinPercentage = 0.20; // 20%
      carbsPercentage = 0.10; // 10%
      break;
    
    case 'hyperproteine': // Régime hyperprotéiné cétogène
      fatPercentage = 0.40; // 40%
      proteinPercentage = 0.50; // 50%
      carbsPercentage = 0.10; // 10%
      break;
    
    case 'standard': // Régime keto standard (maintien)
    default:
      // Ajustement en fonction du type de régime (standard ou alcalin)
      if (dietType === 'keto_alcalin') {
        fatPercentage = 0.72; // 72%
        proteinPercentage = 0.23; // 23%
        carbsPercentage = 0.05; // 5%
      } else {
        fatPercentage = 0.75; // 75%
        proteinPercentage = 0.20; // 20%
        carbsPercentage = 0.05; // 5%
      }
      break;
  }
  
  // Calcul avec une précision accrue pour les protéines
  // Pour garantir les objectifs de protéines sont prioritaires
  const proteinG = Math.max(
    Math.round((calories * proteinPercentage) / 4), 
    // Minimum de protéines en fonction du profil
    ketoProfile === 'prise_masse' ? 150 : 
    ketoProfile === 'hyperproteine' ? 200 : 100
  );
  
  // Calories pour protéines
  const proteinCalories = proteinG * 4;
  
  // Calories restantes pour lipides et glucides
  const remainingCalories = calories - proteinCalories;
  
  // Réajuster les pourcentages sur les calories restantes
  const remainingFatRatio = fatPercentage / (fatPercentage + carbsPercentage);
  const remainingCarbsRatio = carbsPercentage / (fatPercentage + carbsPercentage);
  
  // Calories par gramme: Lipides = 9 kcal/g, Protéines = 4 kcal/g, Glucides = 4 kcal/g
  return {
    fat: Math.round((remainingCalories * remainingFatRatio) / 9),
    protein: proteinG,
    carbs: Math.round((remainingCalories * remainingCarbsRatio) / 4)
  };
}

/**
 * Calcule les besoins nutritionnels complets (calories + macros)
 */
export function calculateNutritionalNeeds(userData: UserData, dietType: DietType, ketoProfile: KetoProfile = 'standard'): NutritionalNeeds {
  const calories = calculateCalorieNeeds(userData);
  const macros = calculateMacroNeeds(calories, dietType, ketoProfile || userData.ketoProfile);
  
  // Journaliser pour débogage
  console.log(`Besoins calculés pour profil ${ketoProfile || userData.ketoProfile || 'standard'}:`, {
    calories, 
    macros,
    percentages: {
      protein: Math.round((macros.protein * 4 / calories) * 100),
      fat: Math.round((macros.fat * 9 / calories) * 100),
      carbs: Math.round((macros.carbs * 4 / calories) * 100)
    }
  });
  
  return {
    calories,
    macros
  };
}

/**
 * Calcule l'IMC (Indice de Masse Corporelle)
 */
export function calculateBMI(weight: number, height: number): number {
  // Formule: poids (kg) / (taille (m))²
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

/**
 * Interprète l'IMC selon les catégories de l'OMS
 */
export function interpretBMI(bmi: number): string {
  if (bmi < 18.5) {
    return 'Insuffisance pondérale';
  } else if (bmi < 25) {
    return 'Poids normal';
  } else if (bmi < 30) {
    return 'Surpoids';
  } else if (bmi < 35) {
    return 'Obésité modérée (Classe I)';
  } else if (bmi < 40) {
    return 'Obésité sévère (Classe II)';
  } else {
    return 'Obésité morbide (Classe III)';
  }
}

/**
 * Obtient la description du profil keto
 */
export function getKetoProfileDescription(profile: KetoProfile): string {
  switch (profile) {
    case 'perte_poids':
      return 'Régime cétogène optimisé pour la perte de poids avec un ratio lipides/protéines élevé';
    case 'prise_masse':
      return 'Régime cétogène avec un apport protéique plus élevé pour favoriser la prise de masse musculaire';
    case 'cyclique':
      return 'Régime cétogène cyclique alternant des périodes strictes et des recharges en glucides';
    case 'hyperproteine':
      return 'Version très protéinée du régime cétogène pour les sportifs et la musculation';
    case 'standard':
    default:
      return 'Régime cétogène standard équilibré pour le maintien';
  }
}

/**
 * Obtient la répartition recommandée des macronutriments pour un profil keto
 */
export function getKetoProfileMacroDistribution(profile: KetoProfile): string {
  switch (profile) {
    case 'perte_poids':
      return 'Lipides: 75%, Protéines: 20%, Glucides: 5%';
    case 'prise_masse':
      return 'Lipides: 65%, Protéines: 30%, Glucides: 5%';
    case 'cyclique':
      return 'Lipides: 70%, Protéines: 20%, Glucides: 10%';
    case 'hyperproteine':
      return 'Lipides: 40%, Protéines: 50%, Glucides: 10%';
    case 'standard':
    default:
      return 'Lipides: 75%, Protéines: 20%, Glucides: 5%';
  }
}
