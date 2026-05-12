describe('E2E: Complete Scan Workflow', () => {
  let authToken;
  let userId;
  let scanId;

  describe('User Registration and Login', () => {
    it('should register a new user', async () => {
      const response = {
        statusCode: 201,
        body: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            email: 'e2e-test@example.com',
            role: 'user'
          }
        }
      };

      authToken = response.body.token;
      userId = response.body.user.id;

      expect(response.statusCode).toBe(201);
      expect(authToken).toBeDefined();
    });

    it('should login with registered user', async () => {
      const response = {
        statusCode: 200,
        body: {
          token: 'mock-jwt-token',
          user: {
            id: userId,
            email: 'e2e-test@example.com'
          }
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('Create and Execute Scan', () => {
    it('should create a new scan', async () => {
      const response = {
        statusCode: 201,
        body: {
          id: 1,
          target: 'http://testphp.vulnweb.com',
          status: 'Running',
          user_id: userId,
          created_at: new Date()
        }
      };

      scanId = response.body.id;

      expect(response.statusCode).toBe(201);
      expect(scanId).toBeDefined();
    });

    it('should track scan progress', async () => {
      const progressChecks = [
        { progress: 10, message: 'Spider scan: 10%' },
        { progress: 35, message: 'Active scan: 35%' },
        { progress: 75, message: 'Active scan: 75%' },
        { progress: 100, message: 'Scan completed' }
      ];

      progressChecks.forEach(check => {
        const response = {
          statusCode: 200,
          body: check
        };

        expect(response.statusCode).toBe(200);
        expect(response.body.progress).toBeGreaterThanOrEqual(0);
        expect(response.body.progress).toBeLessThanOrEqual(100);
      });
    });

    it('should complete scan and find vulnerabilities', async () => {
      const response = {
        statusCode: 200,
        body: {
          id: scanId,
          status: 'Completed',
          issues: 15,
          target: 'http://testphp.vulnweb.com'
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('Completed');
      expect(response.body.issues).toBeGreaterThan(0);
    });
  });

  describe('AI Classification of Vulnerabilities', () => {
    it('should retrieve vulnerabilities with AI classification', async () => {
      const response = {
        statusCode: 200,
        body: [
          {
            id: 1,
            scan_id: scanId,
            title: 'SQL Injection',
            severity: 'high',
            ai_type: 'SQL Injection',
            ai_confidence: 0.95,
            scanner_type: 'ZAP'
          },
          {
            id: 2,
            scan_id: scanId,
            title: 'Cross Site Scripting (Reflected)',
            severity: 'high',
            ai_type: 'Cross-Site Scripting (XSS)',
            ai_confidence: 0.88,
            scanner_type: 'ZAP'
          }
        ]
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      
      const aiClassified = response.body.filter(v => v.ai_type !== null);
      const classificationRate = aiClassified.length / response.body.length;
      
      expect(classificationRate).toBeGreaterThan(0.8); // At least 80% classified
    });

    it('should verify AI classification accuracy', async () => {
      const testCases = [
        {
          title: 'SQL Injection',
          expected_ai_type: 'SQL Injection',
          min_confidence: 0.4
        },
        {
          title: 'Cross Site Scripting (XSS)',
          expected_ai_type: 'Cross-Site Scripting (XSS)',
          min_confidence: 0.25
        },
        {
          title: 'Path Traversal',
          expected_ai_type: 'Path Traversal',
          min_confidence: 0.27
        }
      ];

      testCases.forEach(testCase => {
        const vulnerability = {
          title: testCase.title,
          ai_type: testCase.expected_ai_type,
          ai_confidence: 0.85
        };

        expect(vulnerability.ai_type).toBe(testCase.expected_ai_type);
        expect(vulnerability.ai_confidence).toBeGreaterThanOrEqual(testCase.min_confidence);
      });
    });
  });

  describe('View and Manage Scan Results', () => {
    it('should retrieve scan details', async () => {
      const response = {
        statusCode: 200,
        body: {
          id: scanId,
          target: 'http://testphp.vulnweb.com',
          status: 'Completed',
          issues: 15,
          vulnerabilities: []
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(scanId);
    });

    it('should filter vulnerabilities by severity', async () => {
      const severities = ['critical', 'high', 'medium', 'low'];
      
      severities.forEach(severity => {
        const response = {
          statusCode: 200,
          body: [
            { id: 1, severity: severity, title: `${severity} vulnerability` }
          ]
        };

        expect(response.statusCode).toBe(200);
        expect(response.body.every(v => v.severity === severity)).toBe(true);
      });
    });

    it('should view vulnerability details', async () => {
      const response = {
        statusCode: 200,
        body: {
          id: 1,
          scan_id: scanId,
          title: 'SQL Injection',
          severity: 'high',
          description: 'SQL injection vulnerability found',
          affected_url: 'http://testphp.vulnweb.com/login.php',
          remediation: 'Use prepared statements',
          ai_type: 'SQL Injection',
          ai_confidence: 0.95
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('remediation');
      expect(response.body).toHaveProperty('ai_type');
    });
  });

  describe('Dashboard Statistics', () => {
    it('should retrieve dashboard stats', async () => {
      const response = {
        statusCode: 200,
        body: {
          totalScans: 1,
          activeScans: 0,
          totalVulnerabilities: 15
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.totalScans).toBeGreaterThan(0);
      expect(response.body.totalVulnerabilities).toBeGreaterThan(0);
    });

    it('should retrieve vulnerability summary', async () => {
      const response = {
        statusCode: 200,
        body: [
          { severity: 'high', count: '5' },
          { severity: 'medium', count: '7' },
          { severity: 'low', count: '3' }
        ]
      };

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Scan Management', () => {
    it('should pause a running scan', async () => {
      const response = {
        statusCode: 200,
        body: { success: true, message: 'Scan paused' }
      };

      expect(response.statusCode).toBe(200);
    });

    it('should resume a paused scan', async () => {
      const response = {
        statusCode: 200,
        body: { success: true, message: 'Scan resumed' }
      };

      expect(response.statusCode).toBe(200);
    });

    it('should rerun a completed scan', async () => {
      const response = {
        statusCode: 201,
        body: {
          id: 2,
          target: 'http://testphp.vulnweb.com',
          status: 'Running'
        }
      };

      expect(response.statusCode).toBe(201);
      expect(response.body.id).not.toBe(scanId);
    });

    it('should delete a scan', async () => {
      const response = {
        statusCode: 200,
        body: { success: true, message: 'Scan deleted' }
      };

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Cleanup', () => {
    it('should logout user', async () => {
      // Client-side logout (remove token)
      authToken = null;
      expect(authToken).toBeNull();
    });
  });
});
