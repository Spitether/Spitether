import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseService } from '../../lib/supabase.js';

// In-memory cache for quick checks (supabaseService for persistence)
const rateLimitCache = new Map();

const LIMITS = {
  general: { window: 15 * 60 * 1000, max: 100 },
  auth: { window: 15 * 60 * 1000, max: 5 },
  checkout: { window: 60 * 60 * 1000, max: 5 }, // 1 hour, 5 req
  products: { window: 15 * 60 * 1000, max: 200 }
};

const DEFAULT_WINDOW = 15 * 60 * 1000;

export function isRateLimited(ip, routeKey = 'general') {
  const key = `${ip}_${routeKey}`;
  const now = Date.now();
  
  const limitConfig = LIMITS[routeKey] || LIMITS.general;
  const windowMs = limitConfig.window;
  const windowStart = now - windowMs;
  
  // Check cache
  if (rateLimitCache.has(key)) {
    const record = rateLimitCache.get(key);
    if (now - record.start < windowMs) {
      const ttlLeft = windowMs - (now - record.start);
      record.requests = record.requests.filter(time => time > windowStart);
      
      if (record.requests.length >= limitConfig.max) {
        return { limited: true, remaining: 0, ttl: Math.ceil(ttlLeft / 1000) };
      }
      return { limited: false, remaining: limitConfig.max - record.requests.length, ttl: Math.ceil(ttlLeft / 1000) };
    }
      rateLimitCache.delete(key);
    }
  }
  
  return { limited: false, remaining: limitConfig.max, ttl: 0 };
}

export function recordRequest(ip, routeKey = 'general') {
  const key = `${ip}_${routeKey}`;
  const now = Date.now();
  
  if (!rateLimitCache.has(key)) {
    rateLimitCache.set(key, { start: now, requests: [] });
  }
  
  const record = rateLimitCache.get(key);
  record.requests.push(now);
  
  // Optional: async persist to Supabase for cross-instance sync
  // persistRateLimit(key, record).catch(console.error);
}

async function persistRateLimit(key, record) {
  // Store in Supabase for distributed limiting (Vercel serverless)
  const { error } = await supabaseService
    .from('rate_limits')
    .upsert({
      id: key,
      ip: key.split('_')[0],
      route_key: key.split('_')[1],
      requests: record.requests.length,
      window_start: record.start,
      updated_at: new Date().toISOString()
    });
  
  if (error) console.error('Rate limit persist error:', error);
}

// Cleanup old entries periodically (use max window)
setInterval(() => {
  const now = Date.now();
  const MAX_WINDOW = 60 * 60 * 1000; // 1hr conservative
  for (const [key, record] of rateLimitCache.entries()) {
    if (now - record.start > MAX_WINDOW) {
      rateLimitCache.delete(key);
    }
  }
}, 60000); // Every minute

