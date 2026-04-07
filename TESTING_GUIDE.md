# 🧪 Security Features Testing Guide

## ✅ All Services Running

Your security-enhanced backend is now running with Docker! Here's how to test each security feature:

### 🌐 Service URLs
- **Backend API**: http://localhost:5001
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **ZAP Scanner**: http://localhost:9090
- **DVWA (Test Target)**: http://localhost:8080
- **Vulnerable App**: http://localhost:8888

---

## 1️⃣ Test Environment Variables & Secrets

### ✅ What to Test
Verify that secrets are loaded from .env file and not hardcoded.

### 🧪 Test Commands
```bash
# Check backend logs for security confirmation
docker logs security-scanner-backend | grep "Security features enabled"

# Verify JWT_SECRET is loaded (should NOT show the actual secret)
docker exec security-scanner-backend sh -c "echo \$JWT_SECRET | wc -c"
# Should output: 65 (64 chars + newline)
```

### ✅ Expected Result
- Backend starts without errors
- Logs show "Security features enabled"
- JWT_SECRET is 64 characters long

---

## 2️⃣ Test Input Validation

### ✅ What to Test
All endpoints validate input data before processing.

### 🧪 Test Commands

**Test 1: Invalid Email Format**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"invalid-email\",\"password\":\"test12345\",\"role\":\"developer\"}"
```
**Expected**: `400 Bad Request` - "email must be a valid email"

**Test 2: Short Password**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"short\",\"role\":\"developer\"}"
```
**Expected**: `400 Bad Request` - "password must be at least 8 characters"

**Test 3: Invalid Role**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test12345\",\"role\":\"hacker\"}"
```
**Expected**: `400 Bad Request` - "role must be one of: developer, analyst"

**Test 4: Missing Required Fields**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```
**Expected**: `400 Bad Request` - "Missing required field: password"

**Test 5: Invalid URL for Scan**
```bash
# First register and login to get token
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tester@example.com\",\"password\":\"test12345\",\"role\":\"developer\"}"

# Get token from response, then test invalid URL
curl -X POST http://localhost:5001/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"target\":\"not-a-valid-url\"}"
```
**Expected**: `400 Bad Request` - "target must be a valid URL"

---

## 3️⃣ Test CSRF Protection

### ✅ What to Test
State-changing requests require CSRF token.

### 🧪 Test Commands

**Step 1: Register and Login**
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"csrf-test@example.com\",\"password\":\"test12345\",\"role\":\"developer\"}"

# Login (save the token)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"csrf-test@example.com\",\"password\":\"test12345\"}"
```

**Step 2: Try POST Without CSRF Token (Should Fail)**
```bash
curl -X POST http://localhost:5001/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"target\":\"http://localhost:8080\"}"
```
**Expected**: `403 Forbidden` - "Invalid or missing CSRF token"

**Step 3: Get CSRF Token**
```bash
curl http://localhost:5001/api/csrf-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected**: `{"csrfToken":"..."}`

**Step 4: Try POST With CSRF Token (Should Succeed)**
```bash
curl -X POST http://localhost:5001/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN_HERE" \
  -d "{\"target\":\"http://localhost:8080\"}"
```
**Expected**: `200 OK` - Scan created successfully

---

## 4️⃣ Test Rate Limiting

### ✅ What to Test
Users are rate-limited based on their plan.

### 🧪 Test Commands

**Test API Rate Limit (50 requests/hour for free plan)**
```bash
# Make 60 requests quickly
for i in {1..60}; do
  echo "Request $i"
  curl -s http://localhost:5001/api/scans \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -o /dev/null -w "Status: %{http_code}\n"
  sleep 0.1
done
```
**Expected**: 
- First 50 requests: `200 OK`
- Requests 51-60: `429 Too Many Requests`
- Response includes: "Rate limit exceeded"

**Check Rate Limit Headers**
```bash
curl -v http://localhost:5001/api/scans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" 2>&1 | grep -i "x-ratelimit"
```
**Expected Headers**:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 49
X-RateLimit-Reset: 1234567890
```

---

## 5️⃣ Test SQL Injection Prevention

### ✅ What to Test
SQL injection attempts are blocked.

### 🧪 Test Commands

**Test 1: SQL Injection in ID Parameter**
```bash
curl "http://localhost:5001/api/scans/1%20OR%201=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected**: `400 Bad Request` - "Invalid ID parameter"

