# 🚂 Railway Quick Start (5 Minutes)

## The Fix for "Script start.sh not found" Error

Railway needs to know which folder to build. Follow these exact steps:

---

## Step 1: Add PostgreSQL (1 minute)

1. Go to https://railway.app
2. Login with GitHub
3. Click **"New Project"**
4. Click **"Add PostgreSQL"**
5. Copy the connection URL (click "Connect" tab)

---

## Step 2: Deploy Backend (2 minutes)

1. Click **"New"** → **"GitHub Repo"**
2. Select: `vulnerability-scanner-website/Final-year-project`
3. ⚠️ **BEFORE clicking Deploy:**
   - Click **"Configure"**
   - Set **"Root Directory"** = `backend` ← THIS IS THE FIX!
4. Add Variables:
   - `DATABASE_URL` = (paste from Step 1)
   - `JWT_SECRET` = `your-random-secret-123`
   - `PORT` = `5000`
5. Click **"Deploy"**
6. Wait 2 minutes
7. Generate Domain (Settings → Networking)
8. Copy backend URL

---

## Step 3: Deploy Frontend (2 minutes)

1. Click **"New"** → **"GitHub Repo"**
2. Select same repository again
3. ⚠️ **BEFORE clicking Deploy:**
   - Click **"Configure"**
   - Set **"Root Directory"** = `frontend` ← THIS IS THE FIX!
4. Add Variables:
   - `NEXT_PUBLIC_API_URL` = (paste backend URL from Step 2)
5. Click **"Deploy"**
6. Wait 3 minutes
7. Generate Domain
8. Copy frontend URL

---

## Step 4: Test (30 seconds)

1. Open frontend URL
2. Login:
   - Email: `admin@security.com`
   - Password: `admin123`

---

## ✅ Done!

Your app is now live on Railway!

**Important:** The "Root Directory" setting tells Railway which folder to build. Without it, Railway tries to build the root folder and fails.

---

## 📊 What You Get

- ✅ Frontend: `https://your-app.up.railway.app`
- ✅ Backend: `https://your-api.up.railway.app`
- ✅ Database: Managed by Railway
- ✅ Free tier: $5/month credit (enough for this project!)

---

## ⚠️ Limitations

**Works:**
- ✅ Dashboard
- ✅ User management
- ✅ Scan UI

**Doesn't Work (too large for free tier):**
- ❌ Actual scanning (ZAP scanner is 3.4GB)

**To enable scanning:**
- Upgrade to Railway Pro ($20/month)
- Or deploy to AWS/GCP

---

## 🆘 Still Having Issues?

**Build fails?**
- Check you set "Root Directory" correctly
- Backend: `backend`
- Frontend: `frontend`

**Can't login?**
- Check backend logs in Railway
- Verify DATABASE_URL is correct
- Wait 30 seconds after database creation

**CORS error?**
- Backend should auto-detect Railway domains
- If not, add `FRONTEND_URL` variable to backend

---

**Need help?** Check `RAILWAY-DEPLOY-GUIDE.md` for detailed instructions.
