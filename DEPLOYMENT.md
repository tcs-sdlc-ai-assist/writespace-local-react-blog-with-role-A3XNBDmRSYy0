# Deployment Guide

This document covers deploying the WriteSpace Blog application to [Vercel](https://vercel.com) as a static single-page application (SPA).

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Deploying to Vercel](#deploying-to-vercel)
  - [Option 1: Vercel Git Integration (Recommended)](#option-1-vercel-git-integration-recommended)
  - [Option 2: Vercel CLI](#option-2-vercel-cli)
- [Environment Variables](#environment-variables)
- [CI/CD via Vercel Git Integration](#cicd-via-vercel-git-integration)
- [Build Output](#build-output)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js 18+** and **npm 9+** installed locally for building and testing.
- A **Vercel account** at [vercel.com](https://vercel.com).
- The repository hosted on **GitHub**, **GitLab**, or **Bitbucket** (required for Git integration).

---

## Build Configuration

WriteSpace uses **Vite 5** as its build tool. The production build is configured in `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

| Setting          | Value          | Description                                  |
| ---------------- | -------------- | -------------------------------------------- |
| Build Command    | `npm run build`| Runs `vite build` to produce optimized output|
| Output Directory | `dist`         | Vite writes production files to `dist/`      |
| Install Command  | `npm install`  | Installs all dependencies before building    |

To build locally and verify the output:

```bash
npm install
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## SPA Rewrite Configuration

WriteSpace is a client-side single-page application using React Router for navigation. All routes (e.g., `/blogs`, `/login`, `/dashboard`) must resolve to `index.html` so React Router can handle them in the browser.

The included `vercel.json` at the project root configures this rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that:

- Direct navigation to any route (e.g., `https://your-app.vercel.app/blogs/post-123`) serves `index.html`.
- Page refreshes on any route work correctly instead of returning a 404.
- Static assets in `dist/assets/` are still served normally because Vercel processes static files before applying rewrites.

> **Important:** Do not remove or modify `vercel.json` unless you understand the impact on client-side routing. Without this rewrite rule, refreshing any page other than `/` will result in a 404 error.

---

## Deploying to Vercel

### Option 1: Vercel Git Integration (Recommended)

This is the recommended approach. Vercel automatically builds and deploys on every push.

1. **Push your repository** to GitHub, GitLab, or Bitbucket.

2. **Import the project in Vercel:**
   - Log in to [vercel.com](https://vercel.com).
   - Click **"Add New…"** → **"Project"**.
   - Select your Git provider and authorize access if prompted.
   - Choose the **writespace-blog** repository.

3. **Configure build settings:**
   Vercel auto-detects the Vite framework. The default settings work out of the box:

   | Setting            | Value            |
   | ------------------ | ---------------- |
   | Framework Preset   | Vite             |
   | Build Command      | `npm run build`  |
   | Output Directory   | `dist`           |
   | Install Command    | `npm install`    |

   No changes are needed — the defaults are correct.

4. **Click "Deploy".**
   Vercel will install dependencies, run the build, and deploy the `dist/` output. Your app will be live at a `.vercel.app` URL within minutes.

### Option 2: Vercel CLI

For manual or one-off deployments without Git integration:

1. **Install the Vercel CLI globally:**

   ```bash
   npm install -g vercel
   ```

2. **Log in to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy from the project root:**

   ```bash
   vercel
   ```

   Follow the prompts to link the project. Vercel will detect the Vite framework and apply the correct build settings.

4. **Deploy to production:**

   ```bash
   vercel --prod
   ```

---

## Environment Variables

WriteSpace does **not** require any environment variables. All data is stored in the browser's `localStorage` — there is no backend, no database, and no API keys.

- No `.env` file is needed.
- No environment variables need to be configured in the Vercel dashboard.
- The app works identically in development and production.

If you extend the application in the future to include a backend API, add environment variables in the Vercel dashboard under **Settings → Environment Variables** and access them in code via `import.meta.env.VITE_*` (Vite requires the `VITE_` prefix for client-side variables).

---

## CI/CD via Vercel Git Integration

When the Vercel Git integration is connected, the following CI/CD workflow is automatic:

### Production Deployments

- Every push to the **main** (or **master**) branch triggers a **production deployment**.
- The production URL is your primary `.vercel.app` domain or any custom domain you configure.

### Preview Deployments

- Every push to a **non-production branch** (e.g., feature branches) triggers a **preview deployment**.
- Each preview deployment gets a unique URL for testing and review.
- Pull requests / merge requests automatically receive a comment with the preview URL.

### Build Steps (Automatic)

On each deployment, Vercel runs the following steps:

1. `npm install` — Installs all dependencies from `package.json`.
2. `npm run build` — Executes `vite build`, producing optimized output in `dist/`.
3. Deploys the contents of `dist/` to Vercel's global edge network.

### Running Tests Before Deployment

Vercel does not run tests by default. To enforce tests before deployment, you have two options:

**Option A: Override the build command in Vercel settings:**

```
npm run test && npm run build
```

Set this in the Vercel dashboard under **Settings → General → Build & Development Settings → Build Command**.

**Option B: Use a GitHub Actions workflow** (or equivalent CI) to run tests on pull requests, and only merge to main when tests pass. Vercel then deploys the merged code.

---

## Build Output

After running `npm run build`, the `dist/` directory contains:

```
dist/
├── index.html          # Entry HTML file
├── vite.svg            # Favicon (copied from public/)
└── assets/
    ├── index-[hash].js   # Bundled JavaScript (React app)
    └── index-[hash].css  # Bundled CSS (Tailwind utilities)
```

- JavaScript and CSS files are content-hashed for cache busting.
- Source maps are generated (`sourcemap: true` in `vite.config.js`) for debugging production issues.
- The `dist/` directory is listed in `.gitignore` and should not be committed to version control.

---

## Troubleshooting

### 404 on page refresh

**Cause:** The SPA rewrite rule in `vercel.json` is missing or misconfigured.

**Fix:** Ensure `vercel.json` exists at the project root with the following content:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Build fails with "Cannot find module"

**Cause:** Dependencies are not installed or `package.json` is out of sync.

**Fix:** Run `npm install` locally and verify the build succeeds with `npm run build` before pushing.

### Blank page after deployment

**Cause:** The `dist/` output directory is not configured correctly in Vercel.

**Fix:** Verify that the Output Directory in Vercel project settings is set to `dist`.

### Styles missing in production

**Cause:** Tailwind CSS purging removed classes that are dynamically constructed.

**Fix:** Ensure all Tailwind classes are written as complete strings in the source code (not concatenated dynamically). The `content` array in `tailwind.config.js` must include all source files:

```js
content: [
  './index.html',
  './src/**/*.{js,jsx}',
],
```

### Tests fail in CI

**Cause:** Test environment differences or missing setup.

**Fix:** Run `npm run test` locally to reproduce. Ensure `vitest.config.js` and `vitest.setup.js` are present and correctly configured. The test environment uses `jsdom` and `@testing-library/jest-dom`.

---

## Custom Domain (Optional)

To use a custom domain with your Vercel deployment:

1. Go to your project in the Vercel dashboard.
2. Navigate to **Settings → Domains**.
3. Add your custom domain and follow the DNS configuration instructions.
4. Vercel automatically provisions an SSL certificate for your domain.

---

## Summary

| Item                  | Value / Notes                                      |
| --------------------- | -------------------------------------------------- |
| Hosting Platform      | Vercel                                             |
| Framework             | Vite 5 + React 18                                  |
| Build Command         | `npm run build`                                    |
| Output Directory      | `dist`                                             |
| SPA Rewrites          | Configured in `vercel.json`                        |
| Environment Variables | None required                                      |
| CI/CD                 | Automatic via Vercel Git integration               |
| Production Trigger    | Push to `main` branch                              |
| Preview Trigger       | Push to any non-production branch                  |
| Test Command          | `npm run test` (manual or via build command override)|