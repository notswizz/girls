import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaImages, FaFire, FaTrophy, FaPiggyBank, FaChartLine, FaTimes, FaGlobe, FaLock, FaUser, FaEye } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('lastLoginAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [migrationResult, setMigrationResult] = useState(null);
  const [migrateToEmail, setMigrateToEmail] = useState('');
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  
  // User bank modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBank, setUserBank] = useState(null);
  const [loadingBank, setLoadingBank] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's bank
  const fetchUserBank = async (user) => {
    setSelectedUser(user);
    setLoadingBank(true);
    setUserBank(null);
    
    try {
      const userId = user._id?.toString ? user._id.toString() : String(user._id);
      const response = await fetch(`/api/admin/user-bank?userId=${encodeURIComponent(userId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch bank');
      setUserBank(data);
    } catch (err) {
      console.error('Error fetching user bank:', err);
    } finally {
      setLoadingBank(false);
    }
  };

  const runDataFix = async () => {
    if (!migrateToEmail) {
      alert('Please select a target email');
      return;
    }
    setShowMigrateModal(false);
    try {
      const res = await fetch('/api/admin/fix-data', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: migrateToEmail })
      });
      const data = await res.json();
      setMigrationResult(data);
      if (data.success) {
        fetchData(); // Refresh the data
      }
    } catch (err) {
      setMigrationResult({ error: err.message });
    }
  };
  
  // Get list of real users (not orphans) for the dropdown
  const realUsers = users.filter(u => !u.isOrphan);

  // Show loading while session is being determined
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-pink-500/20 border-t-pink-500"
        />
      </div>
    );
  }

  const ADMIN_EMAIL = 'emailswizz@gmail.com';
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  // Show sign in prompt if not authenticated or not admin
  if (status === 'unauthenticated' || (status === 'authenticated' && !isAdmin)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-white/50 mb-6">
            {status === 'unauthenticated' 
              ? 'Please sign in to access the admin dashboard.'
              : 'You do not have permission to access this page.'}
          </p>
          <a href="/" className="text-pink-400 hover:text-pink-300">← Back to app</a>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-pink-500/20 border-t-pink-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-white/40 text-sm">fap bank analytics</p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <StatCard
            icon={<FaUsers className="text-pink-400" />}
            value={stats?.totalUsers || users.length}
            label="Users"
            color="from-pink-500/20 to-rose-500/10"
          />
          <StatCard
            icon={<FaPiggyBank className="text-purple-400" />}
            value={stats?.totalModels || 0}
            label="Models"
            color="from-purple-500/20 to-violet-500/10"
          />
          <StatCard
            icon={<FaImages className="text-cyan-400" />}
            value={stats?.totalImages || 0}
            label="Images"
            color="from-cyan-500/20 to-blue-500/10"
          />
          <StatCard
            icon={<FaFire className="text-orange-400" />}
            value={stats?.totalVotes || 0}
            label="Votes"
            color="from-orange-500/20 to-amber-500/10"
          />
          <StatCard
            icon={<HiSparkles className="text-violet-400" />}
            value={stats?.totalAICreations || 0}
            label="AI Creations"
            color="from-violet-500/20 to-purple-500/10"
          />
          <StatCard
            icon={<FaTrophy className="text-yellow-400" />}
            value={stats?.publicModels || 0}
            label="Public"
            color="from-yellow-500/20 to-orange-500/10"
          />
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FaUsers className="text-pink-400" />
              Users ({users.length})
            </h2>
            <div className="flex items-center gap-3">
              {users.some(u => u.isOrphan) && (
                <button
                  onClick={() => setShowMigrateModal(true)}
                  className="text-sm px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                >
                  Fix Orphan Data
                </button>
              )}
              <button
                onClick={fetchData}
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {migrationResult && (
            <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${migrationResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {migrationResult.success ? (
                <div>
                  {migrationResult.message || (
                    <>✓ Migrated {migrationResult.migrated?.models || 0} models, {migrationResult.migrated?.images || 0} images, {migrationResult.migrated?.aiCreations || 0} AI creations to {migrationResult.migrated?.toUser}</>
                  )}
                </div>
              ) : (
                <div>✗ {migrationResult.error}</div>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-white/40 text-xs uppercase tracking-wider">
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Email</th>
                    <SortableHeader field="createdAt" label="Joined" sortField={sortField} sortDirection={sortDirection} onSort={(f, d) => { setSortField(f); setSortDirection(d); }} />
                    <SortableHeader field="lastLoginAt" label="Last Login" sortField={sortField} sortDirection={sortDirection} onSort={(f, d) => { setSortField(f); setSortDirection(d); }} />
                    <SortableHeader field="modelCount" label="Models" sortField={sortField} sortDirection={sortDirection} onSort={(f, d) => { setSortField(f); setSortDirection(d); }} align="right" />
                    <SortableHeader field="imageCount" label="Images" sortField={sortField} sortDirection={sortDirection} onSort={(f, d) => { setSortField(f); setSortDirection(d); }} align="right" />
                    <SortableHeader field="voteCount" label="Votes" sortField={sortField} sortDirection={sortDirection} onSort={(f, d) => { setSortField(f); setSortDirection(d); }} align="right" />
                    <th className="text-right p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/40">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    sortUsers(users, sortField, sortDirection).map((user, i) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.03 }}
                        className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${user.isOrphan ? 'bg-orange-500/5' : ''}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.isOrphan ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-orange-300' : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-white/70'}`}>
                              {user.isOrphan ? '?' : (user.name?.[0]?.toUpperCase() || '?')}
                            </div>
                            <div>
                              <span className="font-medium text-white/90">{user.name || 'Anonymous'}</span>
                              {user.isOrphan && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">SESSION</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-white/60 text-sm">
                          {user.email || '-'}
                        </td>
                        <td className="p-4 text-white/40 text-sm">
                          {user.createdAt ? formatDate(user.createdAt) : '-'}
                        </td>
                        <td className="p-4 text-white/40 text-sm">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
                        </td>
                        <td className="p-4 text-right text-white/60">
                          <span className={user.modelCount > 0 ? 'text-pink-400 font-medium' : ''}>{user.modelCount || 0}</span>
                        </td>
                        <td className="p-4 text-right text-white/60">
                          <span className={user.imageCount > 0 ? 'text-cyan-400 font-medium' : ''}>{user.imageCount || 0}</span>
                        </td>
                        <td className="p-4 text-right text-white/60">
                          <span className={user.voteCount > 0 ? 'text-orange-400 font-medium' : ''}>{user.voteCount || 0}</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => fetchUserBank(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <FaEye size={10} />
                            Bank
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
            </table>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Back to app
          </a>
        </motion.div>
      </div>

      {/* Migrate Modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-white mb-4">Migrate Orphan Data</h3>
            <p className="text-white/50 text-sm mb-4">
              Select which user to assign the orphan session data to:
            </p>
            
            <select
              value={migrateToEmail}
              onChange={(e) => setMigrateToEmail(e.target.value)}
              className="w-full p-3 bg-black/50 border border-white/10 rounded-xl text-white mb-4 focus:outline-none focus:border-pink-500"
            >
              <option value="">Select a user...</option>
              {realUsers.map(user => (
                <option key={user._id} value={user.email}>
                  {user.email} ({user.name || 'No name'})
                </option>
              ))}
            </select>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowMigrateModal(false)}
                className="flex-1 py-2 px-4 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={runDataFix}
                disabled={!migrateToEmail}
                className="flex-1 py-2 px-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Migrate
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              className="bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-white/10"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    {selectedUser.image ? (
                      <img src={selectedUser.image} alt="" className="w-12 h-12 rounded-full" />
                    ) : (
                      <FaUser className="text-white/40 text-xl" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name || 'Anonymous'}</h2>
                    <p className="text-sm text-white/40">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes className="text-white/40 text-xl" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                {loadingBank ? (
                  <div className="flex justify-center items-center h-48">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 rounded-full border-2 border-pink-500/20 border-t-pink-500"
                    />
                  </div>
                ) : userBank ? (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">{userBank.totalModels}</div>
                        <div className="text-xs text-white/40">Models</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-white">{userBank.totalImages}</div>
                        <div className="text-xs text-white/40">Photos</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-cyan-400">
                          {userBank.models.reduce((sum, m) => sum + (m.communityWins || 0), 0)}
                        </div>
                        <div className="text-xs text-white/40">Community Wins</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="text-2xl font-bold text-red-400">
                          {userBank.models.reduce((sum, m) => sum + (m.communityLosses || 0), 0)}
                        </div>
                        <div className="text-xs text-white/40">Community Losses</div>
                      </div>
                    </div>
                    
                    {/* Models */}
                    {userBank.models.length === 0 ? (
                      <div className="text-center py-12 text-white/40">
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
                                      <FaLock className="text-white/30" size={12} />
                                    )}
                                  </div>
                                  <div className="text-xs text-white/40">
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
                                    className="aspect-square rounded-lg overflow-hidden bg-black hover:ring-2 hover:ring-pink-500 transition-all"
                                  >
                                    <img
                                      src={image.url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </a>
                                ))}
                                {model.images.length > 16 && (
                                  <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs">
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
                  <div className="text-center py-12 text-white/40">
                    Failed to load bank data.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className={`relative p-4 rounded-xl bg-gradient-to-br ${color} border border-white/5 overflow-hidden`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{formatNumber(value)}</div>
      <div className="text-white/40 text-xs">{label}</div>
    </div>
  );
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SortableHeader({ field, label, sortField, sortDirection, onSort, align = 'left' }) {
  const isActive = sortField === field;
  const handleClick = () => {
    if (isActive) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  return (
    <th 
      className={`p-4 cursor-pointer hover:text-white/60 transition-colors select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={handleClick}
    >
      <span className={`inline-flex items-center gap-1 ${isActive ? 'text-pink-400' : ''}`}>
        {label}
        {isActive && (
          <span className="text-[10px]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
}

function sortUsers(users, field, direction) {
  return [...users].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];
    
    // Handle date fields
    if (field === 'createdAt' || field === 'lastLoginAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    
    // Handle number fields
    if (typeof aVal === 'number' || typeof bVal === 'number') {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
}
