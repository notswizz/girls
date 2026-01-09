import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaUser, FaStar, FaCalendarAlt, FaSort, FaSortUp, FaSortDown, FaSearch, FaSpinner, FaTimes, FaImages, FaGlobe, FaLock, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('ratingsCount');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // User bank modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBank, setUserBank] = useState(null);
  const [loadingBank, setLoadingBank] = useState(false);
  
  // Debug: log when selectedUser changes
  useEffect(() => {
    console.log('selectedUser changed to:', selectedUser);
  }, [selectedUser]);
  
  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter and sort users
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerSearchTerm)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle special cases
      if (sortField === 'createdAt' || sortField === 'lastLoginAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Handle null/undefined values
      if (aValue === undefined || aValue === null) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bValue === undefined || bValue === null) bValue = sortDirection === 'asc' ? Infinity : -Infinity;
      
      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredUsers(result);
  }, [users, sortField, sortDirection, searchTerm]);
  
  // Fetch user's bank
  const fetchUserBank = async (user) => {
    console.log('fetchUserBank called for:', user);
    // Set user immediately to show modal
    setSelectedUser(user);
    setLoadingBank(true);
    setUserBank(null);
    
    try {
      // Ensure userId is a string
      const userId = user._id?.toString ? user._id.toString() : String(user._id);
      const url = `/api/admin/user-bank?userId=${encodeURIComponent(userId)}`;
      console.log('Fetching:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Data:', data);
      if (!response.ok) throw new Error(data.message || 'Failed to fetch bank');
      setUserBank(data);
    } catch (err) {
      console.error('Error fetching user bank:', err);
    } finally {
      setLoadingBank(false);
    }
  };
  
  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'ratingsCount' ? 'desc' : 'asc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-cyan-400" /> : <FaSortDown className="text-cyan-400" />;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout title="community">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Community Leaderboard</h1>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-gray-800/50 rounded-lg text-white/80 text-sm">
          <p>Click on any user to view their bank (models and photos).</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="text-pink-500 text-4xl animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-lg">
            <p className="font-bold">Error loading users:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <FaUser className="mr-2 text-pink-500" />
                        <span>User</span>
                        <span className="ml-1">{getSortIcon('name')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('modelCount')}
                    >
                      <div className="flex items-center">
                        <span>Models</span>
                        <span className="ml-1">{getSortIcon('modelCount')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('imageCount')}
                    >
                      <div className="flex items-center">
                        <FaImages className="mr-2 text-cyan-400" />
                        <span>Photos</span>
                        <span className="ml-1">{getSortIcon('imageCount')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('voteCount')}
                    >
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-yellow-400" />
                        <span>Votes</span>
                        <span className="ml-1">{getSortIcon('voteCount')}</span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-purple-400" />
                        <span>Joined</span>
                        <span className="ml-1">{getSortIcon('createdAt')}</span>
                      </div>
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                        {searchTerm ? 'No users match your search' : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user._id} 
                        className="hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              {user.image ? (
                                <img src={user.image} alt="" className="h-10 w-10 rounded-full" />
                              ) : (
                                <FaUser className="text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.name || 'Anonymous'}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-mono">
                            {user.modelCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-mono">
                            {user.imageCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white font-mono">
                            {user.voteCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => fetchUserBank(user)}
                            className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            View Bank
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* User Bank Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                    {selectedUser.image ? (
                      <img src={selectedUser.image} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                      <FaUser className="text-gray-400 text-xl" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name || 'Anonymous'}</h2>
                    <p className="text-sm text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes className="text-gray-400 text-xl" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                {loadingBank ? (
                  <div className="flex justify-center items-center h-48">
                    <FaSpinner className="text-pink-500 text-3xl animate-spin" />
                  </div>
                ) : userBank ? (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">{userBank.totalModels}</div>
                        <div className="text-xs text-gray-400">Models</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">{userBank.totalImages}</div>
                        <div className="text-xs text-gray-400">Photos</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-cyan-400">
                          {userBank.models.reduce((sum, m) => sum + (m.communityWins || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-400">Community Wins</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-red-400">
                          {userBank.models.reduce((sum, m) => sum + (m.communityLosses || 0), 0)}
                        </div>
                        <div className="text-xs text-gray-400">Community Losses</div>
                      </div>
                    </div>
                    
                    {/* Models */}
                    {userBank.models.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        This user has no models yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Models</h3>
                        {userBank.models.map(model => (
                          <div key={model._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold">
                                  {model.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{model.name}</span>
                                    {model.isPublic ? (
                                      <FaGlobe className="text-emerald-400" size={12} />
                                    ) : (
                                      <FaLock className="text-gray-500" size={12} />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {model.imageCount} photos
                                    {(model.communityWins > 0 || model.communityLosses > 0) && (
                                      <span className="ml-2">
                                        • <span className="text-green-400">{model.communityWins}W</span>
                                        {' '}<span className="text-red-400">{model.communityLosses}L</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Images grid */}
                            {model.images && model.images.length > 0 && (
                              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {model.images.slice(0, 16).map(image => (
                                  <a
                                    key={image._id}
                                    href={image.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="aspect-square rounded-lg overflow-hidden bg-gray-800 hover:ring-2 hover:ring-pink-500 transition-all"
                                  >
                                    <img
                                      src={image.url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                                {model.images.length > 16 && (
                                  <div className="aspect-square rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 text-xs">
                                    +{model.images.length - 16}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    Failed to load bank data.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
