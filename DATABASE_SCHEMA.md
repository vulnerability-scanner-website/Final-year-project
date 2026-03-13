# Database Schema Documentation

## Overview
Database: `security_scanner`
Database Engine: PostgreSQL 16

---

## Tables

### 1. **users** (User Management)
Stores user accounts with role-based access control.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing user ID            |
| email       | VARCHAR(255) | UNIQUE, NOT NULL     | User email (login credential)        |
| password    | VARCHAR(255) | NOT NULL             | Hashed password (bcrypt)             |
| role        | VARCHAR(50)  | NOT NULL             | User role (admin/analyst/developer)  |
| status      | VARCHAR(20)  | DEFAULT 'active'     | Account status (active/inactive/pending) |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Account creation date          |

**Indexes:**
- Primary Key: `id`
- Unique: `email`

**Roles:**
- `admin` - Full system access, can manage users
- `analyst` - Security analyst role
- `developer` - Developer role

**Status Values:**
- `active` - User can access the system
- `inactive` - User account disabled
- `pending` - Awaiting admin approval (new registrations)

---

### 2. **scans** (Security Scans)
Stores security scan records performed by users.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing scan ID            |
| user_id     | INTEGER      | FOREIGN KEY → users(id) | User who initiated the scan       |
| target      | VARCHAR(255) | NOT NULL             | Target URL/IP being scanned          |
| status      | VARCHAR(50)  | NOT NULL             | Scan status (running/completed/failed) |
| issues      | INTEGER      | DEFAULT 0            | Number of vulnerabilities found      |
| date        | DATE         | DEFAULT CURRENT_DATE | Scan date                            |
| duration    | VARCHAR(50)  |                      | Scan duration                        |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp       |

**Foreign Keys:**
- `user_id` → `users(id)` (CASCADE on DELETE)

---

### 3. **vulnerabilities** (Security Issues)
Stores detected vulnerabilities from scans.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing vulnerability ID   |
| scan_id     | INTEGER      | FOREIGN KEY → scans(id) ON DELETE CASCADE | Associated scan |
| title       | VARCHAR(255) | NOT NULL             | Vulnerability title                  |
| severity    | VARCHAR(50)  | NOT NULL             | Severity level (Critical/High/Medium/Low/Info) |
| status      | VARCHAR(50)  | DEFAULT 'Open'       | Issue status (Open/Fixed/Ignored)    |
| description | TEXT         |                      | Detailed vulnerability description   |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Detection timestamp             |

**Foreign Keys:**
- `scan_id` → `scans(id)` (CASCADE on DELETE)

---

### 4. **reports** (Generated Reports)
Stores generated security reports.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing report ID          |
| user_id     | INTEGER      | FOREIGN KEY → users(id) | Report owner                      |
| name        | VARCHAR(255) | NOT NULL             | Report name                          |
| type        | VARCHAR(50)  | NOT NULL             | Report type (PDF/JSON/HTML)          |
| size        | DECIMAL(10,2)|                      | File size in MB                      |
| status      | VARCHAR(50)  | NOT NULL             | Generation status                    |
| subtype     | VARCHAR(255) |                      | Report subtype/category              |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Report generation date          |

**Foreign Keys:**
- `user_id` → `users(id)`

---

### 5. **notifications** (User Notifications)
Stores system notifications for users.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing notification ID    |
| user_id     | INTEGER      | FOREIGN KEY → users(id) | Notification recipient            |
| message     | TEXT         | NOT NULL             | Notification message                 |
| read        | BOOLEAN      | DEFAULT false        | Read status                          |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Notification timestamp          |

**Foreign Keys:**
- `user_id` → `users(id)`

---

### 6. **settings** (User Settings)
Stores user-specific application settings.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing setting ID         |
| user_id     | INTEGER      | UNIQUE, FOREIGN KEY → users(id) | Setting owner (one per user) |
| data        | JSONB        |                      | Settings data in JSON format         |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Settings creation date          |

**Foreign Keys:**
- `user_id` → `users(id)` (UNIQUE - one settings record per user)

---

### 7. **pricing** (Subscription Plans)
Stores available subscription/pricing plans.

| Column      | Type         | Constraints           | Description                          |
|-------------|--------------|----------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY          | Auto-incrementing plan ID            |
| name        | VARCHAR(255) | NOT NULL             | Plan name (Free/Pro/Enterprise)      |
| price       | DECIMAL(10,2)| NOT NULL             | Plan price                           |
| features    | JSONB        |                      | Plan features in JSON format         |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Plan creation date              |

---

## Entity Relationships

```
users (1) ──────< (N) scans
                      │
                      └──< (N) vulnerabilities

users (1) ──────< (N) reports
users (1) ──────< (N) notifications
users (1) ────── (1) settings
```

---

## Database Initialization

The database is automatically initialized on first run with:
- Default admin user: `admin@security.com` / `admin123`
- All required tables with proper constraints
- Foreign key relationships with CASCADE delete where appropriate

**Location:** `backend/config/database.js`

---

## Access Control

### Admin Role
- Full CRUD operations on users
- Can activate/deactivate user accounts
- Can assign roles to users
- Can delete users (cascades to their scans)

### Analyst/Developer Roles
- Can register themselves (status: pending)
- Require admin activation
- Can perform scans
- Can view their own data

---

## Security Features

1. **Password Hashing:** bcrypt with salt rounds = 10
2. **JWT Authentication:** Token-based authentication
3. **Role-Based Access Control (RBAC):** Admin, Analyst, Developer
4. **Foreign Key Constraints:** Data integrity maintained
5. **Cascade Deletes:** Automatic cleanup of related records

---

## Database Connection

**Connection String:**
```
postgres://postgres:postgres@localhost:5432/security_scanner
```

**Docker Container:** `security-scanner-db`
**Port:** 5432 (mapped to host)

---

## Backup & Restore

### Backup
```bash
docker exec security-scanner-db pg_dump -U postgres security_scanner > backup.sql
```

### Restore
```bash
docker exec -i security-scanner-db psql -U postgres security_scanner < backup.sql
```

---

## Migration History

1. **Initial Schema** - All tables created
2. **Status Column Migration** - Added `status` column to users table for account activation workflow

---

## Notes for Advisor

- Database follows normalized design principles (3NF)
- Foreign keys ensure referential integrity
- Cascade deletes prevent orphaned records
- JSONB used for flexible schema (settings, features)
- Timestamps track all record creation
- Indexes on primary keys and unique constraints for performance
