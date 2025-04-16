import React from 'react';
import PropTypes from 'prop-types';
import './FilterPanel.css';

const FilterPanel = ({ children }) => {
  return (
    <div className="filter-panel">
      <div className="filter-panel-content">
        {children}
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  children: PropTypes.node.isRequired
};

export default FilterPanel;
