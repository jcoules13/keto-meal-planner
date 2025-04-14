import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  calculateNutritionalNeeds, 
  calculateBMI, 
  interpretBMI,
  type Gender,
  type ActivityLevel,
  type DietType
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
  activityLevel: ActivityLevel;
  targetWeight: number; // en kg
  dietType: DietType;
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
  | { type: 'ADD_WEIGHT_ENTRY'; payload: WeightEntry }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'UPDATE_FASTING'; payload: Partial<IntermittentFastingConfig> }
  | { type: 'SET_MEAL_FREQUENCY'; payload: number }
  | { type: 'RECALCULATE_TARGETS' };

// Interface du contexte
interface UserContextType {
  // État
  ...UserState;
  
  // Propriétés calculées
  bmi: number;
  bmiCategory: string;

  // Actions
  updateProfile: (profileData: Partial<UserState>) => void;
  setDietType: (dietType: DietType) => void;
  addWeightEntry: (weight: number) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateFasting: (fastingSettings: Partial<IntermittentFastingConfig>) => void;
  setMealFrequency: (frequency: number) => void;
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
  activityLevel: 'modérément_actif',
  targetWeight: 70, // en kg
  dietType: 'keto_standard',
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
    case 'UPDATE_PROFILE':
      return {
        ...state,
        ...action.payload,
        isProfileComplete: true
      };
    
    case 'SET_DIET_TYPE':
      return {
        ...state,
        dietType: action.payload
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
    
    case 'RECALCULATE_TARGETS': {
      const userData = {
        gender: state.gender,
        age: state.age,
        weight: state.weight,
        height: state.height,
        activityLevel: state.activityLevel,
        targetWeight: state.targetWeight
      };
      
      const { calories, macros } = calculateNutritionalNeeds(userData, state.dietType);
      
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
      dispatch({ type: 'UPDATE_PROFILE', payload: savedUser });
    }
  }, []);
  
  // Sauvegarder les données utilisateur dans localStorage à chaque changement
  useEffect(() => {
    if (state.isProfileComplete) {
      saveToStorage('user', state);
    }
  }, [state]);
  
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
      'targetWeight' in profileData
    ) {
      dispatch({ type: 'RECALCULATE_TARGETS' });
    }
  };
  
  const setDietType = (dietType: DietType) => {
    dispatch({ type: 'SET_DIET_TYPE', payload: dietType });
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
    addWeightEntry,
    updatePreferences,
    updateFasting,
    setMealFrequency,
    recalculateTargets
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
