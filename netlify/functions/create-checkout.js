import Stripe from "stripe";
import products from "../../data/products.json" assert { type: "json" };

export const handler = async (event) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { cart } = JSON.parse(event.body);

    const lineItems = cart.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product) throw new Error(`Product not found: ${cartItem.id}`);

      const absoluteImage = `https://spitether.vercel.app/${product.image}`;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [absoluteImage],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: cartItem.quantity,
      };
    });

    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0
    );

    const feeAmount = Math.round(subtotal * 0.05);
    const taxAmount = Math.round(subtotal * 0.0825);

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Platform Fee" },
        unit_amount: feeAmount,
      },
      quantity: 1,
    });

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Sales Tax (8.25%)" },
        unit_amount: taxAmount,
      },
      quantity: 1,
    });

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