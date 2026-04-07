const errorHandler = (error, request, reply) => {
  // Log full error details for debugging (server-side only)
  console.error('Error occurred:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: request.url,
    method: request.method,
    userId: request.user?.id,
    timestamp: new Date().toISOString()
  });

  // Determine status code
  let statusCode = error.statusCode || error.status || 500;
  
  // Handle specific error types
  if (error.validation) {
    statusCode = 400;
  } else if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    statusCode = 401;
  } else if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
    statusCode = 401;
  } else if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    statusCode = 401;
  }

  // Prepare safe error response (no stack traces in production)
  const errorResponse = {
    error: true,
    message: getErrorMessage(error, statusCode),
    statusCode,
    timestamp: new Date().toISOString()
  };

  // Add validation details if available
  if (error.validation) {
    errorResponse.validation = error.validation;
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = error.message;
  }

  reply.code(statusCode).send(errorResponse);
};

function getErrorMessage(error, statusCode) {
  // Return safe, generic messages in production
  if (process.env.NODE_ENV === 'production') {
    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 409:
        return 'Conflict';
      case 429:
        return 'Too Many Requests';
      case 500:
        return 'Internal Server Error';
      default:
        return 'An error occurred';
    }
  }

  // In development, return actual error message
  return error.message || 'An error occurred';
}

module.exports = { errorHandler };
