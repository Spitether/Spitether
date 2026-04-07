import Stripe from "stripe";
import { supabaseService } from "../lib/supabase.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
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
