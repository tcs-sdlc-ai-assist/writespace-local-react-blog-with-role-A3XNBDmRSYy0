import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar.jsx';
import { BlogCard } from '../components/BlogCard.jsx';
import { getPosts } from '../utils/storage.js';
import { getSession, logout } from '../utils/auth.js';

/**
 * LandingPage component — the public-facing landing page for WriteSpace.
 * Displays a hero section, features section, latest posts preview, and footer.
 * @returns {JSX.Element}
 */
export function LandingPage() {
  const [session, setSession] = useState(null);
  const [latestPosts, setLatestPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    const posts = getPosts();
    const sorted = [...posts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLatestPosts(sorted.slice(0, 3));
  }, []);

  function handleLogout() {
    logout();
    setSession(null);
  }

  function handlePostNavigate(post) {
    if (!session) {
      navigate('/login');
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar session={session} onLogout={handleLogout} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-serif leading-tight">
            Your Space to Write,
            <br />
            Share &amp; Inspire
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/90">
            WriteSpace is a modern blogging platform where ideas come to life.
            Create, publish, and share your stories with the world.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                to="/write"
                className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold bg-white text-primary-600 hover:bg-gray-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
              >
                ✍️ Start Writing
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold bg-white text-primary-600 hover:bg-gray-100 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Get Started — It&apos;s Free
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 rounded-lg text-base font-semibold bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
            Why WriteSpace?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to share your thoughts with the world.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center transition-shadow hover:shadow-lg">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-3xl mb-4">
              ✏️
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              Easy Writing
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              A clean, distraction-free editor that lets you focus on what
              matters — your words.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center transition-shadow hover:shadow-lg">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-100 text-3xl mb-4">
              🌍
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              Share Instantly
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Publish your posts and share them with readers instantly. No
              complicated setup required.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center transition-shadow hover:shadow-lg">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-3xl mb-4">
              🔒
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              Role-Based Access
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Admins manage the platform while users focus on creating great
              content. Simple and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">
                Latest Posts
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Check out what our community has been writing about.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post, index) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  session={session}
                  onNavigate={handlePostNavigate}
                  index={index}
                />
              ))}
            </div>
            <div className="mt-10 text-center">
              {session ? (
                <Link
                  to="/"
                  className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  View All Posts →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center px-5 py-2.5 rounded-md text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  Sign In to Read More →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-white">
              <span aria-hidden="true">✍️</span>
              <span className="text-lg font-bold font-serif">WriteSpace</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-white transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>© {new Date().getFullYear()} WriteSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;