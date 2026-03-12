# 🚀 Admin User Management - Quick Reference

## ⚡ Quick Start

### Windows
```bash
setup-admin.bat
```

### Linux/Mac
```bash
chmod +x setup-admin.sh
./setup-admin.sh
```

## 🔑 Default Login
- **URL**: http://localhost:3000
- **Email**: admin@security.com
- **Password**: admin123

## 📁 Project Structure

```
backend/
├── models/UserModel.js          # Database operations
├── controllers/AdminController.js  # Business logic
└── routes/admin.js              # API endpoints

frontend/
└── src/app/dashboard/admin/Users/page.jsx  # UI
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get user details |
| GET | /api/users/stats | User statistics |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

## 🎯 Features

✅ Create, Read, Update, Delete users
✅ Search by name
✅ Filter by status
✅ Toggle user status
✅ Pagination
✅ Real-time statistics
✅ JWT authentication
✅ Role-based access control

## 📚 Documentation

- **Full Guide**: [ADMIN_USER_MANAGEMENT.md](ADMIN_USER_MANAGEMENT.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Implementation**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Deployment**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## 🐛 Troubleshooting

### Backend not starting
```bash
docker logs security-scanner-backend
```

### Users not loading
```bash
docker exec -i security-scanner-db psql -U postgres -d security_scanner < backend/migrations/add_user_fields.sql
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📞 Quick Commands

```bash
# View logs
docker logs security-scanner-backend
docker logs security-scanner-frontend

# Access database
docker exec -it security-scanner-db psql -U postgres -d security_scanner

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Start all
docker-compose up -d
```

## ✅ Testing

1. Login as admin
2. Navigate to User Management
3. Create a test user
4. Edit the user
5. Delete the user

## 🔐 Security

- JWT authentication required
- Admin role required
- Password hashing (bcrypt)
- Self-delete protection
- Email uniqueness validation

---

**Status**: ✅ Ready to Use
**Version**: 1.0
**Last Updated**: 2024
