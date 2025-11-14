# Deployment Guide for Tripzy

This guide explains how to deploy Tripzy to make it live on the web.

## 🚀 GitHub Pages Deployment (Recommended)

GitHub Pages provides free hosting for static websites directly from your GitHub repository.

### Prerequisites
1. Repository must be public (or have GitHub Pro for private repos)
2. GitHub Pages must be enabled in repository settings

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/mariatakahashie666-boop/tripzy
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under "Build and deployment":
   - Set **Source** to "GitHub Actions"
5. Click **Save**

### Step 2: Deploy

The deployment workflow is already configured and will:

**Automatic Deployment:**
- Automatically deploy when code is pushed to the `main` branch
- Build the application with the correct configuration
- Upload and deploy to GitHub Pages

**Manual Deployment:**
1. Go to the **Actions** tab in your repository
2. Select "Deploy to GitHub Pages" workflow from the left sidebar
3. Click **Run workflow** button
4. Select the branch (main)
5. Click **Run workflow**

### Step 3: Access Your Live Site

Once deployed, your site will be available at:
```
https://mariatakahashie666-boop.github.io/tripzy/
```

The deployment typically takes 1-3 minutes to complete.

### Checking Deployment Status

1. Go to the **Actions** tab in your repository
2. Click on the latest workflow run
3. Monitor the progress of the build and deploy jobs
4. Once completed, the deployment URL will be shown

## 📝 Configuration Details

The following files configure the deployment:

### `.github/workflows/deploy.yml`
- GitHub Actions workflow that builds and deploys the app
- Triggers on push to main or manual dispatch
- Uses Node.js 18 to build the application
- Uploads build artifacts to GitHub Pages

### `vite.config.ts`
- Configured with `base: '/tripzy/'` to ensure assets load correctly
- This matches the GitHub Pages subdirectory path

### `package.json`
- Build script: `npm run build` - Creates production build
- Preview script: `npm run preview` - Test production build locally

## 🔧 Alternative Deployment Options

If you prefer not to use GitHub Pages, here are other options:

### Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select this repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: leave empty
5. Click "Deploy site"

**Note:** Remove `base: '/tripzy/'` from `vite.config.ts` for Netlify deployment.

### Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import the repository from GitHub
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

**Note:** Remove `base: '/tripzy/'` from `vite.config.ts` for Vercel deployment.

### Static File Server (Manual)

1. Build the application:
   ```bash
   npm run build
   ```

2. The `dist` folder contains all necessary files

3. Upload the contents of `dist` to any static file hosting service:
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Static Web Apps
   - DigitalOcean Spaces
   - Any traditional web hosting with FTP

## 🐛 Troubleshooting

### Workflow Not Appearing in Actions Tab
- Ensure the workflow file is committed to the repository
- Check that the repository has Actions enabled in Settings → Actions

### Deployment Fails
- Check the Actions tab for error logs
- Verify that GitHub Pages is enabled in repository settings
- Ensure the Source is set to "GitHub Actions"

### Site Shows 404 Error
- Verify the base path in `vite.config.ts` matches your deployment URL
- For GitHub Pages: should be `/tripzy/`
- For root domains: should be `/`

### Assets Not Loading
- Check that the base path in `vite.config.ts` is correct
- Inspect the browser console for 404 errors
- Verify asset paths in the built `dist/index.html`

### GitHub Pages Shows Old Version
- GitHub Pages may cache for a few minutes
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Wait a few minutes and try again

## 📊 Monitoring

After deployment, monitor your site:
- Check GitHub Actions for successful deployments
- Test the live site in multiple browsers
- Verify all features work in production
- Monitor for any console errors

## 🔐 Security Notes

- GitHub Spark features require runtime authentication
- Ensure environment variables are properly configured
- Never commit secrets or API keys to the repository
- Use GitHub Secrets for sensitive configuration

## 📞 Support

If you encounter issues:
1. Check the Actions tab for workflow logs
2. Review the troubleshooting section above
3. Check Vite documentation for build issues
4. Verify GitHub Pages is properly configured
