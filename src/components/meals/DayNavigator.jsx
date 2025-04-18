import React from 'react';
import './WeeklyMealPlanDisplay.css';

/**
 * Composant de navigation entre les jours du plan de repas
 * Affiche tous les jours sous forme d'onglets et permet la sélection
 */
const DayNavigator = ({ days, selectedDayIndex, onSelectDay }) => {
  // Format des jours de la semaine en français
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'long' };
    return new Intl.DateTimeFormat('fr-FR', options).format(date);
  };
  
  // Format des dates en français
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
  };

  return (
    <div className="day-navigator">
      <div className="days-tabs">
        {days.map((day, index) => (
          <button
            key={index}
            className={`day-tab ${selectedDayIndex === index ? 'active' : ''}`}
            onClick={() => onSelectDay(index)}
          >
            <span className="day-name">{getDayOfWeek(day.date)}</span>
            <span className="day-date">{formatDate(day.date)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DayNavigator;