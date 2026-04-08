import Stripe from "stripe";
import fs from "fs";
import path from "path";

const productsPath = path.resolve("data/products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

export const handler = async (event) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { cart } = JSON.parse(event.body);

    // 1. Build product line items
    const lineItems = cart.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);

      if (!product) {
        throw new Error(`Product not found: ${cartItem.id}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: product.price, // already in cents
        },
        quantity: cartItem.quantity,
      };
    });

    // 2. Calculate subtotal (in cents)
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + item.price_data.unit_amount * item.quantity;
    }, 0);

    // 3. Add platform fee (5%)
    const feeAmount = Math.round(subtotal * 0.05);
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Platform Fee" },
        unit_amount: feeAmount,
      },
      quantity: 1,
    });

    // 4. Add tax (8.25%)
    const taxAmount = Math.round(subtotal * 0.0825);
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Sales Tax (8.25%)" },
        unit_amount: taxAmount,
      },
      quantity: 1,
    });

    // 5. Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: "https://shop-spitether.netlify.app/success.html",
      cancel_url: "https://shop-spitether.netlify.app/cancel.html",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
