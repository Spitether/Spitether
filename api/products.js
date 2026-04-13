import { supabaseAnon } from "../lib/supabase.js";

import { isRateLimited, recordRequest } from "./rate-limiter.js";
import { isValidId, getSanitizedQuery, ERRORS } from "../lib/sanitizer.js";

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || req.socket.remoteAddress || 'unknown';
  const limitInfo = isRateLimited(ip, 'products');
  
  if (limitInfo.limited) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      remaining: limitInfo.remaining, 
      retry_after: limitInfo.ttl 
    });
  }
  
  recordRequest(ip, 'products');
  
  try {
    const id = getSanitizedQuery(req, "id");
    if (id && !isValidId(id)) {
      return res.status(400).json({ error: ERRORS.INVALID_ID });
    }

    if (id) {
      const { data, error } = await supabaseAnon
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json(data);
    }

    const { data, error } = await supabaseAnon
      .from("products")
      .select("*");

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("api/products error:", error.message || error);
    return res.status(500).json({ error: error.message || "Unable to load products" });
  }
}
