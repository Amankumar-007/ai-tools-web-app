import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { amount } = await req.json(); // amount in cents

    if (!amount) {
      return new Response(JSON.stringify({ error: "Missing amount" }), { status: 400 });
    }

   const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  line_items: [
    {
      price_data: {
        currency: "usd",
        product_data: { name: "My Awesome Product" },
        unit_amount: amount, // e.g. 1000 = $10
      },
      quantity: 1,
    },
  ],
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
});

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Stripe error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
