# User Management System - Admin Guide

## Setup Instructions

### 1. Rebuild Docker Containers
```bash
docker-compose down
docker-compose up -d --build
```

### 2. Run Database Migration (if upgrading existing database)
```bash
docker exec -i security-scanner-db psql -U postgres -d security_scanner < backend/migrations/add_user_fields.sql
```

## Features

### Admin Dashboard - User Management
- **View all users** with name, email, role, and status
- **Add new users** with email and password
- **Edit users** - update name, email, role, and status
- **Delete users** - remove users from the system
- **Toggle user status** - activate/deactivate users with a switch
- **Search users** by name
- **Filter users** by status (Active, Pending, Inactive)
- **Pagination** - 5 users per page

## API Endpoints

All endpoints require admin authentication (JWT token in Authorization header).

### GET /api/users
Get all users
```json
Response: [
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@security.com",
    "role": "admin",
    "status": "Active",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/users
Create new user
```json
Request: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "status": "Active"
}
```

### PUT /api/users/:id
Update user
```json
Request: {
  "name": "John Doe Updated",
  "email": "john@example.com",
  "role": "admin",
  "status": "Inactive"
}
```

### DELETE /api/users/:id
Delete user

### GET /api/users/stats
Get user statistics

## User Roles
- **admin** - Full system access
- **analyst** - Security analyst access
- **user** - Regular user access

## User Status
- **Active** - User can access the system
- **Pending** - User awaiting approval
- **Inactive** - User cannot access the system

## Default Admin Credentials
- Email: admin@security.com
- Password: admin123

⚠️ Change these in production!

## Environment Variables

### Docker (docker-compose.yml)
```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: http://backend:5000
```

### Local Development
Create `.env.local` in frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Troubleshooting

### Users not loading
1. Check if backend is running: `docker logs security-scanner-backend`
2. Verify database connection: `docker exec security-scanner-db psql -U postgres -d security_scanner -c "SELECT * FROM users;"`
3. Check authentication token in browser localStorage

### Cannot add users
1. Ensure you're logged in as admin
2. Check browser console for errors
3. Verify backend logs: `docker logs security-scanner-backend`

### Docker vs Local Development
- **Local**: Uses `http://localhost:5000`
- **Docker**: Uses `http://backend:5000` (service name)
- Frontend automatically detects environment via `NEXT_PUBLIC_API_URL`
