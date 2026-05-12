const AIClassifier = require('../../services/aiClassifier');
const axios = require('axios');

jest.mock('axios');

describe('AIClassifier', () => {
  let aiClassifier;
  const mockColabUrl = 'https://test-colab.ngrok.io';

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
  });

  describe('constructor', () => {
    it('should initialize with Colab URL', () => {
      aiClassifier = new AIClassifier(mockColabUrl);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('AI Classifier ready')
      );
    });

    it('should warn when no Colab URL provided', () => {
      aiClassifier = new AIClassifier(null);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('COLAB_URL not configured')
      );
    });
  });

  describe('classifyVulnerability', () => {
    beforeEach(() => {
      aiClassifier = new AIClassifier(mockColabUrl);
    });

    it('should classify vulnerability successfully', async () => {
      const mockResponse = {
        data: {
          vulnerability_type: 'SQL Injection',
          confidence: 0.95,
          all_results: {
            types: ['SQL Injection', 'XSS'],
            scores: [0.95, 0.05]
          }
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await aiClassifier.classifyVulnerability('SQL Injection found');

      expect(axios.post).toHaveBeenCalledWith(
        `${mockColabUrl}/classify`,
        { text: 'SQL Injection found' },
        expect.objectContaining({
          timeout: 30000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        type: 'SQL Injection',
        confidence: 0.95,
        allResults: mockResponse.data.all_results
      });
    });

    it('should return null when no Colab URL', async () => {
      const noUrlClassifier = new AIClassifier(null);
      const result = await noUrlClassifier.classifyVulnerability('test');
      expect(result).toBeNull();
    });

    it('should return null when no text provided', async () => {
      const result = await aiClassifier.classifyVulnerability('');
      expect(result).toBeNull();
    });

    it('should retry on 500 error', async () => {
      const error500 = {
        response: { status: 500 }
      };

      const mockResponse = {
        data: {
          vulnerability_type: 'XSS',
          confidence: 0.85
        }
      };

      axios.post
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce(mockResponse);

      const result = await aiClassifier.classifyVulnerability('XSS found');

      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(result.type).toBe('XSS');
    });

    it('should handle connection refused error', async () => {
      axios.post.mockRejectedValue({ code: 'ECONNREFUSED' });

      const result = await aiClassifier.classifyVulnerability('test');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Cannot connect to Colab endpoint')
      );
      expect(result).toBeNull();
    });

    it('should handle 404 error', async () => {
      axios.post.mockRejectedValue({ response: { status: 404 } });

      const result = await aiClassifier.classifyVulnerability('test');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Colab endpoint not found')
      );
      expect(result).toBeNull();
    });

    it('should handle timeout error', async () => {
      axios.post.mockRejectedValue({ code: 'ETIMEDOUT' });

      const result = await aiClassifier.classifyVulnerability('test');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('AI Classification timeout')
      );
      expect(result).toBeNull();
    });

    it('should exhaust retries on persistent 500 errors', async () => {
      const error500 = { response: { status: 500 } };
      axios.post.mockRejectedValue(error500);

      const result = await aiClassifier.classifyVulnerability('test');

      expect(axios.post).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(result).toBeNull();
    });
  });
});
