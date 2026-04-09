import { NextResponse } from 'next/server';
import crypto from 'crypto';
import * as admin from 'firebase-admin';

// 1. Format the key properly, regardless of how Next.js parses the .env
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return '';
  return key.replace(/\\n/g, '\n');
};

// 2. Initialize Firebase Admin robustly
if (!admin.apps.length) {
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  
  if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error("FATAL: Firebase Admin environment variables are missing.");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
  console.log("🔥 Firebase Admin Initialized Successfully");
}

export async function POST(req: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      cart,
      totalAmount,
      userId,
      shippingDetails
    } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified authentically via Razorpay Backend
      
      const db = admin.firestore();
      
      // Idempotent write securely utilizing the razorpay_order_id explicitly as the document ID
      await db.collection("orders").doc(razorpay_order_id).set({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        userId: userId,
        cart: cart,
        totalAmount: totalAmount,
        shippingDetails: shippingDetails,
        status: "PROCESSING",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Webhook notification for Discord payload parsing
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
         await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               content: `🚨 **NEW ORDER ALERT in FLY STORE!** 🚨\n**Amount**: ₹${totalAmount}\n**Customer**: ${shippingDetails.firstName} ${shippingDetails.lastName}\n**Order ID**: ${razorpay_order_id}`
            }) 
         }).catch(e => console.error("Webhook failed to transmit:", e));
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully and appended." });
    } else {
      return NextResponse.json({ success: false, message: "Invalid Razorpay payload signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: `Server error: ${errorMessage}` }, { status: 500 });
  }
}
