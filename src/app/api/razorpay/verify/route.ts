import { NextResponse } from 'next/server';
import crypto from 'crypto';
import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';

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

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard for many, but can be generic SMTP
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

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

      // 4. Dual-Dispatch Email Acknowledgment (Non-Blocking)
      try {
        const receiptHtml = `
          <div style="max-width: 600px; margin: 0 auto; background-color: #f9f9f9; color: #111; font-family: 'Courier New', Courier, monospace; border: 4px solid #111; padding: 30px;">
            <h1 style="text-transform: uppercase; font-size: 24px; border-bottom: 4px solid #111; padding-bottom: 10px; margin-bottom: 20px;">FLY STORE // RECEIPT</h1>
            <p style="margin: 5px 0;"><strong>ORDER ID:</strong> ${razorpay_order_id}</p>
            <p style="margin: 5px 0;"><strong>DATE:</strong> ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              ${cart.map((item: any) => {
                const imgUrl = Array.isArray(item.product.imageStudio) ? item.product.imageStudio[0] : item.product.imageStudio;
                return `
                  <tr style="border-bottom: 1px solid #111;">
                    <td style="padding: 10px 0; width: 60px;">
                      <img src="${imgUrl}" alt="${item.product.name}" style="width: 60px; height: 80px; object-fit: cover; border: 1px solid #111;" />
                    </td>
                    <td style="padding: 10px 20px;">
                      <div style="font-weight: bold; text-transform: uppercase; font-size: 14px;">${item.product.name}</div>
                      <div style="font-size: 11px; opacity: 0.8;">SIZE: ${item.selectedSize} // QTY: ${item.quantity}</div>
                    </td>
                    <td style="padding: 10px 0; text-align: right; font-weight: bold;">
                      ₹${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </table>

            <div style="border-top: 4px solid #111; padding-top: 15px; margin-top: 20px; text-align: right;">
              <div style="font-size: 12px; text-transform: uppercase; opacity: 0.7;">Total Amount Paid</div>
              <div style="font-size: 24px; font-weight: bold;">₹${totalAmount.toFixed(2)}</div>
            </div>

            <div style="margin-top: 40px; border: 1px solid #111; padding: 15px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
              WE APPRECIATE YOUR PATRONAGE. YOUR ORDER IS BEING PROCESSED.
            </div>
          </div>
        `;

        const adminText = `
          NEW ORDER RECEIVED: ${razorpay_order_id}
          
          CUSTOMER DETAILS:
          Name: ${shippingDetails.firstName} ${shippingDetails.lastName}
          Email: ${shippingDetails.email}
          Phone: ${shippingDetails.phone}
          Address: ${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.pincode}
          
          ORDER DETAILS:
          Total Amount: ₹${totalAmount}
          Items:
          ${cart.map((item: any) => `- ${item.product.name} (Size: ${item.selectedSize}, Qty: ${item.quantity}) - ₹${item.product.price}`).join('\n')}
          
          Payment ID: ${razorpay_payment_id}
        `;

        const adminEmails = process.env.ADMIN_EMAILS || "";

        // Concurrent dispatch using allSettled to ensure failure of one doesn't stop the other
        await Promise.allSettled([
          // Email 1: Customer Receipt
          transporter.sendMail({
            from: `"FLY STORE" <${process.env.SMTP_EMAIL}>`,
            to: shippingDetails.email,
            subject: `FLY STORE // ORDER CONFIRMATION [${razorpay_order_id}]`,
            html: receiptHtml,
          }),
          // Email 2: Admin Alerts
          transporter.sendMail({
            from: `"FLY STORE SYSTEM" <${process.env.SMTP_EMAIL}>`,
            to: adminEmails,
            subject: `;) NEW ORDER RECEIVED: ${razorpay_order_id}`,
            text: adminText,
          })
        ]).then(results => {
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.error(`Email ${index + 1} failed:`, result.reason);
            }
          });
        });

      } catch (emailError) {
        console.error("Email dispatch block failed completely:", emailError);
        // Non-blocking: we don't throw error to the user
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
