# 🚂 Railway Deployment - Step by Step

## ⚠️ Important: Deploy Services Separately

Railway cannot auto-detect monorepo structure. You need to deploy each service individually.

## 📋 Deployment Steps

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway

---

### Step 2: Deploy PostgreSQL Database

1. In Railway dashboard, click **"New Project"**
2. Click **"Add PostgreSQL"**
3. Railway will provision the database
4. Click on the PostgreSQL service
5. Go to **"Connect"** tab
6. Copy the **"Postgres Connection URL"** (you'll need this later)
   - Format: `postgresql://postgres:password@host:port/railway`

---

### Step 3: Deploy Backend Service

1. Click **"New"** → **"GitHub Repo"**
2. Select your repository: `vulnerability-scanner-website/Final-year-project`
3. **IMPORTANT:** Click **"Configure"** before deploying
4. Set **"Root Directory"** to: `backend`
5. Click **"Add Variables"** and add:
   ```
   DATABASE_URL = (paste the PostgreSQL URL from Step 2)
   JWT_SECRET = your-random-secret-key-here
   PORT = 5000
   NODE_ENV = production
   ```
6. Click **"Deploy"**
7. Wait for deployment to complete (2-3 minutes)
8. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
9. Copy your backend URL (e.g., `https://backend-production-xxxx.up.railway.app`)

---

### Step 4: Deploy Frontend Service

1. In the same project, click **"New"** → **"GitHub Repo"**
2. Select the same repository again
3. **IMPORTANT:** Click **"Configure"** before deploying
4. Set **"Root Directory"** to: `frontend`
5. Click **"Add Variables"** and add:
   ```
   NEXT_PUBLIC_API_URL = (paste your backend URL from Step 3)
   NODE_ENV = production
   ```
6. Click **"Deploy"**
7. Wait for deployment (3-5 minutes)
8. Go to **"Settings"** → **"Networking"** → **"Generate Domain"**
9. Copy your frontend URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

---

### Step 5: Update Backend CORS (Important!)

The backend needs to allow requests from your frontend domain.

1. Go to your backend service in Railway
2. Click **"Variables"**
3. Add a new variable:
   ```
   FRONTEND_URL = (paste your frontend URL from Step 4)
   ```
4. The backend will automatically redeploy

---

### Step 6: Test Your Deployment

1. Open your frontend URL in a browser
2. You should see the login page
3. Try logging in with:
   - **Email:** `admin@security.com`
   - **Password:** `admin123`

If login fails, check the backend logs in Railway dashboard.

---

## 🎯 Your Deployment Summary

After completing all steps, you'll have:

| Service | URL | Status |
|---------|-----|--------|
| Frontend | `https://your-frontend.up.railway.app` | ✅ |
| Backend | `https://your-backend.up.railway.app` | ✅ |
| Database | Internal Railway URL | ✅ |

---

## 🔧 Troubleshooting

### Backend Build Fails

**Error:** "Script start.sh not found"
**Solution:** Make sure you set **Root Directory** to `backend`

**Error:** "Cannot find module"
**Solution:** Check that `package.json` has all dependencies

### Frontend Build Fails

**Error:** "NEXT_PUBLIC_API_URL is not defined"
**Solution:** Add the environment variable in Railway dashboard

**Error:** "Build timeout"
**Solution:** Frontend build takes 3-5 minutes, be patient

### Database Connection Issues

**Error:** "Connection refused"
**Solution:** 
1. Check DATABASE_URL format
2. Ensure PostgreSQL service is running
3. Wait 30 seconds after database creation

### CORS Errors

**Error:** "Access-Control-Allow-Origin"
**Solution:** Add FRONTEND_URL variable to backend

---

## 💰 Cost Tracking

**Railway Free Tier:**
- $5 credit per month
- Estimated usage:
  - PostgreSQL: ~$1/month
  - Backend: ~$2/month
  - Frontend: ~$2/month
  - **Total: ~$5/month** ✅ Within free tier!

Monitor usage in Railway dashboard: **Settings** → **Usage**

---

## 📊 Monitoring & Logs

### View Logs:
1. Click on any service
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. View real-time logs

### Check Health:
- Backend: Visit `https://your-backend.up.railway.app/health`
- Should return: `{"status":"ok","message":"Backend is running"}`

---

## 🚀 Automatic Deployments

Railway automatically deploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to `alpha` branch
3. Railway detects changes and redeploys automatically

To disable auto-deploy:
- Go to service → **Settings** → **Service** → Toggle off "Auto Deploy"

---

## ⚠️ Limitations on Railway Free Tier

### What Works:
- ✅ Frontend Dashboard
- ✅ Backend API
- ✅ PostgreSQL Database
- ✅ User Authentication
- ✅ Scan Management UI

### What Doesn't Work:
- ❌ ZAP Scanner (too large - 3.4GB)
- ❌ DVWA Test Target
- ❌ Actual security scanning (needs external scanner)

### To Enable Full Scanning:
1. **Option A:** Upgrade to Railway Pro ($20/month)
2. **Option B:** Deploy to AWS/GCP VM
3. **Option C:** Run scanners locally, connect via API

---

## 🔐 Security Best Practices

1. **Change Default Password:**
   - Login to your app
   - Go to Settings
   - Change admin password

2. **Update JWT Secret:**
   - Generate strong random string
   - Update in Railway variables
   - Redeploy backend

3. **Enable HTTPS:**
   - Railway provides HTTPS automatically
   - Always use `https://` URLs

4. **Database Backups:**
   - Railway Pro includes automatic backups
   - Free tier: Export data manually

---

## 📞 Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **GitHub Issues:** Your repository

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Backend deployed with correct root directory
- [ ] Backend environment variables set
- [ ] Backend domain generated
- [ ] Frontend deployed with correct root directory
- [ ] Frontend environment variables set
- [ ] Frontend domain generated
- [ ] CORS configured
- [ ] Login tested successfully
- [ ] Default password changed

---

**Estimated Total Time:** 10-15 minutes
**Difficulty:** Medium ⭐⭐⭐☆☆

Good luck with your deployment! 🚀
