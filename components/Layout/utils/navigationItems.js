import { FaFire, FaStar, FaCog, FaTrophy, FaGlobe } from 'react-icons/fa';

/**
 * Shared navigation items for the application
 */
export const navigationItems = [
  { name: 'home', path: '/', icon: <FaFire className="mr-2" /> },
  { name: 'rate', path: '/rate', icon: <FaStar className="mr-2" /> },
  { name: 'explore', path: '/explore', icon: <FaGlobe className="mr-2" /> },
  { name: 'leaderboard', path: '/leaderboard', icon: <FaTrophy className="mr-2" /> },
  { name: 'manage', path: '/manage', icon: <FaCog className="mr-2" /> },
];
