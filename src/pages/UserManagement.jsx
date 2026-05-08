import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { UserRow } from '../components/UserRow.jsx';
import { getSession, logout } from '../utils/auth.js';
import { getUsers, createUser, deleteUser } from '../utils/storage.js';

/**
 * UserManagement component — admin-only user management page.
 * Displays all users in a responsive list using UserRow components.
 * Includes a create user form with display name, username, password, role select, and validation.
 * Delete requires confirmation; hard-coded admin cannot be deleted; logged-in user cannot delete own account.
 * Non-admins are redirected to /blogs.
 * @returns {JSX.Element}
 */
export function UserManagement() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
    loadUsers();
  }, [navigate]);

  function loadUsers() {
    const allUsers = getUsers();
    setUsers(allUsers);
  }

  function handleLogout() {
    logout();
    setSession(null);
    navigate('/login', { replace: true });
  }

  function handleDeleteUser(user) {
    if (user.username === 'admin') {
      return;
    }
    if (session && session.username === user.username) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.displayName || user.username}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    const success = deleteUser(user.id);
    if (success) {
      loadUsers();
      setSuccessMessage(`User "${user.displayName || user.username}" has been deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setError('Failed to delete user. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  }

  function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedDisplayName || !trimmedUsername || !password) {
      setFormError('All fields are required');
      return;
    }

    if (trimmedUsername === 'admin') {
      setFormError('Username already exists');
      return;
    }

    const existingUsers = getUsers();
    const duplicate = existingUsers.some((u) => u.username === trimmedUsername);
    if (duplicate) {
      setFormError('Username already exists');
      return;
    }

    setLoading(true);

    const created = createUser({
      username: trimmedUsername,
      displayName: trimmedDisplayName,
      password: password,
      role: role,
    });

    setLoading(false);

    if (created) {
      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      loadUsers();
      setSuccessMessage(`User "${trimmedDisplayName}" has been created successfully.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setFormError('Failed to create user. Please try a different username.');
    }
  }

  if (!session) {
    return null;
  }

  const hardCodedAdmin = {
    id: 'admin',
    username: 'admin',
    displayName: 'Site Owner',
    role: 'admin',
    createdAt: null,
  };

  const allUsersWithAdmin = [hardCodedAdmin, ...users];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            User Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage platform users, create new accounts, and remove existing ones.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-md bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-sm text-emerald-600">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md bg-rose-50 border border-rose-200 p-3">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        )}

        {/* Create User Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">
            Create New User
          </h2>

          {formError && (
            <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 p-3">
              <p className="text-sm text-rose-600">{formError}</p>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="createDisplayName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="createDisplayName"
                  name="createDisplayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="createUsername"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username <span className="text-rose-500">*</span>
                </label>
                <input
                  id="createUsername"
                  name="createUsername"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="createPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  id="createPassword"
                  name="createPassword"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="createRole"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="createRole"
                  name="createRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                  loading
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {loading ? 'Creating…' : '➕ Create User'}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 font-serif">
              All Users
            </h2>
            <span className="text-sm text-gray-500">
              {allUsersWithAdmin.length} {allUsersWithAdmin.length === 1 ? 'user' : 'users'}
            </span>
          </div>

          {allUsersWithAdmin.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm border border-gray-100">
              <span className="text-5xl mb-4" aria-hidden="true">
                👥
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                No users found
              </h3>
              <p className="mt-2 text-gray-600 max-w-md">
                Create the first user using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allUsersWithAdmin.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  session={session}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserManagement;