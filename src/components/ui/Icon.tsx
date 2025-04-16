import React from 'react';
import * as FaIcons from 'react-icons/fa';

type IconProps = {
  icon: keyof typeof FaIcons;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ icon, className = '' }) => {
  const IconComponent = FaIcons[icon] as any;
  return <IconComponent className={className} />;
};

export default Icon;