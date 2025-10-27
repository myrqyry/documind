import { randomUUID } from 'crypto';
import type { APIResponse } from '../types';

export const createSuccessResponse = <T>(data: T, metadata?: any): APIResponse<T> => ({
  success: true,
  data,
  metadata: {
    timestamp: new Date(),
    requestId: randomUUID(),
    ...metadata
  }
});

export const createErrorResponse = (code: string, message: string, details?: any): APIResponse<never> => ({
  success: false,
  error: { code, message, details },
  metadata: {
    timestamp: new Date(),
    requestId: randomUUID()
  }
});
