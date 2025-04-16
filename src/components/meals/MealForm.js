import React, { useState, useEffect } from 'react';

const MealForm = ({ initialMeal, onSubmit, onCancel }) => {
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');

  useEffect(() => {
    if (initialMeal) {
      setMealName(initialMeal.name || '');
      setMealDescription(initialMeal.description || '');
    } else {
      setMealName('');
      setMealDescription('');
    }
  }, [initialMeal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: mealName,
      description: mealDescription,
    });
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="meal-form">
      <div className="form-group">
        <label htmlFor="mealName">Nom du repas:</label>
        <input
          type="text"
          id="mealName"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="mealDescription">Description:</label>
        <textarea
          id="mealDescription"
          value={mealDescription}
          onChange={(e) => setMealDescription(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit">Sauvegarder</button>
        <button type="button" onClick={handleCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
};

export default MealForm;