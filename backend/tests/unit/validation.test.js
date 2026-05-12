const { validator, validateInput, schemas } = require('../../middlewares/validation');

describe('Validation Middleware', () => {
  describe('validator.sanitizeString', () => {
    it('should trim and limit string length', () => {
      const result = validator.sanitizeString('  test string  ', 10);
      expect(result).toBe('test strin');
    });

    it('should return empty string for null input', () => {
      const result = validator.sanitizeString(null, 10);
      expect(result).toBe('');
    });

    it('should handle strings shorter than max length', () => {
      const result = validator.sanitizeString('short', 100);
      expect(result).toBe('short');
    });
  });

  describe('validator.sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      const result = validator.sanitizeHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle ampersands', () => {
      const result = validator.sanitizeHtml('Tom & Jerry');
      expect(result).toBe('Tom &amp; Jerry');
    });

    it('should handle quotes', () => {
      const result = validator.sanitizeHtml('Say "hello"');
      expect(result).toContain('&quot;');
    });
  });

  describe('validator.isValidEmail', () => {
    it('should validate correct email', () => {
      expect(validator.isValidEmail('test@example.com')).toBe(true);
      expect(validator.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validator.isValidEmail('invalid')).toBe(false);
      expect(validator.isValidEmail('test@')).toBe(false);
      expect(validator.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('validator.isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(validator.isValidUrl('http://example.com')).toBe(true);
      expect(validator.isValidUrl('https://test.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validator.isValidUrl('not-a-url')).toBe(false);
      expect(validator.isValidUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('validateInput', () => {
    it('should create validation middleware', () => {
      const middleware = validateInput(schemas.createScan);
      expect(typeof middleware).toBe('function');
    });

    it('should validate request body', async () => {
      const mockRequest = {
        body: { target: 'http://example.com', scanType: 'zap' }
      };
      const mockReply = {
        code: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const middleware = validateInput(schemas.createScan);
      await middleware(mockRequest, mockReply);

      expect(mockReply.code).not.toHaveBeenCalled();
    });
  });

  describe('schemas', () => {
    it('should have createScan schema', () => {
      expect(schemas.createScan).toBeDefined();
      expect(schemas.createScan.body).toBeDefined();
    });

    it('should have login schema', () => {
      expect(schemas.login).toBeDefined();
      expect(schemas.login.body).toBeDefined();
    });

    it('should have register schema', () => {
      expect(schemas.register).toBeDefined();
      expect(schemas.register.body).toBeDefined();
    });
  });
});
