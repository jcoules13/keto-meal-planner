import React from 'react';
import AppHeader from './AppHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-white dark:bg-neutral-800 py-4 shadow-inner">
        <div className="container mx-auto px-4 text-center text-neutral-500 dark:text-neutral-400 text-sm">
          &copy; {new Date().getFullYear()} Keto Meal Planner | Tous droits réservés
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;