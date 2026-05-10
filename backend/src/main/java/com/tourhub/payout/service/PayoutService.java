package com.tourhub.payout.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.payment.model.PaymentLine;
import com.tourhub.payment.model.PaymentLineType;
import com.tourhub.payment.model.PaymentStatus;
import com.tourhub.order.model.OrderItem;
import com.tourhub.session.model.TourSession;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.security.annotations.AccessLevel;
import com.tourhub.security.annotations.ShopAccess;
import com.tourhub.security.annotations.ShopIdSource;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.payout.dto.PayoutCreateRequestDto;
import com.tourhub.payout.dto.PayoutHistoryEntryDto;
import com.tourhub.payout.dto.PayoutLineRowDto;
import com.tourhub.payout.dto.PayoutResponseDto;
import com.tourhub.payout.dto.PayoutSessionDetailsDto;
import com.tourhub.payout.dto.PayoutSessionGroupDto;
import com.tourhub.payout.dto.PayoutSessionSummaryDto;
import com.tourhub.payout.dto.PayoutShopDetailsDto;
import com.tourhub.payout.dto.PayoutShopSummaryDto;
import com.tourhub.payout.model.Payout;
import com.tourhub.payout.model.PayoutMethod;
import com.tourhub.payout.model.PayoutStatus;
import com.tourhub.payout.repository.PayoutRepository;
import com.tourhub.shop.model.Shop;
import com.tourhub.shop.repository.ShopRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayoutService {

    private final PaymentLineRepository paymentLineRepository;
    private final PayoutRepository payoutRepository;
    private final ShopRepository shopRepository;

    @Transactional
    public Result<PayoutResponseDto> createPayout(PayoutCreateRequestDto request) {
        Shop shop = shopRepository.findById(request.getShopId()).orElse(null);
        if (shop == null) {
            return Result.fail(ApiError.notFound("Shop not found"));
        }

        if (request.getMethod() == null) {
            return Result.fail(ApiError.badRequest("Payout method is required"));
        }

        Result<FilterWindow> filterWindowResult = resolveExplicitWindow(
                request.getPeriodStart(),
                request.getPeriodEnd());
        if (filterWindowResult.isFail()) {
            return Result.fail(filterWindowResult.error());
        }

        List<PaymentLine> lines = paymentLineRepository.findEligibleForPayout(
                request.getShopId(),
                filterWindowResult.get().from(),
                filterWindowResult.get().to());

        if (lines.isEmpty()) {
            return Result.fail(ApiError.badRequest("No eligible payment lines found for the selected payout window"));
        }

        String currency = lines.get(0).getCurrency();
        boolean mixedCurrencies = lines.stream()
                .map(PaymentLine::getCurrency)
                .anyMatch(lineCurrency -> !Objects.equals(currency, lineCurrency));
        if (mixedCurrencies) {
            return Result.fail(ApiError.badRequest("Eligible payment lines contain multiple currencies"));
        }

        String bankAccountName = firstNonBlank(request.getBankAccountName(), shop.getBankAccountName());
        String bankAccountIban = firstNonBlank(request.getBankAccountIban(), shop.getBankAccountIban());
        if (request.getMethod() == PayoutMethod.BANK_TRANSFER
                && (bankAccountName == null || bankAccountIban == null)) {
            return Result.fail(ApiError.badRequest("Bank account name and IBAN are required for bank transfer payouts"));
        }

        BigDecimal totalAmount = lines.stream()
                .map(PaymentLine::getShopAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Payout payout = Payout.builder()
                .shopId(request.getShopId())
                .totalAmount(totalAmount)
                .transactionCount(lines.size())
                .currency(currency)
                .periodStart(filterWindowResult.get().from())
                .periodEnd(filterWindowResult.get().to())
                .method(request.getMethod())
                .reference(normalizeNullableText(request.getReference()))
                .notes(normalizeNullableText(request.getNotes()))
                .status(PayoutStatus.COMPLETED)
                .paidAt(Instant.now())
                .bankAccountName(bankAccountName)
                .bankAccountIban(bankAccountIban)
                .build();

        Payout savedPayout = payoutRepository.save(payout);

        lines.forEach(line -> line.setPayout(savedPayout));
        paymentLineRepository.saveAll(lines);

        return Result.ok(toPayoutResponse(savedPayout));
    }

    @Transactional(readOnly = true)
    public Result<List<PayoutShopSummaryDto>> getAdminShopSummaries(
            String query,
            String status,
            Integer year,
            Integer month,
            LocalDate from,
            LocalDate to) {

        Result<FilterWindow> filterWindowResult = resolveFilterWindow(year, month, from, to);
        if (filterWindowResult.isFail()) {
            return Result.fail(filterWindowResult.error());
        }

        PayoutStatus normalizedStatus = normalizeStatus(status);
        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid payout status"));
        }

        List<PaymentLine> lines = paymentLineRepository.findAll(
                buildPayoutLineSpecification(filterWindowResult.get().from(), filterWindowResult.get().to(), null),
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")));

        List<PaymentLine> filteredLines = filterByPayoutStatus(lines, normalizedStatus);
        Map<Long, Shop> shopsById = resolveShops(filteredLines.stream()
                .map(PaymentLine::getShopId)
                .distinct()
                .toList());

        List<PayoutShopSummaryDto> summaries = shouldGroupByMonth(year, month, from, to)
                ? buildMonthlyShopSummaries(filteredLines, shopsById, query)
                : buildShopSummaries(
                        filteredLines,
                        shopsById,
                        query,
                        filterWindowResult.get().periodStart(),
                        filterWindowResult.get().periodEnd());

        return Result.ok(summaries);
    }

    @Transactional(readOnly = true)
    @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
    public Result<List<PayoutSessionSummaryDto>> getManagerSessionSummaries(
            Long shopId,
            String query,
            String status,
            Integer year,
            Integer month) {

        Shop shop = shopRepository.findById(shopId).orElse(null);
        if (shop == null) {
            return Result.fail(ApiError.notFound("Shop not found"));
        }

        Result<FilterWindow> filterWindowResult = resolveFilterWindow(year, month, null, null);
        if (filterWindowResult.isFail()) {
            return Result.fail(filterWindowResult.error());
        }

        PayoutStatus normalizedStatus = normalizeStatus(status);
        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid payout status"));
        }

        List<PaymentLine> lines = paymentLineRepository.findAll(
                buildPayoutLineSpecification(filterWindowResult.get().from(), filterWindowResult.get().to(), shopId),
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")));

        List<PaymentLine> filteredLines = filterByPayoutStatus(lines, normalizedStatus);

        List<PayoutSessionSummaryDto> summaries = shouldGroupByMonth(year, month, null, null)
                ? buildMonthlySessionSummaries(filteredLines, query)
                : buildSessionSummaries(
                        filteredLines,
                        query,
                        filterWindowResult.get().periodStart(),
                        filterWindowResult.get().periodEnd());

        return Result.ok(summaries);
    }

    @Transactional(readOnly = true)
    @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
    public Result<PayoutSessionDetailsDto> getManagerSessionDetails(
            Long shopId,
            Long sessionId,
            String status,
            LocalDate from,
            LocalDate to) {

        Shop shop = shopRepository.findById(shopId).orElse(null);
        if (shop == null) {
            return Result.fail(ApiError.notFound("Shop not found"));
        }

        Result<FilterWindow> filterWindowResult = resolveFilterWindow(null, null, from, to);
        if (filterWindowResult.isFail()) {
            return Result.fail(filterWindowResult.error());
        }

        PayoutStatus normalizedStatus = normalizeStatus(status);
        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid payout status"));
        }

        List<PaymentLine> lines = paymentLineRepository.findAll(
                buildPayoutLineSpecification(filterWindowResult.get().from(), filterWindowResult.get().to(), shopId),
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")));

        List<PaymentLine> filteredLines = filterByPayoutStatus(lines, normalizedStatus)
                .stream()
                .filter(line -> Objects.equals(toSessionGroupKey(line).sessionId(), sessionId))
                .toList();

        if (filteredLines.isEmpty()) {
            return Result.fail(ApiError.notFound("No payout transactions found for the selected session"));
        }

        SessionGroupKey sessionKey = toSessionGroupKey(filteredLines.get(0));
        BigDecimal totalAmount = filteredLines.stream()
                .map(PaymentLine::getShopAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        SummaryPayoutInfo payoutInfo = resolveSummaryPayoutInfo(filteredLines);

        return Result.ok(PayoutSessionDetailsDto.builder()
                .sessionId(sessionKey.sessionId())
                .sessionTitle(sessionKey.title())
                .managerName(resolveManagerName(filteredLines))
                .scheduledAt(sessionKey.scheduledAt())
                .currency(resolveCurrency(filteredLines))
                .status(payoutInfo.summaryStatus())
                .payoutStatus(payoutInfo.payoutStatus())
                .payoutId(payoutInfo.payoutId())
                .payoutAmount(payoutInfo.payoutAmount())
                .paidAt(payoutInfo.paidAt())
                .payoutPeriodStart(payoutInfo.periodStart())
                .payoutPeriodEnd(payoutInfo.periodEnd())
                .periodStart(filterWindowResult.get().periodStart())
                .periodEnd(filterWindowResult.get().periodEnd())
                .transactionCount(filteredLines.size())
                .totalAmount(totalAmount)
                .rows(filteredLines.stream().map(this::toLineRow).toList())
                .build());
    }

    @Transactional(readOnly = true)
    public Result<PayoutShopDetailsDto> getAdminShopDetails(
            Long shopId,
            String status,
            Integer year,
            Integer month,
            LocalDate from,
            LocalDate to) {

        Shop shop = shopRepository.findById(shopId).orElse(null);
        if (shop == null) {
            return Result.fail(ApiError.notFound("Shop not found"));
        }

        Result<FilterWindow> filterWindowResult = resolveFilterWindow(year, month, from, to);
        if (filterWindowResult.isFail()) {
            return Result.fail(filterWindowResult.error());
        }

        PayoutStatus normalizedStatus = normalizeStatus(status);
        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid payout status"));
        }

        List<PaymentLine> lines = paymentLineRepository.findAll(
                buildPayoutLineSpecification(filterWindowResult.get().from(), filterWindowResult.get().to(), shopId),
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")));

        List<PaymentLine> filteredLines = filterByPayoutStatus(lines, normalizedStatus);

        BigDecimal totalAmount = filteredLines.stream()
                .map(PaymentLine::getShopAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PayoutSessionGroupDto> sessionGroups = filteredLines.stream()
                .collect(Collectors.groupingBy(this::toSessionGroupKey, LinkedHashMap::new, Collectors.toList()))
                .entrySet()
                .stream()
                .sorted(Comparator
                        .comparing((Map.Entry<SessionGroupKey, List<PaymentLine>> entry) -> entry.getKey().scheduledAt(),
                                Comparator.nullsLast(LocalDateTime::compareTo))
                        .reversed()
                        .thenComparing(entry -> entry.getKey().title(), Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .map(entry -> toSessionGroup(entry.getKey(), entry.getValue()))
                .toList();
        SummaryPayoutInfo payoutInfo = resolveSummaryPayoutInfo(filteredLines);
        List<PayoutHistoryEntryDto> payouts = payoutRepository.findAllForShop(shopId)
                .stream()
                .filter(payout -> matchesPayoutWindow(
                        payout,
                        filterWindowResult.get().periodStart(),
                        filterWindowResult.get().periodEnd()))
                .map(this::toPayoutHistoryEntry)
                .toList();

        return Result.ok(PayoutShopDetailsDto.builder()
                .shopId(shop.getId())
                .shopName(shop.getName())
                .bankAccountName(shop.getBankAccountName())
                .bankAccountIban(shop.getBankAccountIban())
                .currency(resolveCurrency(filteredLines))
                .payoutStatus(payoutInfo.payoutStatus())
                .payoutId(payoutInfo.payoutId())
                .payoutAmount(payoutInfo.payoutAmount())
                .payoutPeriodStart(payoutInfo.periodStart())
                .payoutPeriodEnd(payoutInfo.periodEnd())
                .paidAt(payoutInfo.paidAt())
                .periodStart(filterWindowResult.get().periodStart())
                .periodEnd(filterWindowResult.get().periodEnd())
                .transactionCount(filteredLines.size())
                .totalAmount(totalAmount)
                .payouts(payouts)
                .sessionGroups(sessionGroups)
                .build());
    }

    private Result<FilterWindow> resolveFilterWindow(
            Integer year,
            Integer month,
            LocalDate from,
            LocalDate to) {

        if (from != null && to != null && from.isAfter(to)) {
            return Result.fail(ApiError.badRequest("'From' date must be before or equal to 'To' date"));
        }

        if (month != null && (month < 1 || month > 12)) {
            return Result.fail(ApiError.badRequest("Invalid month"));
        }

        if (month != null && year == null) {
            return Result.fail(ApiError.badRequest("Year is required when month is provided"));
        }

        if (from != null || to != null) {
            return Result.ok(new FilterWindow(
                    from != null ? from.atStartOfDay().toInstant(ZoneOffset.UTC) : null,
                    to != null ? to.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC) : null,
                    from,
                    to));
        }

        if (year != null) {
            LocalDate startDate = month != null
                    ? LocalDate.of(year, month, 1)
                    : LocalDate.of(year, 1, 1);
            LocalDate endExclusive = month != null
                    ? startDate.plusMonths(1)
                    : startDate.plusYears(1);
            LocalDate endDate = month != null
                    ? startDate.withDayOfMonth(startDate.lengthOfMonth())
                    : startDate.withDayOfYear(startDate.lengthOfYear());

            return Result.ok(new FilterWindow(
                    startDate.atStartOfDay().toInstant(ZoneOffset.UTC),
                    endExclusive.atStartOfDay().toInstant(ZoneOffset.UTC),
                    startDate,
                    endDate));
        }

        return Result.ok(new FilterWindow(null, null, null, null));
    }

    private Result<FilterWindow> resolveExplicitWindow(LocalDate periodStart, LocalDate periodEnd) {
        if (periodStart == null || periodEnd == null) {
            return Result.fail(ApiError.badRequest("Payout period start and end are required"));
        }

        if (periodStart.isAfter(periodEnd)) {
            return Result.fail(ApiError.badRequest("Payout period start must be before or equal to payout period end"));
        }

        return Result.ok(new FilterWindow(
                periodStart.atStartOfDay().toInstant(ZoneOffset.UTC),
                periodEnd.atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC),
                periodStart,
                periodEnd));
    }

    private boolean shouldGroupByMonth(
            Integer year,
            Integer month,
            LocalDate from,
            LocalDate to) {
        return year != null && month == null && from == null && to == null;
    }

    private List<PayoutShopSummaryDto> buildMonthlyShopSummaries(
            List<PaymentLine> lines,
            Map<Long, Shop> shopsById,
            String query) {

        return lines.stream()
                .collect(Collectors.groupingBy(
                        line -> YearMonth.from(line.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()),
                        LinkedHashMap::new,
                        Collectors.toList()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<YearMonth, List<PaymentLine>>comparingByKey().reversed())
                .flatMap(entry -> {
                    LocalDate periodStart = entry.getKey().atDay(1);
                    LocalDate periodEnd = entry.getKey().atEndOfMonth();

                    return entry.getValue().stream()
                            .collect(Collectors.groupingBy(PaymentLine::getShopId, LinkedHashMap::new, Collectors.toList()))
                            .entrySet()
                            .stream()
                            .map(shopEntry -> toShopSummary(
                                    shopEntry.getKey(),
                                    shopEntry.getValue(),
                                    shopsById.get(shopEntry.getKey()),
                                    periodStart,
                                    periodEnd))
                            .filter(summary -> matchesQuery(summary, query))
                            .sorted(Comparator
                                    .comparing(PayoutShopSummaryDto::getTotalAmount, Comparator.nullsLast(BigDecimal::compareTo))
                                    .reversed()
                                    .thenComparing(PayoutShopSummaryDto::getShopName, String.CASE_INSENSITIVE_ORDER));
                })
                .toList();
    }

    private List<PayoutShopSummaryDto> buildShopSummaries(
            List<PaymentLine> lines,
            Map<Long, Shop> shopsById,
            String query,
            LocalDate periodStart,
            LocalDate periodEnd) {

        return lines.stream()
                .collect(Collectors.groupingBy(PaymentLine::getShopId, LinkedHashMap::new, Collectors.toList()))
                .entrySet()
                .stream()
                .map(entry -> toShopSummary(
                        entry.getKey(),
                        entry.getValue(),
                        shopsById.get(entry.getKey()),
                        periodStart,
                        periodEnd))
                .filter(summary -> matchesQuery(summary, query))
                .sorted(Comparator
                        .comparing(PayoutShopSummaryDto::getTotalAmount, Comparator.nullsLast(BigDecimal::compareTo))
                        .reversed()
                        .thenComparing(PayoutShopSummaryDto::getShopName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private List<PayoutSessionSummaryDto> buildMonthlySessionSummaries(
            List<PaymentLine> lines,
            String query) {

        return lines.stream()
                .collect(Collectors.groupingBy(
                        line -> YearMonth.from(line.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate()),
                        LinkedHashMap::new,
                        Collectors.toList()))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<YearMonth, List<PaymentLine>>comparingByKey().reversed())
                .flatMap(entry -> {
                    LocalDate periodStart = entry.getKey().atDay(1);
                    LocalDate periodEnd = entry.getKey().atEndOfMonth();

                    return entry.getValue().stream()
                            .collect(Collectors.groupingBy(this::toSessionGroupKey, LinkedHashMap::new, Collectors.toList()))
                            .entrySet()
                            .stream()
                            .map(sessionEntry -> toSessionSummary(
                                    sessionEntry.getKey(),
                                    sessionEntry.getValue(),
                                    periodStart,
                                    periodEnd))
                            .filter(summary -> matchesSessionQuery(summary, query))
                            .sorted(Comparator
                                    .comparing(PayoutSessionSummaryDto::getTotalAmount, Comparator.nullsLast(BigDecimal::compareTo))
                                    .reversed()
                                    .thenComparing(PayoutSessionSummaryDto::getSessionTitle,
                                            Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
                })
                .toList();
    }

    private List<PayoutSessionSummaryDto> buildSessionSummaries(
            List<PaymentLine> lines,
            String query,
            LocalDate periodStart,
            LocalDate periodEnd) {

        return lines.stream()
                .collect(Collectors.groupingBy(this::toSessionGroupKey, LinkedHashMap::new, Collectors.toList()))
                .entrySet()
                .stream()
                .map(entry -> toSessionSummary(
                        entry.getKey(),
                        entry.getValue(),
                        periodStart,
                        periodEnd))
                .filter(summary -> matchesSessionQuery(summary, query))
                .sorted(Comparator
                        .comparing(PayoutSessionSummaryDto::getTotalAmount, Comparator.nullsLast(BigDecimal::compareTo))
                        .reversed()
                        .thenComparing(PayoutSessionSummaryDto::getSessionTitle,
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();
    }

    private Specification<PaymentLine> buildPayoutLineSpecification(
            Instant from,
            Instant to,
            Long shopId) {

        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.equal(root.get("status"), PaymentStatus.SUCCEEDED));
            predicates.add(root.get("type").in(
                    PaymentLineType.SALE,
                    PaymentLineType.REFUND,
                    PaymentLineType.CANCELLATION_FEE));

            if (shopId != null) {
                predicates.add(criteriaBuilder.equal(root.get("shopId"), shopId));
            }

            if (from != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(criteriaBuilder.lessThan(root.get("createdAt"), to));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private List<PaymentLine> filterByPayoutStatus(List<PaymentLine> lines, PayoutStatus status) {
        if (status == null) {
            return lines;
        }

        return lines.stream()
                .filter(line -> derivePayoutStatus(line) == status)
                .toList();
    }

    private PayoutStatus normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return PayoutStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private PayoutStatus derivePayoutStatus(PaymentLine line) {
        return line.getPayout() != null
                ? line.getPayout().getStatus()
                : PayoutStatus.PENDING;
    }

    private Map<Long, Shop> resolveShops(List<Long> shopIds) {
        return shopRepository.findAllById(shopIds)
                .stream()
                .collect(Collectors.toMap(Shop::getId, shop -> shop));
    }

    private PayoutShopSummaryDto toShopSummary(
            Long shopId,
            List<PaymentLine> lines,
            Shop shop,
            LocalDate periodStart,
            LocalDate periodEnd) {
        BigDecimal totalAmount = lines.stream()
                .map(PaymentLine::getShopAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        SummaryPayoutInfo payoutInfo = resolveSummaryPayoutInfo(lines);

        return PayoutShopSummaryDto.builder()
                .shopId(shopId)
                .shopName(shop != null && shop.getName() != null ? shop.getName() : "Shop #" + shopId)
                .bankAccountName(shop != null ? shop.getBankAccountName() : null)
                .bankAccountIban(shop != null ? shop.getBankAccountIban() : null)
                .currency(resolveCurrency(lines))
                .status(payoutInfo.summaryStatus())
                .payoutStatus(payoutInfo.payoutStatus())
                .payoutId(payoutInfo.payoutId())
                .payoutAmount(payoutInfo.payoutAmount())
                .paidAt(payoutInfo.paidAt())
                .payoutPeriodStart(payoutInfo.periodStart())
                .payoutPeriodEnd(payoutInfo.periodEnd())
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .transactionCount(lines.size())
                .totalAmount(totalAmount)
                .build();
    }

    private String resolveCurrency(List<PaymentLine> lines) {
        return lines.stream()
                .map(PaymentLine::getCurrency)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("EUR");
    }

    private SummaryPayoutInfo resolveSummaryPayoutInfo(List<PaymentLine> lines) {
        List<Payout> payouts = lines.stream()
                .map(PaymentLine::getPayout)
                .filter(Objects::nonNull)
                .toList();

        if (payouts.isEmpty()) {
            return new SummaryPayoutInfo(PayoutStatus.PENDING, null, null, null, null, null, null);
        }

        Payout latestPayout = payouts.stream()
                .max(Comparator
                        .comparing(Payout::getPaidAt, Comparator.nullsLast(Instant::compareTo))
                        .thenComparing(Payout::getCreatedAt, Comparator.nullsLast(Instant::compareTo))
                        .thenComparing(Payout::getId, Comparator.nullsLast(Long::compareTo)))
                .orElse(null);

        if (latestPayout == null) {
            return new SummaryPayoutInfo(null, null, null, null, null, null, null);
        }

        boolean everyLineAttachedToSamePayout = lines.stream()
                .allMatch(line -> line.getPayout() != null
                        && Objects.equals(line.getPayout().getId(), latestPayout.getId()));

        return new SummaryPayoutInfo(
                everyLineAttachedToSamePayout ? latestPayout.getStatus() : null,
                latestPayout.getStatus(),
                latestPayout.getId(),
                latestPayout.getPaidAt(),
                toLocalDate(latestPayout.getPeriodStart()),
                toInclusiveLocalDate(latestPayout.getPeriodEnd()),
                latestPayout.getTotalAmount());
    }

    private boolean matchesQuery(PayoutShopSummaryDto summary, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }

        String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);
        return summary.getShopName().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                || String.valueOf(summary.getShopId()).contains(normalizedQuery);
    }

    private boolean matchesSessionQuery(PayoutSessionSummaryDto summary, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }

        String normalizedQuery = query.trim().toLowerCase(Locale.ROOT);
        String sessionTitle = summary.getSessionTitle() != null ? summary.getSessionTitle() : "";

        return sessionTitle.toLowerCase(Locale.ROOT).contains(normalizedQuery)
                || (summary.getSessionId() != null && String.valueOf(summary.getSessionId()).contains(normalizedQuery));
    }

    private PayoutSessionGroupDto toSessionGroup(SessionGroupKey key, List<PaymentLine> lines) {
        BigDecimal totalAmount = lines.stream()
                .map(PaymentLine::getShopAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<PayoutLineRowDto> rows = lines.stream()
                .map(this::toLineRow)
                .toList();

        return PayoutSessionGroupDto.builder()
                .sessionId(key.sessionId())
                .sessionTitle(key.title())
                .scheduledAt(key.scheduledAt())
                .transactionCount(lines.size())
                .totalAmount(totalAmount)
                .rows(rows)
                .build();
    }

    private PayoutSessionSummaryDto toSessionSummary(
            SessionGroupKey key,
            List<PaymentLine> lines,
            LocalDate periodStart,
            LocalDate periodEnd) {
        BigDecimal totalAmount = lines.stream()
                .map(PaymentLine::getShopAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        SummaryPayoutInfo payoutInfo = resolveSummaryPayoutInfo(lines);

        PayoutSessionSummaryDto summary = new PayoutSessionSummaryDto();
        summary.setSessionId(key.sessionId());
        summary.setSessionTitle(key.title());
        summary.setManagerName(resolveManagerName(lines));
        summary.setScheduledAt(key.scheduledAt());
        summary.setCurrency(resolveCurrency(lines));
        summary.setStatus(payoutInfo.summaryStatus());
        summary.setPayoutStatus(payoutInfo.payoutStatus());
        summary.setPayoutId(payoutInfo.payoutId());
        summary.setPayoutAmount(payoutInfo.payoutAmount());
        summary.setPaidAt(payoutInfo.paidAt());
        summary.setPayoutPeriodStart(payoutInfo.periodStart());
        summary.setPayoutPeriodEnd(payoutInfo.periodEnd());
        summary.setPeriodStart(periodStart);
        summary.setPeriodEnd(periodEnd);
        summary.setTransactionCount(lines.size());
        summary.setTotalAmount(totalAmount);
        return summary;
    }

    private boolean matchesPayoutWindow(Payout payout, LocalDate viewStart, LocalDate viewEnd) {
        if (viewStart == null && viewEnd == null) {
            return true;
        }

        LocalDate payoutStart = toLocalDate(payout.getPeriodStart());
        LocalDate payoutEnd = toInclusiveLocalDate(payout.getPeriodEnd());
        if (payoutStart == null && payoutEnd == null) {
            return false;
        }

        LocalDate effectiveStart = payoutStart != null ? payoutStart : payoutEnd;
        LocalDate effectiveEnd = payoutEnd != null ? payoutEnd : payoutStart;

        if (effectiveStart == null || effectiveEnd == null) {
            return false;
        }

        if (viewEnd != null && effectiveStart.isAfter(viewEnd)) {
            return false;
        }

        if (viewStart != null && effectiveEnd.isBefore(viewStart)) {
            return false;
        }

        return true;
    }

    private PayoutHistoryEntryDto toPayoutHistoryEntry(Payout payout) {
        return PayoutHistoryEntryDto.builder()
                .id(payout.getId())
                .totalAmount(payout.getTotalAmount())
                .transactionCount(payout.getTransactionCount())
                .currency(payout.getCurrency())
                .status(payout.getStatus())
                .method(payout.getMethod())
                .reference(payout.getReference())
                .paidAt(payout.getPaidAt())
                .createdAt(payout.getCreatedAt())
                .periodStart(toLocalDate(payout.getPeriodStart()))
                .periodEnd(toInclusiveLocalDate(payout.getPeriodEnd()))
                .build();
    }

    private PayoutLineRowDto toLineRow(PaymentLine line) {
        OrderItem orderItem = line.getOrderItem();
        TourSession session = resolveSession(line);

        return PayoutLineRowDto.builder()
                .paymentLineId(line.getId())
                .label(toDisplayLabel(line.getType()))
                .type(line.getType())
                .orderId(orderItem != null && orderItem.getOrder() != null ? orderItem.getOrder().getId() : null)
                .orderItemId(orderItem != null ? orderItem.getId() : null)
                .sessionId(session != null ? session.getId() : null)
                .tourTitle(resolveTourTitle(line))
                .scheduledAt(resolveScheduledAt(line))
                .participants(orderItem != null ? orderItem.getParticipants() : null)
                .grossAmount(line.getGrossAmount())
                .platformFee(line.getPlatformFee())
                .shopAmount(line.getShopAmount())
                .currency(line.getCurrency())
                .createdAt(line.getCreatedAt())
                .build();
    }

    private SessionGroupKey toSessionGroupKey(PaymentLine line) {
        TourSession session = resolveSession(line);
        return new SessionGroupKey(
                session != null ? session.getId() : null,
                resolveSessionTitle(line),
                resolveScheduledAt(line));
    }

    private TourSession resolveSession(PaymentLine line) {
        if (line.getSession() != null) {
            return line.getSession();
        }

        if (line.getOrderItem() != null) {
            return line.getOrderItem().getSession();
        }

        return null;
    }

    private String resolveSessionTitle(PaymentLine line) {
        TourSession session = resolveSession(line);
        if (session != null
                && session.getSchedule() != null
                && session.getSchedule().getTour() != null
                && session.getSchedule().getTour().getTitle() != null) {
            return session.getSchedule().getTour().getTitle();
        }

        if (line.getOrderItem() != null && line.getOrderItem().getTourTitle() != null) {
            return line.getOrderItem().getTourTitle();
        }

        return "Sessionless entries";
    }

    private String resolveManagerName(List<PaymentLine> lines) {
        return lines.stream()
                .map(this::resolveSession)
                .filter(Objects::nonNull)
                .map(TourSession::getManager)
                .filter(Objects::nonNull)
                .map(manager -> manager.getName() != null ? manager.getName().trim() : null)
                .filter(name -> name != null && !name.isEmpty())
                .findFirst()
                .orElse(null);
    }

    private String resolveTourTitle(PaymentLine line) {
        if (line.getOrderItem() != null && line.getOrderItem().getTourTitle() != null) {
            return line.getOrderItem().getTourTitle();
        }

        return resolveSessionTitle(line);
    }

    private LocalDateTime resolveScheduledAt(PaymentLine line) {
        if (line.getOrderItem() != null && line.getOrderItem().getScheduledAt() != null) {
            return line.getOrderItem().getScheduledAt();
        }

        TourSession session = resolveSession(line);
        if (session != null && session.getSchedule() != null && session.getSchedule().getDate() != null) {
            LocalTime time = session.getSchedule().getTime() != null
                    ? session.getSchedule().getTime()
                    : LocalTime.MIDNIGHT;
            return LocalDateTime.of(session.getSchedule().getDate(), time);
        }

        return null;
    }

    private String toDisplayLabel(PaymentLineType type) {
        return switch (type) {
            case SALE -> "Order item income";
            case REFUND -> "Refund";
            case CANCELLATION_FEE -> "Cancellation fee";
            default -> type.name();
        };
    }

    private PayoutResponseDto toPayoutResponse(Payout payout) {
        return PayoutResponseDto.builder()
                .id(payout.getId())
                .shopId(payout.getShopId())
                .totalAmount(payout.getTotalAmount())
                .transactionCount(payout.getTransactionCount())
                .currency(payout.getCurrency())
                .method(payout.getMethod())
                .reference(payout.getReference())
                .notes(payout.getNotes())
                .status(payout.getStatus())
                .bankAccountName(payout.getBankAccountName())
                .bankAccountIban(payout.getBankAccountIban())
                .paidAt(payout.getPaidAt())
                .createdAt(payout.getCreatedAt())
                .periodStart(toLocalDate(payout.getPeriodStart()))
                .periodEnd(toInclusiveLocalDate(payout.getPeriodEnd()))
                .build();
    }

    private LocalDate toLocalDate(Instant instant) {
        if (instant == null) {
            return null;
        }

        return instant.atZone(ZoneOffset.UTC).toLocalDate();
    }

    private LocalDate toInclusiveLocalDate(Instant instant) {
        return toLocalDate(instant);
    }

    private String firstNonBlank(String preferred, String fallback) {
        String normalizedPreferred = normalizeNullableText(preferred);
        if (normalizedPreferred != null) {
            return normalizedPreferred;
        }

        return normalizeNullableText(fallback);
    }

    private String normalizeNullableText(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record FilterWindow(Instant from, Instant to, LocalDate periodStart, LocalDate periodEnd) {
    }

    private record SessionGroupKey(Long sessionId, String title, LocalDateTime scheduledAt) {
    }

    private record SummaryPayoutInfo(
            PayoutStatus summaryStatus,
            PayoutStatus payoutStatus,
            Long payoutId,
            Instant paidAt,
            LocalDate periodStart,
            LocalDate periodEnd,
            BigDecimal payoutAmount) {
    }
}


