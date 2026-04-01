import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Whitelist of allowed amounts (in cents) to prevent arbitrary charges
const ALLOWED_AMOUNTS = [
  999,   // $9.99 - Pro Monthly
  1999,  // $19.99 - Premium Monthly
  9999,  // $99.99 - Pro Annual
  19999, // $199.99 - Premium Annual
];

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json(); // amount in cents

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: "Missing or invalid amount" }, { status: 400 });
    }

    if (!ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json({ error: "Invalid price tier" }, { status: 400 });
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
 
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err.message);
    return NextResponse.json({ error: "Payment processing failed. Please try again." }, { status: 500 });
  }
}