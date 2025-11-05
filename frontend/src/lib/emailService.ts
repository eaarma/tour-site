import { gmailService } from "@/lib/gmailService"; // ← your existing Gmail handler
import { OrderResponseDto } from "@/types/order";

export const EmailService = {
  async sendOrderConfirmationEmail(order: OrderResponseDto) {
    if (!order || !order.items || !order.items[0]?.email) return;

    const to = order.items[0].email;
    const subject = `✅ Order Confirmation - Order #${order.id}`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #22c55e;">✅ Order ${order.id} confirmed!</h2>
        <p>Thank you for your booking, ${order.items[0].name}.</p>

        <h3>Order Details:</h3>
        <ul>
          ${order.items
            .map(
              (item) => `
            <li style="margin-bottom: 10px;">
              <strong>${item.tourTitle}</strong><br/>
              📅 ${new Date(item.scheduledAt).toLocaleString()}<br/>
              👥 Participants: ${item.participants}<br/>
              💶 €${item.pricePaid.toFixed(2)}
            </li>
          `
            )
            .join("")}
        </ul>

        <h3>Payment Summary:</h3>
        <p><strong>Total Paid:</strong> €${order.totalPrice.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

        <p style="margin-top: 20px;">We look forward to seeing you! 👋</p>
      </div>
    `;

    await gmailService.sendMail({
      to,
      subject,
      html,
    });
  },
};
