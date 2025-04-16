import React, { useState } from 'react';
import { FaCalendarAlt, FaUtensils } from 'react-icons/fa';
import { useMealPlan } from '../../contexts/MealPlanContext';
import './MealPlanCreator.css';

/**
 * Formulaire de création d'un nouveau plan de repas
 */
const MealPlanCreator = ({ dietType, onPlanCreated, onCancel }) => {
  const { createEmptyPlan } = useMealPlan();
  
  // États locaux du formulaire
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDietType, setSelectedDietType] = useState(dietType || 'keto_standard');
  const [errors, setErrors] = useState({});
  
  // Initialiser les dates par défaut (aujourd'hui et dans 7 jours)
  React.useEffect(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 6);
    
    // Formatage des dates en YYYY-MM-DD pour les inputs date
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setStartDate(formatDate(today));
    setEndDate(formatDate(nextWeek));
  }, []);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valider le formulaire
    const validationErrors = {};
    
    if (!name.trim()) {
      validationErrors.name = 'Le nom du plan est obligatoire';
    }
    
    if (!startDate) {
      validationErrors.startDate = 'La date de début est obligatoire';
    }
    
    if (!endDate) {
      validationErrors.endDate = 'La date de fin est obligatoire';
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      validationErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }
    
    // Si des erreurs existent, les afficher et arrêter la soumission
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Créer le plan de repas
    const planId = createEmptyPlan(name, startDate, endDate, selectedDietType);
    
    // Informer le parent que le plan a été créé
    if (planId && onPlanCreated) {
      onPlanCreated(planId);
    }
  };
  
  return (
    <div className="meal-plan-creator">
      <h2>Créer un nouveau plan de repas</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom du plan</label>
          <div className="input-with-icon">
            <FaUtensils className="input-icon" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mon plan hebdomadaire"
              className={errors.name ? 'error' : ''}
            />
          </div>
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Date de début</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={errors.startDate ? 'error' : ''}
              />
            </div>
            {errors.startDate && <div className="error-message">{errors.startDate}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">Date de fin</label>
            <div className="input-with-icon">
              <FaCalendarAlt className="input-icon" />
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={errors.endDate ? 'error' : ''}
              />
            </div>
            {errors.endDate && <div className="error-message">{errors.endDate}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label>Type de régime</label>
          <div className="diet-type-options">
            <div
              className={`diet-option ${selectedDietType === 'keto_standard' ? 'selected' : ''}`}
              onClick={() => setSelectedDietType('keto_standard')}
            >
              <div className="diet-icon keto-standard-icon">K</div>
              <div className="diet-info">
                <h3>Keto Standard</h3>
                <p>Régime cétogène classique à haute teneur en graisses</p>
              </div>
            </div>
            
            <div
              className={`diet-option ${selectedDietType === 'keto_alcalin' ? 'selected' : ''}`}
              onClick={() => setSelectedDietType('keto_alcalin')}
            >
              <div className="diet-icon keto-alkaline-icon">A</div>
              <div className="diet-info">
                <h3>Keto Alcalin</h3>
                <p>Combinaison keto avec alimentation alcaline (pH > 7)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="create-button">
            Créer le plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealPlanCreator;