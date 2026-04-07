// server/create-checkout.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Hardcoded products (can't use fs in serverless)
const products = [
  {
    id: "sample-001",
    name: "Earthy Sample Project",
    price: 2500,
    stock: 5,
    image: "images/products/sample-001.jpg",
    category: "digital",
    description: "A placeholder item to test your store."
  }
];

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { cart } = JSON.parse(event.body || "{}");
    if (!cart || cart.length === 0) {
      return { statusCode: 400, body: "Cart is empty" };
    }
    // Build product line items
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

    // Add platform fee and tax
    const subtotal = line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0);
    const feeAmount = Math.round(subtotal * 0.05);
    const taxAmount = Math.round(subtotal * 0.0825);

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Platform fee" },
        unit_amount: feeAmount
      },
      quantity: 1
    });

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Sales tax (8.25%)" },
        unit_amount: taxAmount
      },
      quantity: 1

    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: "https://shop-spitether.netlify.app/success.html",
      cancel_url: "https://shop-spitether.netlify.app/cancel.html"
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