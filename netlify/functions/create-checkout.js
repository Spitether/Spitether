import Stripe from "stripe";

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

export const handler = async (event) => {
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const { cart } = JSON.parse(event.body);

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
