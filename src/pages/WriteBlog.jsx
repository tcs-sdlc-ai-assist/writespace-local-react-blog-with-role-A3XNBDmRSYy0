import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { getSession, logout } from '../utils/auth.js';
import { getPosts, createPost, updatePost } from '../utils/storage.js';

const TITLE_MAX_LENGTH = 150;
const EXCERPT_MAX_LENGTH = 300;
const CONTENT_MAX_LENGTH = 10000;

/**
 * WriteBlog component — blog post create and edit form page.
 * In create mode: generates UUID via crypto.randomUUID(), sets metadata, saves via storage.createPost(), redirects to post.
 * In edit mode: loads post by URL param, pre-fills form, updates via storage.updatePost(), redirects to post.
 * Ownership enforced (user: own posts only, admin: any). Validation with character counter.
 * Cancel button routes back. Uses Navbar, auth.js, storage.js.
 * @returns {JSX.Element}
 */
export function WriteBlog() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(postId);

  const [session, setSession] = useState(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }
    setSession(currentSession);

    if (isEditMode) {
      const posts = getPosts();
      const post = posts.find((p) => p.id === postId);

      if (!post) {
        setError('Post not found');
        setInitialLoading(false);
        return;
      }

      const canEdit =
        currentSession.role === 'admin' ||
        currentSession.username === post.author;

      if (!canEdit) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title || '');
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
    }

    setInitialLoading(false);
  }, [navigate, postId, isEditMode]);

  function handleLogout() {
    logout();
    setSession(null);
    navigate('/login', { replace: true });
  }

  function handleCancel() {
    if (isEditMode && postId) {
      navigate(`/post/${postId}`);
    } else {
      navigate('/blogs');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedExcerpt = excerpt.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      setError(`Title must be ${TITLE_MAX_LENGTH} characters or less`);
      return;
    }

    if (trimmedExcerpt.length > EXCERPT_MAX_LENGTH) {
      setError(`Excerpt must be ${EXCERPT_MAX_LENGTH} characters or less`);
      return;
    }

    if (!trimmedContent) {
      setError('Content is required');
      return;
    }

    if (trimmedContent.length > CONTENT_MAX_LENGTH) {
      setError(`Content must be ${CONTENT_MAX_LENGTH} characters or less`);
      return;
    }

    setLoading(true);

    if (isEditMode) {
      const success = updatePost(postId, {
        title: trimmedTitle,
        excerpt: trimmedExcerpt,
        content: trimmedContent,
      });

      setLoading(false);

      if (success) {
        navigate(`/post/${postId}`, { replace: true });
      } else {
        setError('Failed to update post. Please try again.');
      }
    } else {
      const success = createPost({
        title: trimmedTitle,
        excerpt: trimmedExcerpt,
        content: trimmedContent,
        author: session.username,
        authorDisplayName: session.displayName || session.username,
        authorRole: session.role || 'user',
      });

      setLoading(false);

      if (success) {
        const posts = getPosts();
        const sorted = [...posts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const newPost = sorted.find(
          (p) =>
            p.title === trimmedTitle &&
            p.author === session.username
        );
        if (newPost) {
          navigate(`/post/${newPost.id}`, { replace: true });
        } else {
          navigate('/blogs', { replace: true });
        }
      } else {
        setError('Failed to create post. Please try again.');
      }
    }
  }

  if (!session || initialLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            {isEditMode ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode
              ? 'Update your blog post below.'
              : 'Share your thoughts with the community.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-rose-50 border border-rose-200 p-3">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  title.length > TITLE_MAX_LENGTH
                    ? 'text-rose-500 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700"
              >
                Excerpt
              </label>
              <span
                className={`text-xs ${
                  excerpt.length > EXCERPT_MAX_LENGTH
                    ? 'text-rose-500 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {excerpt.length}/{EXCERPT_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of your post (optional)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors resize-vertical"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-xs ${
                  content.length > CONTENT_MAX_LENGTH
                    ? 'text-rose-500 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {content.length}/{CONTENT_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="content"
              name="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors resize-vertical"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2.5 rounded-md text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading
                ? isEditMode
                  ? 'Updating…'
                  : 'Publishing…'
                : isEditMode
                  ? '✏️ Update Post'
                  : '🚀 Publish Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default WriteBlog;