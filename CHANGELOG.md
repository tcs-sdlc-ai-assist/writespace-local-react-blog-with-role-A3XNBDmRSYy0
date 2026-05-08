# Changelog

All notable changes to the WriteSpace Blog project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2024-06-01

### Added

- **Public Landing Page** — Hero section with gradient background, feature cards (Easy Writing, Share Instantly, Role-Based Access), latest posts preview, and footer with branding and navigation links.
- **User Authentication** — Login and registration pages with credential validation, inline error messages, and session persistence in localStorage.
  - Login form with username and password fields; redirects admin users to `/dashboard` and regular users to `/blogs`.
  - Registration form with display name, username, password, and confirm password fields; enforces password match and username uniqueness.
  - Auto-login after successful registration.
  - Hard-coded default admin account (`admin` / `admin123`).
- **Role-Based Access Control** — `ProtectedRoute` component guards authenticated and admin-only routes; unauthenticated users are redirected to `/login`, non-admin users are redirected to `/blogs` when accessing admin routes.
- **Blog Post CRUD** — Full create, read, update, and delete functionality for blog posts.
  - `WriteBlog` page with title, excerpt, and content fields; character counters and validation.
  - `ReadBlog` page with full post view, author avatar, formatted dates, and edit/delete controls.
  - `Home` page displaying all posts in a responsive grid sorted newest first.
  - `BlogCard` component with accent border cycling, truncated excerpts, author info, and edit icon based on ownership.
  - Ownership enforcement: regular users can only edit/delete their own posts; admins can manage all posts.
  - Delete confirmation via `window.confirm()`.
- **Admin Dashboard** — Gradient banner header, stat cards (Total Posts, Total Users, Admins, Users), quick action buttons (Write a Post, Manage Users), and recent posts list with edit/delete controls.
- **User Management** — Admin-only page for managing platform users.
  - User list rendered with `UserRow` components showing avatar, display name, username, role badge, creation date, and delete button.
  - Create user form with display name, username, password, and role select fields; validates required fields and username uniqueness.
  - Delete confirmation via `window.confirm()`; prevents deletion of the hard-coded admin account and the currently logged-in user.
  - Success and error messages with auto-dismiss.
- **localStorage Persistence** — All data (posts, users, sessions) stored in `localStorage` with safe read/write utilities and graceful fallback on corrupted data. No backend required.
- **Responsive Tailwind UI** — Mobile-first layout using Tailwind CSS 3 utility classes with responsive breakpoints (`sm:`, `md:`, `lg:`). Custom color palette (`primary`, `accent`) and font families (`sans`, `serif`, `mono`).
- **Client-Side Routing** — SPA navigation with React Router 6. Route map includes public routes (`/`, `/login`, `/register`), authenticated routes (`/blogs`, `/blogs/:postId`, `/post/:postId`, `/write`, `/edit/:postId`), and admin-only routes (`/dashboard`, `/admin`, `/admin/users`). Catch-all redirects to `/`.
- **Component Library** — Reusable components: `Avatar`, `BlogCard`, `Navbar`, `PublicNavbar`, `ProtectedRoute`, `StatCard`, `UserRow`.
- **Prop Validation** — Runtime prop validation using `prop-types` on all shared components.
- **Testing** — Unit and component tests using Vitest and Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`). Test suites for `auth.js`, `storage.js`, `LoginPage`, `LandingPage`, and `Home`.
- **Vercel Deployment** — `vercel.json` with SPA rewrite configuration; Vite build output to `dist/`.