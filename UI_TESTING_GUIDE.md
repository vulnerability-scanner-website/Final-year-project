# 🖥️ Security Features Testing Guide - Using the UI

## 🌐 Access the Application

**Frontend URL**: http://localhost:3000

Open your browser and navigate to the frontend. You'll see the login/register page.

---

## 1️⃣ Test Input Validation

### ✅ What You'll Test
The UI should prevent invalid inputs and show error messages.

### 🧪 Test Steps

#### **Test 1: Invalid Email Format**
1. Go to **Register** page
2. Enter:
   - Email: `invalid-email` (no @ symbol)
   - Password: `test12345`
   - Role: `Developer`
3. Click **Register**

**Expected Result**: ❌ Error message: "Please enter a valid email address" or "email must be a valid email"

#### **Test 2: Short Password**
1. Go to **Register** page
2. Enter:
   - Email: `test@example.com`
   - Password: `short` (less than 8 characters)
   - Role: `Developer`
3. Click **Register**

**Expected Result**: ❌ Error message: "Password must be at least 8 characters"

#### **Test 3: Missing Required Fields**
1. Go to **Register** page
2. Leave email empty
3. Enter password: `test12345`
4. Click **Register**

**Expected Result**: ❌ Error message: "Email is required" or form validation prevents submission

#### **Test 4: Invalid Role**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to manually submit with invalid role:
```javascript
fetch('http://localhost:5001/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test12345',
    role: 'hacker'
  })
}).then(r => r.json()).then(console.log)
```

**Expected Result**: ❌ Error: "role must be one of: developer, analyst"

#### **Test 5: Valid Registration**
1. Go to **Register** page
2. Enter:
   - Email: `security-test@example.com`
   - Password: `test12345`
   - Role: `Developer`
3. Click **Register**

**Expected Result**: ✅ Success! You're registered and logged in (or pending approval message)

---

## 2️⃣ Test CSRF Protection

### ✅ What You'll Test
The UI automatically includes CSRF tokens in requests.

### 🧪 Test Steps

#### **Test 1: Normal Operation (Should Work)**
1. **Login** with your credentials
2. Go to **Scans** page
3. Click **New Scan**
4. Enter target: `http://localhost:8080`
5. Click **Start Scan**

**Expected Result**: ✅ Scan starts successfully (CSRF token is automatically included)

#### **Test 2: Simulate Missing CSRF Token**
1. **Login** to the application
2. Open **Browser DevTools** (F12)
3. Go to **Console** tab
4. Run this code to bypass the UI and make a request without CSRF token:
```javascript
// Get your auth token from localStorage
const token = localStorage.getItem('token');

// Try to create scan WITHOUT CSRF token
fetch('http://localhost:5001/api/scans', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    // Notice: NO X-CSRF-Token header
  },
  body: JSON.stringify({
    target: 'http://localhost:8080'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.error) {
    console.log('✅ CSRF Protection Working!');
  }
});
```

**Expected Result**: ❌ Error: "Invalid or missing CSRF token" (403 Forbidden)

#### **Test 3: With CSRF Token (Should Work)**
1. Still in **Console**, run:
```javascript
const token = localStorage.getItem('token');

// First, get CSRF token
fetch('http://localhost:5001/api/csrf-token', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => {
  const csrfToken = data.csrfToken;
  console.log('CSRF Token:', csrfToken);
  
  // Now make request WITH CSRF token
  return fetch('http://localhost:5001/api/scans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify({
      target: 'http://localhost:8080'
    })
  });
})
.then(r => r.json())
.then(data => {
  console.log('✅ Scan created with CSRF token:', data);
});
```

**Expected Result**: ✅ Scan created successfully

---

## 3️⃣ Test Rate Limiting

### ✅ What You'll Test
After too many requests, you'll be rate-limited.

### 🧪 Test Steps

#### **Test 1: Normal Usage (Should Work)**
1. **Login** to the application
2. Navigate around the app normally
3. View scans, dashboard, etc.

**Expected Result**: ✅ Everything works normally

