const axios = require('axios');

class AIClassifier {
  constructor(colabUrl) {
    this.colabUrl = colabUrl;
    if (this.colabUrl) {
      console.log(`✅ AI Classifier ready with Colab endpoint: ${this.colabUrl}`);
    } else {
      console.warn('⚠️  COLAB_URL not configured - AI classification will be skipped');
    }
  }

  async classifyVulnerability(vulnerabilityText, retries = 2) {
    try {
      if (!this.colabUrl) {
        return null;
      }

      if (!vulnerabilityText) {
        return null;
      }

      console.log(`🔄 Sending to AI: ${vulnerabilityText.substring(0, 50)}...`);

      const response = await axios.post(
        `${this.colabUrl}/classify`,
        { text: vulnerabilityText },
        {
          timeout: 30000, // 30 seconds timeout
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'ngrok-skip-browser-warning': 'true'
          },
          maxRedirects: 5
        }
      );

      console.log(`✅ AI Response received:`, response.data);

      return {
        type: response.data.vulnerability_type || response.data.type,
        confidence: response.data.confidence || 0.85,
        allResults: response.data.all_results || response.data.results
      };
    } catch (error) {
      // Retry logic for 500 errors
      if (error.response?.status === 500 && retries > 0) {
        console.warn(`⚠️  AI returned 500 error, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return this.classifyVulnerability(vulnerabilityText, retries - 1);
      }
      
      if (error.code === 'ECONNREFUSED') {
        console.warn(`⚠️  Cannot connect to Colab endpoint: ${this.colabUrl}`);
        console.warn('   Make sure the Colab notebook is running and the ngrok URL is correct');
      } else if (error.response?.status === 404) {
        console.warn(`⚠️  Colab endpoint not found. Check if /classify endpoint exists`);
      } else if (error.response?.status === 500) {
        console.warn(`⚠️  AI Classification failed after retries: Colab server error (500)`);
      } else if (error.code === 'ENOTFOUND') {
        console.warn(`⚠️  Colab URL is invalid or unreachable: ${this.colabUrl}`);
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        console.warn(`⚠️  AI Classification timeout - Colab is taking too long to respond`);
      } else {
        console.warn(`⚠️ AI Classification error: ${error.message}`);
      }
      return null;
    }
  }
}

module.exports = AIClassifier;
