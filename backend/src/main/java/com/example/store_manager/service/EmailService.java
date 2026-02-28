package com.example.store_manager.service;

import java.time.format.DateTimeFormatter;

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

    public void sendOrderConfirmation(Order order, String manageToken) {
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

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, dd MMM yyyy HH:mm");

        String itemsHtml = order.getOrderItems().stream()
                .map(item -> {
                    String formattedDate = item.getScheduledAt().format(formatter);

                    return """
                                <tr>
                                    <td style="padding:20px 0; border-bottom:1px solid #e5e7eb;">
                                        <h3 style="margin:0; font-size:16px; color:#111827;">
                                            %s
                                        </h3>
                                        <p style="margin:6px 0; font-size:14px; color:#374151;">
                                            <strong>Date:</strong> %s<br/>
                                            <strong>Participants:</strong> %d<br/>
                                            <strong>Meeting Point:</strong> %s<br/>
                                            <strong>Language:</strong> %s<br/>
                                            <strong>Comment:</strong> %s
                                        </p>
                                        <p style="margin:6px 0; font-size:14px; font-weight:bold; color:#111827;">
                                            €%.2f
                                        </p>
                                    </td>
                                </tr>
                            """.formatted(
                            item.getTourTitle(),
                            formattedDate,
                            item.getParticipants(),
                            item.getTour().getMeetingPoint() != null
                                    ? item.getTour().getMeetingPoint()
                                    : "Provided after confirmation",
                            item.getPreferredLanguage() != null
                                    ? item.getPreferredLanguage()
                                    : "N/A",
                            item.getComment() != null
                                    ? item.getComment()
                                    : "None",
                            item.getPricePaid());
                })
                .reduce("", String::concat);

        return """
                <html>
                <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:30px; border-radius:8px;">

                                    <!-- Header -->
                                    <tr>
                                        <td align="center" style="padding-bottom:20px;">
                                            <h2 style="margin:0; color:#16a34a;">
                                                Order Confirmation #%d
                                            </h2>
                                        </td>
                                    </tr>

                                    <!-- Greeting -->
                                    <tr>
                                        <td style="padding-bottom:20px; font-size:14px; color:#374151;">
                                            Hi <strong>%s</strong>,<br/><br/>
                                            Thank you for your booking! Your experience has been confirmed.
                                        </td>
                                    </tr>

                                    <!-- Items -->
                                    %s

                                    <!-- Payment Summary -->
                                    <tr>
                                        <td style="padding-top:25px;">
                                            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f9fafb; padding:15px; border-radius:6px;">
                                                <tr>
                                                    <td style="font-size:14px;">
                                                        <strong>Total Paid:</strong>
                                                    </td>
                                                    <td align="right" style="font-size:14px; font-weight:bold;">
                                                        €%.2f
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size:14px;">
                                                        <strong>Payment Method:</strong>
                                                    </td>
                                                    <td align="right" style="font-size:14px;">
                                                        %s
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding-top:30px; font-size:13px; color:#6b7280; text-align:center;">
                                            We look forward to welcoming you!<br/>
                                            If you have any questions, simply reply to this email.
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(
                        order.getId(),
                        firstItem.getName(),
                        itemsHtml,
                        order.getTotalPrice(),
                        order.getPaymentMethod() != null ? order.getPaymentMethod() : "Online Payment");
    }
}
