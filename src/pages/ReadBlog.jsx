import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { getAvatar } from '../components/Avatar.jsx';
import { getSession, logout } from '../utils/auth.js';
import { getPosts, deletePost } from '../utils/storage.js';

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
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * ReadBlog component — single blog post full reading view.
 * Displays title, author avatar/name, date, and full content.
 * Edit/delete controls shown based on role/ownership.
 * Delete requires window.confirm() and redirects to /blogs.
 * Invalid/missing post ID shows 'Post not found' message.
 * Uses Navbar, Avatar, storage.js, auth.js.
 * @returns {JSX.Element}
 */
export function ReadBlog() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }
    setSession(currentSession);

    const posts = getPosts();
    const found = posts.find((p) => p.id === postId);

    if (!found) {
      setNotFound(true);
    } else {
      setPost(found);
    }
  }, [navigate, postId]);

  function handleLogout() {
    logout();
    setSession(null);
    navigate('/login', { replace: true });
  }

  function handleEdit() {
    navigate(`/edit/${post.id}`);
  }

  function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );
    if (!confirmed) return;

    const success = deletePost(post.id);
    if (success) {
      navigate('/blogs', { replace: true });
    }
  }

  if (!session) {
    return null;
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar session={session} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
          <span className="text-5xl mb-4" aria-hidden="true">
            🔍
          </span>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            Post not found
          </h1>
          <p className="mt-2 text-gray-600 max-w-md">
            The post you&apos;re looking for doesn&apos;t exist or may have been
            removed.
          </p>
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="mt-6 inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            ← Back to Blogs
          </button>
        </main>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const canEdit =
    session.role === 'admin' || session.username === post.author;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate('/blogs')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-6"
        >
          ← Back to Blogs
        </button>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif leading-tight">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getAvatar(post.authorRole || 'user')}
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {post.authorDisplayName || post.author}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <time dateTime={post.createdAt}>
                      {formatDate(post.createdAt)}
                    </time>
                    {post.updatedAt &&
                      post.updatedAt !== post.createdAt && (
                        <span className="text-gray-400">
                          · Updated {formatDate(post.updatedAt)}
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </header>

          {post.excerpt && (
            <p className="text-lg text-gray-600 italic border-l-4 border-primary-300 pl-4 mb-8">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </main>
    </div>
  );
}

export default ReadBlog;