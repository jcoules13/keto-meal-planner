import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  calculateNutritionalNeeds, 
  calculateBMI, 
  interpretBMI,
  type Gender,
  type ActivityLevel,
  type DietType,
  type WeightGoal,
  type KetoProfile
} from '../utils/nutritionCalculator';
import { 
  saveToStorage, 
  loadFromStorage 
} from '../utils/storage';

// Interfaces et types
export interface WeightEntry {
  date: string; // Format YYYY-MM-DD
  weight: number; // en kg
}

export interface IntermittentFastingConfig {
  enabled: boolean;
  fastingWindow: number; // en heures
  eatingWindow: number; // en heures
  startTime: string; // format "HH:MM"
}

export interface UserPreferences {
  excludedFoods: string[]; // IDs des aliments exclus
  favoriteFoods: string[]; // IDs des aliments favoris
  favoriteRecipes: string[]; // IDs des recettes favorites
  seasonalOnly: boolean; // Préférence pour les aliments de saison uniquement
}

export interface UserState {
  id: string | null;
  name: string;
  gender: Gender;
  age: number;
  height: number; // en cm
  weight: number; // en kg
  initialWeight: number; // poids de départ pour calculer la progression
  activityLevel: ActivityLevel;
  targetWeight: number; // en kg
  weightGoal: WeightGoal; // objectif de poids
  dietType: DietType;
  ketoProfile: KetoProfile; // nouveau champ pour le profil Keto
  calorieTarget: number; // calculé
  macroTargets: {
    protein: number; // en g
    fat: number; // en g
    carbs: number; // en g
  };
  mealFrequency: number; // nombre de repas par jour
  intermittentFasting: IntermittentFastingConfig;
  allergies: string[];
  preferences: UserPreferences;
  weightHistory: WeightEntry[];
  isProfileComplete: boolean;
}

// Actions
type UserAction = 
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserState> }
  | { type: 'SET_DIET_TYPE'; payload: DietType }
  | { type: 'SET_WEIGHT_GOAL'; payload: WeightGoal }
  | { type: 'SET_KETO_PROFILE'; payload: KetoProfile } // nouvelle action
  | { type: 'ADD_WEIGHT_ENTRY'; payload: WeightEntry }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_FASTING'; payload: Partial<IntermittentFastingConfig> }
  | { type: 'SET_MEAL_FREQUENCY'; payload: number }
  | { type: 'SET_TARGET_WEIGHT'; payload: number }
  | { type: 'RESET_INITIAL_WEIGHT' }
  | { type: 'RECALCULATE_TARGETS' };

// Interface du contexte
interface UserContextType extends UserState {
  // Propriétés calculées
  bmi: number;
  bmiCategory: string;

  // Actions
  updateProfile: (profileData: Partial<UserState>) => void;
  setDietType: (dietType: DietType) => void;
  setWeightGoal: (weightGoal: WeightGoal) => void;
  setKetoProfile: (ketoProfile: KetoProfile) => void; // nouvelle action
  addWeightEntry: (weight: number) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateFasting: (fastingSettings: Partial<IntermittentFastingConfig>) => void;
  setMealFrequency: (frequency: number) => void;
  setTargetWeight: (targetWeight: number) => void;
  resetInitialWeight: () => void;
  recalculateTargets: () => void;
}

// État initial
const initialState: UserState = {
  id: null,
  name: '',
  gender: 'homme',
  age: 30,
  height: 175, // en cm
  weight: 75, // en kg
  initialWeight: 75, // même que weight au départ
  activityLevel: 'modérément_actif',
  targetWeight: 70, // en kg
  weightGoal: 'maintien_poids', // objectif de poids par défaut
  dietType: 'keto_standard',
  ketoProfile: 'standard', // valeur par défaut
  calorieTarget: 2000, // calculé
  macroTargets: {
    protein: 100, // en g
    fat: 155, // en g
    carbs: 25, // en g
  },
  mealFrequency: 3, // nombre de repas par jour
  intermittentFasting: {
    enabled: false,
    fastingWindow: 16, // en heures
    eatingWindow: 8, // en heures
    startTime: "12:00" // format "HH:MM"
  },
  allergies: [],
  preferences: {
    excludedFoods: [],
    favoriteFoods: [],
    favoriteRecipes: [],
    seasonalOnly: false
  },
  weightHistory: [],
  isProfileComplete: false
};

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'UPDATE_PROFILE': {
      // Si le poids est modifié et l'objectif de poids n'est pas défini, mettre à jour le poids initial
      const newState = {
        ...state,
        ...action.payload,
        isProfileComplete: true
      };

      // Si c'est la première mise à jour du profil, initialiser le poids initial
      if (!state.isProfileComplete && action.payload.weight && !newState.initialWeight) {
        newState.initialWeight = action.payload.weight;
      }

      return newState;
    }
    
    case 'SET_DIET_TYPE':
      return {
        ...state,
        dietType: action.payload
      };
    
    case 'SET_WEIGHT_GOAL':
      return {
        ...state,
        weightGoal: action.payload
      };
    
    case 'SET_KETO_PROFILE':
      return {
        ...state,
        ketoProfile: action.payload
      };
    
    case 'ADD_WEIGHT_ENTRY': {
      const newWeightHistory = [
        ...state.weightHistory,
        action.payload
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        ...state,
        weight: action.payload.weight,
        weightHistory: newWeightHistory
      };
    }
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case 'UPDATE_FASTING':
      return {
        ...state,
        intermittentFasting: {
          ...state.intermittentFasting,
          ...action.payload
        }
      };
    
    case 'SET_MEAL_FREQUENCY':
      return {
        ...state,
        mealFrequency: action.payload
      };
      
    case 'SET_TARGET_WEIGHT': {
      // Quand on définit un nouvel objectif de poids, on réinitialise aussi le poids initial
      return {
        ...state,
        targetWeight: action.payload,
        initialWeight: state.weight // Utiliser le poids actuel comme point de départ
      };
    }
    
    case 'RESET_INITIAL_WEIGHT':
      return {
        ...state,
        initialWeight: state.weight // Réinitialiser le poids initial au poids actuel
      };
    
    case 'RECALCULATE_TARGETS': {
      const userData = {
        gender: state.gender,
        age: state.age,
        weight: state.weight,
        height: state.height,
        activityLevel: state.activityLevel,
        targetWeight: state.targetWeight,
        weightGoal: state.weightGoal
      };
      
      const { calories, macros } = calculateNutritionalNeeds(userData, state.dietType, state.ketoProfile);
      
      return {
        ...state,
        calorieTarget: calories,
        macroTargets: macros
      };
    }
    
    default:
      return state;
  }
}