**Test 2: SQL Injection in Scan ID**
```bash
curl "http://localhost:5001/api/scans/999';%20DROP%20TABLE%20users;--" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected**: `400 Bad Request` - "Invalid ID parameter"

**Test 3: Valid ID (Should Work)**
```bash
curl "http://localhost:5001/api/scans/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected**: `200 OK` or `404 Not Found` (but NOT a SQL error)

---

## 6️⃣ Test Input Sanitization (XSS Prevention)

### ✅ What to Test
HTML/JavaScript in inputs is sanitized.

### 🧪 Test Commands

**Test 1: XSS in Registration**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"<script>alert('xss')</script>@test.com\",\"password\":\"test12345\",\"role\":\"developer\"}"
```
**Expected**: `400 Bad Request` - Invalid email format (sanitized)

**Test 2: Check Database for Sanitized Data**
```bash
# After successful registration, check if data is sanitized
docker exec security-scanner-db psql -U postgres -d security_scanner \
  -c "SELECT email FROM users WHERE email LIKE '%script%';"
```
**Expected**: No results (scripts are removed)

---

## 7️⃣ Test Error Handling

### ✅ What to Test
Production mode hides stack traces.

### 🧪 Test Commands

**Test 1: Trigger Error in Development Mode**
```bash
# Current mode (development) - shows detailed errors
curl "http://localhost:5001/api/scans/invalid" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected**: Detailed error with stack trace (in development)

**Test 2: Switch to Production Mode**
```bash
# Stop containers
docker-compose down

# Update .env
docker exec security-scanner-backend sh -c "sed -i 's/NODE_ENV=development/NODE_ENV=production/' /app/.env"

# Restart
docker-compose up -d
```

**Test 3: Trigger Error in Production Mode**
```bash
curl "http://localhost:5001/api/scans/invalid" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
**Expected**: Generic error message, NO stack trace

---

## 8️⃣ Test Security Headers (Helmet)

### ✅ What to Test
Security headers are present in all responses.

### 🧪 Test Commands

```bash
curl -I http://localhost:5001/health
```

**Expected Headers**:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-XSS-Protection: 0
Content-Security-Policy: default-src 'self'; ...
```

---

## 9️⃣ Test File Upload Validation

### ✅ What to Test
Only allowed file types with size limits.

### 🧪 Test Commands

**Test 1: Upload Invalid File Type**
```bash
echo "test" > test.exe
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -F "file=@test.exe"
```
**Expected**: `400 Bad Request` - "File type not allowed"

**Test 2: Upload File Too Large**
```bash
# Create 15MB file (limit is 10MB)
dd if=/dev/zero of=large.pdf bs=1M count=15
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -F "file=@large.pdf"
```
**Expected**: `400 Bad Request` - "File size exceeds maximum"

**Test 3: Upload Valid File**
```bash
echo "test content" > test.txt
curl -X POST http://localhost:5001/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -F "file=@test.txt"
```
**Expected**: `200 OK` - File uploaded successfully

---

## 🔟 Test HTTPS/SSL (Optional - Production)

### ✅ What to Test
Server can run with HTTPS enabled.

### 🧪 Test Commands

**Step 1: Generate Self-Signed Certificate**
```bash
cd backend
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

**Step 2: Update .env**
```bash
ENABLE_HTTPS=true
SSL_KEY_PATH=/app/key.pem
SSL_CERT_PATH=/app/cert.pem
```

**Step 3: Restart Backend**
```bash
docker-compose restart backend
```

**Step 4: Test HTTPS**
```bash
curl -k https://localhost:5001/health
```
**Expected**: `200 OK` - Server responds via HTTPS

---

## 📊 Complete Test Script

Save this as `test-security.sh`:

```bash
#!/bin/bash

echo "🔒 Security Features Test Suite"
echo "================================"

BASE_URL="http://localhost:5001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Input Validation
echo -e "\n1️⃣ Testing Input Validation..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test","role":"developer"}')
if [ "$RESPONSE" = "400" ]; then
  echo -e "${GREEN}✓ Input validation working${NC}"
