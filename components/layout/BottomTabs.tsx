
import React from 'react';
import type { Screen } from '../../types';
import { BookOpenIcon, CogIcon, InformationCircleIcon, ScaleIcon } from '../icons';

interface BottomTabsProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: Screen;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2] dark:from-[#4c51bf] dark:to-[#553c9a]';
  const inactiveClasses = 'text-gray-500 dark:text-gray-400';

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-1/4 pt-2 pb-1 transition-transform duration-200 ease-in-out transform hover:scale-105 focus:outline-none"
    >
      <div className={`w-7 h-7 ${isActive ? activeClasses : inactiveClasses}`}>{icon}</div>
      <span className={`text-xs mt-1 font-medium ${isActive ? activeClasses : inactiveClasses}`}>{label}</span>
    </button>
  );
};

const BottomTabs: React.FC<BottomTabsProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems: { label: Screen; icon: React.ReactNode }[] = [
    { label: 'Lexicon', icon: <BookOpenIcon /> },
    { label: 'Grammar', icon: <ScaleIcon /> },
    { label: 'About', icon: <InformationCircleIcon /> },
    { label: 'Settings', icon: <CogIcon /> },
  ];

  return (
    <nav className="flex justify-around items-center h-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-t-lg">
      {navItems.map(item => (
        <NavItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          isActive={activeScreen === item.label}
          onClick={() => setActiveScreen(item.label)}
        />
      ))}
    </nav>
  );
};

export default BottomTabs;
