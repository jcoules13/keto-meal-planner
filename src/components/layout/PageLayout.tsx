import React from 'react';
import { Helmet } from 'react-helmet';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title = '', 
  description = '' 
}) => {
  const fullTitle = title 
    ? `${title} | Keto Meal Planner` 
    : 'Keto Meal Planner';
  
  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      
      <div className="page-container">
        {children}
      </div>
    </>
  );
};

export default PageLayout;
