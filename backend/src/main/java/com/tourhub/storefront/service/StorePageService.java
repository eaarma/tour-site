package com.tourhub.storefront.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.storefront.dto.StorePageDto;
import com.tourhub.storefront.dto.UpdateStorePageRequestDto;
import com.tourhub.storefront.model.StorePage;
import com.tourhub.storefront.model.StorePageSlug;
import com.tourhub.storefront.repository.StorePageRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StorePageService {

    private static final TypeReference<LinkedHashMap<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final StorePageRepository storePageRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Result<List<StorePageDto>> getPages() {
        List<StorePage> storedPages = storePageRepository.findAllByOrderByIdAsc();

        if (storedPages.isEmpty()) {
            return Result.ok(defaultPages()
                    .stream()
                    .map(this::toDto)
                    .toList());
        }

        Map<String, StorePage> pagesBySlug = new LinkedHashMap<>();
        storedPages.forEach(page -> pagesBySlug.put(page.getSlug(), page));

        List<StorePageDto> pages = new ArrayList<>();
        for (StorePageSlug slug : StorePageSlug.values()) {
            StorePage page = pagesBySlug.get(slug.getValue());
            pages.add(toDto(page != null ? page : buildDefaultPage(slug)));
        }

        return Result.ok(pages);
    }

    @Transactional(readOnly = true)
    public Result<StorePageDto> getPage(String slugValue) {
        StorePageSlug slug;

        try {
            slug = StorePageSlug.fromValue(slugValue);
        } catch (IllegalArgumentException exception) {
            return Result.fail(ApiError.notFound("Store page not found"));
        }

        StorePage page = storePageRepository.findBySlug(slug.getValue())
                .orElseGet(() -> buildDefaultPage(slug));

        return Result.ok(toDto(page));
    }

    @Transactional
    public Result<StorePageDto> updatePage(String slugValue, UpdateStorePageRequestDto dto) {
        StorePageSlug slug;

        try {
            slug = StorePageSlug.fromValue(slugValue);
        } catch (IllegalArgumentException exception) {
            return Result.fail(ApiError.notFound("Store page not found"));
        }

        Result<Void> validationResult = validatePageUpdate(slug, dto);
        if (validationResult.isFail()) {
            return Result.fail(validationResult.getErrorOrThrow());
        }

        StorePage page = storePageRepository.findBySlug(slug.getValue())
                .orElseGet(() -> buildDefaultPage(slug));

        page.setSlug(slug.getValue());
        page.setEyebrow(dto.getEyebrow().trim());
        page.setTitle(dto.getTitle().trim());
        page.setDescription(normalizeNullable(dto.getDescription()));
        page.setContentJson(writeJson(dto.getContentJson()));
        page.setClosingNote(normalizeNullable(dto.getClosingNote()));

        StorePage savedPage = storePageRepository.save(page);
        return Result.ok(toDto(savedPage));
    }

    private Result<Void> validatePageUpdate(StorePageSlug slug, UpdateStorePageRequestDto dto) {
        if (dto.getContentJson() == null || dto.getContentJson().isEmpty()) {
            return Result.fail(ApiError.badRequest("Page content cannot be empty."));
        }

        if (slug == StorePageSlug.FAQ) {
            List<?> items = readList(dto.getContentJson().get("items"));

            if (items.isEmpty()) {
                return Result.fail(ApiError.badRequest("FAQ pages need at least one item."));
            }

            for (Object item : items) {
                Map<String, Object> itemMap = readObject(item);
                if (itemMap == null) {
                    return Result.fail(ApiError.badRequest("FAQ items must be valid objects."));
                }

                if (isBlank(itemMap.get("question")) || isBlank(itemMap.get("answer"))) {
                    return Result.fail(ApiError.badRequest("Each FAQ item needs both a question and an answer."));
                }
            }

            return Result.ok();
        }

        if (slug == StorePageSlug.CONTACT) {
            if (isBlank(dto.getContentJson().get("detailsTitle"))
                    || isBlank(dto.getContentJson().get("detailsDescription"))
                    || isBlank(dto.getContentJson().get("bestForTitle"))
                    || isBlank(dto.getContentJson().get("bestForDescription"))
                    || isBlank(dto.getContentJson().get("messageTitle"))
                    || isBlank(dto.getContentJson().get("messageDescription"))
                    || isBlank(dto.getContentJson().get("emptyDetailsMessage"))
                    || isBlank(dto.getContentJson().get("submitButtonLabel"))) {
                return Result.fail(ApiError.badRequest("Contact pages need all public copy fields filled in."));
            }

            return Result.ok();
        }

        List<?> sections = readList(dto.getContentJson().get("sections"));

        if (sections.isEmpty()) {
            return Result.fail(ApiError.badRequest("Policy pages need at least one section."));
        }

        for (Object section : sections) {
            Map<String, Object> sectionMap = readObject(section);
            if (sectionMap == null) {
                return Result.fail(ApiError.badRequest("Policy sections must be valid objects."));
            }

            if (isBlank(sectionMap.get("title")) || isBlank(sectionMap.get("body"))) {
                return Result.fail(ApiError.badRequest("Each policy section needs both a title and body."));
            }
        }

        return Result.ok();
    }

    private StorePageDto toDto(StorePage page) {
        return StorePageDto.builder()
                .id(page.getId())
                .slug(page.getSlug())
                .eyebrow(page.getEyebrow())
                .title(page.getTitle())
                .description(page.getDescription())
                .contentJson(readContentJson(page.getContentJson()))
                .closingNote(page.getClosingNote())
                .createdAt(page.getCreatedAt() != null ? page.getCreatedAt().toString() : null)
                .updatedAt(page.getUpdatedAt() != null ? page.getUpdatedAt().toString() : null)
                .build();
    }

    private Map<String, Object> readContentJson(String contentJson) {
        try {
            return objectMapper.readValue(contentJson, MAP_TYPE);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored store page content is invalid JSON.", exception);
        }
    }

    private String writeJson(Object content) {
        try {
            return objectMapper.writeValueAsString(content);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Failed to serialize store page content.", exception);
        }
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }

    private boolean isBlank(Object value) {
        return !(value instanceof String stringValue) || stringValue.trim().isEmpty();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readObject(Object value) {
        if (value instanceof Map<?, ?> mapValue) {
            return (Map<String, Object>) mapValue;
        }

        return null;
    }

    private List<?> readList(Object value) {
        return value instanceof List<?> listValue ? listValue : List.of();
    }

    private List<StorePage> defaultPages() {
        return List.of(
                buildDefaultPage(StorePageSlug.FAQ),
                buildDefaultPage(StorePageSlug.PRIVACY),
                buildDefaultPage(StorePageSlug.TERMS),
                buildDefaultPage(StorePageSlug.REFUND),
                buildDefaultPage(StorePageSlug.CONTACT));
    }

    private StorePage buildDefaultPage(StorePageSlug slug) {
        return switch (slug) {
            case FAQ -> StorePage.builder()
                    .slug(slug.getValue())
                    .eyebrow("Help center")
                    .title("Frequently Asked Questions")
                    .description(null)
                    .contentJson(writeJson(Map.of(
                            "items",
                            List.of(
                                    Map.of(
                                            "question", "How do I confirm my booking?",
                                            "answer",
                                            "A booking is confirmed once your payment has been successfully processed. You will receive a confirmation email with your booking details and meeting information."),
                                    Map.of(
                                            "question", "What is the difference between Public and Private tours?",
                                            "answer",
                                            "Public tours are priced per person. The total cost depends on the number of participants selected.\n\nPrivate tours are priced per tour. The price is fixed for your group, regardless of the number of participants (within the allowed limit)."),
                                    Map.of(
                                            "question", "Can I cancel my booking?",
                                            "answer",
                                            "Yes. You may cancel your booking free of charge up to 24 hours before the scheduled tour start time.\n\nCancellations made within 24 hours of the tour start time are non-refundable."),
                                    Map.of(
                                            "question", "How do I cancel a booking?",
                                            "answer",
                                            "You can cancel your booking through your account under \"Upcoming Bookings\" or via the link provided in your confirmation email.\n\nIf your booking qualifies for a refund, the refund will be processed automatically to your original payment method."),
                                    Map.of(
                                            "question", "How long does a refund take?",
                                            "answer",
                                            "Refunds are issued to the original payment method and typically take 5-10 business days to appear, depending on your payment provider."),
                                    Map.of(
                                            "question", "What happens if I don't show up?",
                                            "answer",
                                            "Failure to attend a scheduled tour without prior cancellation is considered a no-show and is non-refundable."),
                                    Map.of(
                                            "question", "Is my payment secure?",
                                            "answer",
                                            "Yes. All payments are processed securely through Stripe. We do not store your full card details on our servers."),
                                    Map.of(
                                            "question", "Where do I find the meeting point?",
                                            "answer",
                                            "The meeting point is displayed on the tour detail page and included in your booking confirmation email."),
                                    Map.of(
                                            "question", "Who is responsible for the tour?",
                                            "answer",
                                            "Tours are operated by independent tour providers (\"Shops\"). They are responsible for delivering the tour experience. TourHub provides the booking and payment platform.")))))
                    .closingNote(null)
                    .build();
            case PRIVACY -> StorePage.builder()
                    .slug(slug.getValue())
                    .eyebrow("Legal")
                    .title("Privacy Policy")
                    .description(
                            "This Privacy Policy explains how TourHub (\"we\", \"our\", or \"us\") collects, uses, and protects your personal data when you use our platform to browse, book, and manage guided tours.")
                    .contentJson(writeJson(Map.of(
                            "sections",
                            List.of(
                                    Map.of(
                                            "title", "1. Information We Collect",
                                            "body",
                                            "- Name and email address when creating an account\n- Booking details (selected tours, dates, participants)\n- Payment-related information processed via Stripe\n- Authentication data (JWT tokens stored securely)\n- Technical data such as IP address and browser type"),
                                    Map.of(
                                            "title", "2. How We Use Your Data",
                                            "body",
                                            "- To process bookings and manage orders\n- To authenticate users and maintain sessions\n- To send booking confirmations and important notifications\n- To improve system performance and security"),
                                    Map.of(
                                            "title", "3. Payment Processing",
                                            "body",
                                            "Payments are securely processed via Stripe. We do not store your full card details. Stripe may collect and process payment data in accordance with their own privacy policy."),
                                    Map.of(
                                            "title", "4. Cookies & Authentication",
                                            "body",
                                            "We use secure HTTP-only cookies for authentication purposes. These cookies are required for login and session management and are not used for advertising."),
                                    Map.of(
                                            "title", "5. Data Retention",
                                            "body",
                                            "We retain booking and account information as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time."),
                                    Map.of(
                                            "title", "6. Data Security",
                                            "body",
                                            "We implement technical and organizational measures to protect your data, including encrypted connections (HTTPS), restricted server access, and monitoring systems."),
                                    Map.of(
                                            "title", "7. Your Rights",
                                            "body",
                                            "Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data. To exercise these rights, please contact us using the information below."),
                                    Map.of(
                                            "title", "8. Contact",
                                            "body",
                                            "If you have questions about this Privacy Policy, please contact us at {{contactEmail}}.")))))
                    .closingNote(null)
                    .build();
            case TERMS -> StorePage.builder()
                    .slug(slug.getValue())
                    .eyebrow("Legal")
                    .title("Terms & Conditions")
                    .description(
                            "These Terms & Conditions govern your use of TourHub and the booking of guided tours through our platform. By using this website, you agree to these terms.")
                    .contentJson(writeJson(Map.of(
                            "sections",
                            List.of(
                                    Map.of(
                                            "title", "1. Platform Role",
                                            "body",
                                            "TourHub operates as an online marketplace connecting customers with independent tour operators (\"Shops\"). TourHub is not the organizer of the tours unless explicitly stated. The respective Shop is responsible for delivering the tour service."),
                                    Map.of(
                                            "title", "2. Bookings",
                                            "body",
                                            "When placing an order, you agree to purchase the selected tour under the terms provided by the respective Shop.\n\n- Public tours are priced per participant.\n- Private tours are priced per tour (fixed group price).\n- A booking is confirmed only after successful payment processing."),
                                    Map.of(
                                            "title", "3. Payments",
                                            "body",
                                            "Payments are processed securely via Stripe. By completing a payment, you authorize the charge shown at checkout.\n\nTourHub may collect a platform service fee. The final price is displayed before payment confirmation."),
                                    Map.of(
                                            "title", "4. Cancellations & Refunds",
                                            "body",
                                            "Cancellation and refund policies are determined by the respective Shop and may vary per tour. Please review the specific cancellation terms listed for each tour before booking."),
                                    Map.of(
                                            "title", "5. User Accounts",
                                            "body",
                                            "Users are responsible for maintaining the confidentiality of their login credentials. You agree not to misuse the platform or attempt unauthorized access to other accounts."),
                                    Map.of(
                                            "title", "6. Liability",
                                            "body",
                                            "TourHub is not liable for the execution, safety, or quality of tours provided by independent Shops. Any claims related to the tour service must be directed to the responsible Shop."),
                                    Map.of(
                                            "title", "7. Modifications",
                                            "body",
                                            "We reserve the right to modify these Terms at any time. Updated versions will be published on this page."),
                                    Map.of(
                                            "title", "8. Contact",
                                            "body",
                                            "For questions regarding these Terms, please contact {{contactEmail}}.")))))
                    .closingNote(null)
                    .build();
            case REFUND -> StorePage.builder()
                    .slug(slug.getValue())
                    .eyebrow("Store policy")
                    .title("Cancellation Policy")
                    .description(
                            "This Cancellation Policy explains how booking cancellations and refunds are handled on TourHub.")
                    .contentJson(writeJson(Map.of(
                            "sections",
                            List.of(
                                    Map.of(
                                            "title", "1. Free Cancellation",
                                            "body",
                                            "Customers may cancel their booking free of charge up to 24 hours before the scheduled start time of the tour."),
                                    Map.of(
                                            "title", "2. Non-Refundable Period",
                                            "body",
                                            "Cancellations made within 24 hours of the scheduled tour start time are non-refundable."),
                                    Map.of(
                                            "title", "3. No-Show Policy",
                                            "body",
                                            "Failure to attend a scheduled tour without prior cancellation (\"no-show\") is considered non-refundable."),
                                    Map.of(
                                            "title", "4. Refund Processing",
                                            "body",
                                            "Approved refunds will be issued to the original payment method used during checkout.\n\nRefund processing times may vary depending on your payment provider, but typically take 5-10 business days to appear on your statement."),
                                    Map.of(
                                            "title", "5. Exceptions",
                                            "body",
                                            "In exceptional circumstances (such as severe weather, safety concerns, or tour operator cancellation), alternative arrangements or refunds may be offered at the discretion of the tour operator.")))))
                    .closingNote(null)
                    .build();
            case CONTACT -> StorePage.builder()
                    .slug(slug.getValue())
                    .eyebrow("{{siteName}}")
                    .title("Get in touch")
                    .description(
                            "We'd love to hear from you. Whether you have a question about our tours, booking, or just want help choosing the right experience, feel free to reach out.")
                    .contentJson(writeJson(Map.of(
                            "detailsTitle", "Contact details",
                            "detailsDescription",
                            "Use the information below for direct support or send us a message through the form.",
                            "bestForTitle", "Best for",
                            "bestForDescription",
                            "Questions about tours, booking guidance, availability, or help choosing between experiences.",
                            "messageTitle", "Message",
                            "messageDescription",
                            "Send a note and we'll get back to you as soon as we can.",
                            "emptyDetailsMessage",
                            "Contact details have not been configured yet. You can still use the form and the message will be sent through the site contact route.",
                            "submitButtonLabel", "Send")))
                    .closingNote(
                            "We usually recommend including the tour name, date, and any special questions so it's easier to help you quickly.")
                    .build();
        };
    }
}

