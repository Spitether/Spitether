import Stripe from "stripe";
import { supabaseService } from "../lib/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function readRawBody(req, maxSizeKB = 1024) {
  const chunks = [];
  let totalSize = 0;
  const MAX_BYTES = maxSizeKB * 1024;
  
  for await (const chunk of req) {
    totalSize += chunk.length;
    if (totalSize > MAX_BYTES) throw new Error('Payload too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

import { isRateLimited, recordRequest } from "./rate-limiter.js";

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || req.socket.remoteAddress || 'unknown';
  
  // Weaker limits for webhook (Stripe IP verification handles abuse)
  const limitInfo = isRateLimited(ip, 'webhook');
  if (limitInfo.limited) {
    return res.status(429).send(`Too many requests. Retry after ${limitInfo.ttl}s`);
  }
  recordRequest(ip, 'webhook');
  
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = await readRawBody(req, 1024);
    event = stripe.webhooks.constructEvent(rawBody.toString(), signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const cartJson = session.metadata?.cart;

    if (cartJson) {
      try {
        const cart = JSON.parse(cartJson);

        for (const cartItem of cart) {
          const { data: product, error: productError } = await supabaseService
            .from("products")
            .select("stock")
            .eq("id", cartItem.id)
            .single();

          if (productError) {
            console.error("Failed to load product stock:", productError);
            continue;
          }

          const newStock = Math.max(0, product.stock - cartItem.quantity);
          const { error: updateError } = await supabaseService
            .from("products")
            .update({ stock: newStock })
            .eq("id", cartItem.id);

          if (updateError) {
            console.error("Failed to update stock for", cartItem.id, updateError);
          }
        }
      } catch (err) {
        console.error("Failed to update stock from webhook:", err);
        return res.status(500).send("Failed to update stock");
      }
    }
  }

  return res.status(200).send("Received");
}
