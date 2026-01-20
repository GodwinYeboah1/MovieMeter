/**
 * Sanitize user input to prevent XSS attacks
 * Strips all HTML tags and dangerous characters, allowing only plain text
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities to prevent double encoding
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');
  
  // Remove any remaining HTML tags (in case of encoded tags)
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script-related content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Sanitize but allow basic formatting (for future markdown support)
 * Currently strips all HTML for security
 */
export function sanitizeWithFormatting(input: string): string {
  // For now, use the same sanitization
  // In the future, you can add markdown parsing here
  return sanitizeInput(input);
}
