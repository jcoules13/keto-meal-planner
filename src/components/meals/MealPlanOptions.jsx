import React, { useState, useEffect } from 'react';
import { FaClock, FaUtensils, FaBalanceScale, FaCalendarAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { getPreferredStartDay, savePreferredStartDay, getDayName } from '../../utils/dateUtils';
import StartDaySelector from './StartDaySelector';
import './MealPlanOptions.css';

/**
 * Composant pour configurer les options avancées d'un plan de repas
 * - Nombre de repas par jour
 * - Types de repas (petit déjeuner, déjeuner, etc.)
 * - Configuration du jeûne intermittent
 * - Répartition calorique entre les repas
 * - Jour de départ de la semaine
 */
const MealPlanOptions = ({ onOptionsChange }) => {
  const { mealFrequency, intermittentFasting, updateFasting, setMealFrequency } = useUser();
  
  // Options générales de plan
  const [numMeals, setNumMeals] = useState(mealFrequency || 3);
  const [selectedMealTypes, setSelectedMealTypes] = useState({
    petitDejeuner: true,
    dejeuner: true, 
    souper: true,
    collationMatin: false,
    collationApresMidi: false
  });
  
  // Option de jour de départ de la semaine (0 = dimanche par défaut)
  const [startDayOfWeek, setStartDayOfWeek] = useState(getPreferredStartDay(0));
  
  // Options de jeûne intermittent
  const [fastingEnabled, setFastingEnabled] = useState(intermittentFasting?.enabled || false);
  const [fastingPattern, setFastingPattern] = useState('16/8');
  const [fastingStartTime, setFastingStartTime] = useState(intermittentFasting?.startTime || '12:00');
  
  // Options de répartition calorique
  const [calorieDistribution, setCalorieDistribution] = useState('balanced');
  const [customDistribution, setCustomDistribution] = useState({
    petitDejeuner: 20,
    dejeuner: 40,
    souper: 30,
    collationMatin: 5,
    collationApresMidi: 5
  });
  
  // Mettre à jour les options lorsqu'elles changent
  useEffect(() => {
    // Calculer les fenêtres de jeûne et d'alimentation
    let fastingWindow = 16;
    let eatingWindow = 8;
    
    if (fastingPattern === '16/8') {
      fastingWindow = 16;
      eatingWindow = 8;
    } else if (fastingPattern === '18/6') {
      fastingWindow = 18;
      eatingWindow = 6;
    } else if (fastingPattern === '20/4') {
      fastingWindow = 20;
      eatingWindow = 4;
    } else if (fastingPattern === 'OMAD') {
      fastingWindow = 23;
      eatingWindow = 1;
    }
    
    // Mettre à jour le nombre de repas en fonction des types de repas sélectionnés
    const selectedMealsCount = Object.values(selectedMealTypes).filter(Boolean).length;
    
    // Générer la configuration complète
    const planOptions = {
      mealFrequency: selectedMealsCount,
      mealTypes: selectedMealTypes,
      startDayOfWeek: startDayOfWeek, // Ajouter le jour de départ aux options
      intermittentFasting: {
        enabled: fastingEnabled,
        fastingWindow,
        eatingWindow,
        startTime: fastingStartTime
      },
      calorieDistribution: calorieDistribution === 'custom' ? customDistribution : getDistributionFromPreset(calorieDistribution, selectedMealTypes)
    };
    
    // Propager les changements vers le composant parent
    onOptionsChange && onOptionsChange(planOptions);
    
    // Mettre à jour les données utilisateur via les contextes
    if (selectedMealsCount !== mealFrequency) {
      setMealFrequency(selectedMealsCount);
    }
    
    if (fastingEnabled !== intermittentFasting?.enabled || 
        fastingWindow !== intermittentFasting?.fastingWindow ||
        eatingWindow !== intermittentFasting?.eatingWindow ||
        fastingStartTime !== intermittentFasting?.startTime) {
      updateFasting({
        enabled: fastingEnabled,
        fastingWindow,
        eatingWindow,
        startTime: fastingStartTime
      });
    }
  }, [numMeals, selectedMealTypes, fastingEnabled, fastingPattern, fastingStartTime, calorieDistribution, customDistribution, startDayOfWeek]);
  
  // Gestionnaire pour les changements de nombre de repas
  const handleNumMealsChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setNumMeals(count);
    
    // Ajuster automatiquement les types de repas
    if (count === 1) {
      setSelectedMealTypes({
        petitDejeuner: false,
        dejeuner: true,
        souper: false,
        collationMatin: false,
        collationApresMidi: false
      });
    } else if (count === 2) {
      setSelectedMealTypes({
        petitDejeuner: false,
        dejeuner: true,
        souper: true,
        collationMatin: false,
        collationApresMidi: false
      });
    } else if (count === 3) {
      setSelectedMealTypes({
        petitDejeuner: true,
        dejeuner: true,
        souper: true,
        collationMatin: false,
        collationApresMidi: false
      });
    } else if (count === 4) {
      setSelectedMealTypes({
        petitDejeuner: true,
        dejeuner: true,
        souper: true,
        collationMatin: true,
        collationApresMidi: false
      });
    } else if (count === 5) {
      setSelectedMealTypes({
        petitDejeuner: true,
        dejeuner: true,
        souper: true,
        collationMatin: true,
        collationApresMidi: true
      });
    }
  };
  
  // Gestionnaire pour les changements de types de repas
  const handleMealTypeChange = (type) => {
    const newSelectedMealTypes = {
      ...selectedMealTypes,
      [type]: !selectedMealTypes[type]
    };
    
    // S'assurer qu'au moins un repas est sélectionné
    if (Object.values(newSelectedMealTypes).some(Boolean)) {
      setSelectedMealTypes(newSelectedMealTypes);
    }
  };
  
  // Gestionnaire pour le changement du jour de début de semaine
  const handleStartDayChange = (dayValue) => {
    setStartDayOfWeek(dayValue);
    savePreferredStartDay(dayValue);
  };
  
  // Fonction pour obtenir la répartition calorique à partir du preset
  const getDistributionFromPreset = (preset, mealTypes) => {
    const enabledMeals = Object.entries(mealTypes)
      .filter(([, enabled]) => enabled)
      .map(([meal]) => meal);
    
    // Si aucun repas n'est sélectionné, retourner une distribution par défaut
    if (enabledMeals.length === 0) {
      return { dejeuner: 100 };
    }
    
    const distribution = {};
    
    if (preset === 'balanced') {
      // Répartition équilibrée
      const equalShare = Math.floor(100 / enabledMeals.length);
      const remainder = 100 - (equalShare * enabledMeals.length);
      
      enabledMeals.forEach((meal, index) => {
        distribution[meal] = equalShare + (index === 0 ? remainder : 0);
      });
    } else if (preset === '60/40') {
      // 60% déjeuner, 40% souper
      if (enabledMeals.includes('dejeuner') && enabledMeals.includes('souper')) {
        // Cas où déjeuner et souper sont sélectionnés
        const otherMeals = enabledMeals.filter(m => m !== 'dejeuner' && m !== 'souper');
        
        if (otherMeals.length === 0) {
          distribution.dejeuner = 60;
          distribution.souper = 40;
        } else {
          // Allouer 20% aux autres repas
          const otherShare = Math.floor(20 / otherMeals.length);
          otherMeals.forEach(meal => {
            distribution[meal] = otherShare;
          });
          
          // Répartir le reste entre déjeuner et souper
          const remainingTotal = 100 - (otherShare * otherMeals.length);
          distribution.dejeuner = Math.round((remainingTotal * 0.6));
          distribution.souper = 100 - distribution.dejeuner - (otherShare * otherMeals.length);
        }
      } else {
        // Répartition équilibrée si pas à la fois déjeuner et souper
        const equalShare = Math.floor(100 / enabledMeals.length);
        enabledMeals.forEach(meal => {
          distribution[meal] = equalShare;
        });
      }
    } else if (preset === '70/30') {
      // 70% déjeuner, 30% souper
      if (enabledMeals.includes('dejeuner') && enabledMeals.includes('souper')) {
        const otherMeals = enabledMeals.filter(m => m !== 'dejeuner' && m !== 'souper');
        
        if (otherMeals.length === 0) {
          distribution.dejeuner = 70;
          distribution.souper = 30;
        } else {
          // Allouer 20% aux autres repas
          const otherShare = Math.floor(20 / otherMeals.length);
          otherMeals.forEach(meal => {
            distribution[meal] = otherShare;
          });
          
          // Répartir le reste entre déjeuner et souper
          const remainingTotal = 100 - (otherShare * otherMeals.length);
          distribution.dejeuner = Math.round((remainingTotal * 0.7));
          distribution.souper = 100 - distribution.dejeuner - (otherShare * otherMeals.length);
        }
      } else {
        // Répartition équilibrée si pas à la fois déjeuner et souper
        const equalShare = Math.floor(100 / enabledMeals.length);
        enabledMeals.forEach(meal => {
          distribution[meal] = equalShare;
        });
      }
    } else if (preset === '40/60') {
      // 40% déjeuner, 60% souper
      if (enabledMeals.includes('dejeuner') && enabledMeals.includes('souper')) {
        const otherMeals = enabledMeals.filter(m => m !== 'dejeuner' && m !== 'souper');
        
        if (otherMeals.length === 0) {
          distribution.dejeuner = 40;
          distribution.souper = 60;
        } else {
          // Allouer 20% aux autres repas
          const otherShare = Math.floor(20 / otherMeals.length);
          otherMeals.forEach(meal => {
            distribution[meal] = otherShare;
          });
          
          // Répartir le reste entre déjeuner et souper
          const remainingTotal = 100 - (otherShare * otherMeals.length);
          distribution.dejeuner = Math.round((remainingTotal * 0.4));
          distribution.souper = 100 - distribution.dejeuner - (otherShare * otherMeals.length);
        }
      } else {
        // Répartition équilibrée si pas à la fois déjeuner et souper
        const equalShare = Math.floor(100 / enabledMeals.length);
        enabledMeals.forEach(meal => {
          distribution[meal] = equalShare;
        });
      }
    } else if (preset === '30/70') {
      // 30% déjeuner, 70% souper
      if (enabledMeals.includes('dejeuner') && enabledMeals.includes('souper')) {
        const otherMeals = enabledMeals.filter(m => m !== 'dejeuner' && m !== 'souper');
        
        if (otherMeals.length === 0) {
          distribution.dejeuner = 30;
          distribution.souper = 70;
        } else {
          // Allouer 20% aux autres repas
          const otherShare = Math.floor(20 / otherMeals.length);
          otherMeals.forEach(meal => {
            distribution[meal] = otherShare;
          });
          
          // Répartir le reste entre déjeuner et souper
          const remainingTotal = 100 - (otherShare * otherMeals.length);
          distribution.dejeuner = Math.round((remainingTotal * 0.3));
          distribution.souper = 100 - distribution.dejeuner - (otherShare * otherMeals.length);
        }
      } else {
        // Répartition équilibrée si pas à la fois déjeuner et souper
        const equalShare = Math.floor(100 / enabledMeals.length);
        enabledMeals.forEach(meal => {
          distribution[meal] = equalShare;
        });
      }
    }
    
    // S'assurer que toutes les clés sont présentes avec une valeur par défaut de 0
    Object.keys(mealTypes).forEach(meal => {
      if (!distribution[meal]) {
        distribution[meal] = 0;
      }
    });
    
    return distribution;
  };
  
  // Gestionnaire pour les changements de distribution calorique personnalisée
  const handleCustomDistributionChange = (meal, value) => {
    // Validation de la valeur (entre 0 et 100)
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    // Mettre à jour la distribution
    setCustomDistribution(prev => ({
      ...prev,
      [meal]: numValue
    }));
  };
  
  // Vérifier si la somme de la distribution personnalisée est 100%
  const isCustomDistributionValid = () => {
    // Ne compter que les repas sélectionnés
    const enabledValues = Object.entries(customDistribution)
      .filter(([meal]) => selectedMealTypes[meal])
      .map(([, value]) => value);
    
    return enabledValues.reduce((sum, val) => sum + val, 0) === 100;
  };
  
  // Calculer l'heure de fin d'alimentation
  const calculateEatingEndTime = () => {
    if (!fastingEnabled || !fastingStartTime) return '';
    
    let eatingDuration = 8; // Par défaut
    
    if (fastingPattern === '16/8') eatingDuration = 8;
    else if (fastingPattern === '18/6') eatingDuration = 6;
    else if (fastingPattern === '20/4') eatingDuration = 4;
    else if (fastingPattern === 'OMAD') eatingDuration = 1;
    
    // Calculer l'heure de fin
    const [hours, minutes] = fastingStartTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + eatingDuration);
    
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };
  
  // Valider l'état actuel des repas en fonction du jeûne
  const validateMealsWithFasting = () => {
    if (!fastingEnabled) return true;
    
    // Pour OMAD, seulement un repas doit être sélectionné
    if (fastingPattern === 'OMAD' && Object.values(selectedMealTypes).filter(Boolean).length > 1) {
      return false;
    }
    
    return true;
  };
  
  return (
    <div className="meal-plan-options card mb-8">
      <h3 className="text-xl font-bold text-text-primary mb-4">Options avancées du plan</h3>
      
      {/* Section de planification */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FaCalendarAlt className="text-primary-500 mr-2" />
          <h4 className="text-lg font-medium text-text-primary">Planification</h4>
        </div>
        
        {/* Nouveau sélecteur de jour de début de semaine */}
        <StartDaySelector onChange={handleStartDayChange} />
      </div>
      
      {/* Section de configuration des repas */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FaUtensils className="text-primary-500 mr-2" />
          <h4 className="text-lg font-medium text-text-primary">Configuration des repas</h4>
        </div>
        
        <div className="mb-4">
          <label className="block text-text-secondary mb-2">Nombre de repas par jour</label>
          <select 
            className="form-select w-full md:w-auto"
            value={numMeals}
            onChange={handleNumMealsChange}
          >
            <option value="1">1 repas</option>
            <option value="2">2 repas</option>
            <option value="3">3 repas</option>
            <option value="4">4 repas</option>
            <option value="5">5 repas</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-text-secondary mb-2">Types de repas</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={selectedMealTypes.petitDejeuner}
                onChange={() => handleMealTypeChange('petitDejeuner')}
                className="form-checkbox"
              />
              <span className="ml-2">Petit déjeuner</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={selectedMealTypes.dejeuner}
                onChange={() => handleMealTypeChange('dejeuner')}
                className="form-checkbox"
              />
              <span className="ml-2">Déjeuner</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={selectedMealTypes.souper}
                onChange={() => handleMealTypeChange('souper')}
                className="form-checkbox"
              />
              <span className="ml-2">Souper</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={selectedMealTypes.collationMatin}
                onChange={() => handleMealTypeChange('collationMatin')}
                className="form-checkbox"
              />
              <span className="ml-2">Collation matin</span>
            </label>
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={selectedMealTypes.collationApresMidi}
                onChange={() => handleMealTypeChange('collationApresMidi')}
                className="form-checkbox"
              />
              <span className="ml-2">Collation après-midi</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Section du jeûne intermittent */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FaClock className="text-primary-500 mr-2" />
          <h4 className="text-lg font-medium text-text-primary">Jeûne intermittent</h4>
        </div>
        
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              checked={fastingEnabled}
              onChange={(e) => setFastingEnabled(e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Activer le jeûne intermittent</span>
          </label>
        </div>
        
        {fastingEnabled && (
          <>
            <div className="mb-4">
              <label className="block text-text-secondary mb-2">Type de jeûne</label>
              <select 
                className="form-select w-full md:w-auto"
                value={fastingPattern}
                onChange={(e) => setFastingPattern(e.target.value)}
              >
                <option value="16/8">16/8 (16h de jeûne, 8h d'alimentation)</option>
                <option value="18/6">18/6 (18h de jeûne, 6h d'alimentation)</option>
                <option value="20/4">20/4 (20h de jeûne, 4h d'alimentation)</option>
                <option value="OMAD">OMAD (One Meal A Day)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-text-secondary mb-2">Heure de début d'alimentation</label>
              <input 
                type="time" 
                className="form-input"
                value={fastingStartTime}
                onChange={(e) => setFastingStartTime(e.target.value)}
              />
              <p className="text-sm text-text-secondary mt-1">
                Fenêtre d'alimentation: {fastingStartTime} - {calculateEatingEndTime()}
              </p>
            </div>
            
            {!validateMealsWithFasting() && (
              <div className="bg-warning bg-opacity-10 border-l-4 border-warning text-warning p-4 rounded mb-4">
                <p>Attention: Le nombre de repas sélectionnés n'est pas compatible avec votre modèle de jeûne.</p>
                {fastingPattern === 'OMAD' && <p>Pour OMAD, ne sélectionnez qu'un seul repas par jour.</p>}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Section de répartition calorique */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FaBalanceScale className="text-primary-500 mr-2" />
          <h4 className="text-lg font-medium text-text-primary">Répartition calorique</h4>
        </div>
        
        <div className="mb-4">
          <label className="block text-text-secondary mb-2">Modèle de répartition</label>
          <select 
            className="form-select w-full md:w-auto"
            value={calorieDistribution}
            onChange={(e) => setCalorieDistribution(e.target.value)}
          >
            <option value="balanced">Équilibré (égal entre les repas)</option>
            <option value="60/40">60% déjeuner / 40% souper</option>
            <option value="70/30">70% déjeuner / 30% souper</option>
            <option value="40/60">40% déjeuner / 60% souper</option>
            <option value="30/70">30% déjeuner / 70% souper</option>
            <option value="custom">Personnalisé</option>
          </select>
        </div>
        
        {calorieDistribution === 'custom' && (
          <div>
            <label className="block text-text-secondary mb-2">Répartition personnalisée (%)</label>
            <div className="space-y-2">
              {Object.entries(selectedMealTypes).map(([meal, enabled]) => {
                if (!enabled) return null;
                
                const mealLabels = {
                  petitDejeuner: 'Petit déjeuner',
                  dejeuner: 'Déjeuner',
                  souper: 'Souper',
                  collationMatin: 'Collation matin',
                  collationApresMidi: 'Collation après-midi'
                };
                
                return (
                  <div key={meal} className="flex items-center">
                    <span className="w-40">{mealLabels[meal]}</span>
                    <input 
                      type="number" 
                      className="form-input w-16"
                      min="0"
                      max="100"
                      value={customDistribution[meal]}
                      onChange={(e) => handleCustomDistributionChange(meal, e.target.value)}
                    />
                    <span className="ml-2">%</span>
                  </div>
                );
              })}
            </div>
            
            {!isCustomDistributionValid() && (
              <p className="text-warning mt-2">
                La somme des pourcentages doit être égale à 100%.
              </p>
            )}
          </div>
        )}
        
        {/* Affichage de la répartition actuelle */}
        <div className="mt-4 p-3 bg-bg-secondary rounded">
          <h5 className="font-medium mb-2">Répartition actuelle :</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(
              calorieDistribution === 'custom' 
                ? customDistribution 
                : getDistributionFromPreset(calorieDistribution, selectedMealTypes)
            ).map(([meal, percentage]) => {
              if (!selectedMealTypes[meal]) return null;
              
              const mealLabels = {
                petitDejeuner: 'Petit déjeuner',
                dejeuner: 'Déjeuner',
                souper: 'Souper',
                collationMatin: 'Collation matin',
                collationApresMidi: 'Collation après-midi'
              };
              
              return (
                <div key={meal} className="flex items-center justify-between">
                  <span>{mealLabels[meal]}</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanOptions;