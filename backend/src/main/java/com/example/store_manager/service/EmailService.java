package com.example.store_manager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendOrderConfirmation(Order order) {

        OrderItem firstItem = order.getOrderItems().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Order has no items"));

        String to = firstItem.getEmail();

        if (to == null) {
            log.warn("Order {} has no email — skipping confirmation", order.getId());
            return;
        }

        String subject = "Order Confirmation #" + order.getId();
        String html = buildHtml(order, firstItem);

        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Confirmation email sent for order {}", order.getId());

        } catch (Exception e) {
            log.error("Failed to send confirmation email for order {}", order.getId(), e);
        }
    }

    private String buildHtml(Order order, OrderItem firstItem) {

        String itemsHtml = order.getOrderItems().stream()
                .map(item -> """
                            <li>
                                <strong>%s</strong><br/>
                                📅 %s<br/>
                                👥 %d participant(s)<br/>
                                💶 €%.2f<br/>
                                🌐 %s<br/>
                                📝 %s
                            </li>
                        """.formatted(
                        item.getTourTitle(),
                        item.getScheduledAt(),
                        item.getParticipants(),
                        item.getPricePaid(),
                        item.getPreferredLanguage(),
                        item.getComment() == null ? "N/A" : item.getComment()))
                .reduce("", String::concat);

        return """
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #22c55e;">✅ Order #%d Confirmed!</h2>
                        <p>Hi <strong>%s</strong>,</p>
                        <p>Thank you for your booking. Here are your order details:</p>

                        <h3>🧾 Order Items</h3>
                        <ul>%s</ul>

                        <h3>💳 Payment Summary</h3>
                        <p><strong>Total Paid:</strong> €%.2f</p>
                        <p><strong>Payment Method:</strong> %s</p>

                        <p style="margin-top: 20px;">We look forward to your experience! 🎉</p>
                    </div>
                """.formatted(
                order.getId(),
                firstItem.getName(),
                itemsHtml,
                order.getTotalPrice(),
                order.getPaymentMethod());
    }
}
