import React, { useRef, useEffect } from 'react';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant de navigation amélioré entre les jours du plan de repas
 * Affiche les jours avec un style clair et adapté aux mobiles 
 * Corrige les problèmes de contraste en thème clair
 */
const DayNavigator = ({ days, selectedDayIndex, onSelectDay }) => {
  const scrollRef = useRef(null);
  
  // Effet pour centrer automatiquement le jour sélectionné
  useEffect(() => {
    if (scrollRef.current && days.length > 0) {
      const tabElement = scrollRef.current.querySelector('.active');
      if (tabElement) {
        // Calculer la position de défilement pour centrer l'élément
        const container = scrollRef.current;
        const scrollLeft = tabElement.offsetLeft - (container.clientWidth / 2) + (tabElement.clientWidth / 2);
        
        // Appliquer le défilement avec animation douce
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedDayIndex, days.length]);
  
  // Format des jours de la semaine en français
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short' }; // Format court
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };
  
  // Format des dates en français
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
  };

  return (
    <div className="day-tabs-container">
      <div className="day-tabs" ref={scrollRef}>
        {days.map((day, index) => (
          <button
            key={index}
            className={`day-tab ${selectedDayIndex === index ? 'active' : ''}`}
            onClick={() => onSelectDay(index)}
            aria-selected={selectedDayIndex === index}
            aria-controls={`day-panel-${index}`}
          >
            <div className="day-name">{getDayOfWeek(day.date)}</div>
            <div className="day-date">{formatDate(day.date)}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DayNavigator;
