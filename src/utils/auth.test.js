import { describe, it, expect, beforeEach } from 'vitest';
import { login, logout, getSession, isAdmin, isOwner } from './auth.js';
import { createUser } from './storage.js';

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_session', 'not-valid-json');
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains a non-object value', () => {
      localStorage.setItem('writespace_session', JSON.stringify('hello'));
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains null', () => {
      localStorage.setItem('writespace_session', JSON.stringify(null));
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session object has no username', () => {
      localStorage.setItem('writespace_session', JSON.stringify({ role: 'user' }));
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns the session object when valid data exists', () => {
      const mockSession = {
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
        loginAt: '2024-01-01T00:00:00.000Z',
      };
      localStorage.setItem('writespace_session', JSON.stringify(mockSession));
      const session = getSession();
      expect(session).toEqual(mockSession);
    });

    it('returns session with username even if other fields are missing', () => {
      const mockSession = { username: 'minimal' };
      localStorage.setItem('writespace_session', JSON.stringify(mockSession));
      const session = getSession();
      expect(session).toEqual(mockSession);
      expect(session.username).toBe('minimal');
    });

    it('returns null when localStorage contains an array', () => {
      localStorage.setItem('writespace_session', JSON.stringify([1, 2, 3]));
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains a number', () => {
      localStorage.setItem('writespace_session', JSON.stringify(42));
      const session = getSession();
      expect(session).toBeNull();
    });
  });

  describe('login', () => {
    describe('hard-coded admin', () => {
      it('authenticates the hard-coded admin with correct credentials', () => {
        const result = login('admin', 'admin123');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.username).toBe('admin');
        expect(result.user.displayName).toBe('Site Owner');
        expect(result.user.role).toBe('admin');
      });

      it('persists session to localStorage on successful admin login', () => {
        login('admin', 'admin123');
        const session = getSession();
        expect(session).not.toBeNull();
        expect(session.username).toBe('admin');
        expect(session.displayName).toBe('Site Owner');
        expect(session.role).toBe('admin');
        expect(session.loginAt).toBeDefined();
      });

      it('sets loginAt as a valid ISO date string', () => {
        login('admin', 'admin123');
        const session = getSession();
        const loginDate = new Date(session.loginAt);
        expect(loginDate.getTime()).not.toBeNaN();
      });

      it('fails with wrong password for admin', () => {
        const result = login('admin', 'wrongpassword');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('does not persist session on failed admin login', () => {
        login('admin', 'wrongpassword');
        const session = getSession();
        expect(session).toBeNull();
      });
    });

    describe('localStorage users', () => {
      beforeEach(() => {
        createUser({
          username: 'johndoe',
          displayName: 'John Doe',
          password: 'password123',
          role: 'user',
        });
        createUser({
          username: 'janeadmin',
          displayName: 'Jane Admin',
          password: 'adminpass',
          role: 'admin',
        });
      });

      it('authenticates a localStorage user with correct credentials', () => {
        const result = login('johndoe', 'password123');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.username).toBe('johndoe');
        expect(result.user.displayName).toBe('John Doe');
        expect(result.user.role).toBe('user');
      });

      it('persists session to localStorage on successful user login', () => {
        login('johndoe', 'password123');
        const session = getSession();
        expect(session).not.toBeNull();
        expect(session.username).toBe('johndoe');
        expect(session.displayName).toBe('John Doe');
        expect(session.role).toBe('user');
        expect(session.loginAt).toBeDefined();
      });

      it('authenticates a localStorage admin user with correct credentials', () => {
        const result = login('janeadmin', 'adminpass');
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user.username).toBe('janeadmin');
        expect(result.user.role).toBe('admin');
      });

      it('fails with wrong password for localStorage user', () => {
        const result = login('johndoe', 'wrongpassword');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('fails with non-existent username', () => {
        const result = login('nonexistent', 'password123');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('does not persist session on failed user login', () => {
        login('johndoe', 'wrongpassword');
        const session = getSession();
        expect(session).toBeNull();
      });

      it('returns user id in the result for localStorage users', () => {
        const result = login('johndoe', 'password123');
        expect(result.user.id).toBeDefined();
        expect(typeof result.user.id).toBe('string');
        expect(result.user.id.length).toBeGreaterThan(0);
      });
    });

    describe('edge cases', () => {
      it('returns error when username is empty', () => {
        const result = login('', 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('returns error when password is empty', () => {
        const result = login('admin', '');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('returns error when both username and password are empty', () => {
        const result = login('', '');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('returns error when username is null', () => {
        const result = login(null, 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('returns error when password is null', () => {
        const result = login('admin', null);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('returns error when username is undefined', () => {
        const result = login(undefined, 'password');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('returns error when password is undefined', () => {
        const result = login('admin', undefined);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('is case-sensitive for username', () => {
        createUser({
          username: 'testuser',
          displayName: 'Test',
          password: 'pass',
          role: 'user',
        });

        const result = login('TestUser', 'pass');
        expect(result.success).toBe(false);
      });

      it('is case-sensitive for password', () => {
        createUser({
          username: 'testuser',
          displayName: 'Test',
          password: 'Password123',
          role: 'user',
        });

        const result = login('testuser', 'password123');
        expect(result.success).toBe(false);
      });

      it('hard-coded admin takes priority over localStorage user named admin', () => {
        // createUser prevents username 'admin', but test the login path
        const result = login('admin', 'admin123');
        expect(result.success).toBe(true);
        expect(result.user.displayName).toBe('Site Owner');
        expect(result.user.role).toBe('admin');
      });

      it('overwrites previous session on new login', () => {
        createUser({
          username: 'user1',
          displayName: 'User One',
          password: 'pass1',
          role: 'user',
        });
        createUser({
          username: 'user2',
          displayName: 'User Two',
          password: 'pass2',
          role: 'user',
        });

        login('user1', 'pass1');
        let session = getSession();
        expect(session.username).toBe('user1');

        login('user2', 'pass2');
        session = getSession();
        expect(session.username).toBe('user2');
      });
    });
  });

  describe('logout', () => {
    it('removes the session from localStorage', () => {
      login('admin', 'admin123');
      expect(getSession()).not.toBeNull();

      logout();
      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });

    it('does not throw when called multiple times', () => {
      login('admin', 'admin123');
      logout();
      expect(() => logout()).not.toThrow();
      expect(getSession()).toBeNull();
    });

    it('only removes the session key, not other localStorage data', () => {
      login('admin', 'admin123');
      localStorage.setItem('other_key', 'other_value');

      logout();

      expect(getSession()).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });
  });

  describe('isAdmin', () => {
    it('returns false when no session exists', () => {
      expect(isAdmin()).toBe(false);
    });

    it('returns true when the current session user is an admin', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);
    });

    it('returns false when the current session user is a regular user', () => {
      createUser({
        username: 'regularuser',
        displayName: 'Regular User',
        password: 'pass',
        role: 'user',
      });
      login('regularuser', 'pass');
      expect(isAdmin()).toBe(false);
    });

    it('returns true for a localStorage user with admin role', () => {
      createUser({
        username: 'customadmin',
        displayName: 'Custom Admin',
        password: 'adminpass',
        role: 'admin',
      });
      login('customadmin', 'adminpass');
      expect(isAdmin()).toBe(true);
    });

    it('returns false after logout', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);

      logout();
      expect(isAdmin()).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('returns false when no session exists', () => {
      expect(isOwner('someuser')).toBe(false);
    });

    it('returns true when the current session username matches the author', () => {
      login('admin', 'admin123');
      expect(isOwner('admin')).toBe(true);
    });

    it('returns false when the current session username does not match the author', () => {
      login('admin', 'admin123');
      expect(isOwner('otheruser')).toBe(false);
    });

    it('returns true for a regular user checking their own username', () => {
      createUser({
        username: 'johndoe',
        displayName: 'John Doe',
        password: 'pass',
        role: 'user',
      });
      login('johndoe', 'pass');
      expect(isOwner('johndoe')).toBe(true);
    });

    it('returns false for a regular user checking a different username', () => {
      createUser({
        username: 'johndoe',
        displayName: 'John Doe',
        password: 'pass',
        role: 'user',
      });
      login('johndoe', 'pass');
      expect(isOwner('janedoe')).toBe(false);
    });

    it('returns false after logout', () => {
      login('admin', 'admin123');
      expect(isOwner('admin')).toBe(true);

      logout();
      expect(isOwner('admin')).toBe(false);
    });

    it('is case-sensitive for username comparison', () => {
      createUser({
        username: 'johndoe',
        displayName: 'John Doe',
        password: 'pass',
        role: 'user',
      });
      login('johndoe', 'pass');
      expect(isOwner('JohnDoe')).toBe(false);
    });
  });

  describe('session persistence', () => {
    it('session persists across multiple getSession calls', () => {
      login('admin', 'admin123');

      const session1 = getSession();
      const session2 = getSession();

      expect(session1).toEqual(session2);
      expect(session1.username).toBe('admin');
    });

    it('session contains all expected fields after admin login', () => {
      login('admin', 'admin123');
      const session = getSession();

      expect(session).toHaveProperty('username');
      expect(session).toHaveProperty('displayName');
      expect(session).toHaveProperty('role');
      expect(session).toHaveProperty('loginAt');
      expect(session.username).toBe('admin');
      expect(session.displayName).toBe('Site Owner');
      expect(session.role).toBe('admin');
    });

    it('session contains all expected fields after user login', () => {
      createUser({
        username: 'testuser',
        displayName: 'Test User',
        password: 'testpass',
        role: 'user',
      });
      login('testuser', 'testpass');
      const session = getSession();

      expect(session).toHaveProperty('username');
      expect(session).toHaveProperty('displayName');
      expect(session).toHaveProperty('role');
      expect(session).toHaveProperty('loginAt');
      expect(session.username).toBe('testuser');
      expect(session.displayName).toBe('Test User');
      expect(session.role).toBe('user');
    });

    it('failed login does not overwrite existing session', () => {
      login('admin', 'admin123');
      const sessionBefore = getSession();
      expect(sessionBefore.username).toBe('admin');

      const result = login('nonexistent', 'wrongpass');
      expect(result.success).toBe(false);

      const sessionAfter = getSession();
      expect(sessionAfter.username).toBe('admin');
    });
  });

  describe('graceful handling of corrupted session data', () => {
    it('returns null when session data is corrupted JSON', () => {
      localStorage.setItem('writespace_session', '{broken');
      expect(getSession()).toBeNull();
    });

    it('returns null when session data is an empty object', () => {
      localStorage.setItem('writespace_session', JSON.stringify({}));
      expect(getSession()).toBeNull();
    });

    it('isAdmin returns false when session data is corrupted', () => {
      localStorage.setItem('writespace_session', 'corrupted');
      expect(isAdmin()).toBe(false);
    });

    it('isOwner returns false when session data is corrupted', () => {
      localStorage.setItem('writespace_session', 'corrupted');
      expect(isOwner('admin')).toBe(false);
    });

    it('login still works after corrupted session data', () => {
      localStorage.setItem('writespace_session', 'corrupted');
      const result = login('admin', 'admin123');
      expect(result.success).toBe(true);

      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('admin');
    });
  });
});