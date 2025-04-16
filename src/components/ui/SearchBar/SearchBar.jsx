import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder, debounceTime }) => {
  const [inputValue, setInputValue] = useState(value);
  
  // Mettre à jour la valeur interne lorsque la prop value change
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Gestion du debounce pour éviter trop d'appels lors de la saisie rapide
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, value, onChange, debounceTime]);
  
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleClear = () => {
    setInputValue('');
    onChange('');
  };
  
  return (
    <div className="search-bar">
      <div className="search-icon">
        <FiSearch />
      </div>
      
      <input
        type="text"
        className="search-input"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
      />
      
      {inputValue && (
        <button 
          className="clear-button"
          onClick={handleClear}
          aria-label="Effacer la recherche"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  debounceTime: PropTypes.number
};

SearchBar.defaultProps = {
  value: '',
  placeholder: 'Rechercher...',
  debounceTime: 300
};

export default SearchBar;
