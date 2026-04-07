import Stripe from "stripe";
import products from "../data/products.json" assert { type: "json" };

export const handler = async (event) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { items } = JSON.parse(event.body);

    // Match cart items with product data
    const lineItems = items.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
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
