import { FaStar, FaCog } from 'react-icons/fa';

/**
 * Shared navigation items for the application
 * Core tabs: Rate (with gallery/explore toggle), Manage (with analytics)
 */
export const navigationItems = [
  { name: 'rate', path: '/rate', icon: <FaStar className="mr-2" /> },
  { name: 'manage', path: '/manage', icon: <FaCog className="mr-2" /> },
];
