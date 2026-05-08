# WriteSpace Blog

A modern blogging platform built with React and Vite. WriteSpace lets users create, publish, and share blog posts with role-based access control for admins and regular users.

## Tech Stack

- **React 18** — UI library
- **Vite 5** — Build tool and dev server
- **React Router 6** — Client-side routing
- **Tailwind CSS 3** — Utility-first CSS framework
- **PropTypes** — Runtime prop validation
- **Vitest** — Unit testing framework
- **Testing Library** — React component testing utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
```

Production output is written to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
npm run test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Default Admin Account

| Username | Password   |
| -------- | ---------- |
| `admin`  | `admin123` |

## Folder Structure

```
writespace-blog/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── vitest.config.js
├── vitest.setup.js
├── vercel.json
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx              # App entry point
    ├── App.jsx               # Router and route definitions
    ├── index.css             # Tailwind directives
    ├── setupTests.js         # Test setup
    ├── components/
    │   ├── Avatar.jsx        # Role-based avatar component
    │   ├── BlogCard.jsx      # Blog post preview card
    │   ├── Navbar.jsx        # Authenticated user navbar
    │   ├── ProtectedRoute.jsx# Auth and role guard wrapper
    │   ├── PublicNavbar.jsx  # Public/guest navbar
    │   ├── StatCard.jsx      # Dashboard statistic tile
    │   └── UserRow.jsx       # User management list row
    ├── pages/
    │   ├── AdminDashboard.jsx# Admin dashboard with stats and recent posts
    │   ├── Home.jsx          # Authenticated blog list page
    │   ├── LandingPage.jsx   # Public landing page
    │   ├── LoginPage.jsx     # Login form page
    │   ├── ReadBlog.jsx      # Single blog post reading view
    │   ├── RegisterPage.jsx  # User registration form page
    │   ├── UserManagement.jsx# Admin user CRUD page
    │   └── WriteBlog.jsx     # Blog post create/edit form page
    └── utils/
        ├── auth.js           # Session management (login, logout, getSession)
        └── storage.js        # localStorage CRUD for posts and users
```

## Route Map

| Path              | Component        | Access       | Description                        |
| ----------------- | ---------------- | ------------ | ---------------------------------- |
| `/`               | LandingPage      | Public       | Landing page with hero and features|
| `/login`          | LoginPage        | Public       | User login form                    |
| `/register`       | RegisterPage     | Public       | User registration form             |
| `/blogs`          | Home             | Authenticated| Blog post list                     |
| `/blogs/:postId`  | ReadBlog         | Authenticated| Single post reading view           |
| `/post/:postId`   | ReadBlog         | Authenticated| Single post reading view (alias)   |
| `/write`          | WriteBlog        | Authenticated| Create a new blog post             |
| `/edit/:postId`   | WriteBlog        | Authenticated| Edit an existing blog post         |
| `/dashboard`      | AdminDashboard   | Admin only   | Admin dashboard with stats         |
| `/admin`          | AdminDashboard   | Admin only   | Admin dashboard (alias)            |
| `/admin/users`    | UserManagement   | Admin only   | User management CRUD               |

## Features

- **User Authentication** — Login and registration with session persistence in localStorage
- **Role-Based Access Control** — Admin and user roles with protected routes
- **Blog Post CRUD** — Create, read, update, and delete blog posts
- **User Management** — Admins can create and delete user accounts
- **Admin Dashboard** — Overview stats, quick actions, and recent posts
- **Landing Page** — Public-facing page with hero section, feature cards, and latest posts preview
- **Responsive Design** — Mobile-first layout with Tailwind CSS responsive utilities
- **Client-Side Routing** — SPA navigation with React Router
- **Data Persistence** — All data stored in localStorage (no backend required)
- **Form Validation** — Inline error messages, character counters, and field validation
- **Ownership Enforcement** — Users can only edit/delete their own posts; admins can manage all

## Deployment on Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the project in [Vercel](https://vercel.com).
3. Vercel auto-detects the Vite framework. The default settings work out of the box:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. The included `vercel.json` configures SPA rewrites so all routes resolve to `index.html`.
5. Click **Deploy**.

## License

Private — All rights reserved.