# 🚂 Deploy to Railway.app

## Prerequisites
- GitHub account
- Railway.app account (sign up at https://railway.app)
- Your project pushed to GitHub

## Important Notes
⚠️ **Railway Free Tier Limitations:**
- $5 free credit per month
- Limited to 512MB RAM per service
- 1GB disk space per service
- Services sleep after 30 minutes of inactivity

⚠️ **What Won't Work on Free Tier:**
- ZAP Scanner (too large - 3.4GB)
- DVWA (not essential for production)
- Scanner tools (resource intensive)

✅ **What Will Work:**
- Backend API
- Frontend Dashboard
- PostgreSQL Database
- Basic security scanning (without ZAP)

## Deployment Steps

### Step 1: Push to GitHub
Make sure your latest code is on GitHub:
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin alpha
```

### Step 2: Sign Up for Railway
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### Step 3: Deploy from GitHub

#### Option A: Deploy Each Service Separately (Recommended)

**1. Deploy PostgreSQL Database:**
- Click "New Project"
- Select "Deploy PostgreSQL"
- Railway will automatically provision a database
- Copy the connection string (you'll need it)

**2. Deploy Backend:**
- Click "New" → "GitHub Repo"
- Select your repository
- Railway will detect the Dockerfile in `/backend`
- Add environment variables:
  - `DATABASE_URL`: (paste PostgreSQL connection string)
  - `JWT_SECRET`: (generate a random secret)
  - `PORT`: 5000
- Click "Deploy"

**3. Deploy Frontend:**
- Click "New" → "GitHub Repo"
- Select your repository again
- Set root directory to `/frontend`
- Add environment variables:
  - `NEXT_PUBLIC_API_URL`: (your backend URL from Railway)
- Click "Deploy"

#### Option B: Deploy with Docker Compose (Simpler but uses more resources)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will detect `docker-compose.yml`
5. Add environment variables in Railway dashboard:
   - `POSTGRES_USER`: postgres
   - `POSTGRES_PASSWORD`: (create a strong password)
   - `POSTGRES_DB`: security_scanner
   - `JWT_SECRET`: (generate random string)
   - `NEXT_PUBLIC_API_URL`: https://your-backend.railway.app

### Step 4: Configure Environment Variables

In Railway dashboard, add these variables:

**Backend Service:**
```
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/security_scanner
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

**Frontend Service:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Step 5: Generate Domain Names

1. Go to each service in Railway
2. Click "Settings" → "Networking"
3. Click "Generate Domain"
4. Copy the domain URLs

### Step 6: Update Frontend Environment

Update the frontend's `NEXT_PUBLIC_API_URL` with your backend's Railway domain.

### Step 7: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.railway.app`
2. Try logging in with default credentials:
   - Email: `admin@security.com`
   - Password: `admin123`

## Cost Estimation

**Free Tier ($5/month credit):**
- PostgreSQL: ~$1/month
- Backend: ~$2/month
- Frontend: ~$2/month
- **Total: ~$5/month** (within free tier!)

**If you exceed free tier:**
- Each service: ~$5-10/month
- Total: ~$15-30/month

## Limitations on Railway

### What's Removed for Railway:
- ❌ ZAP Scanner (too large)
- ❌ DVWA test target (not needed in production)
- ❌ Scanner tools container (resource intensive)

### What's Kept:
- ✅ Backend API (security scanning logic)
- ✅ Frontend Dashboard
- ✅ PostgreSQL Database
- ✅ User authentication
- ✅ Scan management

## Alternative: Use Railway for Frontend/Backend + External Scanner

You can:
1. Deploy frontend + backend on Railway
2. Keep ZAP scanner running locally
3. Configure backend to connect to your local ZAP instance via ngrok

## Troubleshooting

### Build Fails
- Check Railway logs in the dashboard
- Ensure Dockerfile is correct
- Verify all dependencies are in package.json

### Database Connection Issues
- Use Railway's internal DNS: `postgres.railway.internal`
- Check DATABASE_URL format
- Ensure database is healthy before backend starts

### Frontend Can't Connect to Backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, Memory, Network)
- Deployment history
- Automatic HTTPS

## Scaling

To scale beyond free tier:
- Upgrade to Pro plan ($20/month)
- Increase resources per service
- Add more replicas for high availability

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repository

---

**Note:** For full security scanning capabilities with ZAP, consider deploying to a VPS (AWS EC2, DigitalOcean) instead of Railway.
