import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Home } from './Home.jsx';
import * as auth from '../utils/auth.js';
import * as storage from '../utils/storage.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../utils/auth.js', () => ({
  getSession: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../utils/storage.js', () => ({
  getPosts: vi.fn(),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

const mockSession = {
  username: 'testuser',
  displayName: 'Test User',
  role: 'user',
  loginAt: '2024-01-01T00:00:00.000Z',
};

const mockAdminSession = {
  username: 'admin',
  displayName: 'Site Owner',
  role: 'admin',
  loginAt: '2024-01-01T00:00:00.000Z',
};

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    auth.getSession.mockReturnValue(null);
    storage.getPosts.mockReturnValue([]);
  });

  describe('redirect behavior', () => {
    it('redirects to /login when no session exists', () => {
      auth.getSession.mockReturnValue(null);
      renderHome();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('does not redirect when session exists', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();
      expect(mockNavigate).not.toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  describe('page rendering', () => {
    it('renders the All Posts heading', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('renders the description text', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();
      expect(
        screen.getByText('Explore the latest stories from our community.')
      ).toBeInTheDocument();
    });

    it('renders nothing when session is null', () => {
      auth.getSession.mockReturnValue(null);
      const { container } = renderHome();
      expect(container.innerHTML).toBe('');
    });
  });

  describe('empty state', () => {
    it('renders empty state when no posts exist', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();
      expect(screen.getByText('No posts yet')).toBeInTheDocument();
    });

    it('renders empty state description text', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();
      expect(
        screen.getByText(/Be the first to share your thoughts/i)
      ).toBeInTheDocument();
    });

    it('renders Write Your First Post button in empty state', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();
      expect(
        screen.getByText(/Write Your First Post/i)
      ).toBeInTheDocument();
    });

    it('navigates to /write when Write Your First Post button is clicked', async () => {
      const user = userEvent.setup();
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();

      const writeButton = screen.getByText(/Write Your First Post/i);
      await user.click(writeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/write');
    });
  });

  describe('blog grid rendering', () => {
    const samplePosts = [
      {
        id: 'post-1',
        title: 'First Post',
        excerpt: 'First excerpt',
        content: 'First content',
        author: 'user1',
        authorDisplayName: 'User One',
        authorRole: 'user',
        createdAt: '2024-06-01T00:00:00.000Z',
        updatedAt: '2024-06-01T00:00:00.000Z',
      },
      {
        id: 'post-2',
        title: 'Second Post',
        excerpt: 'Second excerpt',
        content: 'Second content',
        author: 'user2',
        authorDisplayName: 'User Two',
        authorRole: 'user',
        createdAt: '2024-05-01T00:00:00.000Z',
        updatedAt: '2024-05-01T00:00:00.000Z',
      },
    ];

    it('renders blog cards when posts exist', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(samplePosts);
      renderHome();

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
    });

    it('does not render empty state when posts exist', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(samplePosts);
      renderHome();

      expect(screen.queryByText('No posts yet')).not.toBeInTheDocument();
    });

    it('renders author display names', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(samplePosts);
      renderHome();

      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    it('renders all posts from storage', () => {
      const manyPosts = [
        {
          id: 'post-1',
          title: 'Post Alpha',
          content: 'Content Alpha',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'post-2',
          title: 'Post Beta',
          content: 'Content Beta',
          author: 'user2',
          authorDisplayName: 'User Two',
          authorRole: 'user',
          createdAt: '2024-05-01T00:00:00.000Z',
          updatedAt: '2024-05-01T00:00:00.000Z',
        },
        {
          id: 'post-3',
          title: 'Post Gamma',
          content: 'Content Gamma',
          author: 'user3',
          authorDisplayName: 'User Three',
          authorRole: 'user',
          createdAt: '2024-04-01T00:00:00.000Z',
          updatedAt: '2024-04-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(manyPosts);
      renderHome();

      expect(screen.getByText('Post Alpha')).toBeInTheDocument();
      expect(screen.getByText('Post Beta')).toBeInTheDocument();
      expect(screen.getByText('Post Gamma')).toBeInTheDocument();
    });
  });

  describe('newest-first sorting', () => {
    it('sorts posts newest first', () => {
      const unsortedPosts = [
        {
          id: 'post-old',
          title: 'Old Post',
          content: 'Old content',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'post-new',
          title: 'New Post',
          content: 'New content',
          author: 'user2',
          authorDisplayName: 'User Two',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'post-mid',
          title: 'Middle Post',
          content: 'Middle content',
          author: 'user3',
          authorDisplayName: 'User Three',
          authorRole: 'user',
          createdAt: '2024-03-01T00:00:00.000Z',
          updatedAt: '2024-03-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(unsortedPosts);
      renderHome();

      const postTitles = screen.getAllByRole('button').map((el) => el.textContent);
      const newIndex = postTitles.findIndex((t) => t.includes('New Post'));
      const midIndex = postTitles.findIndex((t) => t.includes('Middle Post'));
      const oldIndex = postTitles.findIndex((t) => t.includes('Old Post'));

      expect(newIndex).toBeLessThan(midIndex);
      expect(midIndex).toBeLessThan(oldIndex);
    });
  });

  describe('edit icon visibility based on role/ownership', () => {
    it('shows edit icon on posts authored by the current user', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'My Post',
          content: 'My content',
          author: 'testuser',
          authorDisplayName: 'Test User',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.getByTitle('You can edit this post')).toBeInTheDocument();
    });

    it('does not show edit icon on posts authored by other users for regular user', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Other Post',
          content: 'Other content',
          author: 'otheruser',
          authorDisplayName: 'Other User',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(posts);
      renderHome();

      expect(screen.queryByTitle('You can edit this post')).not.toBeInTheDocument();
    });

    it('shows edit icon on all posts for admin user', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'User Post',
          content: 'User content',
          author: 'someuser',
          authorDisplayName: 'Some User',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'post-2',
          title: 'Another Post',
          content: 'Another content',
          author: 'anotheruser',
          authorDisplayName: 'Another User',
          authorRole: 'user',
          createdAt: '2024-05-01T00:00:00.000Z',
          updatedAt: '2024-05-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockAdminSession);
      storage.getPosts.mockReturnValue(posts);
      renderHome();

      const editIcons = screen.getAllByTitle('You can edit this post');
      expect(editIcons).toHaveLength(2);
    });

    it('shows edit icon on own post and not on others for regular user', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'My Own Post',
          content: 'My content',
          author: 'testuser',
          authorDisplayName: 'Test User',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'post-2',
          title: 'Someone Else Post',
          content: 'Other content',
          author: 'otheruser',
          authorDisplayName: 'Other User',
          authorRole: 'user',
          createdAt: '2024-05-01T00:00:00.000Z',
          updatedAt: '2024-05-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(posts);
      renderHome();

      const editIcons = screen.getAllByTitle('You can edit this post');
      expect(editIcons).toHaveLength(1);
    });
  });

  describe('navigation on post click', () => {
    it('navigates to post detail page when a blog card is clicked', async () => {
      const user = userEvent.setup();
      const posts = [
        {
          id: 'post-123',
          title: 'Clickable Post',
          content: 'Some content',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ];

      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue(posts);
      renderHome();

      const postCard = screen.getByText('Clickable Post');
      await user.click(postCard);

      expect(mockNavigate).toHaveBeenCalledWith('/post/post-123');
    });
  });

  describe('logout behavior', () => {
    it('calls logout and navigates to /login when logout is triggered', async () => {
      const user = userEvent.setup();
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(auth.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  describe('navbar rendering', () => {
    it('renders the Navbar with session info', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders Write link in navbar for authenticated user', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();

      const writeLinks = screen.getAllByText('Write');
      expect(writeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Admin Dashboard link in navbar for admin user', () => {
      auth.getSession.mockReturnValue(mockAdminSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();

      const adminLinks = screen.getAllByText('Admin Dashboard');
      expect(adminLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('does not render Admin Dashboard link for regular user', () => {
      auth.getSession.mockReturnValue(mockSession);
      storage.getPosts.mockReturnValue([]);
      renderHome();

      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });
  });
});