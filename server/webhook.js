/* webhook.js — Stripe webhook for order confirmation */

exports.handler = async function(event, context) {
  console.log("webhook.js loaded");

  // TODO:
  // 1. Verify Stripe signature
  // 2. Parse event type
  // 3. On checkout.session.completed:
  //      - Reduce stock in products.json
  //      - Save order record (optional)
  // 4. Return 200 to Stripe

  return {
    statusCode: 200,
    body: "Webhook placeholder"
  };
};
