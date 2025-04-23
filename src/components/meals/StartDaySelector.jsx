import React, { useState, useEffect } from 'react';
import { getPreferredStartDay, savePreferredStartDay, getDayName } from '../../utils/dateUtils';

/**
 * Composant permettant à l'utilisateur de choisir son jour de début de semaine préféré
 * Utilise des boutons radio pour un choix plus intuitif
 */
const StartDaySelector = ({ onChange }) => {
  // État pour le jour de début sélectionné (0 = dimanche par défaut)
  const [selectedDay, setSelectedDay] = useState(getPreferredStartDay(0));
  
  // Liste des jours avec leur indice
  const days = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];
  
  // Quand le jour sélectionné change, le sauvegarder et notifier le parent
  useEffect(() => {
    savePreferredStartDay(selectedDay);
    if (onChange) {
      onChange(selectedDay);
    }
  }, [selectedDay, onChange]);
  
  // Gestion du changement de sélection
  const handleDayChange = (dayValue) => {
    const numValue = parseInt(dayValue, 10);
    setSelectedDay(numValue);
  };
  
  return (
    <div className="start-day-selector">
      <h3 className="text-lg font-medium text-text-primary mb-3">Jour de début de semaine</h3>
      <p className="text-text-secondary mb-3">
        Choisissez le jour qui commencera votre semaine pour le plan de repas
      </p>
      
      <div className="days-radio-group grid grid-cols-2 md:grid-cols-7 gap-2 mt-3">
        {days.map(day => (
          <label 
            key={day.value} 
            className={`
              day-radio-label 
              flex items-center justify-center 
              p-2 border rounded-md 
              ${selectedDay === day.value 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-300 hover:border-gray-400'
              }
              cursor-pointer transition-colors text-center
            `}
          >
            <input
              type="radio"
              name="startDay"
              value={day.value}
              checked={selectedDay === day.value}
              onChange={() => handleDayChange(day.value)}
              className="sr-only" // Caché visuellement, le style est appliqué au label
            />
            <span>{day.label}</span>
          </label>
        ))}
      </div>
      
      <p className="mt-3 text-sm text-text-secondary">
        Votre semaine commencera le prochain {getDayName(selectedDay)}
      </p>
    </div>
  );
};

export default StartDaySelector;