import PropTypes from 'prop-types';
import { Avatar } from './Avatar.jsx';

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
 * UserRow component for displaying a user in the admin user management panel.
 * Shows avatar, display name, username, role badge, created date, and delete button.
 * @param {Object} props
 * @param {Object} props.user - The user object to display.
 * @param {string} props.user.id - The user's unique ID.
 * @param {string} props.user.username - The user's username.
 * @param {string} props.user.displayName - The user's display name.
 * @param {'admin' | 'user'} [props.user.role] - The user's role.
 * @param {string} [props.user.createdAt] - ISO date string of when the user was created.
 * @param {Object|null} props.session - The current session object.
 * @param {Function} [props.onDelete] - Callback invoked with the user object when delete is clicked.
 * @returns {JSX.Element}
 */
export function UserRow({ user, session, onDelete }) {
  const role = user.role || 'user';
  const isHardCodedAdmin = user.username === 'admin';
  const isSelf = session && session.username === user.username;
  const deleteDisabled = isHardCodedAdmin || isSelf;

  function handleDelete() {
    if (!deleteDisabled && onDelete) {
      onDelete(user);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar role={role} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {user.displayName || user.username}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                role === 'admin'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {role}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {user.createdAt && (
          <time className="text-xs text-gray-400 hidden sm:block" dateTime={user.createdAt}>
            {formatDate(user.createdAt)}
          </time>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteDisabled}
          title={
            isHardCodedAdmin
              ? 'Cannot delete the admin account'
              : isSelf
                ? 'Cannot delete your own account'
                : 'Delete user'
          }
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 ${
            deleteDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700'
          }`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']),
    createdAt: PropTypes.string,
  }).isRequired,
  session: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']),
    loginAt: PropTypes.string,
  }),
  onDelete: PropTypes.func,
};

UserRow.defaultProps = {
  session: null,
  onDelete: undefined,
};

export default UserRow;