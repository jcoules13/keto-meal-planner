import React, { useMemo } from 'react';
import { FaClock, FaUtensils } from 'react-icons/fa';

/**
 * Composant pour visualiser le calendrier du jeûne intermittent
 * Montre les périodes de jeûne et d'alimentation de manière graphique
 */
const FastingScheduleDisplay = ({ fastingConfig }) => {
  const { enabled, fastingWindow, eatingWindow, startTime } = fastingConfig;
  
  // Calculer l'heure de fin de la fenêtre d'alimentation
  const endTime = useMemo(() => {
    if (!enabled || !startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + eatingWindow);
    
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  }, [enabled, eatingWindow, startTime]);
  
  // Générer les heures pour la visualisation (24 heures)
  const hourLabels = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => `${i}:00`);
  }, []);
  
  // Déterminer si une heure donnée fait partie de la fenêtre d'alimentation
  const isEatingTime = (hour) => {
    if (!enabled || !startTime) return false;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Extraire l'heure du label (ex: "14:00" => 14)
    const currentHour = parseInt(hour.split(':')[0]);
    
    // Cas où la fenêtre d'alimentation ne passe pas minuit
    if (endHour > startHour) {
      return currentHour >= startHour && currentHour < endHour;
    } 
    // Cas où la fenêtre d'alimentation passe minuit
    else {
      return currentHour >= startHour || currentHour < endHour;
    }
  };
  
  // Obtenir le mode de jeûne en format lisible
  const getFastingModeLabel = () => {
    if (fastingWindow === 16 && eatingWindow === 8) return '16/8';
    if (fastingWindow === 18 && eatingWindow === 6) return '18/6';
    if (fastingWindow === 20 && eatingWindow === 4) return '20/4';
    if (fastingWindow === 23 && eatingWindow === 1) return 'OMAD';
    return `${fastingWindow}/${eatingWindow}`;
  };
  
  // Si le jeûne n'est pas activé, ne pas afficher ce composant
  if (!enabled) return null;
  
  return (
    <div className="fasting-schedule-display p-4 bg-bg-secondary rounded-lg">
      <div className="flex items-center mb-3">
        <FaClock className="text-primary-500 mr-2" />
        <h4 className="text-lg font-medium">Calendrier de jeûne ({getFastingModeLabel()})</h4>
      </div>
      
      <div className="flex justify-between mb-2 text-sm text-text-secondary">
        <span>Fenêtre d'alimentation: {startTime} - {endTime}</span>
        <span>{eatingWindow}h d'alimentation / {fastingWindow}h de jeûne</span>
      </div>
      
      <div className="timeline-container overflow-x-auto">
        <div className="timeline-hours flex" style={{ minWidth: '768px' }}>
          {hourLabels.map((hour, index) => (
            <div 
              key={hour} 
              className={`timeline-hour flex-1 py-2 text-center ${
                isEatingTime(hour) 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className="hour-label text-xs">{hour}</div>
              <div className="hour-icon mt-1">
                {isEatingTime(hour) ? (
                  <FaUtensils className="mx-auto text-primary-500" size={12} />
                ) : (
                  <FaClock className="mx-auto text-gray-500" size={12} />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="timeline-legend flex justify-between mt-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-100 mr-1"></div>
            <span>Fenêtre d'alimentation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-100 mr-1"></div>
            <span>Période de jeûne</span>
          </div>
        </div>
      </div>
      
      <div className="meal-recommendations mt-4">
        <h5 className="text-sm font-medium mb-1">Repas recommandés :</h5>
        <ul className="text-xs text-text-secondary">
          {eatingWindow <= 4 && (
            <li className="flex items-center">
              <FaUtensils className="text-primary-500 mr-1" size={10} />
              <span>Concentrez vos repas dans la fenêtre {startTime} - {endTime}</span>
            </li>
          )}
          {eatingWindow === 1 && (
            <li className="flex items-center mt-1">
              <FaUtensils className="text-primary-500 mr-1" size={10} />
              <span>Optez pour un seul repas complet (OMAD)</span>
            </li>
          )}
          {eatingWindow >= 6 && (
            <li className="flex items-center">
              <FaUtensils className="text-primary-500 mr-1" size={10} />
              <span>Prévoyez 2-3 repas espacés dans votre fenêtre d'alimentation</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FastingScheduleDisplay;