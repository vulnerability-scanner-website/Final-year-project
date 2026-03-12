# Deployment Checklist - Admin User Management

## Pre-Deployment

### 1. Environment Check
- [ ] Docker Desktop is installed and running
- [ ] Docker Compose is available
- [ ] Ports 3000, 5000, 5432 are available
- [ ] Git repository is up to date

### 2. File Verification
- [ ] `backend/models/UserModel.js` exists
- [ ] `backend/controllers/AdminController.js` exists
- [ ] `backend/routes/admin.js` exists
- [ ] `backend/migrations/add_user_fields.sql` exists
- [ ] `backend/config/database.js` updated
- [ ] `backend/server.js` updated
- [ ] `frontend/src/app/dashboard/admin/Users/page.jsx` updated
- [ ] `frontend/src/components/popup/AddUserDialog.jsx` updated
- [ ] `docker-compose.yml` configured correctly

## Deployment Steps

### Step 1: Stop Existing Containers
```bash
docker-compose down
```
- [ ] All containers stopped
- [ ] No errors in output

### Step 2: Rebuild Containers
```bash
docker-compose up -d --build
```
- [ ] Backend container built successfully
- [ ] Frontend container built successfully
- [ ] Database container started
- [ ] All containers running

### Step 3: Wait for Database
```bash
# Wait 10 seconds for database initialization
```
- [ ] Database is ready
- [ ] No connection errors

### Step 4: Run Migration
```bash
docker exec -i security-scanner-db psql -U postgres -d security_scanner < backend/migrations/add_user_fields.sql
```
- [ ] Migration executed successfully
- [ ] Columns added to users table
- [ ] No SQL errors

### Step 5: Verify Services
```bash
docker ps
```
- [ ] security-scanner-backend is running
- [ ] security-scanner-frontend is running
- [ ] security-scanner-db is running
- [ ] All containers healthy

## Post-Deployment Testing

### 1. Backend API Tests

#### Test 1: Health Check
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"ok","message":"Backend is running"}`
- [ ] Backend responds
- [ ] Status is OK

#### Test 2: Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@security.com","password":"admin123"}'
```
Expected: `{"token":"...", "user":{...}}`
- [ ] Login successful
- [ ] Token received
- [ ] User data returned

**Save token for next tests:**
```bash
TOKEN="<paste_token_here>"
```

#### Test 3: Get All Users
```bash
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Array of users with name, email, role, status
- [ ] Users list returned
- [ ] Contains admin user
- [ ] Has name and status fields

#### Test 4: Create User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "user",
    "status": "Active"
  }'
```
Expected: New user object
- [ ] User created successfully
- [ ] Returns user with ID
- [ ] Password not in response

#### Test 5: Update User
```bash
curl -X PUT http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated",
    "email": "test@example.com",
    "role": "analyst",
    "status": "Active"
  }'
```
Expected: Updated user object
- [ ] User updated successfully
- [ ] Changes reflected

#### Test 6: Get User Stats
```bash
curl http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Statistics object
- [ ] Stats returned
- [ ] Contains total count
- [ ] Contains role breakdown
- [ ] Contains status breakdown

#### Test 7: Delete User
```bash
curl -X DELETE http://localhost:5000/api/users/2 \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Success message
- [ ] User deleted successfully
- [ ] Success message returned

### 2. Frontend Tests

#### Test 1: Access Frontend
Open browser: `http://localhost:3000`
- [ ] Frontend loads
- [ ] No console errors
- [ ] Login page appears

#### Test 2: Login
- Email: `admin@security.com`
- Password: `admin123`
- [ ] Login successful
- [ ] Redirected to dashboard
- [ ] Token stored in localStorage

#### Test 3: Navigate to User Management
Click: Dashboard → User Management
- [ ] Page loads
- [ ] Users table displays
- [ ] Statistics cards show data
- [ ] Search bar visible
- [ ] Filter dropdown visible

#### Test 4: View Users
- [ ] Users displayed in table
- [ ] Shows: ID, Name, Role, Status
- [ ] Action buttons visible (Edit, Delete, Toggle)
- [ ] Pagination works

#### Test 5: Search Users
Type in search box: "admin"
- [ ] Results filter in real-time
- [ ] Shows matching users
- [ ] Case-insensitive search

#### Test 6: Filter by Status
Select filter: "Active"
- [ ] Shows only active users
- [ ] Other statuses hidden
- [ ] Can reset filter

