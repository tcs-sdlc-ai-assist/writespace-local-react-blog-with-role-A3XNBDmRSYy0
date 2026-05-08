import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAvatar } from './Avatar.jsx';

/**
 * PublicNavbar component for guest/public pages.
 * Displays WriteSpace logo and Login/Register buttons when not authenticated.
 * If authenticated, shows avatar chip and dashboard CTA.
 * @param {Object} props
 * @param {Object|null} props.session - The current session object, or null if not authenticated.
 * @param {Function} [props.onLogout] - Callback invoked when the logout button is clicked.
 * @returns {JSX.Element}
 */
export function PublicNavbar({ session, onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    if (onLogout) {
      onLogout();
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span aria-hidden="true">✍️</span>
            <span className="font-serif">WriteSpace</span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-2">
                  {getAvatar(session.role || 'user')}
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {session.displayName || session.username}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

PublicNavbar.propTypes = {
  session: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']),
    loginAt: PropTypes.string,
  }),
  onLogout: PropTypes.func,
};

PublicNavbar.defaultProps = {
  session: null,
  onLogout: undefined,
};

export default PublicNavbar;