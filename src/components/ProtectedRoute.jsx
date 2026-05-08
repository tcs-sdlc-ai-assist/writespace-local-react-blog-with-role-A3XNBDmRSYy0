import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getSession } from '../utils/auth.js';

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * Checks the current session via getSession(). If no session exists, redirects to /login.
 * If adminOnly is true and the user is not an admin, redirects to /blogs.
 * Otherwise, renders the children.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child elements to render if access is granted.
 * @param {boolean} [props.adminOnly] - If true, only admin users may access the route.
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ children, adminOnly }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && session.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
  adminOnly: false,
};

export default ProtectedRoute;