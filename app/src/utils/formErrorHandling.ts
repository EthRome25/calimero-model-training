import { ZodError } from 'zod';

export const formatZodError = (error: ZodError): string[] => {
  return error.errors.map((err) => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
};

export const formatFormError = (error: any): string => {
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    // Handle Zod errors with issues array - show only first error
    if (error.issues && Array.isArray(error.issues)) {
      const firstIssue = error.issues[0];
      if (typeof firstIssue === 'string') return firstIssue;
      if (firstIssue.message) return firstIssue.message;
      return JSON.stringify(firstIssue);
    }
    
    // Handle Zod errors with errors array - show only first error
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0];
      if (typeof firstError === 'string') return firstError;
      if (firstError.message) return firstError.message;
      if (firstError.code) return `${firstError.code}: ${firstError.message || 'Validation error'}`;
      return JSON.stringify(firstError);
    }
    
    // Handle TanStack Form errors
    if (error.message) {
      return error.message;
    }
    
    // Handle validation errors with path
    if (error.path && error.message) {
      return `${error.path}: ${error.message}`;
    }
    
    // Handle simple objects with message property
    if (error.message) {
      return error.message;
    }
    
    // Try to extract any meaningful information
    const keys = Object.keys(error);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const firstValue = error[firstKey];
      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }
    
    // Fallback to JSON stringify for debugging
    return JSON.stringify(error, null, 2);
  }
  
  return 'An unknown error occurred';
};

export const formatFormErrors = (errors: any[]): string[] => {
  return errors.map(formatFormError);
};