#### Test 7: Add New User
1. Click "Add User" button
2. Fill form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Role: "User"
   - Status: "Active"
3. Click "Save User"

- [ ] Dialog opens
- [ ] All fields present
- [ ] Validation works
- [ ] User created
- [ ] Dialog closes
- [ ] Table updates
- [ ] New user appears

#### Test 8: Edit User
1. Click Edit icon on a user
2. Modify name
3. Click "Update User"

- [ ] Dialog opens with current data
- [ ] Can modify fields
- [ ] Update successful
- [ ] Dialog closes
- [ ] Table updates
- [ ] Changes visible

#### Test 9: Toggle User Status
Click toggle switch on a user
- [ ] Status changes
- [ ] Badge updates color
- [ ] Database updated

#### Test 10: Delete User
1. Click Delete icon
2. Confirm deletion

- [ ] Confirmation dialog appears
- [ ] Shows user name
- [ ] Can cancel
- [ ] Delete works
- [ ] User removed from table

#### Test 11: Pagination
- [ ] Shows 5 users per page
- [ ] Page numbers display
- [ ] Can navigate pages
- [ ] Prev/Next buttons work
- [ ] Buttons disable appropriately

#### Test 12: Statistics Cards
- [ ] Total Users count correct
- [ ] Active Users count correct
- [ ] Inactive Users count correct
- [ ] Updates in real-time

### 3. Database Verification

```bash
docker exec -it security-scanner-db psql -U postgres -d security_scanner
```

#### Check Table Structure
```sql
\d users
```
- [ ] Table exists
- [ ] Has `name` column
- [ ] Has `status` column
- [ ] All columns correct

#### Check Data
```sql
SELECT id, name, email, role, status FROM users;
```
- [ ] Admin user exists
- [ ] Has name field
- [ ] Has status field
- [ ] Data looks correct

#### Exit
```sql
\q
```

## Error Checking

### Check Logs

#### Backend Logs
```bash
docker logs security-scanner-backend
```
- [ ] No errors
- [ ] Routes registered
- [ ] Database connected

#### Frontend Logs
```bash
docker logs security-scanner-frontend
```
- [ ] No build errors
- [ ] Server started
- [ ] No runtime errors

#### Database Logs
```bash
docker logs security-scanner-db
```
- [ ] Database initialized
- [ ] No connection errors
- [ ] Ready to accept connections

### Common Issues

#### Issue: ERR_NAME_NOT_RESOLVED
**Solution**: Verify `NEXT_PUBLIC_API_URL=http://localhost:5000` in docker-compose.yml
- [ ] Fixed

#### Issue: 401 Unauthorized
**Solution**: Login again to get fresh token
- [ ] Fixed

#### Issue: 403 Forbidden
**Solution**: Ensure logged in as admin user
- [ ] Fixed

#### Issue: Users not loading
**Solution**: Run migration script
- [ ] Fixed

#### Issue: Cannot create users
**Solution**: Check all required fields filled
- [ ] Fixed

## Security Checklist

- [ ] JWT secret is set (not default in production)
- [ ] Admin password changed from default
- [ ] CORS configured correctly
- [ ] Database password is strong
- [ ] No sensitive data in logs
- [ ] HTTPS enabled (production)
- [ ] Rate limiting configured
- [ ] Input validation working

## Performance Checklist

- [ ] Database queries optimized
- [ ] Pagination working
- [ ] No memory leaks
- [ ] Response times acceptable (<500ms)
- [ ] Frontend loads quickly
- [ ] No unnecessary re-renders

## Documentation Checklist

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Architecture diagram available
- [ ] Deployment guide written
- [ ] Troubleshooting guide available

## Final Verification

### Smoke Test
1. [ ] Login as admin
2. [ ] View users list
3. [ ] Create a user
4. [ ] Edit the user
5. [ ] Delete the user
6. [ ] Logout
7. [ ] Login again

### All Systems Go?
- [ ] Backend: ✅
- [ ] Frontend: ✅
- [ ] Database: ✅
- [ ] Authentication: ✅
- [ ] User Management: ✅
- [ ] Documentation: ✅

## Sign-Off

- Deployed by: _______________
- Date: _______________
- Time: _______________
- Status: ✅ READY FOR PRODUCTION

---

**Notes:**
- Keep this checklist for future deployments
- Update as needed for your environment
- Document any issues encountered
- Share with team members
