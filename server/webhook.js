/* webhook.js — Stripe webhook for order confirmation */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const path = require("path");

const productsPath = path.join(__dirname, "..", "data", "products.json");

exports.handler = async function(event, context) {
  console.log("webhook.js loaded");

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let payload = event.body;
  if (event.isBase64Encoded) {
    payload = Buffer.from(event.body, "base64").toString("utf8");
  }

  let stripeEvent;
  try {
    if (endpointSecret) {
      const signature = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];
      stripeEvent = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } else {
      stripeEvent = JSON.parse(payload);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const cartJson = session.metadata?.cart;

    if (cartJson) {
      try {
        const cart = JSON.parse(cartJson);
        const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

        const updatedProducts = products.map(product => {
          const cartItem = cart.find(item => item.id === product.id);
          if (!cartItem) return product;
          return {
            ...product,
            stock: Math.max(0, product.stock - cartItem.quantity)
          };
        });

        fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
      } catch (err) {
        console.error("Failed to update stock:", err);
      }
    }
  }

  return {
    statusCode: 200,
    body: "Received"
  };
};
