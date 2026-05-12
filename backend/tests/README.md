# Test Suite Documentation

## Overview
Comprehensive test suite for the Security Scanner application covering unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── Scan.test.js        # Scan model tests
│   ├── Vulnerability.test.js # Vulnerability model tests
│   ├── aiClassifier.test.js # AI Classifier service tests
│   └── validation.test.js   # Validation middleware tests
├── integration/             # Integration tests for API endpoints
│   ├── auth.test.js        # Authentication API tests
│   ├── scans.test.js       # Scans API tests
│   └── vulnerabilities.test.js # Vulnerabilities API tests
└── e2e/                     # End-to-end workflow tests
    ├── scan-workflow.test.js # Complete scan workflow
    └── admin-workflow.test.js # Admin workflow tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Verbose Output
```bash
npm run test:verbose
```

## Test Coverage

### Current Coverage Targets
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

### Coverage by Component

#### Models (Unit Tests)
- ✅ Scan Model
  - create()
  - findByUserId()
  - findById()
  - updateStatus()
  - delete()

- ✅ Vulnerability Model
  - create()
  - findByScanId()
  - findByUserId()
  - findById()
  - updateWithAI()

#### Services (Unit Tests)
- ✅ AI Classifier
  - Constructor initialization
  - classifyVulnerability()
  - Retry logic on 500 errors
  - Error handling (ECONNREFUSED, 404, timeout)

#### Middlewares (Unit Tests)
- ✅ Validation
  - sanitizeString()
  - sanitizeHtml()
  - isValidEmail()
  - isValidUrl()
  - validateInput()
  - Schemas validation

#### API Endpoints (Integration Tests)

**Authentication**
- ✅ POST /api/auth/register
- ✅ POST /api/auth/login
- ✅ POST /api/auth/forgot-password
- ✅ POST /api/auth/reset-password

**Scans**
- ✅ GET /api/scans
- ✅ POST /api/scans
- ✅ GET /api/scans/:id
- ✅ GET /api/scans/:id/progress
- ✅ DELETE /api/scans/:id
- ✅ POST /api/scans/:id/pause
- ✅ POST /api/scans/:id/resume
- ✅ POST /api/scans/:id/stop
- ✅ POST /api/scans/:id/rerun

**Vulnerabilities**
- ✅ GET /api/vulnerabilities
- ✅ GET /api/scans/:scanId/vulnerabilities
- ✅ GET /api/vulnerabilities/:id
- ✅ AI Classification verification
- ✅ Vulnerability statistics

#### Workflows (E2E Tests)

**User Workflow**
- ✅ User registration
- ✅ User login
- ✅ Create scan
- ✅ Track scan progress
- ✅ View vulnerabilities with AI classification
- ✅ Manage scans (pause, resume, rerun, delete)
- ✅ Dashboard statistics

**Admin Workflow**
- ✅ Admin authentication
- ✅ Admin dashboard stats
- ✅ User management
- ✅ System-wide scan management
- ✅ AI classification statistics
- ✅ Notifications management
- ✅ Settings management

## Test Features

### Unit Tests
- **Mocking**: All external dependencies are mocked
- **Isolation**: Each test is independent
- **Fast**: Run in milliseconds
- **Coverage**: Focus on individual function logic

### Integration Tests
- **API Testing**: Test actual API endpoints
- **Database Mocking**: Mock database connections
- **Authentication**: Test JWT authentication
- **Validation**: Test input validation
- **Error Handling**: Test error responses

### E2E Tests
- **Complete Workflows**: Test entire user journeys
- **Real Scenarios**: Simulate actual user behavior
- **AI Verification**: Verify AI classification works
- **Multi-step**: Test complex interactions

## Key Test Scenarios

### AI Classification Testing
```javascript
// Verify AI classification accuracy
- SQL Injection → 'SQL Injection' (confidence > 0.4)
- XSS → 'Cross-Site Scripting (XSS)' (confidence > 0.25)
- Path Traversal → 'Path Traversal' (confidence > 0.27)

// Verify classification rate
- At least 80% of vulnerabilities should be AI classified
```

### Security Testing
```javascript
// Authentication
- Reject unauthenticated requests
- Validate JWT tokens
- Enforce role-based access control

// Input Validation
- Sanitize HTML/SQL injection attempts
- Validate email formats
- Validate URL formats
- Enforce string length limits
```

### Performance Testing
```javascript
// Scan Limits
- Free users: 3 scans per month
- Rate limiting: Prevent abuse
- Concurrent scans: Manage resources
```

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Best Practices

1. **Write Tests First**: TDD approach when adding new features
2. **Keep Tests Simple**: One assertion per test when possible
3. **Use Descriptive Names**: Test names should explain what they test
4. **Mock External Services**: Don't rely on external APIs in tests
5. **Clean Up**: Always clean up test data after tests
6. **Run Tests Often**: Run tests before committing code

## Troubleshooting

### Tests Failing
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests in verbose mode
npm run test:verbose

# Run specific test file
npx jest tests/unit/Scan.test.js
```

### Coverage Not Generated
```bash
# Ensure coverage directory exists
mkdir -p coverage

# Run with coverage flag
npm run test:coverage
```

## Future Enhancements

- [ ] Add performance benchmarking tests
- [ ] Add load testing for concurrent scans
- [ ] Add security penetration tests
- [ ] Add visual regression tests for frontend
- [ ] Add mutation testing
- [ ] Increase coverage to 80%+

## Contributing

When adding new features:
1. Write unit tests for new functions
2. Write integration tests for new API endpoints
3. Update E2E tests if workflow changes
4. Ensure all tests pass before submitting PR
5. Maintain or improve code coverage

## Test Results Summary

```
Test Suites: 9 passed, 9 total
Tests:       100+ passed, 100+ total
Coverage:    50%+ (branches, functions, lines, statements)
Time:        ~30s
```

## Contact

For questions about tests, contact the development team.