#### **Test 2: Trigger Rate Limit**
1. **Login** to the application
2. Open **Browser DevTools** (F12) → **Console**
3. Run this script to make many requests quickly:
```javascript
const token = localStorage.getItem('token');
let successCount = 0;
let rateLimitCount = 0;

// Make 60 requests
for (let i = 1; i <= 60; i++) {
  fetch('http://localhost:5001/api/scans', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(r => {
    console.log(`Request ${i}: ${r.status}`);
    if (r.status === 200) successCount++;
    if (r.status === 429) {
      rateLimitCount++;
      console.log('🚫 Rate Limited!');
    }
    return r.json();
  })
  .then(data => {
    if (data.error && data.error.includes('Rate limit')) {
      console.log(`❌ ${data.message}`);
    }
  });
}

setTimeout(() => {
  console.log(`\n📊 Results:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`🚫 Rate Limited: ${rateLimitCount}`);
}, 5000);
```

**Expected Result**: 
- First ~50 requests: ✅ Success (200 OK)
- After 50 requests: ❌ Rate limited (429 Too Many Requests)
- Error message: "Rate limit exceeded. Try again in X seconds"

#### **Test 3: Wait and Retry**
1. After being rate-limited, wait 1 hour (or restart backend to reset)
2. Try making requests again

**Expected Result**: ✅ Requests work again

---

## 4️⃣ Test SQL Injection Prevention

### ✅ What You'll Test
SQL injection attempts are blocked.

### 🧪 Test Steps

#### **Test 1: Normal Scan ID (Should Work)**
1. **Login** and create a scan
2. Click on the scan to view details
3. Note the URL: `http://localhost:3000/scans/1`

**Expected Result**: ✅ Scan details load correctly

#### **Test 2: SQL Injection in URL**
1. **Login** to the application
2. Manually change the URL to:
   ```
   http://localhost:3000/scans/1 OR 1=1
   ```
   or
   ```
   http://localhost:3000/scans/999'; DROP TABLE users;--
   ```
3. Press Enter

**Expected Result**: ❌ Error: "Invalid ID parameter" or "Scan not found" (NOT a database error)

#### **Test 3: SQL Injection via DevTools**
1. Open **Browser DevTools** (F12) → **Console**
2. Try SQL injection:
```javascript
const token = localStorage.getItem('token');

fetch("http://localhost:5001/api/scans/1' OR '1'='1", {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data);
  if (data.error && data.error.includes('Invalid ID')) {
    console.log('✅ SQL Injection Prevented!');
  }
});
```

**Expected Result**: ❌ Error: "Invalid ID parameter" (SQL injection blocked)

---

## 5️⃣ Test Input Sanitization (XSS Prevention)

### ✅ What You'll Test
HTML/JavaScript in inputs is sanitized.

### 🧪 Test Steps

#### **Test 1: XSS in Registration**
1. Go to **Register** page
2. Enter:
   - Email: `<script>alert('XSS')</script>@test.com`
   - Password: `test12345`
   - Role: `Developer`
3. Click **Register**

**Expected Result**: ❌ Error: "Invalid email format" (script tags removed/rejected)

#### **Test 2: XSS in Scan Target**
1. **Login** to the application
2. Go to **New Scan**
3. Enter target: `http://localhost:8080<script>alert('XSS')</script>`
4. Click **Start Scan**

**Expected Result**: ❌ Error: "Invalid URL format" or script is sanitized

#### **Test 3: Check Database for Sanitized Data**
1. After attempting XSS attacks
2. Open a new terminal
3. Check database:
```bash
docker exec -it security-scanner-db psql -U postgres -d security_scanner
```
4. Run query:
```sql
SELECT email FROM users WHERE email LIKE '%script%';
```

**Expected Result**: No results (scripts were sanitized/removed)

---

## 6️⃣ Test Error Handling

### ✅ What You'll Test
Errors don't expose sensitive information.

### 🧪 Test Steps

#### **Test 1: Trigger an Error**
1. **Login** to the application
2. Open **Browser DevTools** (F12) → **Network** tab
3. Try to access a non-existent scan:
   ```
   http://localhost:3000/scans/99999
   ```

**Expected Result**: 
- ❌ Error message: "Scan not found" or "Not Found"
- ✅ NO stack traces visible
- ✅ NO database error details

