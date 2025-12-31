# GitHub Deployment Guide for Exco Media Management System

## Step-by-Step GitHub Deployment

### Prerequisites
- GitHub account (free at github.com)
- Git installed on your computer

### Step 1: Create GitHub Repository

1. Go to **github.com** and sign in
2. Click **"New"** (top left, under your profile)
3. Enter repository name: **`exco-media`**
4. Add description: **"Premium Team Management System - Exco Multimedia & Publisiti"**
5. Choose **Public** (for live site) or **Private** (for private access)
6. Click **"Create repository"**

### Step 2: Prepare Your Files

1. Navigate to your project folder:
   ```
   cd c:\Users\MSAT_Production\Downloads\media
   ```

2. Initialize git (if not already done):
   ```
   git init
   ```

3. Add all files:
   ```
   git add .
   ```

4. Commit changes:
   ```
   git commit -m "Initial commit: Exco Media Management System v1.0"
   ```

### Step 3: Connect to GitHub

1. Add GitHub as remote (replace YOUR_USERNAME and YOUR_REPO):
   ```
   git remote add origin https://github.com/YOUR_USERNAME/exco-media.git
   ```

2. Rename branch to main (if needed):
   ```
   git branch -M main
   ```

3. Push to GitHub:
   ```
   git push -u origin main
   ```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. In left menu, click **Pages**
4. Under "Source", select **Deploy from a branch**
5. Branch: **main** | Folder: **/ (root)**
6. Click **Save**

### Step 5: Your App is Live!

Your app will be available at:
```
https://YOUR_USERNAME.github.io/exco-media
```

Wait 2-3 minutes for GitHub to deploy, then visit the URL!

---

## Configuration for GitHub Pages

The app is already configured for GitHub Pages:

✅ **Relative paths** - All links use relative paths
✅ **Service Worker** - Works with GitHub Pages
✅ **Manifest** - Configured for any domain
✅ **No build required** - Pure HTML/CSS/JS

### If You Use a Custom Domain

1. In Settings → Pages, enter your domain
2. Update DNS records (GitHub will provide instructions)
3. Your app will be available at your custom domain

---

## Private vs Public Repository

### Public Repository
- Anyone can view your code
- Easy to collaborate
- Great for demos
- GitHub Pages works automatically

### Private Repository
- Only you and invited members can see code
- Need GitHub Pro ($4/month) for Pages
- More secure
- Better for confidential projects

---

## Updating Your App

After deployment, to make changes:

1. Edit files locally
2. Commit changes:
   ```
   git add .
   git commit -m "Update: Description of changes"
   git push
   ```

3. Wait 1-2 minutes for GitHub Pages to update
4. Refresh your live URL

---

## Troubleshooting

### "404 Not Found"
- Wait 5 minutes for GitHub to deploy
- Check repository is public (if Pages enabled)
- Verify index.html is in root folder

### App doesn't work online
- Check browser console (F12) for errors
- Ensure all files were pushed to GitHub
- Try hard refresh (Ctrl+Shift+F5)

### Service Worker issues
- GitHub Pages supports Service Workers
- Clear browser cache if issues persist
- Check in F12 → Application → Service Workers

### Can't push to GitHub
- Check git is installed: `git --version`
- Verify you're in correct folder
- Check GitHub token/credentials

---

## GitHub Actions (Optional)

For automatic deployments, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

This automatically deploys on every push!

---

## Security Settings

After deployment, configure security:

1. Go to **Settings → Code security and analysis**
2. Enable **Dependabot alerts** (monitors dependencies)
3. Go to **Settings → Collaborators** to manage access
4. Go to **Settings → Branches** to add branch protection

---

## Environment Variables

For sensitive data (future backend integration):

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add secrets safely (won't be visible in code)

Never commit `.env` files or passwords!

---

## Monitoring

GitHub provides free monitoring:

1. **Insights** tab - Shows activity and traffic
2. **Security** tab - Alerts for vulnerabilities
3. **Settings → Code security** - Security analysis

---

## Backup Your Code

Always keep local backup:

```
# Create backup of your repository
git clone https://github.com/YOUR_USERNAME/exco-media.git my-backup
```

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push files to GitHub
3. ✅ Enable GitHub Pages
4. ✅ Share live URL with team
5. ✅ Monitor for issues
6. ✅ Update documentation with live URL

Your app is now live on GitHub! 🚀

---

## Quick Commands Reference

```bash
# Initialize git
git init

# Add all files
git add .

# Commit with message
git commit -m "Your message"

# Push to GitHub
git push -u origin main

# Check status
git status

# View logs
git log

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name

# Switch branch
git checkout main
```

---

## Support

If you encounter issues:

1. Check GitHub Help: https://docs.github.com
2. Visit GitHub Community: https://github.community
3. Search existing issues in your repo
4. Create new issue with error details

---

**Your Exco Media Management System is ready for production on GitHub!** 🎉

For security guidelines, see: SECURITY.md
For credentials, see: CREDENTIALS.txt
For general info, see: README.md
