const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';

/**
 * Safely reads and parses a JSON array from localStorage.
 * @param {string} key - The localStorage key to read.
 * @returns {Array} The parsed array, or an empty array on failure.
 */
function safeRead(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Safely writes a JSON array to localStorage.
 * @param {string} key - The localStorage key to write.
 * @param {Array} data - The array to persist.
 * @returns {boolean} True if write succeeded, false otherwise.
 */
function safeWrite(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves all posts from localStorage.
 * @returns {Array<Object>} Array of post objects.
 */
export function getPosts() {
  return safeRead(POSTS_KEY);
}

/**
 * Creates a new post and persists it to localStorage.
 * @param {Object} post - The post object. Expected fields: title, excerpt, content, author, authorDisplayName, authorRole.
 * @returns {boolean} True if the post was created successfully.
 */
export function createPost(post) {
  const posts = safeRead(POSTS_KEY);
  const now = new Date().toISOString();
  const newPost = {
    id: crypto.randomUUID(),
    title: post.title || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    author: post.author || '',
    authorDisplayName: post.authorDisplayName || '',
    authorRole: post.authorRole || 'user',
    createdAt: now,
    updatedAt: now,
  };
  posts.push(newPost);
  return safeWrite(POSTS_KEY, posts);
}

/**
 * Updates an existing post by ID.
 * @param {string} postId - The ID of the post to update.
 * @param {Object} updates - An object containing the fields to update.
 * @returns {boolean} True if the post was found and updated successfully.
 */
export function updatePost(postId, updates) {
  const posts = safeRead(POSTS_KEY);
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) {
    return false;
  }
  const now = new Date().toISOString();
  posts[index] = {
    ...posts[index],
    ...updates,
    id: posts[index].id,
    createdAt: posts[index].createdAt,
    updatedAt: now,
  };
  return safeWrite(POSTS_KEY, posts);
}

/**
 * Deletes a post by ID.
 * @param {string} postId - The ID of the post to delete.
 * @returns {boolean} True if the post was found and deleted successfully.
 */
export function deletePost(postId) {
  const posts = safeRead(POSTS_KEY);
  const filtered = posts.filter((p) => p.id !== postId);
  if (filtered.length === posts.length) {
    return false;
  }
  return safeWrite(POSTS_KEY, filtered);
}

/**
 * Retrieves all users from localStorage.
 * @returns {Array<Object>} Array of user objects.
 */
export function getUsers() {
  return safeRead(USERS_KEY);
}

/**
 * Creates a new user and persists it to localStorage.
 * @param {Object} user - The user object. Expected fields: username, displayName, password, role.
 * @returns {boolean} True if the user was created successfully.
 */
export function createUser(user) {
  const users = safeRead(USERS_KEY);
  const duplicate = users.some((u) => u.username === user.username);
  if (duplicate || user.username === 'admin') {
    return false;
  }
  const now = new Date().toISOString();
  const newUser = {
    id: crypto.randomUUID(),
    username: user.username || '',
    displayName: user.displayName || '',
    password: user.password || '',
    role: user.role || 'user',
    createdAt: now,
  };
  users.push(newUser);
  return safeWrite(USERS_KEY, users);
}

/**
 * Deletes a user by ID.
 * @param {string} userId - The ID of the user to delete.
 * @returns {boolean} True if the user was found and deleted successfully.
 */
export function deleteUser(userId) {
  const users = safeRead(USERS_KEY);
  const filtered = users.filter((u) => u.id !== userId);
  if (filtered.length === users.length) {
    return false;
  }
  return safeWrite(USERS_KEY, filtered);
}