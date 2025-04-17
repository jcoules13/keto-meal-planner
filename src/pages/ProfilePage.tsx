import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Gender, ActivityLevel, DietType, WeightGoal, KetoProfile } from '../utils/nutritionCalculator';
import IMCVisualizer from '../components/profile/IMCVisualizer';
import './ProfilePage.css';

const ProfilePage = () => {
  const user = useUser();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(!user.isProfileComplete);
  
  // États locaux pour le formulaire d'édition
  const [formData, setFormData] = useState({
    name: user.name,
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    targetWeight: user.targetWeight,
    weightGoal: user.weightGoal,
    activityLevel: user.activityLevel,
    dietType: user.dietType,
    ketoProfile: user.ketoProfile // Ajout du profil Keto
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    user.updateProfile(formData);
    setIsEditing(false);
  };
  
  const activityLevelLabels: Record<ActivityLevel, string> = {
    'sédentaire': 'Sédentaire (peu ou pas d\'exercice)',
    'légèrement_actif': 'Légèrement actif (exercice léger 1-3 jours/semaine)',
    'modérément_actif': 'Modérément actif (exercice modéré 3-5 jours/semaine)',
    'très_actif': 'Très actif (exercice intense 6-7 jours/semaine)',
    'extrêmement_actif': 'Extrêmement actif (exercice très intense ou travail physique)'
  };
  
  const dietTypeLabels: Record<DietType, string> = {
    'keto_standard': 'Keto Standard',
    'keto_alcalin': 'Keto Alcalin'
  };
  
  const weightGoalLabels: Record<WeightGoal, string> = {
    'perte_poids': 'Perte de poids',
    'maintien_poids': 'Maintien du poids',
    'prise_poids': 'Prise de poids'
  };
  
  // Labels pour les profils Keto
  const ketoProfileLabels: Record<KetoProfile, string> = {
    'standard': 'Standard (Maintien)',
    'perte_poids': 'Perte de poids (classique)',
    'prise_masse': 'Prise de masse musculaire',
    'cyclique': 'Régime cétogène cyclique (CKD)',
    'hyperproteine': 'Régime hyperprotéiné cétogène'
  };
  
  // Descriptions des profils Keto
  const ketoProfileDescriptions: Record<KetoProfile, { lipides: string, proteines: string, glucides: string, description: string }> = {
    'standard': {
      lipides: '75%',
      proteines: '20%',
      glucides: '5%',
      description: 'Répartition standard pour le maintien et la forme'
    },
    'perte_poids': {
      lipides: '70-80%',
      proteines: '20-25%',
      glucides: '5-10%',
      description: 'Ratio classique pour entrer en cétose et favoriser la perte de poids'
    },
    'prise_masse': {
      lipides: '65-75%',
      proteines: '25-30%',
      glucides: '5-10%',
      description: 'Apport protéique plus élevé pour préserver et développer le muscle'
    },
    'cyclique': {
      lipides: 'Variable',
      proteines: 'Modérées',
      glucides: 'Variable (périodes de 50-100g)',
      description: 'Alternance de phases cétogènes strictes et phases de recharge glucidique'
    },
    'hyperproteine': {
      lipides: '25-50%',
      proteines: '40-65%',
      glucides: '10%',
      description: 'Pour perte de poids rapide ou prise de masse avec contrôle strict des glucides'
    }
  };
  
  // Explication des facteurs d'activité et leur impact sur les calories
  const activityFactorExplanations: Record<ActivityLevel, { factor: number, description: string }> = {
    'sédentaire': { 
      factor: 1.2,
      description: 'Peu ou pas d\'exercice, travail de bureau'
    },
    'légèrement_actif': { 
      factor: 1.375,
      description: 'Exercice léger 1-3 jours par semaine, activités quotidiennes actives'
    },
    'modérément_actif': { 
      factor: 1.55,
      description: 'Exercice modéré 3-5 jours par semaine, activité physique régulière'
    },
    'très_actif': { 
      factor: 1.725,
      description: 'Exercice intense 6-7 jours par semaine, emploi physiquement exigeant'
    },
    'extrêmement_actif': { 
      factor: 1.9,
      description: 'Exercice très intense quotidien, athlètes professionnels ou travail très physique'
    }
  };
  
  // Explication des objectifs de poids et leur impact sur les calories
  const weightGoalExplanations: Record<WeightGoal, { adjustment: string, description: string }> = {
    'perte_poids': { 
      adjustment: '-20%',
      description: 'Déficit calorique pour favoriser une perte de poids saine (environ 0.5-1kg par semaine)'
    },
    'maintien_poids': { 
      adjustment: '0%',
      description: 'Apport calorique équilibré pour maintenir votre poids actuel'
    },
    'prise_poids': { 
      adjustment: '+10%',
      description: 'Léger surplus calorique pour favoriser la prise de masse (idéalement musculaire)'
    }
  };
  
  // Calcul des pourcentages de macronutriments
  const macroPercentages = {
    protein: Math.round((user.macroTargets.protein * 4 / user.calorieTarget) * 100),
    fat: Math.round((user.macroTargets.fat * 9 / user.calorieTarget) * 100),
    carbs: Math.round((user.macroTargets.carbs * 4 / user.calorieTarget) * 100)
  };
  
  return (
    <div className={`profile-page ${theme} max-w-4xl mx-auto py-8 px-4`}>
      <h1 className="text-3xl font-title font-bold mb-6">Profil Utilisateur</h1>
      
      {isEditing ? (
        <div className="profile-card">
          <h2 className="text-xl font-title font-semibold mb-4">
            {user.isProfileComplete ? 'Modifier votre profil' : 'Compléter votre profil'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-grid">
              <div>
                <label htmlFor="name" className="label">Nom</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Votre nom"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="label">Genre</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="age" className="label">Âge</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="input"
                  min="18"
                  max="120"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="height" className="label">Taille (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="input"
                  min="100"
                  max="250"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="weight" className="label">Poids actuel (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="input"
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="targetWeight" className="label">Poids cible (kg)</label>
                <input
                  type="number"
                  id="targetWeight"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleInputChange}
                  className="input"
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="weightGoal" className="label">Objectif</label>
                <select
                  id="weightGoal"
                  name="weightGoal"
                  value={formData.weightGoal}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {Object.entries(weightGoalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="activityLevel" className="label">Niveau d'activité</label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {Object.entries(activityLevelLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="dietType" className="label">Type de régime</label>
                <select
                  id="dietType"
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {Object.entries(dietTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Nouveau champ pour le profil Keto */}
              <div>
                <label htmlFor="ketoProfile" className="label">Profil Keto</label>
                <select
                  id="ketoProfile"
                  name="ketoProfile"
                  value={formData.ketoProfile}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {Object.entries(ketoProfileLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              {user.isProfileComplete && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="profile-card space-y-8">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-title font-semibold">Informations personnelles</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline"
              >
                Modifier
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="profile-info-item">
                <p className="profile-info-label">Nom</p>
                <p className="profile-info-value">{user.name}</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Genre</p>
                <p className="profile-info-value">{user.gender === 'homme' ? 'Homme' : user.gender === 'femme' ? 'Femme' : 'Autre'}</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Âge</p>
                <p className="profile-info-value">{user.age} ans</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Taille</p>
                <p className="profile-info-value">{user.height} cm</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Poids actuel</p>
                <p className="profile-info-value">{user.weight} kg</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Poids cible</p>
                <p className="profile-info-value">{user.targetWeight} kg</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Objectif</p>
                <p className="profile-info-value">{weightGoalLabels[user.weightGoal]}</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Niveau d'activité</p>
                <p className="profile-info-value">{activityLevelLabels[user.activityLevel]}</p>
              </div>
              
              <div className="profile-info-item">
                <p className="profile-info-label">Type de régime</p>
                <p className="profile-info-value">{dietTypeLabels[user.dietType]}</p>
              </div>
              
              {/* Affichage du profil Keto */}
              <div className="profile-info-item">
                <p className="profile-info-label">Profil Keto</p>
                <p className="profile-info-value">{ketoProfileLabels[user.ketoProfile]}</p>
              </div>
            </div>
          </div>
          
          <div className="profile-section">
            <h2 className="text-xl font-title font-semibold mb-4">Besoins Caloriques Quotidiens</h2>
            
            <div className="info-box">
              <p className="mb-2">
                Vos besoins caloriques sont calculés en fonction de votre métabolisme de base, de votre niveau d'activité et de votre objectif de poids.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Facteur d'activité:</span> {activityFactorExplanations[user.activityLevel].factor}x ({activityFactorExplanations[user.activityLevel].description})
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Ajustement selon l'objectif:</span> {weightGoalExplanations[user.weightGoal].adjustment} ({weightGoalExplanations[user.weightGoal].description})
              </p>
              
              {/* Information sur le profil Keto */}
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                <span className="font-medium">Profil Keto:</span> {ketoProfileDescriptions[user.ketoProfile].description}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-medium">Répartition recommandée:</span> Lipides: {ketoProfileDescriptions[user.ketoProfile].lipides}, 
                Protéines: {ketoProfileDescriptions[user.ketoProfile].proteines}, 
                Glucides: {ketoProfileDescriptions[user.ketoProfile].glucides}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="macro-stat">
                <p className="macro-stat-label">Calories</p>
                <p className="macro-stat-value">{user.calorieTarget} kcal</p>
              </div>
              
              <div className="macro-stat">
                <p className="macro-stat-label">Protéines</p>
                <p className="macro-stat-value">{user.macroTargets.protein} g</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{macroPercentages.protein}% des calories</p>
              </div>
              
              <div className="macro-stat">
                <p className="macro-stat-label">Lipides</p>
                <p className="macro-stat-value">{user.macroTargets.fat} g</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{macroPercentages.fat}% des calories</p>
              </div>
              
              <div className="macro-stat">
                <p className="macro-stat-label">Glucides</p>
                <p className="macro-stat-value">{user.macroTargets.carbs} g</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{macroPercentages.carbs}% des calories</p>
              </div>
            </div>
            
            <div className="info-note">
              <p className="info-note-text">
                <span className="font-medium">📝 Note:</span> Les besoins caloriques peuvent varier selon de nombreux facteurs individuels. Utilisez ces valeurs comme point de départ et ajustez si nécessaire en fonction de vos résultats.
              </p>
            </div>
          </div>
          
          <div className="profile-section">
            <h2 className="text-xl font-title font-semibold mb-4">Calcul de l'IMC</h2>
            
            {/* Nouveau composant de visualisation d'IMC */}
            <div className="info-box">
              <IMCVisualizer 
                bmi={user.bmi} 
                height={user.height} 
                weight={user.weight} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
