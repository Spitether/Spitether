// server/create-checkout-session.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const path = require("path");

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { cart } = JSON.parse(event.body || "{}");
    if (!cart || cart.length === 0) {
      return { statusCode: 400, body: "Cart is empty" };
    }

    // Load products.json
    const productsPath = path.join(__dirname, "..", "data", "products.json");
    const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

    // Build line items
    const line_items = cart.map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) throw new Error(`Product not found: ${item.id}`);

      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price
        },
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: "https://your-domain.com/checkout.html?status=success",
      cancel_url: "https://your-domain.com/cart.html?status=cancelled"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create checkout session" })
    };
  }
};