// Création du contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
}

// Provider
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  // Propriétés calculées
  const bmi = calculateBMI(state.weight, state.height);
  const bmiCategory = interpretBMI(bmi);
  
  // Charger les données utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const savedUser = loadFromStorage<UserState | null>('user', null);
    if (savedUser) {
      // S'assurer que initialWeight existe (pour la compatibilité)
      if (!savedUser.initialWeight) {
        savedUser.initialWeight = savedUser.weight;
      }
      // S'assurer que ketoProfile existe (pour la compatibilité)
      if (!savedUser.ketoProfile) {
        savedUser.ketoProfile = 'standard';
      }
      dispatch({ type: 'UPDATE_PROFILE', payload: savedUser });
    }
  }, []);
  
  // Sauvegarder les données utilisateur dans localStorage avec debounce
  useEffect(() => {
    if (!state.isProfileComplete) return;

    // Debounce pour éviter trop de sauvegardes et boucles infinies
    const timeoutId = setTimeout(() => {
      saveToStorage('user', state);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    state.isProfileComplete,
    state.name,
    state.gender,
    state.age,
    state.height,
    state.weight,
    state.initialWeight,
    state.activityLevel,
    state.targetWeight,
    state.weightGoal,
    state.dietType,
    state.ketoProfile,
    state.calorieTarget,
    JSON.stringify(state.macroTargets),
    state.mealFrequency,
    JSON.stringify(state.intermittentFasting),
    JSON.stringify(state.allergies),
    JSON.stringify(state.preferences),
    JSON.stringify(state.weightHistory)
  ]);
  
  // Actions exposées
  const updateProfile = (profileData: Partial<UserState>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
    
    // Recalculer les cibles nutritionnelles si les données pertinentes ont changé
    if (
      'gender' in profileData || 
      'age' in profileData || 
      'weight' in profileData || 
      'height' in profileData || 
      'activityLevel' in profileData || 
      'targetWeight' in profileData ||
      'weightGoal' in profileData ||
      'ketoProfile' in profileData // Ajouter le nouveau profil Keto à la liste des déclencheurs
    ) {
      dispatch({ type: 'RECALCULATE_TARGETS' });
    }
  };
  
  const setDietType = (dietType: DietType) => {
    dispatch({ type: 'SET_DIET_TYPE', payload: dietType });
    dispatch({ type: 'RECALCULATE_TARGETS' });
  };
  
  const setWeightGoal = (weightGoal: WeightGoal) => {
    dispatch({ type: 'SET_WEIGHT_GOAL', payload: weightGoal });
    dispatch({ type: 'RECALCULATE_TARGETS' });
  };
  
  const setKetoProfile = (ketoProfile: KetoProfile) => {
    dispatch({ type: 'SET_KETO_PROFILE', payload: ketoProfile });
    dispatch({ type: 'RECALCULATE_TARGETS' });
  };
  
  const addWeightEntry = (weight: number) => {
    const entry: WeightEntry = {
      date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
      weight
    };
    dispatch({ type: 'ADD_WEIGHT_ENTRY', payload: entry });
    dispatch({ type: 'RECALCULATE_TARGETS' });
  };
  
  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };
  
  const updateFasting = (fastingSettings: Partial<IntermittentFastingConfig>) => {
    dispatch({ type: 'UPDATE_FASTING', payload: fastingSettings });
  };
  
  const setMealFrequency = (frequency: number) => {
    dispatch({ type: 'SET_MEAL_FREQUENCY', payload: frequency });
  };
  
  const setTargetWeight = (targetWeight: number) => {
    dispatch({ type: 'SET_TARGET_WEIGHT', payload: targetWeight });
    dispatch({ type: 'RECALCULATE_TARGETS' });
  };
  
  const resetInitialWeight = () => {
    dispatch({ type: 'RESET_INITIAL_WEIGHT' });
  };
  
  const recalculateTargets = () => {
    dispatch({ type: 'RECALCULATE_TARGETS' });
  };
  
  // Valeur du contexte
  const value: UserContextType = {
    ...state,
    bmi,
    bmiCategory,
    updateProfile,
    setDietType,
    setWeightGoal,
    setKetoProfile, // Nouvelle action exposée
    addWeightEntry,
    updatePreferences,
    updateFasting,
    setMealFrequency,
    setTargetWeight,
    resetInitialWeight,
    recalculateTargets
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
