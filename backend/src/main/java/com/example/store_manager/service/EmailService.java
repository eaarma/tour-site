package com.example.store_manager.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final ResendClient resendClient;
    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public void sendOrderConfirmation(Order order, String manageToken) {
        OrderItem firstItem = order.getOrderItems().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Order has no items"));

        String manageUrl = frontendBaseUrl + "/booking/manage?token=" + manageToken;

        String to = firstItem.getEmail();

        if (to == null) {
            log.warn("Order {} has no email — skipping confirmation", order.getId());
            return;
        }

        String subject = "Order Confirmation #" + order.getId();
        String html = buildHtml(order, firstItem, manageUrl);
        try {
            resendClient.sendEmail(to, subject, html);
            log.info("Confirmation email sent for order {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for order {}", order.getId(), e);
        }
    }

    private String buildHtml(Order order, OrderItem firstItem, String manageUrl) {
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
                                <body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, sans-serif;">
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

                                                    <!-- Manage Booking -->
                <tr>
                    <td align="center" style="padding-top:30px;">
                        <a href="%s"
                           style="background-color:#16a34a;
                                  color:#ffffff;
                                  text-decoration:none;
                                  padding:12px 24px;
                                  border-radius:6px;
                                  display:inline-block;
                                  font-weight:bold;
                                  font-size:14px;">
                            Manage Booking
                        </a>
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
                        order.getPaymentMethod() != null ? order.getPaymentMethod() : "Online Payment",
                        manageUrl);
    }

    public void sendCancellationConfirmation(
            OrderItem item,
            boolean refundable,
            BigDecimal refundAmount) {

        if (item.getEmail() == null) {
            log.warn("OrderItem {} has no email — skipping cancellation email", item.getId());
            return;
        }

        String subject = "Booking Cancellation – " + item.getTourTitle();
        String html = buildCancellationHtml(item, refundable, refundAmount);

        try {

            resendClient.sendEmail(item.getEmail(), subject, html);

            log.info("Cancellation email sent for orderItem {}", item.getId());

        } catch (Exception e) {
            log.error("Failed to send cancellation email for orderItem {}", item.getId(), e);
        }
    }

    private String buildCancellationHtml(
            OrderItem item,
            boolean refundable,
            BigDecimal refundAmount) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, dd MMM yyyy HH:mm");

        String formattedDate = item.getScheduledAt().format(formatter);

        String refundSection = refundable
                ? """
                          <tr>
                              <td style="padding-top:20px; font-size:14px; color:#374151;">
                                  <strong>Refund Amount:</strong> €%.2f<br/>
                                  The refund will be returned to your original payment method.
                                  Depending on your bank provider, this may take 5–10 business days.
                              </td>
                          </tr>
                        """.formatted(refundAmount)
                : """
                          <tr>
                              <td style="padding-top:20px; font-size:14px; color:#374151;">
                                  This booking was outside the free cancellation window
                                  and is therefore non-refundable.
                              </td>
                          </tr>
                        """;

        return """
                <html>
                <body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0"
                                       style="background:#ffffff; padding:30px; border-radius:8px;">

                                    <!-- Header -->
                                    <tr>
                                        <td align="center" style="padding-bottom:20px;">
                                            <h2 style="margin:0; color:#dc2626;">
                                                Booking Cancelled
                                            </h2>
                                        </td>
                                    </tr>

                                    <!-- Greeting -->
                                    <tr>
                                        <td style="padding-bottom:20px; font-size:14px; color:#374151;">
                                            Hi <strong>%s</strong>,<br/><br/>
                                            Your booking has been successfully cancelled.
                                        </td>
                                    </tr>

                                    <!-- Booking Info -->
                                    <tr>
                                        <td style="padding:20px 0; border-bottom:1px solid #e5e7eb;">
                                            <h3 style="margin:0; font-size:16px; color:#111827;">
                                                %s
                                            </h3>
                                            <p style="margin:6px 0; font-size:14px; color:#374151;">
                                                <strong>Date:</strong> %s<br/>
                                                <strong>Participants:</strong> %d
                                            </p>
                                        </td>
                                    </tr>

                                    %s

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding-top:30px; font-size:13px; color:#6b7280; text-align:center;">
                                            If you have any questions, feel free to reply to this email.
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                item.getName(),
                item.getTourTitle(),
                formattedDate,
                item.getParticipants(),
                refundSection);
    }

    public void sendVerificationEmail(User user, String token) {

        if (user.getEmail() == null) {
            log.warn("User {} has no email — skipping verification email", user.getId());
            return;
        }

        String verifyUrl = frontendBaseUrl + "/verify-email?token=" + token;

        String subject = "Verify your email address";

        String html = """
                <html>
                <body style="margin:0; padding:0; background-color:#ffffff; font-family:Arial, sans-serif;">
                    <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0"
                                       style="background:#ffffff; padding:30px; border-radius:8px;">

                                    <!-- Header -->
                                    <tr>
                                        <td align="center" style="padding-bottom:20px;">
                                            <h2 style="margin:0; color:#16a34a;">
                                                Confirm Your Email
                                            </h2>
                                        </td>
                                    </tr>

                                    <!-- Greeting -->
                                    <tr>
                                        <td style="padding-bottom:20px; font-size:14px; color:#374151;">
                                            Hi <strong>%s</strong>,<br/><br/>
                                            Please confirm your email address to activate your account.
                                        </td>
                                    </tr>

                                    <!-- Verify Button -->
                                    <tr>
                                        <td align="center" style="padding-top:20px;">
                                            <a href="%s"
                                               style="background-color:#16a34a;
                                                      color:#ffffff;
                                                      text-decoration:none;
                                                      padding:12px 24px;
                                                      border-radius:6px;
                                                      display:inline-block;
                                                      font-weight:bold;
                                                      font-size:14px;">
                                                Verify Email
                                            </a>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding-top:30px; font-size:13px; color:#6b7280; text-align:center;">
                                            If you did not create this account, you can ignore this email.
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(
                user.getName() != null ? user.getName() : "there",
                verifyUrl);

        try {

            resendClient.sendEmail(user.getEmail(), subject, html);

            log.info("Verification email sent to user {}", user.getEmail());

        } catch (Exception e) {
            log.error("Failed to send verification email to {}", user.getEmail(), e);
        }
    }

    public void sendPasswordResetEmail(User user, String token) {

        String resetUrl = frontendBaseUrl + "/reset-password?token=" + token;

        String subject = "Reset Your Password";

        String html = """
                <html>
                <body style="font-family:Arial, sans-serif;">
                    <h2>Password Reset</h2>
                    <p>Hello %s,</p>
                    <p>You requested a password reset.</p>

                    <p>
                        <a href="%s"
                           style="background:#16a34a;
                                  color:white;
                                  padding:12px 24px;
                                  text-decoration:none;
                                  border-radius:6px;
                                  font-weight:bold;">
                           Reset Password
                        </a>
                    </p>

                    <p>If you did not request this, you can safely ignore this email.</p>

                    <p>This link will expire in 30 minutes.</p>
                </body>
                </html>
                """.formatted(user.getName(), resetUrl);

        try {
            resendClient.sendEmail(user.getEmail(), subject, html);

            log.info("Password reset email sent to {}", user.getEmail());

        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }
    }
}
