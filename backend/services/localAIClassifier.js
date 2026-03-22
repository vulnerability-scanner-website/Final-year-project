class LocalAIClassifier {
  constructor() {
    this.patterns = {
      'SQL Injection': {
        keywords: ['sql', 'injection', 'query', 'database', 'select', 'insert', 'update', 'delete', 'where'],
        confidence: 0.95
      },
      'Cross-Site Scripting': {
        keywords: ['xss', 'script', 'javascript', 'html', 'dom', 'reflected', 'stored', 'alert'],
        confidence: 0.92
      },
      'Command Injection': {
        keywords: ['command', 'injection', 'shell', 'exec', 'system', 'os', 'process', 'bash'],
        confidence: 0.90
      },
      'Path Traversal': {
        keywords: ['path', 'traversal', 'directory', 'file', 'lfi', 'rfi', 'include', 'require', 'etc/passwd'],
        confidence: 0.88
      },
      'LDAP Injection': {
        keywords: ['ldap', 'injection', 'filter', 'directory', 'bind'],
        confidence: 0.85
      },
      'XML External Entity': {
        keywords: ['xxe', 'xml', 'entity', 'external', 'dtd', 'doctype'],
        confidence: 0.87
      },
      'Insecure Deserialization': {
        keywords: ['deserialization', 'serialize', 'unserialize', 'pickle', 'marshal', 'object'],
        confidence: 0.86
      },
      'Open Redirect': {
        keywords: ['redirect', 'open', 'url', 'location', 'forward', 'goto'],
        confidence: 0.84
      },
      'SSRF': {
        keywords: ['ssrf', 'server-side', 'request', 'forgery', 'url', 'fetch', 'curl', 'http'],
        confidence: 0.83
      },
      'CSRF': {
        keywords: ['csrf', 'cross-site', 'request', 'forgery', 'token', 'state'],
        confidence: 0.81
      },
      'Weak Cryptography': {
        keywords: ['weak', 'crypto', 'md5', 'sha1', 'encryption', 'hash', 'password', 'algorithm'],
        confidence: 0.80
      },
      'Insecure Cookie': {
        keywords: ['cookie', 'secure', 'httponly', 'samesite', 'session', 'flag'],
        confidence: 0.79
      },
      'Missing Security Header': {
        keywords: ['header', 'security', 'x-frame', 'csp', 'hsts', 'x-content', 'missing'],
        confidence: 0.78
      },
      'Information Disclosure': {
        keywords: ['information', 'disclosure', 'expose', 'leak', 'sensitive', 'debug', 'error', 'stack'],
        confidence: 0.77
      },
      'IDOR': {
        keywords: ['idor', 'insecure', 'direct', 'object', 'reference', 'authorization', 'access'],
        confidence: 0.76
      }
    };
  }

  async classifyVulnerability(vulnerabilityText) {
    try {
      if (!vulnerabilityText) {
        return null;
      }

      const text = vulnerabilityText.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;

      // Score each pattern
      for (const [vulnType, pattern] of Object.entries(this.patterns)) {
        let score = 0;
        
        // Check keyword matches
        for (const keyword of pattern.keywords) {
          if (text.includes(keyword)) {
            score += 1;
          }
        }

        // Normalize score
        const normalizedScore = (score / pattern.keywords.length) * pattern.confidence;

        if (normalizedScore > highestScore) {
          highestScore = normalizedScore;
          bestMatch = {
            type: vulnType,
            confidence: Math.min(normalizedScore, 0.99)
          };
        }
      }

      if (bestMatch && highestScore > 0.3) {
        console.log(`✓ AI: ${bestMatch.type} (${Math.round(bestMatch.confidence * 100)}%)`);
        return bestMatch;
      }

      return null;
    } catch (error) {
      console.error('Local AI Classification error:', error.message);
      return null;
    }
  }
}

module.exports = LocalAIClassifier;
