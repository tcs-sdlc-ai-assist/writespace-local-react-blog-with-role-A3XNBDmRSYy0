import { getUsers } from './storage.js';

const SESSION_KEY = 'writespace_session';

/**
 * Reads the current session from localStorage.
 * @returns {Object|null} The session object, or null if no session exists.
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.username) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Writes a session object to localStorage.
 * @param {Object} session - The session object to persist.
 * @returns {boolean} True if write succeeded, false otherwise.
 */
function writeSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

/**
 * Authenticates a user by username and password.
 * Checks against the hard-coded admin account first, then localStorage users.
 * On success, writes a session to localStorage.
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to authenticate.
 * @returns {{ success: boolean, user?: Object, error?: string }} Result object.
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  if (username === 'admin' && password === 'admin123') {
    const adminUser = {
      id: 'admin',
      username: 'admin',
      displayName: 'Site Owner',
      role: 'admin',
    };
    const session = {
      username: adminUser.username,
      displayName: adminUser.displayName,
      role: adminUser.role,
      loginAt: new Date().toISOString(),
    };
    writeSession(session);
    return { success: true, user: adminUser };
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const session = {
      username: user.username,
      displayName: user.displayName,
      role: user.role || 'user',
      loginAt: new Date().toISOString(),
    };
    writeSession(session);
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role || 'user',
      },
    };
  }

  return { success: false, error: 'Invalid credentials' };
}

/**
 * Logs out the current user by removing the session from localStorage.
 * @returns {void}
 */
export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // silently fail
  }
}

/**
 * Checks if the current session user is an admin.
 * @returns {boolean} True if the current user has the admin role.
 */
export function isAdmin() {
  const session = getSession();
  if (!session) {
    return false;
  }
  return session.role === 'admin';
}

/**
 * Checks if the current session user is the owner of a resource.
 * @param {string} authorUsername - The username of the resource author.
 * @returns {boolean} True if the current user's username matches the author.
 */
export function isOwner(authorUsername) {
  const session = getSession();
  if (!session) {
    return false;
  }
  return session.username === authorUsername;
}