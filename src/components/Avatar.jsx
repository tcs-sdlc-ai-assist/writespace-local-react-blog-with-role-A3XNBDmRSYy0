import PropTypes from 'prop-types';

/**
 * Returns a styled avatar JSX element based on the user's role.
 * @param {'admin' | 'user'} role - The role of the user.
 * @returns {JSX.Element} A styled span element with a role-appropriate emoji and background.
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-200 text-violet-800 text-sm font-semibold">
        👑
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 text-sm font-semibold">
      📖
    </span>
  );
}

/**
 * Avatar component that renders a role-based visual avatar.
 * @param {Object} props
 * @param {'admin' | 'user'} props.role - The role of the user.
 * @returns {JSX.Element}
 */
export function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
};

Avatar.defaultProps = {
  role: 'user',
};

export default Avatar;