# Google OAuth Implementation Guide

## ✅ What Has Been Implemented

### Backend Changes:
1. **Installed packages**: `passport`, `passport-google-oauth20`
2. **Database migration**: Added `google_id`, `auth_provider` columns, made `password` nullable
3. **Passport configuration**: Created `/backend/config/passport.js`
4. **Auth routes**: Added `/api/auth/google` and `/api/auth/google/callback`
5. **AuthController**: Added `googleCallback()` method
6. **User model**: Added `findByGoogleId()` and updated `create()` method

### Frontend Changes:
1. **Google button**: Connected to backend OAuth endpoint
2. **Success page**: Created `/auth/google/success` to handle OAuth callback

## 🔧 Setup Steps

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** or **Google Identity Services**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Configure OAuth consent screen:
   - App name: CyberTrace
   - User support email: your email
   - Developer contact: your email
7. Application type: **Web application**
8. Add Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
9. Copy your **Client ID** and **Client Secret**

### 2. Update Backend Environment Variables

Edit `/backend/.env`:
```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 3. Start Services

```bash
docker-compose up -d
```

## 🎯 How It Works

### User Flow:
1. User clicks "Log in with Google" button
2. Redirected to Google OAuth consent screen
3. User approves access
4. Google redirects to `/api/auth/google/callback`
5. Backend creates/finds user, generates JWT token
6. Redirects to `/auth/google/success?token=xxx&role=xxx`
7. Frontend stores token and redirects to dashboard

### Database Schema:
```sql
users table:
- google_id VARCHAR(255) UNIQUE (nullable)
- auth_provider VARCHAR(20) DEFAULT 'local'
- password VARCHAR(255) (nullable for Google users)
```

### Security Features:
- Users with Google accounts can't login with password
- Users with password accounts can't login with Google (prevents account takeover)
- New Google users auto-approved as 'developer' role
- JWT tokens generated same way as regular login

## 🧪 Testing

1. Make sure you've added your Google credentials to `.env`
2. Start all services: `docker-compose up -d`
3. Go to `http://localhost:3000/auth/login`
4. Click "Log in with Google"
5. Sign in with your Google account
6. You should be redirected to the dashboard

## 📝 Notes

- Google users are created with `auth_provider='google'` and no password
- Default role for new Google users is `developer`
- Admins are notified when new users register via Google
- Users receive welcome notification after first Google login

## 🔒 Production Setup

For production, update:
1. `GOOGLE_CALLBACK_URL` to your production domain
2. Add production URL to Google Console authorized redirect URIs
3. Update `FRONTEND_URL` in backend `.env`
