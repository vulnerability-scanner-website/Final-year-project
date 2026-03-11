# Security Scanner Platform - Complete Setup

## 🚀 Quick Start with Docker

### 1. Start Everything
```bash
docker-compose up --build
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **WebSocket**: ws://localhost:5000/ws
- **Database**: localhost:5432

### 3. Default Login Credentials
```
Email: admin@security.com
Password: admin123
Role: admin
```

## ✅ What's Included

### Backend Features
- ✅ PostgreSQL database with auto-initialization
- ✅ JWT authentication (login/register)
- ✅ Protected API routes
- ✅ Password hashing with bcrypt
- ✅ WebSocket for real-time updates
- ✅ Rate limiting
- ✅ CORS enabled

### Database Tables
- `users` - User accounts with roles
- `scans` - Security scan records
- `reports` - Generated reports

### API Endpoints

**Public:**
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/health` - Health check

**Protected (requires JWT token):**
- `GET /api/scans` - Get user's scans
- `POST /api/scans` - Create new scan
- `GET /api/reports` - Get user's reports

**WebSocket:**
- `ws://localhost:5000/ws` - Real-time updates

## 📝 Usage Examples

### Frontend API Usage

```javascript
import { authAPI, scansAPI, connectWebSocket } from '@/lib/api';

// Login
const { token, user } = await authAPI.login('admin@security.com', 'admin123');

// Get scans
const scans = await scansAPI.getAll();

// Create scan
const newScan = await scansAPI.create('example.com');

// WebSocket
const ws = connectWebSocket((data) => {
  console.log('Received:', data);
});
```

## 🛠️ Development

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
```

### Rebuild After Changes
```bash
docker-compose up --build
```

### Access Database
```bash
docker exec -it security-scanner-db psql -U admin -d security_scanner
```

### Database Commands
```sql
-- View users
SELECT * FROM users;

-- View scans
SELECT * FROM scans;

-- View reports
SELECT * FROM reports;
```

## 🔒 Security Notes

1. Change `JWT_SECRET` in production
2. Use strong passwords
3. Enable HTTPS in production
4. Update CORS origins for production

## 🐛 Troubleshooting

**Database connection failed:**
```bash
docker-compose down -v
docker-compose up --build
```

**Port already in use:**
```bash
# Stop existing services
docker-compose down
# Or change ports in docker-compose.yml
```

**Frontend can't connect to backend:**
- Check `NEXT_PUBLIC_API_URL` in docker-compose.yml
- Ensure backend is running: http://localhost:5000/api/health

## 📊 Project Status

**Completed:**
- ✅ Frontend UI (75-80%)
- ✅ Backend API with database
- ✅ Authentication system
- ✅ WebSocket support
- ✅ Docker containerization

**Overall: ~85% Complete**
