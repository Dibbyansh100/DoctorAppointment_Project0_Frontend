/**
 * Parses Spring Boot RFC 7807 ProblemDetail responses and Axios network errors.
 * 
 * Backend Error Response Structure:
 * {
 *   "type": "about:blank",
 *   "title": "Validation Failed" | "Resource Not Found" | "Business Rule Violation" | "Duplicate Resource",
 *   "status": 400 | 404 | 409 | 500,
 *   "detail": "Descriptive message",
 *   "instance": "/api/v1/...",
 *   "timestamp": "2026-11-04T05:30:00Z",
 *   "errors": { "fieldName": "Error message" } // on validation failure
 * }
 */
export function parseApiError(error) {
  if (!error) {
    return {
      message: 'An unknown error occurred.',
      fieldErrors: {},
      status: 500,
      title: 'Error',
    };
  }

  // Handle network or connection failures (backend offline)
  if (!error.response) {
    return {
      message: error.message === 'Network Error'
        ? 'Cannot connect to backend server. Please verify Spring Boot is running on port 8079.'
        : error.message || 'Network request failed.',
      fieldErrors: {},
      status: 0,
      title: 'Connection Error',
    };
  }

  const { data, status } = error.response;

  // Spring Boot ProblemDetail payload
  if (data && typeof data === 'object') {
    const title = data.title || (status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'Error');
    const detail = data.detail || data.message || 'Operation failed.';
    const fieldErrors = data.errors || {};

    return {
      message: detail,
      fieldErrors,
      status,
      title,
    };
  }

  // Fallback for plain string or unexpected response bodies
  return {
    message: typeof data === 'string' ? data : error.message || 'Server returned an error.',
    fieldErrors: {},
    status,
    title: `Error ${status}`,
  };
}
