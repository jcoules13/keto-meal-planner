import React from 'react';
import PropTypes from 'prop-types';
import './SeasonalityIndicator.css';

const SeasonalityIndicator = ({ seasons }) => {
  const allSeasons = ['printemps', 'été', 'automne', 'hiver'];
  const currentSeason = getCurrentSeason();
  
  // Obtenir la saison actuelle
  function getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'printemps';
    if (month >= 5 && month <= 7) return 'été';
    if (month >= 8 && month <= 10) return 'automne';
    return 'hiver';
  }
  
  // Vérifier si l'aliment est disponible toute l'année
  const isAvailableAllYear = 
    seasons?.length === 4 || 
    seasons?.includes('toute_année');
  
  return (
    <div className="seasonality-indicator">
      {isAvailableAllYear ? (
        <div className="all-year-indicator">
          <span className="all-year-label">Disponible toute l'année</span>
        </div>
      ) : (
        <div className="seasons-grid">
          {allSeasons.map(season => {
            const isAvailable = seasons?.includes(season);
            const isCurrent = season === currentSeason;
            
            return (
              <div 
                key={season}
                className={`
                  season-item 
                  ${isAvailable ? 'available' : 'not-available'}
                  ${isCurrent ? 'current' : ''}
                `}
              >
                <div className="season-icon">{getSeasonIcon(season)}</div>
                <div className="season-name">{getSeasonName(season)}</div>
              </div>
            );
          })}
        </div>
      )}
      
      {!isAvailableAllYear && (
        <div className="current-season-note">
          Nous sommes actuellement en <strong>{getSeasonName(currentSeason)}</strong>.
          {seasons?.includes(currentSeason) ? (
            <span className="in-season-message"> Cet aliment est de saison.</span>
          ) : (
            <span className="off-season-message"> Cet aliment n'est pas de saison.</span>
          )}
        </div>
      )}
    </div>
  );
};

// Fonction pour obtenir l'icône de saison (utilise des émojis par défaut)
function getSeasonIcon(season) {
  switch (season) {
    case 'printemps': return '🌱';
    case 'été': return '☀️';
    case 'automne': return '🍂';
    case 'hiver': return '❄️';
    default: return '';
  }
}

// Fonction pour obtenir le nom formaté de la saison
function getSeasonName(season) {
  switch (season) {
    case 'printemps': return 'Printemps';
    case 'été': return 'Été';
    case 'automne': return 'Automne';
    case 'hiver': return 'Hiver';
    default: return season;
  }
}

SeasonalityIndicator.propTypes = {
  seasons: PropTypes.arrayOf(PropTypes.string)
};

SeasonalityIndicator.defaultProps = {
  seasons: []
};

export default SeasonalityIndicator;
