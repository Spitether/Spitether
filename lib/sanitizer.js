/* lib/sanitizer.js - Shared input validation & sanitization */

/** Validate product ID format */
export function isValidId(id) {
  return typeof id === 'string' && /^[a-z0-9\-_]{1,50}$/.test(id);
}

/** Validate single cart item */
export function validateCartItem(item) {
  if (!item || typeof item !== 'object') return false;
  if (!isValidId(item.id)) return false;
  const qty = parseInt(item.quantity);
  return Number.isInteger(qty) && qty >= 1 && qty <= 99;
}

/** Validate entire cart payload */
export function validateCart(cart, maxItems = 50, maxTotalSizeKB = 500) {
  if (!Array.isArray(cart)) return { valid: false, error: 'Cart must be array' };
  if (cart.length > maxItems) return { valid: false, error: `Max ${maxItems} items` };
  
  // Size limit (stringified for JSON safety)
  try {
    const jsonSize = JSON.stringify(cart);
    if (jsonSize.length > maxTotalSizeKB * 1024) {
      return { valid: false, error: `Payload too large (${maxTotalSizeKB}KB max)` };
    }
  } catch {
    return { valid: false, error: 'Invalid JSON' };
  }
  
  // Validate all items
  for (let i = 0; i < cart.length; i++) {
    if (!validateCartItem(cart[i])) {
      return { valid: false, error: `Invalid item at index ${i}` };
    }
  }
  
  return { valid: true };
}

/** Safe JSON.parse with size limit */
export function safeJSONParse(str, maxSizeKB = 1000) {
  if (typeof str !== 'string') return null;
  if (str.length > maxSizeKB * 1024) return null;
  
  try {
    const parsed = JSON.parse(str);
    // Prevent prototype pollution
    if (parsed && typeof parsed === 'object') {
      delete parsed.__proto__;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Sanitized query param getter */
export function getSanitizedQuery(reqOrEvent, paramName) {
  let value;
  if (reqOrEvent.query) { // Netlify/Vercel req
    value = reqOrEvent.query[paramName];
  } else if (reqOrEvent.queryStringParameters) { // Lambda event
    value = reqOrEvent.queryStringParameters[paramName];
  } else {
    return null;
  }
  return typeof value === 'string' ? value.trim().slice(0, 100) : null;
}

/** Get sanitized request body */
export function getSanitizedBody(reqOrEvent, maxSizeKB = 1000) {
  let body;
  if (reqOrEvent.body) {
    if (typeof reqOrEvent.body === 'string') {
      body = safeJSONParse(reqOrEvent.body, maxSizeKB);
    } else if (typeof reqOrEvent.body === 'object') {
      body = reqOrEvent.body; // Already parsed
    }
  }
  return body;
}

// Export error helpers
export const ERRORS = {
  INVALID_CART: 'Invalid cart data',
  OVERSIZED_PAYLOAD: 'Payload too large',
  INVALID_ID: 'Invalid product ID',
  MALFORMED_JSON: 'Malformed JSON'
};

