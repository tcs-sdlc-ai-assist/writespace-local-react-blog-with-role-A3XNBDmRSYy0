import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getUsers,
  createUser,
  deleteUser,
} from './storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getPosts', () => {
    it('returns an empty array when no posts exist', () => {
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_posts', 'not-valid-json');
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('writespace_posts', JSON.stringify({ foo: 'bar' }));
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns an empty array when localStorage contains a string value', () => {
      localStorage.setItem('writespace_posts', JSON.stringify('hello'));
      const posts = getPosts();
      expect(posts).toEqual([]);
    });

    it('returns stored posts when valid data exists', () => {
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          excerpt: 'An excerpt',
          content: 'Some content',
          author: 'testuser',
          authorDisplayName: 'Test User',
          authorRole: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(mockPosts));
      const posts = getPosts();
      expect(posts).toEqual(mockPosts);
      expect(posts).toHaveLength(1);
    });
  });

  describe('createPost', () => {
    it('creates a post and stores it in localStorage', () => {
      const postData = {
        title: 'My First Post',
        excerpt: 'A short excerpt',
        content: 'Full content here',
        author: 'testuser',
        authorDisplayName: 'Test User',
        authorRole: 'user',
      };

      const result = createPost(postData);
      expect(result).toBe(true);

      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('My First Post');
      expect(posts[0].excerpt).toBe('A short excerpt');
      expect(posts[0].content).toBe('Full content here');
      expect(posts[0].author).toBe('testuser');
      expect(posts[0].authorDisplayName).toBe('Test User');
      expect(posts[0].authorRole).toBe('user');
    });

    it('generates a UUID for the new post', () => {
      createPost({
        title: 'UUID Test',
        content: 'Content',
        author: 'testuser',
      });

      const posts = getPosts();
      expect(posts[0].id).toBeDefined();
      expect(typeof posts[0].id).toBe('string');
      expect(posts[0].id.length).toBeGreaterThan(0);
    });

    it('sets createdAt and updatedAt timestamps', () => {
      createPost({
        title: 'Timestamp Test',
        content: 'Content',
        author: 'testuser',
      });

      const posts = getPosts();
      expect(posts[0].createdAt).toBeDefined();
      expect(posts[0].updatedAt).toBeDefined();
      expect(posts[0].createdAt).toBe(posts[0].updatedAt);

      const createdDate = new Date(posts[0].createdAt);
      expect(createdDate.getTime()).not.toBeNaN();
    });

    it('defaults missing fields to empty strings', () => {
      createPost({});

      const posts = getPosts();
      expect(posts[0].title).toBe('');
      expect(posts[0].excerpt).toBe('');
      expect(posts[0].content).toBe('');
      expect(posts[0].author).toBe('');
      expect(posts[0].authorDisplayName).toBe('');
      expect(posts[0].authorRole).toBe('user');
    });

    it('appends to existing posts', () => {
      createPost({ title: 'Post 1', content: 'Content 1', author: 'user1' });
      createPost({ title: 'Post 2', content: 'Content 2', author: 'user2' });

      const posts = getPosts();
      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Post 1');
      expect(posts[1].title).toBe('Post 2');
    });

    it('generates unique IDs for each post', () => {
      createPost({ title: 'Post A', content: 'A', author: 'user1' });
      createPost({ title: 'Post B', content: 'B', author: 'user1' });

      const posts = getPosts();
      expect(posts[0].id).not.toBe(posts[1].id);
    });
  });

  describe('updatePost', () => {
    it('updates an existing post by ID', () => {
      createPost({ title: 'Original', content: 'Original content', author: 'testuser' });
      const posts = getPosts();
      const postId = posts[0].id;

      const result = updatePost(postId, { title: 'Updated Title', content: 'Updated content' });
      expect(result).toBe(true);

      const updatedPosts = getPosts();
      expect(updatedPosts[0].title).toBe('Updated Title');
      expect(updatedPosts[0].content).toBe('Updated content');
    });

    it('returns false when post ID does not exist', () => {
      const result = updatePost('nonexistent-id', { title: 'Updated' });
      expect(result).toBe(false);
    });

    it('preserves the original ID and createdAt', () => {
      createPost({ title: 'Original', content: 'Content', author: 'testuser' });
      const posts = getPosts();
      const originalId = posts[0].id;
      const originalCreatedAt = posts[0].createdAt;

      updatePost(originalId, { title: 'Updated' });

      const updatedPosts = getPosts();
      expect(updatedPosts[0].id).toBe(originalId);
      expect(updatedPosts[0].createdAt).toBe(originalCreatedAt);
    });

    it('updates the updatedAt timestamp', () => {
      createPost({ title: 'Original', content: 'Content', author: 'testuser' });
      const posts = getPosts();
      const postId = posts[0].id;
      const originalUpdatedAt = posts[0].updatedAt;

      // Small delay to ensure different timestamp
      updatePost(postId, { title: 'Updated' });

      const updatedPosts = getPosts();
      expect(updatedPosts[0].updatedAt).toBeDefined();
      // updatedAt should be a valid ISO string
      const updatedDate = new Date(updatedPosts[0].updatedAt);
      expect(updatedDate.getTime()).not.toBeNaN();
    });

    it('does not allow overriding the id field via updates', () => {
      createPost({ title: 'Original', content: 'Content', author: 'testuser' });
      const posts = getPosts();
      const originalId = posts[0].id;

      updatePost(originalId, { id: 'hacked-id', title: 'Updated' });

      const updatedPosts = getPosts();
      expect(updatedPosts[0].id).toBe(originalId);
    });

    it('does not allow overriding the createdAt field via updates', () => {
      createPost({ title: 'Original', content: 'Content', author: 'testuser' });
      const posts = getPosts();
      const postId = posts[0].id;
      const originalCreatedAt = posts[0].createdAt;

      updatePost(postId, { createdAt: '1999-01-01T00:00:00.000Z' });

      const updatedPosts = getPosts();
      expect(updatedPosts[0].createdAt).toBe(originalCreatedAt);
    });

    it('only updates the targeted post', () => {
      createPost({ title: 'Post 1', content: 'Content 1', author: 'user1' });
      createPost({ title: 'Post 2', content: 'Content 2', author: 'user2' });

      const posts = getPosts();
      const secondPostId = posts[1].id;

      updatePost(secondPostId, { title: 'Updated Post 2' });

      const updatedPosts = getPosts();
      expect(updatedPosts[0].title).toBe('Post 1');
      expect(updatedPosts[1].title).toBe('Updated Post 2');
    });
  });

  describe('deletePost', () => {
    it('deletes an existing post by ID', () => {
      createPost({ title: 'To Delete', content: 'Content', author: 'testuser' });
      const posts = getPosts();
      const postId = posts[0].id;

      const result = deletePost(postId);
      expect(result).toBe(true);

      const remainingPosts = getPosts();
      expect(remainingPosts).toHaveLength(0);
    });

    it('returns false when post ID does not exist', () => {
      const result = deletePost('nonexistent-id');
      expect(result).toBe(false);
    });

    it('only deletes the targeted post', () => {
      createPost({ title: 'Post 1', content: 'Content 1', author: 'user1' });
      createPost({ title: 'Post 2', content: 'Content 2', author: 'user2' });
      createPost({ title: 'Post 3', content: 'Content 3', author: 'user3' });

      const posts = getPosts();
      const secondPostId = posts[1].id;

      deletePost(secondPostId);

      const remainingPosts = getPosts();
      expect(remainingPosts).toHaveLength(2);
      expect(remainingPosts[0].title).toBe('Post 1');
      expect(remainingPosts[1].title).toBe('Post 3');
    });

    it('returns false when no posts exist', () => {
      const result = deletePost('any-id');
      expect(result).toBe(false);
    });
  });

  describe('getUsers', () => {
    it('returns an empty array when no users exist', () => {
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_users', '{broken json');
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('writespace_users', JSON.stringify(42));
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array when localStorage contains null', () => {
      localStorage.setItem('writespace_users', JSON.stringify(null));
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns stored users when valid data exists', () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'johndoe',
          displayName: 'John Doe',
          password: 'pass123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(mockUsers));
      const users = getUsers();
      expect(users).toEqual(mockUsers);
      expect(users).toHaveLength(1);
    });
  });

  describe('createUser', () => {
    it('creates a user and stores it in localStorage', () => {
      const userData = {
        username: 'newuser',
        displayName: 'New User',
        password: 'password123',
        role: 'user',
      };

      const result = createUser(userData);
      expect(result).toBe(true);

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('newuser');
      expect(users[0].displayName).toBe('New User');
      expect(users[0].password).toBe('password123');
      expect(users[0].role).toBe('user');
    });

    it('generates a UUID for the new user', () => {
      createUser({
        username: 'uuiduser',
        displayName: 'UUID User',
        password: 'pass',
        role: 'user',
      });

      const users = getUsers();
      expect(users[0].id).toBeDefined();
      expect(typeof users[0].id).toBe('string');
      expect(users[0].id.length).toBeGreaterThan(0);
    });

    it('sets createdAt timestamp', () => {
      createUser({
        username: 'timestampuser',
        displayName: 'Timestamp User',
        password: 'pass',
        role: 'user',
      });

      const users = getUsers();
      expect(users[0].createdAt).toBeDefined();
      const createdDate = new Date(users[0].createdAt);
      expect(createdDate.getTime()).not.toBeNaN();
    });

    it('prevents duplicate usernames', () => {
      createUser({
        username: 'duplicate',
        displayName: 'First',
        password: 'pass1',
        role: 'user',
      });

      const result = createUser({
        username: 'duplicate',
        displayName: 'Second',
        password: 'pass2',
        role: 'user',
      });

      expect(result).toBe(false);

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].displayName).toBe('First');
    });

    it('prevents creating a user with username "admin"', () => {
      const result = createUser({
        username: 'admin',
        displayName: 'Fake Admin',
        password: 'pass',
        role: 'admin',
      });

      expect(result).toBe(false);

      const users = getUsers();
      expect(users).toHaveLength(0);
    });

    it('defaults missing fields to empty strings or "user" role', () => {
      createUser({ username: 'minimal' });

      const users = getUsers();
      expect(users[0].displayName).toBe('');
      expect(users[0].password).toBe('');
      expect(users[0].role).toBe('user');
    });

    it('appends to existing users', () => {
      createUser({ username: 'user1', displayName: 'User 1', password: 'p1', role: 'user' });
      createUser({ username: 'user2', displayName: 'User 2', password: 'p2', role: 'user' });

      const users = getUsers();
      expect(users).toHaveLength(2);
      expect(users[0].username).toBe('user1');
      expect(users[1].username).toBe('user2');
    });

    it('generates unique IDs for each user', () => {
      createUser({ username: 'user1', displayName: 'User 1', password: 'p1', role: 'user' });
      createUser({ username: 'user2', displayName: 'User 2', password: 'p2', role: 'user' });

      const users = getUsers();
      expect(users[0].id).not.toBe(users[1].id);
    });

    it('can create a user with admin role', () => {
      const result = createUser({
        username: 'newadmin',
        displayName: 'New Admin',
        password: 'adminpass',
        role: 'admin',
      });

      expect(result).toBe(true);

      const users = getUsers();
      expect(users[0].role).toBe('admin');
    });
  });

  describe('deleteUser', () => {
    it('deletes an existing user by ID', () => {
      createUser({ username: 'todelete', displayName: 'To Delete', password: 'pass', role: 'user' });
      const users = getUsers();
      const userId = users[0].id;

      const result = deleteUser(userId);
      expect(result).toBe(true);

      const remainingUsers = getUsers();
      expect(remainingUsers).toHaveLength(0);
    });

    it('returns false when user ID does not exist', () => {
      const result = deleteUser('nonexistent-id');
      expect(result).toBe(false);
    });

    it('only deletes the targeted user', () => {
      createUser({ username: 'user1', displayName: 'User 1', password: 'p1', role: 'user' });
      createUser({ username: 'user2', displayName: 'User 2', password: 'p2', role: 'user' });
      createUser({ username: 'user3', displayName: 'User 3', password: 'p3', role: 'user' });

      const users = getUsers();
      const secondUserId = users[1].id;

      deleteUser(secondUserId);

      const remainingUsers = getUsers();
      expect(remainingUsers).toHaveLength(2);
      expect(remainingUsers[0].username).toBe('user1');
      expect(remainingUsers[1].username).toBe('user3');
    });

    it('returns false when no users exist', () => {
      const result = deleteUser('any-id');
      expect(result).toBe(false);
    });
  });

  describe('graceful fallback on corrupted data', () => {
    it('getPosts handles corrupted localStorage gracefully', () => {
      localStorage.setItem('writespace_posts', '[[[]invalid');
      expect(getPosts()).toEqual([]);
    });

    it('getUsers handles corrupted localStorage gracefully', () => {
      localStorage.setItem('writespace_users', 'undefined');
      expect(getUsers()).toEqual([]);
    });

    it('createPost works even when existing data is corrupted', () => {
      localStorage.setItem('writespace_posts', 'corrupted');
      const result = createPost({ title: 'Recovery Post', content: 'Content', author: 'user' });
      expect(result).toBe(true);

      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Recovery Post');
    });

    it('createUser works even when existing data is corrupted', () => {
      localStorage.setItem('writespace_users', 'corrupted');
      const result = createUser({ username: 'recoveryuser', displayName: 'Recovery', password: 'pass', role: 'user' });
      expect(result).toBe(true);

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('recoveryuser');
    });

    it('deletePost returns false when data is corrupted', () => {
      localStorage.setItem('writespace_posts', 'corrupted');
      const result = deletePost('some-id');
      expect(result).toBe(false);
    });

    it('deleteUser returns false when data is corrupted', () => {
      localStorage.setItem('writespace_users', 'corrupted');
      const result = deleteUser('some-id');
      expect(result).toBe(false);
    });

    it('updatePost returns false when data is corrupted', () => {
      localStorage.setItem('writespace_posts', 'corrupted');
      const result = updatePost('some-id', { title: 'Updated' });
      expect(result).toBe(false);
    });
  });
});