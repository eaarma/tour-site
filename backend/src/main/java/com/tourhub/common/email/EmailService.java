package com.tourhub.common.email;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.storefront.model.StorefrontSettings;
import com.tourhub.storefront.repository.StorefrontSettingsRepository;
import com.tourhub.user.model.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final DateTimeFormatter EMAIL_DATE_FORMATTER = DateTimeFormatter.ofPattern(
            "EEEE, dd MMM yyyy 'at' HH:mm",
            Locale.ENGLISH);

    private static final String DEFAULT_SITE_NAME = "TourHub";
    private static final String DEFAULT_PRIMARY_COLOR = "#15803d";
    private static final String DEFAULT_ACCENT_COLOR = "#0f172a";
    private static final String DEFAULT_BACKGROUND_COLOR = "#eef2f7";
    private static final String DEFAULT_SURFACE_COLOR = "#ffffff";
    private static final String DEFAULT_MUTED_SURFACE_COLOR = "#f8fafc";
    private static final String DEFAULT_BORDER_COLOR = "#dbe3ec";
    private static final String DEFAULT_TEXT_COLOR = "#0f172a";
    private static final String DEFAULT_MUTED_TEXT_COLOR = "#475569";
    private static final String DEFAULT_SOFT_TEXT_COLOR = "#64748b";

    private final ResendClient resendClient;
    private final StorefrontSettingsRepository storefrontSettingsRepository;

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.contact.receiver-email:}")
    private String contactReceiver;

    public void sendOrderConfirmation(Order order, String manageToken) {
        OrderItem firstItem = order.getOrderItems().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Order has no items"));

        String to = firstItem.getEmail();
        if (!hasText(to)) {
            log.warn("Order {} has no email - skipping confirmation", order.getId());
            return;
        }

        EmailBranding branding = loadBranding();
        String manageUrl = frontendBaseUrl + "/booking/manage?token=" + manageToken;
        String subject = "Booking confirmed - " + branding.siteName() + " - #" + order.getId();
        String html = buildOrderConfirmationHtml(order, firstItem, manageUrl, branding);

        try {
            resendClient.sendEmail(to, subject, html, resolveSupportReplyTo(branding));
            log.info("Confirmation email sent for order {}", order.getId());
        } catch (Exception e) {
            log.error("Failed to send confirmation email for order {}", order.getId(), e);
        }
    }

    public void sendCancellationConfirmation(
            OrderItem item,
            boolean refundable,
            BigDecimal refundAmount) {

        if (!hasText(item.getEmail())) {
            log.warn("OrderItem {} has no email - skipping cancellation email", item.getId());
            return;
        }

        EmailBranding branding = loadBranding();
        String subject = "Booking cancelled - " + safeText(item.getTourTitle(), "Your booking");
        String html = buildGuestCancellationHtml(item, refundable, refundAmount, branding);

        try {
            resendClient.sendEmail(item.getEmail(), subject, html, resolveSupportReplyTo(branding));
            log.info("Cancellation email sent for orderItem {}", item.getId());
        } catch (Exception e) {
            log.error("Failed to send cancellation email for orderItem {}", item.getId(), e);
        }
    }

    public void sendVerificationEmail(User user, String token) {
        if (!hasText(user.getEmail())) {
            log.warn("User {} has no email - skipping verification email", user.getId());
            return;
        }

        EmailBranding branding = loadBranding();
        String verifyUrl = frontendBaseUrl + "/verify-email?token=" + token;
        String subject = "Confirm your email - " + branding.siteName();
        String html = buildVerificationHtml(user, verifyUrl, branding);

        try {
            resendClient.sendEmail(user.getEmail(), subject, html, resolveSupportReplyTo(branding));
            log.info("Verification email sent to user {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", user.getEmail(), e);
        }
    }

    public void sendPasswordResetEmail(User user, String token) {
        if (!hasText(user.getEmail())) {
            log.warn("User {} has no email - skipping password reset email", user.getId());
            return;
        }

        EmailBranding branding = loadBranding();
        String resetUrl = frontendBaseUrl + "/reset-password?token=" + token;
        String subject = "Reset your password - " + branding.siteName();
        String html = buildPasswordResetHtml(user, resetUrl, branding);

        try {
            resendClient.sendEmail(user.getEmail(), subject, html, resolveSupportReplyTo(branding));
            log.info("Password reset email sent to {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", user.getEmail(), e);
        }
    }

    public void sendProviderCancellationNotice(
            OrderItem item,
            BigDecimal refundAmount) {

        if (!hasText(item.getEmail())) {
            log.warn("OrderItem {} has no email - skipping provider cancellation email", item.getId());
            return;
        }

        EmailBranding branding = loadBranding();
        String subject = "Tour cancelled - refund initiated - " + safeText(item.getTourTitle(), "Your booking");
        String html = buildProviderCancellationHtml(item, refundAmount, branding);

        try {
            resendClient.sendEmail(item.getEmail(), subject, html, resolveSupportReplyTo(branding));
            log.info("Provider cancellation email sent for orderItem {}", item.getId());
        } catch (Exception e) {
            log.error("Failed to send provider cancellation email for orderItem {}", item.getId(), e);
        }
    }

    public void sendContactMessage(String name, String email, String subject, String message) {
        StorefrontSettings settings = storefrontSettingsRepository.findTopByOrderByIdAsc().orElse(null);
        EmailBranding branding = buildBranding(settings);

        String resolvedReceiver = resolveContactReceiver(settings);
        if (!hasText(resolvedReceiver)) {
            throw new IllegalStateException("Contact receiver email is not configured.");
        }

        String normalizedName = safeText(name, "Anonymous visitor").trim();
        String normalizedEmail = safeText(email, "").trim();
        String normalizedSubject = hasText(subject) ? subject.trim() : "New contact message";
        String normalizedMessage = safeText(message, "").trim();

        String html = buildContactMessageHtml(
                normalizedName,
                normalizedEmail,
                normalizedSubject,
                normalizedMessage,
                branding);

        resendClient.sendEmail(
                resolvedReceiver.trim(),
                "Contact form - " + normalizedSubject,
                html,
                normalizedEmail);

        log.info("Contact form email forwarded from {}", normalizedEmail);
    }

    private String buildOrderConfirmationHtml(
            Order order,
            OrderItem firstItem,
            String manageUrl,
            EmailBranding branding) {

        StringBuilder itemsHtml = new StringBuilder();
        int itemIndex = 1;
        int totalGuests = 0;

        for (OrderItem item : order.getOrderItems()) {
            totalGuests += item.getParticipants() != null ? item.getParticipants() : 0;
            itemsHtml.append(buildExperienceCard(item, itemIndex++));
        }

        String summaryHtml = buildDataCard(
                "Booking summary",
                buildDataTable(
                        buildDataRow("Booking reference", "#" + order.getId()),
                        buildDataRow("Experiences", String.valueOf(order.getOrderItems().size())),
                        buildDataRow("Guests", String.valueOf(totalGuests)),
                        buildDataRow("Payment method", formatPaymentMethod(order.getPaymentMethod())),
                        buildDataRow("Total paid", formatMoney(order.getTotalPrice()))));

        String helpfulNote = buildNoticeCard(
                "Manage with confidence",
                "Use the secure booking link below to review your reservation, confirm the meeting details, and handle eligible cancellations.",
                branding.primaryColor());

        String directLink = buildLinkCard("Manage booking link", manageUrl, branding.primaryColor());

        String intro = wrapParagraph(
                "Thanks for booking with " + escape(branding.siteName())
                        + ". Your reservation is confirmed and the details below are ready to share with your guests.");

        return buildEmailDocument(
                branding,
                "Your booking is confirmed. Review your itinerary and keep your secure manage link handy.",
                "Booking confirmed",
                "#166534",
                "#dcfce7",
                "#bbf7d0",
                "Your booking is confirmed",
                personalGreeting(firstItem.getName()) + intro,
                buildPrimaryButton(manageUrl, "Manage booking", branding.primaryColor()),
                summaryHtml + itemsHtml + directLink + helpfulNote,
                "Questions about timing, meeting points, or changes? "
                        + buildSupportLine(branding, true));
    }

    private String buildGuestCancellationHtml(
            OrderItem item,
            boolean refundable,
            BigDecimal refundAmount,
            EmailBranding branding) {

        String statusCard = refundable
                ? buildNoticeCard(
                        "Refund initiated",
                        "A refund of " + formatMoney(refundAmount)
                                + " is being returned to the original payment method. Most banks post it within 5 to 10 business days.",
                        "#0f766e")
                : buildNoticeCard(
                        "Cancellation complete",
                        "This booking fell outside the free cancellation window, so no refund is due for this reservation.",
                        "#b45309");

        String policyCopy = refundable
                ? "Your reservation has been cancelled successfully and the refund process is already underway."
                : "Your reservation has been cancelled successfully. The cancellation window had already closed, so the charge remains final.";

        return buildEmailDocument(
                branding,
                "Your booking has been cancelled and the latest refund details are included below.",
                refundable ? "Refund in progress" : "Cancellation complete",
                refundable ? "#0f766e" : "#b45309",
                refundable ? "#ccfbf1" : "#ffedd5",
                refundable ? "#99f6e4" : "#fed7aa",
                "Your booking has been cancelled",
                personalGreeting(item.getName()) + wrapParagraph(policyCopy),
                buildPrimaryButton(frontendBaseUrl, "Explore more tours", branding.primaryColor()),
                buildBookingStatusCard(item, "Cancelled booking")
                        + statusCard
                        + buildLinkCard("Need another plan?", frontendBaseUrl, branding.primaryColor()),
                "If you need help reviewing refund timing or choosing a replacement experience, "
                        + buildSupportLine(branding, true));
    }

    private String buildProviderCancellationHtml(
            OrderItem item,
            BigDecimal refundAmount,
            EmailBranding branding) {

        String refundNote = buildNoticeCard(
                "Full refund issued",
                "A refund of " + formatMoney(refundAmount)
                        + " has been initiated automatically. Most banks post it within 5 to 10 business days.",
                "#b91c1c");

        return buildEmailDocument(
                branding,
                "The guide cancelled this tour and your refund has already been initiated.",
                "Operator update",
                "#b91c1c",
                "#fee2e2",
                "#fecaca",
                "This tour was cancelled by the guide",
                personalGreeting(item.getName())
                        + wrapParagraph(
                                "We are sorry for the disruption. The guide could not run this session, so we have cancelled the booking on your behalf and started the refund automatically."),
                buildPrimaryButton(frontendBaseUrl, "Find another experience", branding.primaryColor()),
                buildBookingStatusCard(item, "Affected booking")
                        + refundNote
                        + buildLinkCard("Browse current availability", frontendBaseUrl, branding.primaryColor()),
                "If you want help finding a similar route or rebooking quickly, "
                        + buildSupportLine(branding, true));
    }

    private String buildVerificationHtml(User user, String verifyUrl, EmailBranding branding) {
        String securityCard = buildNoticeCard(
                "Why this matters",
                "Confirming your email activates account access, keeps booking updates reliable, and helps protect your profile.",
                "#1d4ed8");

        return buildEmailDocument(
                branding,
                "Confirm your email address to activate your account and receive booking updates.",
                "Action required",
                "#1d4ed8",
                "#dbeafe",
                "#bfdbfe",
                "Confirm your email address",
                personalGreeting(user.getName())
                        + wrapParagraph(
                                "Finish setting up your account by confirming this email address. Once verified, you can sign in normally and receive important booking updates in the right place."),
                buildPrimaryButton(verifyUrl, "Verify email", branding.primaryColor()),
                securityCard + buildLinkCard("Verification link", verifyUrl, branding.primaryColor()),
                "If you did not create this account, you can safely ignore this email.");
    }

    private String buildPasswordResetHtml(User user, String resetUrl, EmailBranding branding) {
        String securityCard = buildNoticeCard(
                "Security note",
                "This reset link expires in 30 minutes. If you did not request a password reset, no action is needed and your password will stay unchanged.",
                "#4338ca");

        return buildEmailDocument(
                branding,
                "Use this secure link to reset your password. It expires in 30 minutes.",
                "Security check",
                "#4338ca",
                "#e0e7ff",
                "#c7d2fe",
                "Reset your password",
                personalGreeting(user.getName())
                        + wrapParagraph(
                                "We received a request to reset your password. Use the secure button below to choose a new one and get back into your account."),
                buildPrimaryButton(resetUrl, "Reset password", branding.primaryColor()),
                securityCard + buildLinkCard("Reset link", resetUrl, branding.primaryColor()),
                "If this request was not from you, you can ignore this email and nothing will change.");
    }

    private String buildContactMessageHtml(
            String name,
            String email,
            String subject,
            String message,
            EmailBranding branding) {

        String messageCard = buildCard(
                "Message",
                "Customer inquiry",
                "<div style=\"font-size:15px; line-height:1.8; color:" + DEFAULT_TEXT_COLOR + ";\">"
                        + escapeMultiline(message)
                        + "</div>");

        String contactDetails = buildDataCard(
                "Contact details",
                buildDataTable(
                        buildDataRow("Name", name),
                        buildDataRow("Email", email),
                        buildDataRow("Subject", subject)));

        String replyButton = buildPrimaryButton("mailto:" + attributeEscape(email), "Reply to sender", branding.primaryColor());

        return buildEmailDocument(
                branding,
                "A new contact form submission has arrived from " + name + ".",
                "New inquiry",
                "#1f2937",
                "#e2e8f0",
                "#cbd5e1",
                "New contact form message",
                wrapParagraph("A new inquiry came in through the public contact form for " + escape(branding.siteName()) + "."),
                replyButton,
                contactDetails + messageCard,
                "This message was submitted through the website contact form.");
    }

    private String buildExperienceCard(OrderItem item, int itemIndex) {
        StringBuilder rows = new StringBuilder();
        rows.append(buildDataRow("Experience", safeText(item.getTourTitle(), "Booked experience")));
        rows.append(buildDataRow("Date", formatDateTime(item.getScheduledAt())));
        rows.append(buildDataRow("Guests", String.valueOf(defaultInt(item.getParticipants()))));
        rows.append(buildDataRow("Language", safeText(item.getPreferredLanguage(), "Not specified")));
        rows.append(buildDataRow("Meeting point", resolveMeetingPoint(item)));

        if (hasText(item.getComment())) {
            rows.append(buildDataRow("Comment", item.getComment()));
        }

        rows.append(buildDataRow("Amount", formatMoney(item.getPricePaid())));

        return buildCard(
                "Experience " + itemIndex,
                safeText(item.getTourTitle(), "Booked experience"),
                buildDataTable(rows.toString()));
    }

    private String buildBookingStatusCard(OrderItem item, String label) {
        String rows = buildDataRow("Booking reference", "#" + item.getOrder().getId())
                + buildDataRow("Experience", safeText(item.getTourTitle(), "Booked experience"))
                + buildDataRow("Date", formatDateTime(item.getScheduledAt()))
                + buildDataRow("Guests", String.valueOf(defaultInt(item.getParticipants())))
                + buildDataRow("Amount", formatMoney(item.getPricePaid()));

        return buildDataCard(label, buildDataTable(rows));
    }

    private String buildEmailDocument(
            EmailBranding branding,
            String preheader,
            String badgeText,
            String badgeTextColor,
            String badgeBackgroundColor,
            String badgeBorderColor,
            String title,
            String introHtml,
            String actionHtml,
            String contentHtml,
            String footerMessage) {

        StringBuilder html = new StringBuilder();
        html.append("<html><body style=\"margin:0;padding:0;background-color:")
                .append(DEFAULT_BACKGROUND_COLOR)
                .append(";font-family:'Segoe UI',Arial,sans-serif;color:")
                .append(DEFAULT_TEXT_COLOR)
                .append(";\">");

        html.append("<div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;\">")
                .append(escape(preheader))
                .append("</div>");

        html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color:")
                .append(DEFAULT_BACKGROUND_COLOR)
                .append(";\">")
                .append("<tr><td align=\"center\" style=\"padding:32px 16px;\">")
                .append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:640px;background:")
                .append(DEFAULT_SURFACE_COLOR)
                .append(";border:1px solid ")
                .append(DEFAULT_BORDER_COLOR)
                .append(";border-radius:24px;overflow:hidden;\">")
                .append("<tr><td style=\"height:8px;background-color:")
                .append(branding.primaryColor())
                .append(";\"></td></tr>")
                .append("<tr><td style=\"padding:28px 32px 10px;\">")
                .append(buildBrandHeader(branding))
                .append(buildStatusBadge(badgeText, badgeTextColor, badgeBackgroundColor, badgeBorderColor))
                .append("<h1 style=\"margin:18px 0 12px;font-size:30px;line-height:1.2;color:")
                .append(branding.accentColor())
                .append(";font-weight:700;\">")
                .append(escape(title))
                .append("</h1>")
                .append(introHtml);

        if (hasText(actionHtml)) {
            html.append("<div style=\"padding-top:8px;\">").append(actionHtml).append("</div>");
        }

        html.append("</td></tr>")
                .append("<tr><td style=\"padding:0 32px 8px;\">")
                .append(contentHtml)
                .append("</td></tr>")
                .append("<tr><td style=\"padding:24px 32px 32px;border-top:1px solid ")
                .append(DEFAULT_BORDER_COLOR)
                .append(";\">")
                .append("<p style=\"margin:0;font-size:13px;line-height:1.8;color:")
                .append(DEFAULT_SOFT_TEXT_COLOR)
                .append(";\">")
                .append(footerMessage)
                .append("</p>")
                .append("<p style=\"margin:14px 0 0;font-size:12px;line-height:1.8;color:")
                .append(DEFAULT_SOFT_TEXT_COLOR)
                .append(";\">Sent by ")
                .append(escape(branding.siteName()))
                .append(" | <a href=\"")
                .append(attributeEscape(frontendBaseUrl))
                .append("\" style=\"color:")
                .append(branding.primaryColor())
                .append(";text-decoration:none;\">Visit site</a></p>")
                .append("</td></tr></table></td></tr></table></body></html>");

        return html.toString();
    }

    private String buildBrandHeader(EmailBranding branding) {
        StringBuilder html = new StringBuilder();
        html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td>");

        if (hasText(branding.logoUrl())) {
            html.append("<img src=\"")
                    .append(attributeEscape(branding.logoUrl()))
                    .append("\" alt=\"")
                    .append(attributeEscape(branding.siteName()))
                    .append("\" style=\"display:block;max-width:160px;height:auto;border:0;\"/>");
        } else {
            html.append("<div style=\"font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:")
                    .append(branding.primaryColor())
                    .append(";\">")
                    .append(escape(branding.siteName()))
                    .append("</div>");
        }

        html.append("<div style=\"padding-top:10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:")
                .append(DEFAULT_SOFT_TEXT_COLOR)
                .append(";\">Booking updates and customer support</div>")
                .append("</td></tr></table>");

        return html.toString();
    }

    private String buildStatusBadge(
            String text,
            String textColor,
            String backgroundColor,
            String borderColor) {

        return "<div style=\"display:inline-block;margin-top:20px;padding:8px 14px;border-radius:999px;"
                + "font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;"
                + "color:" + textColor + ";background-color:" + backgroundColor + ";border:1px solid " + borderColor + ";\">"
                + escape(text)
                + "</div>";
    }

    private String buildPrimaryButton(String url, String label, String color) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:8px;\">"
                + "<tr><td align=\"center\" style=\"border-radius:999px;background-color:" + color + ";\">"
                + "<a href=\"" + attributeEscape(url) + "\""
                + " style=\"display:inline-block;padding:14px 24px;border-radius:999px;"
                + "font-size:14px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;\">"
                + escape(label)
                + "</a></td></tr></table>";
    }

    private String buildCard(String kicker, String heading, String bodyHtml) {
        StringBuilder html = new StringBuilder();
        html.append("<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:16px;")
                .append("background-color:")
                .append(DEFAULT_MUTED_SURFACE_COLOR)
                .append(";border:1px solid ")
                .append(DEFAULT_BORDER_COLOR)
                .append(";border-radius:18px;\">")
                .append("<tr><td style=\"padding:22px 24px;\">");

        if (hasText(kicker)) {
            html.append("<div style=\"font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:")
                    .append(DEFAULT_SOFT_TEXT_COLOR)
                    .append(";margin-bottom:10px;\">")
                    .append(escape(kicker))
                    .append("</div>");
        }

        if (hasText(heading)) {
            html.append("<h2 style=\"margin:0 0 12px;font-size:20px;line-height:1.3;color:")
                    .append(DEFAULT_TEXT_COLOR)
                    .append(";font-weight:700;\">")
                    .append(escape(heading))
                    .append("</h2>");
        }

        html.append(bodyHtml)
                .append("</td></tr></table>");

        return html.toString();
    }

    private String buildDataCard(String title, String rowsHtml) {
        return buildCard("Details", title, rowsHtml);
    }

    private String buildNoticeCard(String title, String copy, String accentColor) {
        String primaryTint = rgba(accentColor, 0.08);
        String primaryBorder = rgba(accentColor, 0.18);

        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top:16px;"
                + "background-color:" + primaryTint + ";border:1px solid " + primaryBorder + ";border-radius:18px;\">"
                + "<tr><td style=\"padding:20px 22px;\">"
                + "<div style=\"font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:" + DEFAULT_SOFT_TEXT_COLOR + ";margin-bottom:10px;\">Next steps</div>"
                + "<div style=\"font-size:18px;font-weight:700;line-height:1.3;color:" + DEFAULT_TEXT_COLOR + ";margin-bottom:8px;\">"
                + escape(title)
                + "</div>"
                + "<div style=\"font-size:14px;line-height:1.75;color:" + DEFAULT_MUTED_TEXT_COLOR + ";\">"
                + escape(copy)
                + "</div>"
                + "</td></tr></table>";
    }

    private String buildLinkCard(String label, String url, String linkColor) {
        return buildCard(
                "Direct link",
                label,
                "<div style=\"font-size:13px;line-height:1.8;word-break:break-word;\">"
                        + "<a href=\"" + attributeEscape(url) + "\" style=\"color:" + linkColor
                        + ";text-decoration:none;\">"
                        + escape(url)
                        + "</a></div>");
    }

    private String buildDataTable(String... rowsHtml) {
        StringBuilder rows = new StringBuilder();
        for (String rowHtml : rowsHtml) {
            rows.append(rowHtml);
        }
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\">"
                + rows
                + "</table>";
    }

    private String buildDataRow(String label, String value) {
        return "<tr>"
                + "<td style=\"padding:8px 0;font-size:14px;line-height:1.6;color:" + DEFAULT_MUTED_TEXT_COLOR + ";\">"
                + escape(label)
                + "</td>"
                + "<td align=\"right\" style=\"padding:8px 0 8px 16px;font-size:14px;line-height:1.6;color:" + DEFAULT_TEXT_COLOR + ";font-weight:600;\">"
                + escape(safeText(value, "Not provided"))
                + "</td>"
                + "</tr>";
    }

    private String buildSupportLine(EmailBranding branding, boolean includeReplyLanguage) {
        if (hasText(branding.contactEmail())) {
            if (includeReplyLanguage) {
                return "reply to this email or write to <a href=\"mailto:" + attributeEscape(branding.contactEmail())
                        + "\" style=\"color:" + branding.primaryColor() + ";text-decoration:none;\">"
                        + escape(branding.contactEmail()) + "</a>.";
            }

            return "<a href=\"mailto:" + attributeEscape(branding.contactEmail()) + "\" style=\"color:"
                    + branding.primaryColor() + ";text-decoration:none;\">"
                    + escape(branding.contactEmail()) + "</a>.";
        }

        return "<a href=\"" + attributeEscape(frontendBaseUrl) + "\" style=\"color:" + branding.primaryColor()
                + ";text-decoration:none;\">" + escape(branding.siteName()) + "</a>.";
    }

    private String wrapParagraph(String copy) {
        return "<p style=\"margin:0 0 12px;font-size:15px;line-height:1.8;color:" + DEFAULT_MUTED_TEXT_COLOR + ";\">"
                + copy
                + "</p>";
    }

    private String personalGreeting(String rawName) {
        return wrapParagraph("Hello <strong style=\"color:" + DEFAULT_TEXT_COLOR + ";\">"
                + escape(safeText(rawName, "there"))
                + "</strong>,");
    }

    private EmailBranding loadBranding() {
        return buildBranding(storefrontSettingsRepository.findTopByOrderByIdAsc().orElse(null));
    }

    private EmailBranding buildBranding(StorefrontSettings settings) {
        if (settings == null) {
            return new EmailBranding(
                    DEFAULT_SITE_NAME,
                    DEFAULT_PRIMARY_COLOR,
                    DEFAULT_ACCENT_COLOR,
                    null,
                    null);
        }

        return new EmailBranding(
                safeText(settings.getSiteName(), DEFAULT_SITE_NAME),
                sanitizeHexColor(settings.getPrimaryColor(), DEFAULT_PRIMARY_COLOR),
                sanitizeHexColor(settings.getAccentColor(), DEFAULT_ACCENT_COLOR),
                hasText(settings.getLogoUrl()) ? settings.getLogoUrl().trim() : null,
                hasText(settings.getContactEmail()) ? settings.getContactEmail().trim() : null);
    }

    private String resolveSupportReplyTo(EmailBranding branding) {
        return hasText(branding.contactEmail()) ? branding.contactEmail() : null;
    }

    private String resolveContactReceiver(StorefrontSettings settings) {
        if (settings != null && hasText(settings.getContactReceiverEmail())) {
            return settings.getContactReceiverEmail().trim();
        }

        return hasText(contactReceiver) ? contactReceiver.trim() : null;
    }

    private String resolveMeetingPoint(OrderItem item) {
        if (item.getTour() != null && hasText(item.getTour().getMeetingPoint())) {
            return item.getTour().getMeetingPoint();
        }

        return "Shared closer to the experience start time";
    }

    private String formatDateTime(LocalDateTime scheduledAt) {
        return scheduledAt != null ? scheduledAt.format(EMAIL_DATE_FORMATTER) : "To be confirmed";
    }

    private String formatMoney(BigDecimal value) {
        BigDecimal normalized = value != null ? value : BigDecimal.ZERO;
        return String.format(Locale.US, "EUR %.2f", normalized);
    }

    private String formatPaymentMethod(String value) {
        String normalized = safeText(value, "Online payment").trim().replace('_', ' ');
        if (normalized.isEmpty()) {
            return "Online payment";
        }

        String[] words = normalized.split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (result.length() > 0) {
                result.append(' ');
            }
            if (word.length() == 1) {
                result.append(word.toUpperCase(Locale.ENGLISH));
            } else {
                result.append(word.substring(0, 1).toUpperCase(Locale.ENGLISH))
                        .append(word.substring(1).toLowerCase(Locale.ENGLISH));
            }
        }
        return result.toString();
    }

    private String sanitizeHexColor(String value, String fallback) {
        if (hasText(value) && value.trim().matches("^#[0-9a-fA-F]{6}$")) {
            return value.trim();
        }
        return fallback;
    }

    private String rgba(String hex, double alpha) {
        String sanitized = sanitizeHexColor(hex, DEFAULT_PRIMARY_COLOR);
        int red = Integer.parseInt(sanitized.substring(1, 3), 16);
        int green = Integer.parseInt(sanitized.substring(3, 5), 16);
        int blue = Integer.parseInt(sanitized.substring(5, 7), 16);
        return String.format(Locale.US, "rgba(%d,%d,%d,%.2f)", red, green, blue, alpha);
    }

    private int defaultInt(Integer value) {
        return value != null ? value : 0;
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value);
    }

    private String escapeMultiline(String value) {
        return escape(value).replace("\n", "<br/>");
    }

    private String attributeEscape(String value) {
        return HtmlUtils.htmlEscape(value);
    }

    private String safeText(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private record EmailBranding(
            String siteName,
            String primaryColor,
            String accentColor,
            String logoUrl,
            String contactEmail) {
    }
}
