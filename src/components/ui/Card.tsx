import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
  hoverable = false,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-neutral-800 
        rounded-lg shadow-md
        overflow-hidden
        ${hoverable ? 'transition-shadow hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          {title && (
            <h3 className="text-lg font-title font-semibold text-neutral-800 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="p-4">{children}</div>
      
      {footer && (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;