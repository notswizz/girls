import { FaTrophy, FaPiggyBank } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

/**
 * Shared navigation items for the application
 * Core tabs: Rate (head-to-head rating), Bank (manage collection), Creations (AI)
 */
export const navigationItems = [
  { name: 'rate', path: '/rate', icon: <FaTrophy className="mr-2" /> },
  { name: 'bank', path: '/manage', icon: <FaPiggyBank className="mr-2" /> },
  { name: 'creations', path: '/creations', icon: <HiSparkles className="mr-2" /> },
];
