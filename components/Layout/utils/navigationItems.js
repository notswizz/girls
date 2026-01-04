import { FaTrophy, FaPiggyBank } from 'react-icons/fa';

/**
 * Shared navigation items for the application
 * Core tabs: Rate (head-to-head rating), Bank (manage collection)
 */
export const navigationItems = [
  { name: 'rate', path: '/rate', icon: <FaTrophy className="mr-2" /> },
  { name: 'bank', path: '/manage', icon: <FaPiggyBank className="mr-2" /> },
];
