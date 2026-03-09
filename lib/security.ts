/**
 * Security utilities for audit logging and session management
 */

import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface AuditLog {
  action: string;
  resource: string;
  resourceId?: string;
  userEmail: string;
  userId: string;
  timestamp: Timestamp;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an admin action for audit purposes
 */
export async function logAdminAction(
  action: string,
  resource: string,
  user: User | null,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!db || !user) return;

  try {
    const auditLog: Omit<AuditLog, 'timestamp'> = {
      action,
      resource,
      resourceId,
      userEmail: user.email || 'unknown',
      userId: user.uid,
      details,
      // Note: IP address would need to be passed from server-side or API
    };

    await addDoc(collection(db, 'audit_logs'), {
      ...auditLog,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('Failed to log admin action:', error);
  }
}

/**
 * Get client IP address (approximate, from headers if available)
 */
export function getClientIP(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  // In a real implementation, you'd get this from server-side headers
  // For now, we'll just return undefined
  return undefined;
}

/**
 * Sanitize error messages to prevent information disclosure
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal error details
    const message = error.message.toLowerCase();
    
    // Generic error messages based on error type
    if (message.includes('permission') || message.includes('permission-denied')) {
      return 'You do not have permission to perform this action.';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (message.includes('quota') || message.includes('resource-exhausted')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    if (message.includes('unavailable')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    // Default generic error
    return 'An error occurred. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}

