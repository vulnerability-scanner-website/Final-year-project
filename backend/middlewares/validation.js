const validator = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  url: (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },

  uuid: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },

  integer: (value) => {
    return Number.isInteger(Number(value)) && Number(value) > 0;
  },

  sanitizeString: (str, maxLength = 255) => {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, maxLength).replace(/[<>]/g, '');
  },

  sanitizeHtml: (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
};

const schemas = {
  register: {
    type: 'object',
    required: ['email', 'password', 'role'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 8, maxLength: 128 },
      role: { type: 'string', enum: ['developer', 'analyst'] }
    }
  },

  login: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      password: { type: 'string', minLength: 1, maxLength: 128 }
    }
  },

  createScan: {
    type: 'object',
    required: ['target'],
    properties: {
      target: { type: 'string', format: 'uri', maxLength: 500 },
      scanType: { type: 'string', enum: ['zap', 'nuclei', 'nikto', 'full'] }
    }
  },

  updateUser: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      role: { type: 'string', enum: ['developer', 'analyst', 'admin'] },
      status: { type: 'string', enum: ['active', 'pending', 'suspended'] }
    }
  },

  createReport: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      type: { type: 'string', enum: ['pdf', 'json', 'csv'] },
      subtype: { type: 'string', maxLength: 100 }
    }
  },

  idParam: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', pattern: '^[0-9]+$' }
    }
  }
};

const validateInput = (schema) => {
  return async (request, reply) => {
    try {
      const data = request.body || request.params || request.query;
      
      if (!data || typeof data !== 'object') {
        return reply.code(400).send({ error: 'Invalid request data' });
      }

      // Check required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (!(field in data) || data[field] === null || data[field] === undefined || data[field] === '') {
            return reply.code(400).send({ error: `Missing required field: ${field}` });
          }
        }
      }

      // Validate each property
      for (const [key, rules] of Object.entries(schema.properties || {})) {
        const value = data[key];
        
        if (value === undefined || value === null) continue;

        // Type validation
        if (rules.type === 'string' && typeof value !== 'string') {
          return reply.code(400).send({ error: `${key} must be a string` });
        }
        if (rules.type === 'number' && typeof value !== 'number') {
          return reply.code(400).send({ error: `${key} must be a number` });
        }

        // String validations
        if (rules.type === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            return reply.code(400).send({ error: `${key} must be at least ${rules.minLength} characters` });
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            return reply.code(400).send({ error: `${key} must not exceed ${rules.maxLength} characters` });
          }
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
            return reply.code(400).send({ error: `${key} has invalid format` });
          }
          if (rules.format === 'email' && !validator.email(value)) {
            return reply.code(400).send({ error: `${key} must be a valid email` });
          }
          if (rules.format === 'uri' && !validator.url(value)) {
            return reply.code(400).send({ error: `${key} must be a valid URL` });
          }
          if (rules.enum && !rules.enum.includes(value)) {
            return reply.code(400).send({ error: `${key} must be one of: ${rules.enum.join(', ')}` });
          }
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      return reply.code(400).send({ error: 'Validation failed' });
    }
  };
};

module.exports = { validator, schemas, validateInput };
