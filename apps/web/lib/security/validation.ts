import { z } from 'zod';

/**
 * Input Validation Schemas
 * 
 * Defines validation rules for common input types in the application.
 * Uses Zod for type-safe runtime validation.
 */

/**
 * Email validation schema
 * Ensures email addresses are properly formatted
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .trim()
  .toLowerCase();

/**
 * Phone number validation schema
 * Validates Rwandan phone numbers (+250 format)
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^(\+250|250)?[0-9]{9}$/,
    'Invalid phone number. Use format: +250XXXXXXXXX or 250XXXXXXXXX'
  )
  .transform((val) => {
    // Normalize to +250 format
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.startsWith('250')) {
      return '+' + cleaned;
    }
    return '+250' + cleaned;
  });

/**
 * Name validation schema
 * Validates user names (first name, last name, pharmacy name, etc.)
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .trim();

/**
 * Text field validation schema
 * For general text inputs like addresses, descriptions
 */
export const textFieldSchema = z
  .string()
  .min(1, 'This field is required')
  .max(500, 'Text is too long')
  .trim();

/**
 * URL validation schema
 * Ensures URLs are properly formatted and use safe protocols
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    (url) => {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    },
    { message: 'Only HTTP and HTTPS URLs are allowed' }
  );

/**
 * Pharmacy contact inquiry schema
 * Validates data when users contact pharmacies
 */
export const pharmacyInquirySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long')
    .trim(),
});

export type PharmacyInquiry = z.infer<typeof pharmacyInquirySchema>;

/**
 * Pharmacy registration schema
 * Validates pharmacy owner registration data
 */
export const pharmacyRegistrationSchema = z.object({
  pharmacyName: nameSchema,
  ownerName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: textFieldSchema,
  licenseNumber: z
    .string()
    .min(5, 'License number is required')
    .max(50, 'License number is too long')
    .regex(/^[A-Z0-9-]+$/, 'Invalid license number format')
    .trim(),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
});

export type PharmacyRegistration = z.infer<typeof pharmacyRegistrationSchema>;

/**
 * User login schema
 * Validates user authentication credentials
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

/**
 * Search query schema
 * Validates pharmacy search inputs
 */
export const searchSchema = z.object({
  query: z
    .string()
    .max(200, 'Search query is too long')
    .trim()
    .optional(),
  location: z
    .string()
    .max(200, 'Location query is too long')
    .trim()
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(0).max(50).optional(), // km
});

export type SearchQuery = z.infer<typeof searchSchema>;

/**
 * Validate data against a schema
 * 
 * Generic function to validate any data against a Zod schema.
 * Returns validated data or throws validation error.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 * 
 * @example
 * const email = validateInput(emailSchema, 'user@example.com');
 * // Returns 'user@example.com'
 * 
 * const inquiry = validateInput(pharmacyInquirySchema, formData);
 * // Returns typed PharmacyInquiry object or throws
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result object
 * 
 * Alternative to validateInput that doesn't throw errors.
 * Returns success/error result object instead.
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 * 
 * @example
 * const result = safeValidate(emailSchema, 'invalid-email');
 * if (result.success) {
 *   console.log(result.data); // Validated data
 * } else {
 *   console.log(result.error); // Validation errors
 * }
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
}
