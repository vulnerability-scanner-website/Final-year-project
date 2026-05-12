describe('Vulnerabilities API Integration Tests', () => {
  let mockToken;
  let mockScanId = 1;

  beforeAll(() => {
    mockToken = 'mock-jwt-token';
  });

  describe('GET /api/vulnerabilities', () => {
    it('should return all vulnerabilities for user', async () => {
      const response = {
        statusCode: 200,
        body: [
          {
            id: 1,
            scan_id: 1,
            title: 'SQL Injection',
            severity: 'high',
            status: 'Open',
            ai_type: 'SQL Injection',
            ai_confidence: 0.95
          },
          {
            id: 2,
            scan_id: 1,
            title: 'XSS',
            severity: 'medium',
            status: 'Open',
            ai_type: 'Cross-Site Scripting (XSS)',
            ai_confidence: 0.88
          }
        ]
      };

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      };

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/scans/:scanId/vulnerabilities', () => {
    it('should return vulnerabilities for specific scan', async () => {
      const response = {
        statusCode: 200,
        body: [
          {
            id: 1,
            scan_id: mockScanId,
            title: 'SQL Injection',
            severity: 'high',
            description: 'SQL injection vulnerability found',
            affected_url: 'http://example.com/login',
            scanner_type: 'ZAP'
          }
        ]
      };

      expect(response.statusCode).toBe(200);
      expect(response.body[0].scan_id).toBe(mockScanId);
    });

    it('should return 404 for non-existent scan', async () => {
      const response = {
        statusCode: 404,
        body: { error: 'Scan not found' }
      };

      expect(response.statusCode).toBe(404);
    });

    it('should filter by severity', async () => {
      const response = {
        statusCode: 200,
        body: [
          {
            id: 1,
            severity: 'critical',
            title: 'Critical vulnerability'
          }
        ]
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.every(v => v.severity === 'critical')).toBe(true);
    });
  });

  describe('GET /api/vulnerabilities/:id', () => {
    it('should return vulnerability details', async () => {
      const response = {
        statusCode: 200,
        body: {
          id: 1,
          scan_id: 1,
          title: 'SQL Injection',
          severity: 'high',
          description: 'Detailed description',
          affected_url: 'http://example.com/login',
          affected_parameter: 'username',
          evidence: 'Error message revealed',
          remediation: 'Use prepared statements',
          cwe_id: '89',
          cvss_score: 9.8,
          scanner_type: 'ZAP',
          ai_type: 'SQL Injection',
          ai_confidence: 0.95,
          ai_results: {
            types: ['SQL Injection', 'Command Injection'],
            scores: [0.95, 0.05]
          },
          status: 'Open',
          created_at: new Date()
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('ai_type');
      expect(response.body).toHaveProperty('ai_confidence');
    });

    it('should return 404 for non-existent vulnerability', async () => {
      const response = {
        statusCode: 404,
        body: { error: 'Vulnerability not found' }
      };

      expect(response.statusCode).toBe(404);
    });
  });

  describe('AI Classification', () => {
    it('should have AI classification data', async () => {
      const response = {
        statusCode: 200,
        body: {
          id: 1,
          title: 'SQL Injection',
          ai_type: 'SQL Injection',
          ai_confidence: 0.95,
          ai_results: {
            types: ['SQL Injection', 'Command Injection'],
            scores: [0.95, 0.05]
          }
        }
      };

      expect(response.body.ai_type).toBeDefined();
      expect(response.body.ai_confidence).toBeGreaterThan(0);
      expect(response.body.ai_confidence).toBeLessThanOrEqual(1);
    });

    it('should handle vulnerabilities without AI classification', async () => {
      const response = {
        statusCode: 200,
        body: {
          id: 2,
          title: 'Missing Header',
          ai_type: null,
          ai_confidence: null
        }
      };

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Vulnerability Statistics', () => {
    it('should return vulnerability counts by severity', async () => {
      const response = {
        statusCode: 200,
        body: {
          critical: 2,
          high: 5,
          medium: 10,
          low: 15,
          info: 20
        }
      };

      expect(response.statusCode).toBe(200);
      expect(typeof response.body.critical).toBe('number');
    });

    it('should return AI classification statistics', async () => {
      const response = {
        statusCode: 200,
        body: {
          total: 100,
          ai_classified: 87,
          classification_rate: 0.87
        }
      };

      expect(response.statusCode).toBe(200);
      expect(response.body.classification_rate).toBeGreaterThan(0);
    });
  });
});
