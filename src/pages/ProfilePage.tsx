import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Gender, ActivityLevel, DietType } from '../utils/nutritionCalculator';

const ProfilePage = () => {
  const user = useUser();
  const [isEditing, setIsEditing] = useState(!user.isProfileComplete);
  
  // États locaux pour le formulaire d'édition
  const [formData, setFormData] = useState({
    name: user.name,
    gender: user.gender,
    age: user.age,
    height: user.height,
    weight: user.weight,
    targetWeight: user.targetWeight,
    activityLevel: user.activityLevel,
    dietType: user.dietType
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
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-title font-bold mb-6">Profil Utilisateur</h1>
      
      {isEditing ? (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-title font-semibold mb-4">
            {user.isProfileComplete ? 'Modifier votre profil' : 'Compléter votre profil'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md">
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
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Nom</p>
              <p className="font-medium text-lg">{user.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Genre</p>
              <p className="font-medium text-lg">{user.gender === 'homme' ? 'Homme' : user.gender === 'femme' ? 'Femme' : 'Autre'}</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Âge</p>
              <p className="font-medium text-lg">{user.age} ans</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Taille</p>
              <p className="font-medium text-lg">{user.height} cm</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Poids actuel</p>
              <p className="font-medium text-lg">{user.weight} kg</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Poids cible</p>
              <p className="font-medium text-lg">{user.targetWeight} kg</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Niveau d'activité</p>
              <p className="font-medium text-lg">{activityLevelLabels[user.activityLevel]}</p>
            </div>
            
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Type de régime</p>
              <p className="font-medium text-lg">{dietTypeLabels[user.dietType]}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-title font-semibold mb-4">Besoins nutritionnels quotidiens</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Calories</p>
                <p className="font-medium text-xl">{user.calorieTarget} kcal</p>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Protéines</p>
                <p className="font-medium text-xl">{user.macroTargets.protein} g</p>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Lipides</p>
                <p className="font-medium text-xl">{user.macroTargets.fat} g</p>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Glucides</p>
                <p className="font-medium text-xl">{user.macroTargets.carbs} g</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-title font-semibold mb-4">Calcul de l'IMC</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg text-center flex-1">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">IMC</p>
                <p className="font-medium text-xl">{user.bmi}</p>
              </div>
              
              <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg text-center flex-1">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Catégorie</p>
                <p className="font-medium text-xl">{user.bmiCategory}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;