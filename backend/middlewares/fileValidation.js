const path = require('path');

const ALLOWED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'application/json': ['.json'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default

const validateFile = async (data, request) => {
  const filename = data.filename;
  const mimetype = data.mimetype;
  
  // Check if file has a name
  if (!filename) {
    throw new Error('File name is required');
  }

  // Sanitize filename - remove path traversal attempts
  const sanitizedFilename = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Check file extension
  const ext = path.extname(sanitizedFilename).toLowerCase();
  const allowedExtensions = Object.values(ALLOWED_MIME_TYPES).flat();
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`);
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES[mimetype]) {
    throw new Error(`MIME type not allowed: ${mimetype}`);
  }

  // Verify extension matches MIME type
  if (!ALLOWED_MIME_TYPES[mimetype].includes(ext)) {
    throw new Error('File extension does not match MIME type');
  }

  // Check file size
  const buffer = await data.toBuffer();
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check for malicious content patterns
  const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 1024));
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // event handlers
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(content)) {
      throw new Error('File contains potentially malicious content');
    }
  }

  return {
    buffer,
    filename: sanitizedFilename,
    mimetype,
    size: buffer.length
  };
};

const multipartOptions = {
  limits: {
    fieldNameSize: 100,
    fieldSize: MAX_FILE_SIZE,
    fields: 10,
    fileSize: MAX_FILE_SIZE,
    files: 1,
    headerPairs: 2000
  },
  attachFieldsToBody: true
};

module.exports = { validateFile, multipartOptions, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
