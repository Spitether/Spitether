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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { cart } = body;

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
            images: [product.image]
          },
          unit_amount: product.price
        },
        quantity: cartItem.quantity
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0);
    const feeAmount = Math.round(subtotal * 0.05);
    const taxAmount = Math.round(subtotal * 0.0825);

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Platform Fee" },
        unit_amount: feeAmount
      },
      quantity: 1
    });

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Sales Tax (8.25%)" },
        unit_amount: taxAmount
      },
      quantity: 1
    });

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["host"];
    const origin = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/cancel.html`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Checkout function error:", error);
    return res.status(500).json({ error: error.message });
  }
}