else
  echo -e "${RED}✗ Input validation failed${NC}"
fi

# Test 2: Register User
echo -e "\n2️⃣ Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"security-test@example.com","password":"test12345","role":"developer"}')
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✓ User registered, token obtained${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
fi

# Test 3: CSRF Protection
echo -e "\n3️⃣ Testing CSRF Protection..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/scans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"target":"http://localhost:8080"}')
if [ "$RESPONSE" = "403" ]; then
  echo -e "${GREEN}✓ CSRF protection working${NC}"
else
  echo -e "${RED}✗ CSRF protection failed${NC}"
fi

# Test 4: Get CSRF Token
echo -e "\n4️⃣ Getting CSRF Token..."
CSRF_RESPONSE=$(curl -s $BASE_URL/api/csrf-token \
  -H "Authorization: Bearer $TOKEN")
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$CSRF_TOKEN" ]; then
  echo -e "${GREEN}✓ CSRF token obtained${NC}"
else
  echo -e "${RED}✗ Failed to get CSRF token${NC}"
fi

# Test 5: SQL Injection Prevention
echo -e "\n5️⃣ Testing SQL Injection Prevention..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/scans/1%20OR%201=1" \
  -H "Authorization: Bearer $TOKEN")
if [ "$RESPONSE" = "400" ]; then
  echo -e "${GREEN}✓ SQL injection prevented${NC}"
else
  echo -e "${RED}✗ SQL injection test failed${NC}"
fi

# Test 6: Security Headers
echo -e "\n6️⃣ Testing Security Headers..."
HEADERS=$(curl -s -I $BASE_URL/health | grep -i "x-content-type-options")
if [ ! -z "$HEADERS" ]; then
  echo -e "${GREEN}✓ Security headers present${NC}"
else
  echo -e "${RED}✗ Security headers missing${NC}"
fi

# Test 7: Rate Limiting
echo -e "\n7️⃣ Testing Rate Limiting (making 55 requests)..."
COUNT=0
for i in {1..55}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/scans \
    -H "Authorization: Bearer $TOKEN")
  if [ "$RESPONSE" = "429" ]; then
    COUNT=$((COUNT + 1))
  fi
done
if [ $COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Rate limiting working (got $COUNT rate limit responses)${NC}"
else
  echo -e "${RED}✗ Rate limiting not triggered${NC}"
fi

echo -e "\n================================"
echo "🎉 Security test suite completed!"
```

**Run the test script**:
```bash
chmod +x test-security.sh
./test-security.sh
```

---

## 🎯 Quick Verification Checklist

- [ ] Backend starts without errors
- [ ] All 7 containers running (postgres, backend, frontend, zap, scanner, dvwa, vulnerable-app)
- [ ] Invalid email rejected (400)
- [ ] Short password rejected (400)
- [ ] POST without CSRF token rejected (403)
- [ ] POST with CSRF token succeeds (200)
- [ ] Rate limit triggers after 50 requests (429)
- [ ] SQL injection attempts blocked (400)
- [ ] Security headers present in responses
- [ ] Error messages don't expose stack traces in production

---

## 📝 Notes

- **Free Plan Limits**: 5 scans/day, 50 API requests/hour
- **CSRF Token**: Valid for 1 hour
- **JWT Token**: Check expiration in your implementation
- **File Upload**: Max 10MB, only PDF/JSON/TXT/CSV/XLSX

---

## 🆘 Troubleshooting

**Issue**: CSRF token not working
- **Solution**: Make sure you're including the token in `X-CSRF-Token` header

**Issue**: Rate limit not triggering
- **Solution**: Wait 1 hour for rate limit to reset, or restart backend

**Issue**: SQL injection test passes
- **Solution**: Check that SQLHelper.validateId() is being called in routes

**Issue**: Security headers missing
- **Solution**: Verify @fastify/helmet is installed and registered

---

## ✅ All Tests Passing?

Congratulations! Your backend is now secured with:
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ SQL injection prevention
- ✅ Input sanitization
- ✅ Proper error handling
- ✅ Security headers
- ✅ File upload validation
- ✅ HTTPS support (optional)

**Your application is production-ready! 🚀**
