import React from 'react';
import PropTypes from 'prop-types';
import './PHIndicator.css';

const PHIndicator = ({ value }) => {
  // pH doit être entre 0 et 14
  const safeValue = Math.max(0, Math.min(14, value));
  
  // Détermine la classe CSS en fonction de la valeur du pH
  const getIndicatorClass = (pH) => {
    if (pH < 6.0) return 'very-acidic';
    if (pH < 6.5) return 'acidic';
    if (pH < 7.0) return 'slightly-acidic';
    if (pH === 7.0) return 'neutral';
    if (pH < 7.5) return 'slightly-alkaline';
    if (pH < 8.0) return 'alkaline';
    return 'very-alkaline';
  };
  
  // Determine le libellé descriptif en fonction de la valeur du pH
  const getDescriptiveLabel = (pH) => {
    if (pH < 6.0) return 'Très acide';
    if (pH < 6.5) return 'Acide';
    if (pH < 7.0) return 'Légèrement acide';
    if (pH === 7.0) return 'Neutre';
    if (pH < 7.5) return 'Légèrement alcalin';
    if (pH < 8.0) return 'Alcalin';
    return 'Très alcalin';
  };
  
  const indicatorClass = getIndicatorClass(safeValue);
  const descriptiveLabel = getDescriptiveLabel(safeValue);
  
  // Calcule la position du marqueur sur l'échelle (en pourcentage)
  const markerPosition = (safeValue / 14) * 100;
  
  return (
    <div className="ph-indicator">
      <div className="ph-value-display">
        <span className={`ph-value ${indicatorClass}`}>
          pH {safeValue.toFixed(1)}
        </span>
        <span className="ph-label">{descriptiveLabel}</span>
      </div>
      
      <div className="ph-scale">
        <div className="ph-scale-bar">
          <div className="ph-gradient"></div>
          <div 
            className="ph-marker"
            style={{ left: `${markerPosition}%` }}
          ></div>
        </div>
        <div className="ph-scale-labels">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
        <div className="ph-scale-descriptions">
          <span>Acide</span>
          <span>Neutre</span>
          <span>Alcalin</span>
        </div>
      </div>
    </div>
  );
};

PHIndicator.propTypes = {
  value: PropTypes.number.isRequired
};

export default PHIndicator;
