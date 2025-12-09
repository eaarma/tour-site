// /app/api/send-confirmation/route.ts

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { order } = await req.json();

    if (!order || !order.items?.length) {
      return NextResponse.json(
        { error: "Order details missing" },
        { status: 400 }
      );
    }

    const customer = order.items[0]; // name, email, phone, etc.

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 📧 Email HTML Template
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #22c55e;">✅ Order #${order.id} Confirmed!</h2>
        <p>Hi <strong>${customer.name}</strong>,</p>
        <p>Thank you for your booking. Here are your order details:</p>

        <h3>🧾 Order Items</h3>
        <ul>
          ${order.items
            .map(
              (item: any) => `
            <li>
              <strong>${item.tourTitle}</strong><br/>
              📅 ${new Date(item.scheduledAt).toLocaleString()}<br/>
              👥 ${item.participants} participant(s)<br/>
              💶 €${item.pricePaid.toFixed(2)}<br/>
              🌐 ${item.preferredLanguage}<br/>
              📝 ${item.comment || "N/A"}

            </li>
          `
            )
            .join("")}
        </ul>

        <h3>💳 Payment Summary</h3>
        <p><strong>Total Paid:</strong> €${order.totalPrice.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

        <h3>👤 Customer Details</h3>
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        ${
          customer.nationality
            ? `<p><strong>Nationality:</strong> ${customer.nationality}</p>`
            : ""
        }

        <p style="margin-top: 20px;">We look forward to your experience! 🎉</p>
      </div>
    `;

    // 📤 Send email
    await transporter.sendMail({
      from: `"Tour Booking" <${process.env.SMTP_USER}>`,
      to: customer.email,
      subject: `✅ Order Confirmation #${order.id}`,
      html,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email." },
      { status: 500 }
    );
  }
}