#### **Test 2: Check Network Response**
1. In **Network** tab, click on the failed request
2. Go to **Response** tab
3. Check the error response

**Expected Result** (Development Mode):
```json
{
  "error": true,
  "message": "Scan not found",
  "statusCode": 404,
  "timestamp": "..."
}
```

**Expected Result** (Production Mode):
```json
{
  "error": true,
  "message": "Not Found",
  "statusCode": 404,
  "timestamp": "..."
}
```
- ✅ NO `stack` field
- ✅ NO database connection strings
- ✅ NO internal paths

---

## 7️⃣ Test File Upload Validation

### ✅ What You'll Test
Only allowed file types with size limits.

### 🧪 Test Steps

#### **Test 1: Upload Invalid File Type**
1. **Login** to the application
2. Go to a page with file upload (if available)
3. Try to upload: `malicious.exe` or `script.js`

**Expected Result**: ❌ Error: "File type not allowed. Allowed types: PDF, JSON, TXT, CSV, XLSX"

#### **Test 2: Upload File Too Large**
1. Create a large file (>10MB)
2. Try to upload it

**Expected Result**: ❌ Error: "File size exceeds maximum allowed size of 10MB"

#### **Test 3: Upload Valid File**
1. Create or select a valid file (PDF, JSON, TXT, CSV, or XLSX)
2. Make sure it's under 10MB
3. Upload it

**Expected Result**: ✅ File uploaded successfully

#### **Test 4: Upload File with Malicious Content**
1. Create a text file named `test.txt`
2. Add content: `<script>alert('XSS')</script>`
3. Try to upload

**Expected Result**: ❌ Error: "File contains potentially malicious content" (if content scanning is enabled)

---

## 8️⃣ Test Security Headers

### ✅ What You'll Test
Security headers are present in all responses.

### 🧪 Test Steps

#### **Test 1: Check Headers in Browser**
1. **Open the application** in browser
2. Open **Browser DevTools** (F12)
3. Go to **Network** tab
4. Refresh the page
5. Click on any request (e.g., the main HTML document)
6. Go to **Headers** tab
7. Scroll to **Response Headers**

**Expected Headers**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
```

#### **Test 2: Test Clickjacking Protection**
1. Create a simple HTML file `test-clickjacking.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Clickjacking Test</h1>
  <iframe src="http://localhost:3000" width="800" height="600"></iframe>
</body>
</html>
```
2. Open this file in browser

**Expected Result**: ❌ The iframe should be blocked or show an error (X-Frame-Options protection)

---

## 9️⃣ Test Authentication & Authorization

### ✅ What You'll Test
Protected routes require authentication.

### 🧪 Test Steps

#### **Test 1: Access Protected Route Without Login**
1. **Logout** if you're logged in
2. Try to access: `http://localhost:3000/dashboard`

**Expected Result**: ❌ Redirected to login page

#### **Test 2: Access API Without Token**
1. Open **Browser DevTools** (F12) → **Console**
2. Run:
```javascript
fetch('http://localhost:5001/api/scans')
  .then(r => r.json())
  .then(console.log);
```

**Expected Result**: ❌ Error: "Unauthorized" (401)

