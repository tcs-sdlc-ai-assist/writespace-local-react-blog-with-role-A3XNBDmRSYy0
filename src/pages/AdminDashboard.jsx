import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getSession, logout } from '../utils/auth.js';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';

/**
 * Formats an ISO date string to a human-readable format.
 * @param {string} isoString - ISO date string.
 * @returns {string} Formatted date string.
 */
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Truncates a string to a given max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} The truncated string.
 */
function truncate(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * AdminDashboard component — admin-only dashboard page.
 * Displays gradient banner header, stat cards (total posts, total users, admin count, user count),
 * quick action buttons, and recent posts section with edit/delete controls.
 * Non-admins are redirected to /blogs.
 * @returns {JSX.Element}
 */
export function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }
    if (currentSession.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }
    setSession(currentSession);
    loadData();
  }, [navigate]);

  function loadData() {
    const allPosts = getPosts();
    const sorted = [...allPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setPosts(sorted);

    const allUsers = getUsers();
    setUsers(allUsers);
  }

  function handleLogout() {
    logout();
    setSession(null);
    navigate('/login', { replace: true });
  }

  function handleEditPost(post) {
    navigate(`/edit/${post.id}`);
  }

  function handleDeletePost(post) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const success = deletePost(post.id);
    if (success) {
      loadData();
    }
  }

  if (!session) {
    return null;
  }

  const totalPosts = posts.length;
  const totalUsers = users.length + 1; // +1 for the hard-coded admin
  const adminCount = users.filter((u) => u.role === 'admin').length + 1; // +1 for hard-coded admin
  const userCount = users.filter((u) => u.role !== 'admin').length;
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />

      {/* Gradient Banner Header */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center gap-4">
            {getAvatar('admin')}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-white/80 text-sm sm:text-base">
                Welcome back, {session.displayName || session.username}. Here&apos;s an overview of your platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Posts"
            value={totalPosts}
            icon="📝"
            gradient="bg-gradient-to-br from-primary-500 to-primary-700"
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon="👥"
            gradient="bg-gradient-to-br from-accent-500 to-accent-700"
          />
          <StatCard
            label="Admins"
            value={adminCount}
            icon="👑"
            gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          />
          <StatCard
            label="Users"
            value={userCount}
            icon="📖"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/write')}
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            >
              ✍️ Write a Post
            </button>
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold bg-accent-600 text-white hover:bg-accent-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2"
            >
              👥 Manage Users
            </button>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">
            Recent Posts
          </h2>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm border border-gray-100">
              <span className="text-5xl mb-4" aria-hidden="true">
                📝
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                No posts yet
              </h3>
              <p className="mt-2 text-gray-600 max-w-md">
                Get started by writing the first blog post for your platform.
              </p>
              <button
                type="button"
                onClick={() => navigate('/write')}
                className="mt-4 inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
              >
                ✍️ Write Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getAvatar(post.authorRole || 'user')}
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate block text-left w-full"
                      >
                        {truncate(post.title, 60)}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{post.authorDisplayName || post.author}</span>
                        <span className="text-gray-300">·</span>
                        <time dateTime={post.createdAt}>
                          {formatDate(post.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditPost(post)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;