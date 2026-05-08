import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { BlogCard } from '../components/BlogCard.jsx';
import { getPosts } from '../utils/storage.js';
import { getSession, logout } from '../utils/auth.js';

/**
 * Home component — authenticated blog list page.
 * Displays all posts from localStorage in a responsive grid (1/2/3 columns).
 * Uses BlogCard component with accent border cycling. Edit icon visible based on role/ownership.
 * Empty state with message and CTA to write. Posts sorted newest first.
 * @returns {JSX.Element}
 */
export function Home() {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }
    setSession(currentSession);

    const allPosts = getPosts();
    const sorted = [...allPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setPosts(sorted);
  }, [navigate]);

  function handleLogout() {
    logout();
    setSession(null);
    navigate('/login', { replace: true });
  }

  function handlePostNavigate(post) {
    navigate(`/post/${post.id}`);
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-serif">
            All Posts
          </h1>
          <p className="mt-2 text-gray-600">
            Explore the latest stories from our community.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4" aria-hidden="true">
              📝
            </span>
            <h2 className="text-xl font-semibold text-gray-900">
              No posts yet
            </h2>
            <p className="mt-2 text-gray-600 max-w-md">
              Be the first to share your thoughts with the community. Start
              writing your first blog post today!
            </p>
            <button
              type="button"
              onClick={() => navigate('/write')}
              className="mt-6 inline-flex items-center px-5 py-2.5 rounded-md text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            >
              ✍️ Write Your First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                session={session}
                onNavigate={handlePostNavigate}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;