import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage.jsx';
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

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    auth.getSession.mockReturnValue(null);
    storage.getPosts.mockReturnValue([]);
  });

  describe('hero section', () => {
    it('renders the hero heading', () => {
      renderLandingPage();
      expect(
        screen.getByText(/Your Space to Write,/i)
      ).toBeInTheDocument();
    });

    it('renders the hero description text', () => {
      renderLandingPage();
      expect(
        screen.getByText(/WriteSpace is a modern blogging platform/i)
      ).toBeInTheDocument();
    });

    it('renders Get Started and Sign In buttons when not authenticated', () => {
      renderLandingPage();
      expect(
        screen.getByText(/Get Started — It's Free/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText('Sign In')
      ).toBeInTheDocument();
    });

    it('renders Start Writing button when authenticated', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      renderLandingPage();
      expect(
        screen.getByText(/Start Writing/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Get Started — It's Free/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('features section', () => {
    it('renders the Why WriteSpace heading', () => {
      renderLandingPage();
      expect(
        screen.getByText('Why WriteSpace?')
      ).toBeInTheDocument();
    });

    it('renders the Easy Writing feature card', () => {
      renderLandingPage();
      expect(
        screen.getByText('Easy Writing')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/clean, distraction-free editor/i)
      ).toBeInTheDocument();
    });

    it('renders the Share Instantly feature card', () => {
      renderLandingPage();
      expect(
        screen.getByText('Share Instantly')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Publish your posts and share them/i)
      ).toBeInTheDocument();
    });

    it('renders the Role-Based Access feature card', () => {
      renderLandingPage();
      expect(
        screen.getByText('Role-Based Access')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Admins manage the platform/i)
      ).toBeInTheDocument();
    });
  });

  describe('latest posts preview', () => {
    it('does not render Latest Posts section when no posts exist', () => {
      storage.getPosts.mockReturnValue([]);
      renderLandingPage();
      expect(
        screen.queryByText('Latest Posts')
      ).not.toBeInTheDocument();
    });

    it('renders Latest Posts section when posts exist', () => {
      storage.getPosts.mockReturnValue([
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
      ]);

      renderLandingPage();
      expect(
        screen.getByText('Latest Posts')
      ).toBeInTheDocument();
      expect(
        screen.getByText('First Post')
      ).toBeInTheDocument();
    });

    it('renders at most 3 latest posts sorted by newest first', () => {
      const posts = [
        {
          id: 'post-1',
          title: 'Oldest Post',
          content: 'Content 1',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'post-2',
          title: 'Middle Post',
          content: 'Content 2',
          author: 'user2',
          authorDisplayName: 'User Two',
          authorRole: 'user',
          createdAt: '2024-03-01T00:00:00.000Z',
          updatedAt: '2024-03-01T00:00:00.000Z',
        },
        {
          id: 'post-3',
          title: 'Newest Post',
          content: 'Content 3',
          author: 'user3',
          authorDisplayName: 'User Three',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'post-4',
          title: 'Fourth Post Should Not Show',
          content: 'Content 4',
          author: 'user4',
          authorDisplayName: 'User Four',
          authorRole: 'user',
          createdAt: '2024-02-01T00:00:00.000Z',
          updatedAt: '2024-02-01T00:00:00.000Z',
        },
      ];

      storage.getPosts.mockReturnValue(posts);
      renderLandingPage();

      expect(screen.getByText('Newest Post')).toBeInTheDocument();
      expect(screen.getByText('Middle Post')).toBeInTheDocument();
      expect(screen.getByText('Oldest Post')).toBeInTheDocument();
      expect(screen.queryByText('Fourth Post Should Not Show')).not.toBeInTheDocument();
    });

    it('renders Sign In to Read More link when not authenticated', () => {
      storage.getPosts.mockReturnValue([
        {
          id: 'post-1',
          title: 'A Post',
          content: 'Content',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ]);

      renderLandingPage();
      expect(
        screen.getByText(/Sign In to Read More/i)
      ).toBeInTheDocument();
    });

    it('renders View All Posts link when authenticated', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      storage.getPosts.mockReturnValue([
        {
          id: 'post-1',
          title: 'A Post',
          content: 'Content',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ]);

      renderLandingPage();
      expect(
        screen.getByText(/View All Posts/i)
      ).toBeInTheDocument();
    });
  });

  describe('navbar adaptation to auth state', () => {
    it('renders Login and Register links in navbar when not authenticated', () => {
      renderLandingPage();
      const loginLinks = screen.getAllByText('Login');
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
      const registerLinks = screen.getAllByText('Register');
      expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders user display name and Dashboard button when authenticated', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      renderLandingPage();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('does not render Login/Register nav links when authenticated', () => {
      auth.getSession.mockReturnValue({
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      renderLandingPage();
      // The footer still has Login/Register links, so we check the nav specifically
      const navElement = screen.getByRole('navigation');
      const loginInNav = navElement.querySelector('a[href="/login"]');
      expect(loginInNav).toBeNull();
    });
  });

  describe('unauthenticated click redirect behavior', () => {
    it('navigates to /login when unauthenticated user clicks a blog card', async () => {
      const user = userEvent.setup();

      storage.getPosts.mockReturnValue([
        {
          id: 'post-1',
          title: 'Clickable Post',
          content: 'Some content here',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ]);

      renderLandingPage();

      const postCard = screen.getByText('Clickable Post');
      await user.click(postCard);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to /login when authenticated user clicks a blog card', async () => {
      const user = userEvent.setup();

      auth.getSession.mockReturnValue({
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      storage.getPosts.mockReturnValue([
        {
          id: 'post-1',
          title: 'Clickable Post Auth',
          content: 'Some content here',
          author: 'user1',
          authorDisplayName: 'User One',
          authorRole: 'user',
          createdAt: '2024-06-01T00:00:00.000Z',
          updatedAt: '2024-06-01T00:00:00.000Z',
        },
      ]);

      renderLandingPage();

      const postCard = screen.getByText('Clickable Post Auth');
      await user.click(postCard);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('footer', () => {
    it('renders the footer with WriteSpace branding', () => {
      renderLandingPage();
      expect(
        screen.getByText(/All rights reserved/i)
      ).toBeInTheDocument();
    });

    it('renders the current year in the footer', () => {
      renderLandingPage();
      const currentYear = new Date().getFullYear().toString();
      expect(
        screen.getByText(new RegExp(currentYear))
      ).toBeInTheDocument();
    });
  });

  describe('logout behavior', () => {
    it('calls logout and clears session when logout button is clicked', async () => {
      const user = userEvent.setup();

      auth.getSession.mockReturnValue({
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      renderLandingPage();

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(auth.logout).toHaveBeenCalled();
    });
  });
});