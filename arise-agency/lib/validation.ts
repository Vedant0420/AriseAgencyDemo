/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitizes a string by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .slice(0, 1000); // Limit length
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates that a date is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Validates platform selection
 */
export function isValidPlatform(platform: string): boolean {
  const validPlatforms = ['YouTube', 'TikTok', 'Instagram', 'Other'];
  return validPlatforms.includes(platform);
}

/**
 * Validates booking form data
 */
export interface BookingFormData {
  name: string;
  email: string;
  platform: string;
  date: string;
  time: string;
  notes: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateBookingForm(data: BookingFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Email validation
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Platform validation
  if (!data.platform || !isValidPlatform(data.platform)) {
    errors.platform = 'Please select a valid platform';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Please select a date';
  } else if (!isFutureDate(data.date)) {
    errors.date = 'Please select a future date';
  }

  // Time validation
  if (!data.time) {
    errors.time = 'Please select a time';
  }

  // Notes validation (optional but should be sanitized if provided)
  if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitizes booking form data
 */
export function sanitizeBookingForm(data: BookingFormData): BookingFormData {
  return {
    name: sanitizeString(data.name),
    email: data.email.trim().toLowerCase(),
    platform: data.platform,
    date: data.date,
    time: data.time,
    notes: sanitizeString(data.notes || ''),
  };
}

