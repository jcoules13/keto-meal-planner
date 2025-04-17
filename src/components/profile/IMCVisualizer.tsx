import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface IMCVisualizerProps {
  bmi: number;
  height: number;
  weight: number;
  className?: string;
}

const IMCVisualizer: React.FC<IMCVisualizerProps> = ({ bmi, height, weight, className = '' }) => {
  const { theme } = useTheme();
  
  // Définition des catégories d'IMC et leurs limites
  const bmiCategories = [
    { min: 0, max: 15, label: 'Dénutrition sévère', color: '#3b82f6' },     // Bleu
    { min: 15, max: 18.5, label: 'Insuffisance pondérale', color: '#60a5fa' }, // Bleu clair
    { min: 18.5, max: 25, label: 'Normal', color: '#22c55e' },             // Vert
    { min: 25, max: 30, label: 'Surpoids', color: '#fcd34d' },             // Jaune
    { min: 30, max: 40, label: 'Obésité', color: '#f97316' },              // Orange
    { min: 40, max: 100, label: 'Obésité sévère', color: '#ef4444' }       // Rouge
  ];
  
  // Trouver la catégorie correspondant à l'IMC actuel
  const currentCategory = bmiCategories.find(cat => bmi >= cat.min && bmi < cat.max) || bmiCategories[bmiCategories.length - 1];
  
  // Calcul de la position du curseur (en pourcentage)
  const minIMC = 15;
  const maxIMC = 40;
  // Limiter la position entre 0 et 100%
  const cursorPosition = Math.min(Math.max(((bmi - minIMC) / (maxIMC - minIMC)) * 100, 0), 100);
  
  return (
    <div className={`bmi-visualizer ${theme} ${className}`}>
      <div className="flex flex-col items-center mb-4">
        <div className="text-4xl font-bold">{bmi.toFixed(1)}</div>
        <div className={`text-xl ${bmi < 18.5 ? 'text-blue-500' : 
                              bmi < 25 ? 'text-green-500' : 
                              bmi < 30 ? 'text-yellow-500' : 
                              bmi < 40 ? 'text-orange-500' : 'text-red-500'}`}>
          {currentCategory.label}
        </div>
      </div>
      
      {/* Barre d'IMC avec gradients */}
      <div className="relative h-3 w-full flex rounded-full overflow-hidden">
        {bmiCategories.map((category, index) => {
          // Calculer la largeur de chaque segment en pourcentage
          const start = category.min < minIMC ? minIMC : category.min;
          const end = category.max > maxIMC ? maxIMC : category.max;
          const width = ((end - start) / (maxIMC - minIMC)) * 100;
          
          // Ne pas afficher les segments hors de la plage visible
          if (end <= minIMC || start >= maxIMC) return null;
          
          return (
            <div 
              key={index}
              style={{ 
                width: `${width}%`, 
                backgroundColor: category.color 
              }}
            />
          );
        })}
        
        {/* Indicateur de position */}
        <div 
          className="absolute top-0 transform -translate-x-1/2"
          style={{ 
            left: `${cursorPosition}%`,
            width: '12px',
            height: '12px',
            backgroundColor: 'white',
            border: '2px solid #333',
            borderRadius: '50%'
          }}
        />
      </div>
      
      {/* Échelle de référence */}
      <div className="flex justify-between mt-1 text-xs text-neutral-500">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>40</span>
      </div>
      
      {/* Informations supplémentaires */}
      <div className="mt-2 flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
        <div>Taille: {height} cm</div>
        <div>Poids: {weight} kg</div>
      </div>
    </div>
  );
};

export default IMCVisualizer;