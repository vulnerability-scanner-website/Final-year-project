# 🚂 Railway.app Quick Setup Checklist

## ✅ Pre-Deployment Checklist

- [x] Code pushed to GitHub
- [x] Railway configuration files created
- [ ] Railway account created
- [ ] GitHub connected to Railway

## 📋 Deployment Steps (5 minutes)

### 1. Create Railway Account
- Go to: https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `vulnerability-scanner-website/Final-year-project`
- Branch: `alpha`

### 3. Add PostgreSQL Database
- In your project, click "New"
- Select "Database" → "Add PostgreSQL"
- Railway will provision it automatically
- Copy the connection string

### 4. Configure Backend Service
- Railway should auto-detect the backend
- Go to backend service → "Variables"
- Add these variables:
  ```
  DATABASE_URL = (paste PostgreSQL connection string from step 3)
  JWT_SECRET = (generate random string, e.g., use: https://randomkeygen.com/)
  PORT = 5000
  ```
- Click "Deploy"

### 5. Configure Frontend Service
- Go to frontend service → "Variables"
- Add:
  ```
  NEXT_PUBLIC_API_URL = (your backend Railway URL)
  ```
- To get backend URL: Go to backend → Settings → Generate Domain
- Click "Deploy"

### 6. Generate Public URLs
- Backend: Settings → Networking → Generate Domain
- Frontend: Settings → Networking → Generate Domain
- Copy both URLs

### 7. Update Frontend API URL
- Go back to frontend Variables
- Update `NEXT_PUBLIC_API_URL` with backend domain
- Redeploy frontend

### 8. Test Your Deployment
- Visit your frontend URL
- Try logging in:
  - Email: `admin@security.com`
  - Password: `admin123`

## 🎯 Your Railway URLs

After deployment, you'll have:
- **Frontend**: `https://your-app-name.up.railway.app`
- **Backend API**: `https://your-backend.up.railway.app`
- **Database**: Internal Railway URL

## 💰 Cost Tracking

Railway Free Tier:
- $5 credit per month
- Monitor usage in Railway dashboard
- Estimated usage: ~$5/month (within free tier)

## ⚠️ Important Notes

### What's Deployed:
- ✅ Frontend Dashboard
- ✅ Backend API
- ✅ PostgreSQL Database
- ✅ User Authentication
- ✅ Scan Management

### What's NOT Deployed (too resource-intensive):
- ❌ ZAP Scanner (3.4GB)
- ❌ DVWA Test Target
- ❌ Scanner Tools Container

### For Full Scanning Capabilities:
You'll need to either:
1. Upgrade to Railway Pro ($20/month)
2. Deploy to AWS/GCP/Azure VM
3. Keep scanners running locally and connect via API

## 🔧 Troubleshooting

### Build Failed?
- Check Railway logs
- Ensure all files are pushed to GitHub
- Verify Dockerfile syntax

### Can't Connect to Database?
- Check DATABASE_URL format
- Ensure PostgreSQL service is running
- Wait for database to be healthy (30-60 seconds)

### Frontend Shows Error?
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend is deployed and running
- Check browser console for errors

## 📊 Monitoring

Railway Dashboard shows:
- Deployment status
- Real-time logs
- Resource usage (CPU, Memory)
- Cost tracking

## 🚀 Next Steps

After successful deployment:
1. Test all features
2. Create additional user accounts
3. Configure CORS if needed
4. Set up custom domain (optional)
5. Enable automatic deployments from GitHub

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your GitHub Repo Issues

---

**Estimated Setup Time:** 5-10 minutes
**Difficulty:** Easy ⭐⭐☆☆☆
