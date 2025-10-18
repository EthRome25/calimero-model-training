export interface RateLimitError extends Error {
  isRateLimit: boolean;
  retryAfter?: number;
}

export const isRateLimitError = (error: any): error is RateLimitError => {
  return (
    error?.message?.includes('Rate limit exceeded') ||
    error?.message?.includes('Too many requests') ||
    error?.message?.includes('rate limit') ||
    error?.status === 429
  );
};

export const createRateLimitError = (message: string, retryAfter?: number): RateLimitError => {
  const error = new Error(message) as RateLimitError;
  error.isRateLimit = true;
  error.retryAfter = retryAfter;
  return error;
};

export const getRateLimitMessage = (error: RateLimitError): string => {
  if (error.retryAfter) {
    return `Rate limit exceeded. Please wait ${Math.ceil(error.retryAfter / 1000)} seconds before trying again.`;
  }
  return 'Rate limit exceeded. Please wait a moment before trying again.';
};

export const getRetryDelay = (attemptIndex: number, baseDelay: number = 1000): number => {
  // Exponential backoff with jitter
  const delay = baseDelay * Math.pow(2, attemptIndex);
  const jitter = Math.random() * 0.1 * delay; // Add up to 10% jitter
  return Math.min(delay + jitter, 30000); // Cap at 30 seconds
};
