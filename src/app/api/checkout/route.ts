import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json(); // amount in cents
 
    if (!amount) {
      return NextResponse.json({ error: "Missing amount" }, { status: 400 });
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}