import PropTypes from 'prop-types';
import { getAvatar } from './Avatar.jsx';

const ACCENT_COLORS = [
  'border-l-primary-400',
  'border-l-accent-400',
  'border-l-violet-400',
  'border-l-emerald-400',
  'border-l-rose-400',
  'border-l-amber-400',
];

/**
 * Truncates a string to a given max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} The truncated string.
 */
function truncate(text, maxLength = 120) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

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
 * BlogCard component that renders a blog post preview card.
 * @param {Object} props
 * @param {Object} props.post - The post object.
 * @param {Object|null} props.session - The current session object.
 * @param {Function} [props.onNavigate] - Navigation handler called with the post when clicked.
 * @param {number} [props.index] - Index used for accent border color cycling.
 * @returns {JSX.Element}
 */
export function BlogCard({ post, session, onNavigate, index = 0 }) {
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const excerpt = post.excerpt ? truncate(post.excerpt, 120) : truncate(post.content, 120);
  const canEdit =
    session &&
    (session.role === 'admin' || session.username === post.author);

  function handleClick() {
    if (onNavigate) {
      onNavigate(post);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative bg-white rounded-lg shadow-md border-l-4 ${accentColor} p-5 cursor-pointer transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        {canEdit && (
          <span
            className="flex-shrink-0 text-gray-400 hover:text-primary-600"
            title="You can edit this post"
          >
            ✏️
          </span>
        )}
      </div>

      {excerpt && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">{excerpt}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getAvatar(post.authorRole || 'user')}
          <span className="text-sm font-medium text-gray-700">
            {post.authorDisplayName || post.author}
          </span>
        </div>
        <time className="text-xs text-gray-400" dateTime={post.createdAt}>
          {formatDate(post.createdAt)}
        </time>
      </div>
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    author: PropTypes.string,
    authorDisplayName: PropTypes.string,
    authorRole: PropTypes.oneOf(['admin', 'user']),
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  }).isRequired,
  session: PropTypes.shape({
    username: PropTypes.string,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['admin', 'user']),
    loginAt: PropTypes.string,
  }),
  onNavigate: PropTypes.func,
  index: PropTypes.number,
};

BlogCard.defaultProps = {
  session: null,
  onNavigate: undefined,
  index: 0,
};

export default BlogCard;