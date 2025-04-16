import React from 'react';

const MealDayView = ({ plan, dayIndex, onBack, onAddMeal, onEditMeal, onDeleteMeal }) => {
  const day = plan.days[dayIndex];

  if (!day) {
    return <div>Day not found</div>;
  }


  return (
    <div className="meal-day-view">
      <h2>Jour {dayIndex + 1}</h2>
      <ul>
        {day.meals.map((meal, index) => (
          <li key={index}>
            {meal.name}
            <button onClick={() => onEditMeal(meal)}>Modifier</button>
            <button onClick={() => onDeleteMeal(meal.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
      <button onClick={onAddMeal}>Ajouter un repas</button>
      <button onClick={onBack}>Retour</button>
    </div>
  );
};

export default MealDayView;
