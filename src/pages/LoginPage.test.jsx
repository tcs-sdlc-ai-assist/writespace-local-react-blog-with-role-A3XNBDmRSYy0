import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage.jsx';
import * as auth from '../utils/auth.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../utils/auth.js', () => ({
  login: vi.fn(),
  getSession: vi.fn(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    auth.getSession.mockReturnValue(null);
  });

  describe('form rendering', () => {
    it('renders the WriteSpace branding', () => {
      renderLoginPage();
      expect(screen.getByText('WriteSpace')).toBeInTheDocument();
    });

    it('renders the Welcome Back heading', () => {
      renderLoginPage();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('renders the sign in description text', () => {
      renderLoginPage();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('renders the username input field', () => {
      renderLoginPage();
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    it('renders the password input field', () => {
      renderLoginPage();
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders the Sign In button', () => {
      renderLoginPage();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('renders the register link', () => {
      renderLoginPage();
      expect(screen.getByText('Register here')).toBeInTheDocument();
    });

    it('renders the "Don\'t have an account?" text', () => {
      renderLoginPage();
      expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    });

    it('renders username placeholder text', () => {
      renderLoginPage();
      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    });

    it('renders password placeholder text', () => {
      renderLoginPage();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });
  });

  describe('successful login redirect', () => {
    it('redirects admin user to /dashboard on successful login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: true,
        user: {
          id: 'admin',
          username: 'admin',
          displayName: 'Site Owner',
          role: 'admin',
        },
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      expect(auth.login).toHaveBeenCalledWith('admin', 'admin123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('redirects regular user to /blogs on successful login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: true,
        user: {
          id: 'user-1',
          username: 'johndoe',
          displayName: 'John Doe',
          role: 'user',
        },
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(auth.login).toHaveBeenCalledWith('johndoe', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('redirects to /blogs when user object is null on success', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: true,
        user: null,
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'someuser');
      await user.type(passwordInput, 'somepass');
      await user.click(submitButton);

      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });
  });

  describe('failed login error display', () => {
    it('displays error message on failed login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: false,
        error: 'Invalid credentials',
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('displays default error message when no error string is provided', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: false,
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('displays error when username is empty', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(passwordInput, 'somepass');
      await user.click(submitButton);

      expect(screen.getByText('Username and password are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('displays error when password is empty', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'someuser');
      await user.click(submitButton);

      expect(screen.getByText('Username and password are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('displays error when both fields are empty', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /Sign In/i });
      await user.click(submitButton);

      expect(screen.getByText('Username and password are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('displays error when username is only whitespace', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, '   ');
      await user.type(passwordInput, 'somepass');
      await user.click(submitButton);

      expect(screen.getByText('Username and password are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('displays error when password is only whitespace', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'someuser');
      await user.type(passwordInput, '   ');
      await user.click(submitButton);

      expect(screen.getByText('Username and password are required')).toBeInTheDocument();
      expect(auth.login).not.toHaveBeenCalled();
    });

    it('does not navigate on failed login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: false,
        error: 'Invalid credentials',
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('clears previous error on new submission attempt', async () => {
      const user = userEvent.setup();

      auth.login
        .mockReturnValueOnce({
          success: false,
          error: 'Invalid credentials',
        })
        .mockReturnValueOnce({
          success: true,
          user: {
            id: 'user-1',
            username: 'johndoe',
            displayName: 'John Doe',
            role: 'user',
          },
        });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();

      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });

  describe('authenticated user redirect behavior', () => {
    it('redirects authenticated admin to /dashboard', () => {
      auth.getSession.mockReturnValue({
        username: 'admin',
        displayName: 'Site Owner',
        role: 'admin',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      renderLoginPage();

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    it('redirects authenticated regular user to /blogs', () => {
      auth.getSession.mockReturnValue({
        username: 'johndoe',
        displayName: 'John Doe',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      });

      renderLoginPage();

      expect(mockNavigate).toHaveBeenCalledWith('/blogs', { replace: true });
    });

    it('does not redirect when no session exists', () => {
      auth.getSession.mockReturnValue(null);

      renderLoginPage();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('form interaction', () => {
    it('trims username before calling login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: true,
        user: {
          id: 'user-1',
          username: 'johndoe',
          displayName: 'John Doe',
          role: 'user',
        },
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(usernameInput, '  johndoe  ');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(auth.login).toHaveBeenCalledWith('johndoe', 'password123');
    });

    it('does not show error initially', () => {
      renderLoginPage();

      const errorElements = document.querySelectorAll('.text-rose-600');
      expect(errorElements.length).toBe(0);
    });

    it('allows typing in username field', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const usernameInput = screen.getByLabelText('Username');
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    it('allows typing in password field', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'testpass');

      expect(passwordInput).toHaveValue('testpass');
    });
  });
});