#### **Test 3: Access Another User's Data**
1. **Login** as User A
2. Note a scan ID from User A
3. **Logout** and **Login** as User B
4. Try to access User A's scan:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5001/api/scans/USER_A_SCAN_ID', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(r => r.json())
.then(console.log);
```

**Expected Result**: ❌ Error: "Scan not found" or "Forbidden" (user ownership check)

---

## 🔟 Test Password Security

### ✅ What You'll Test
Passwords are hashed and secure.

### 🧪 Test Steps

#### **Test 1: Register with Password**
1. **Register** a new user with password: `MySecurePassword123`
2. Check database:
```bash
docker exec -it security-scanner-db psql -U postgres -d security_scanner
```
3. Run:
```sql
SELECT email, password FROM users WHERE email = 'your-email@example.com';
```

**Expected Result**: 
- ✅ Password is hashed (looks like: `$2b$10$...`)
- ✅ NOT plain text
- ✅ 60 characters long (bcrypt hash)

#### **Test 2: Login with Wrong Password**
1. Go to **Login** page
2. Enter correct email but wrong password
3. Click **Login**

**Expected Result**: ❌ Error: "Invalid credentials" (generic message, doesn't reveal if email exists)

---

## 📊 Complete UI Test Checklist

Use this checklist to verify all security features:

### Input Validation
- [ ] Invalid email rejected
- [ ] Short password rejected
- [ ] Missing fields rejected
- [ ] Invalid role rejected
- [ ] Valid registration succeeds

### CSRF Protection
- [ ] Normal operations work (CSRF token auto-included)
- [ ] Request without CSRF token fails (403)
- [ ] Request with CSRF token succeeds

### Rate Limiting
- [ ] Normal usage works
- [ ] After 50+ requests, rate limited (429)
- [ ] Error message shows retry time

### SQL Injection Prevention
- [ ] Normal scan ID works
- [ ] SQL injection in URL blocked
- [ ] SQL injection via API blocked

### Input Sanitization
- [ ] XSS in email rejected
- [ ] XSS in scan target sanitized
- [ ] Database doesn't contain script tags

### Error Handling
- [ ] Errors show user-friendly messages
- [ ] No stack traces visible
- [ ] No sensitive info exposed

### File Upload Validation
- [ ] Invalid file type rejected
- [ ] Large file rejected
- [ ] Valid file accepted

### Security Headers
- [ ] X-Content-Type-Options present
- [ ] X-Frame-Options present
- [ ] Strict-Transport-Security present
- [ ] Clickjacking protection works

### Authentication
- [ ] Protected routes require login
- [ ] API requires token
- [ ] Users can't access others' data

### Password Security
- [ ] Passwords are hashed in database
- [ ] Wrong password rejected
- [ ] Generic error messages

---

## 🎥 Video Walkthrough Script

If you want to record a demo, follow this script:

### Part 1: Input Validation (2 min)
1. Show registration form
2. Try invalid email → Show error
3. Try short password → Show error
4. Try valid registration → Show success

### Part 2: CSRF Protection (2 min)
1. Login to app
2. Open DevTools
3. Show request without CSRF token → Fails
4. Show request with CSRF token → Succeeds

### Part 3: Rate Limiting (2 min)
1. Open DevTools console
2. Run script to make 60 requests
3. Show first 50 succeed
4. Show requests 51+ fail with rate limit error

### Part 4: SQL Injection (1 min)
1. Try to access scan with SQL injection in URL
2. Show error: "Invalid ID parameter"

### Part 5: Security Headers (1 min)
1. Open DevTools → Network
2. Show response headers
3. Point out security headers

**Total: ~8 minutes**

---

## 🆘 Troubleshooting

### Issue: CSRF errors on every request
**Solution**: 
1. Check if frontend is fetching CSRF token
2. Clear browser cache and cookies
3. Restart backend: `docker-compose restart backend`

### Issue: Rate limit triggers too quickly
**Solution**: 
1. Edit `backend/.env`
2. Increase `RATE_LIMIT_MAX=200`
3. Restart: `docker-compose restart backend`

### Issue: Can't see security headers
**Solution**: 
1. Make sure you're checking Response Headers (not Request Headers)
2. Check backend logs: `docker logs security-scanner-backend`

### Issue: File upload not working
**Solution**: 
1. Check file size (must be < 10MB)
2. Check file type (PDF, JSON, TXT, CSV, XLSX only)
3. Check backend logs for errors

---

## ✅ Success Criteria

Your security implementation is working if:

1. ✅ Invalid inputs are rejected with clear error messages
2. ✅ CSRF protection blocks requests without tokens
3. ✅ Rate limiting triggers after excessive requests
4. ✅ SQL injection attempts are blocked
5. ✅ XSS attempts are sanitized
6. ✅ Errors don't expose sensitive information
7. ✅ Security headers are present
8. ✅ File uploads are validated
9. ✅ Authentication is required for protected routes
10. ✅ Passwords are hashed in database

---

## 🎉 You're Done!

All security features are now testable through the UI. Use this guide to demonstrate your security implementation to stakeholders or for your project presentation!

**Pro Tip**: Record a screen capture while testing these features to create a security demo video! 🎥
