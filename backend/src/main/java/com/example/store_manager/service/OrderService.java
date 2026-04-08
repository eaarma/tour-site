package com.example.store_manager.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.order.OrderStatusDto;
import com.example.store_manager.dto.tour.TourSnapshotDto;
import com.example.store_manager.mapper.OrderItemMapper;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import com.example.store_manager.repository.TourSessionRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

        private final OrderRepository orderRepository;
        private final UserRepository userRepository;
        private final TourRepository tourRepository;
        private final OrderMapper orderMapper;
        private final OrderItemMapper orderItemMapper;
        private final OrderItemRepository orderItemRepository;
        private final ShopUserRepository shopUserRepository;
        private final TourScheduleRepository tourScheduleRepository;
        private final CurrentUserService currentUserService;
        private final TourSessionRepository tourSessionRepository;
        private final PaymentService paymentService;

        @Transactional(readOnly = true)
        public Result<Page<OrderResponseDto>> searchOrdersForAdmin(
                        String query,
                        String status,
                        LocalDate from,
                        LocalDate to,
                        int page,
                        int size) {

                if (from != null && to != null && from.isAfter(to)) {
                        return Result.fail(ApiError.badRequest("'From' date must be before or equal to 'To' date"));
                }

                String normalizedQuery = normalizeQuery(query);
                OrderStatus normalizedStatus = normalizeStatus(status);

                if (status != null && !status.isBlank() && normalizedStatus == null) {
                        return Result.fail(ApiError.badRequest("Invalid order status"));
                }

                Pageable pageable = PageRequest.of(
                                page,
                                size,
                                Sort.by(
                                                Sort.Order.desc("createdAt"),
                                                Sort.Order.desc("id")));

                Instant createdFrom = from != null
                                ? from.atStartOfDay(ZoneOffset.UTC).toInstant()
                                : null;

                Instant createdTo = to != null
                                ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant()
                                : null;

                Page<Order> result = orderRepository.findAll(
                                buildAdminOrderSpecification(
                                                normalizedQuery,
                                                normalizedStatus,
                                                createdFrom,
                                                createdTo),
                                pageable);

                return Result.ok(result.map(orderMapper::toDto));
        }

        @Transactional
        public Result<OrderResponseDto> createOrder(
                        OrderCreateRequestDto dto,
                        UUID userId) {

                User user = null;
                if (userId != null) {
                        user = userRepository.findById(userId).orElse(null);
                        if (user == null) {
                                return Result.fail(ApiError.notFound("User not found"));
                        }
                }

                Result<Order> built = buildOrder(dto, user, OrderStatus.PENDING, false);

                if (built.isFail()) {
                        return Result.fail(built.getErrorOrThrow());
                }

                Order saved = orderRepository.save(built.get());

                return Result.ok(orderMapper.toDto(saved));
        }

        @Transactional
        protected Result<Order> buildOrder(
                        OrderCreateRequestDto dto,
                        User user,
                        OrderStatus orderStatus,
                        boolean reserveOnly) {

                Order order = Order.builder()
                                .user(user)
                                .paymentMethod(dto.getPaymentMethod())
                                .status(orderStatus)
                                .build();

                BigDecimal totalPrice = BigDecimal.ZERO;

                for (OrderItemCreateRequestDto itemDto : dto.getItems()) {

                        Tour tour = tourRepository.findById(itemDto.getTourId()).orElse(null);
                        if (tour == null) {
                                return Result.fail(ApiError.notFound("Tour not found"));
                        }

                        // 🔒 Lock schedule
                TourSchedule schedule = tourScheduleRepository
                                .findByIdForUpdate(itemDto.getScheduleId())
                                .orElse(null);

                if (schedule == null) {
                        return Result.fail(ApiError.notFound("Schedule not found"));
                }

                if (schedule.getTour() == null
                                || schedule.getTour().getId() == null
                                || !schedule.getTour().getId().equals(tour.getId())) {
                        return Result.fail(ApiError.badRequest(
                                        "Selected schedule does not belong to the requested tour"));
                }

                int available = schedule.getAvailableParticipants();

                        if (itemDto.getParticipants() > available) {
                                return Result.fail(
                                                ApiError.badRequest("Not enough spots available for this schedule"));
                        }

                        // Update inventory-related schedule counts.
                        if (reserveOnly) {
                                schedule.setReservedParticipants(
                                                schedule.getReservedParticipants() + itemDto.getParticipants());
                        } else {
                                int newBooked = schedule.getBookedParticipants() + itemDto.getParticipants();

                                schedule.setBookedParticipants(newBooked);

                                if ("PRIVATE".equalsIgnoreCase(tour.getType())
                                                || newBooked >= schedule.getMaxParticipants()) {
                                        schedule.setStatus("BOOKED");
                                } else {
                                        schedule.setStatus("ACTIVE");
                                }
                        }
                        BigDecimal price;
                        if ("PRIVATE".equalsIgnoreCase(tour.getType())) {
                                price = tour.getPrice(); // per tour
                        } else {
                                price = tour.getPrice().multiply(BigDecimal.valueOf(itemDto.getParticipants()));

                        }

                        OrderItem item = OrderItem.builder()
                                        .order(order)
                                        .tour(tour)
                                        .session(null)
                                        .shopId(tour.getShop().getId())
                                        .tourTitle(tour.getTitle())
                                        .scheduledAt(
                                                        LocalDateTime.of(
                                                                        schedule.getDate(),
                                                                        schedule.getTime()))
                                        .schedule(schedule)
                                        .participants(itemDto.getParticipants())
                                        .name(dto.getName())
                                        .email(dto.getEmail())
                                        .phone(dto.getPhone())
                                        .nationality(dto.getNationality())
                                        .preferredLanguage(itemDto.getPreferredLanguage())
                                        .comment(itemDto.getComment())
                                        .paymentMethod(dto.getPaymentMethod())
                                        .status(orderStatus)
                                        .pricePaid(price)
                                        .tourSnapshot(orderMapper.toJsonSnapshot(
                                                        TourSnapshotDto.builder()
                                                                        .id(tour.getId())
                                                                        .title(tour.getTitle())
                                                                        .description(tour.getDescription())
                                                                        .price(tour.getPrice())
                                                                        .type(tour.getType())
                                                                        .build()))
                                        .build();

                        order.getOrderItems().add(item);
                        totalPrice = totalPrice.add(price);
                }

                order.setTotalPrice(totalPrice);

                return Result.ok(order);
        }

        @Transactional
        public Result<OrderResponseDto> finalizeReservation(
                        Long orderId,
                        UUID token) {

                Order order = orderRepository
                                .findByIdAndReservationToken(orderId, token)
                                .orElse(null);
                if (order == null) {
                        return Result.fail(ApiError.notFound("Order not found"));
                }

                if (order.getStatus() == OrderStatus.FINALIZED) {
                        return Result.ok(orderMapper.toDto(order));
                }

                if (order.getStatus() != OrderStatus.RESERVED) {
                        return Result.fail(ApiError.badRequest(
                                        "Order is not in RESERVED state"));
                }

                if (!Objects.equals(order.getReservationToken(), token)) {
                        return Result.fail(ApiError.forbidden(
                                        "Invalid reservation token"));
                }

                if (order.getExpiresAt() != null &&
                                order.getExpiresAt().isBefore(Instant.now())) {

                        return Result.fail(ApiError.badRequest(
                                        "Reservation has expired"));
                }
                for (OrderItem item : order.getOrderItems()) {

                        // ensure session exists (this is fine here)
                        TourSchedule schedule = tourScheduleRepository
                                        .findByIdForUpdate(item.getSchedule().getId())
                                        .orElse(null);

                        if (schedule == null) {
                                return Result.fail(ApiError.notFound("Schedule not found"));
                        }

                        TourSession session = tourSessionRepository
                                        .findByScheduleId(schedule.getId())
                                        .orElseGet(() -> tourSessionRepository.save(
                                                        TourSession.builder()
                                                                        .schedule(schedule)
                                                                        .status(SessionStatus.PLANNED)
                                                                        .build()));

                        item.setSession(session);
                        item.setStatus(OrderStatus.FINALIZED);
                }

                order.setStatus(OrderStatus.FINALIZED);

                paymentService.createPendingForOrder(order);

                Order saved = orderRepository.save(order);

                return Result.ok(orderMapper.toDto(saved));
        }

        @Transactional(readOnly = true)
        public Result<OrderStatusDto> getReservationStatus(
                        Long orderId,
                        UUID reservationToken) {

                Order order = orderRepository
                                .findByIdAndReservationToken(orderId, reservationToken)
                                .orElse(null);

                if (order == null) {
                        return Result.fail(ApiError.notFound("Order not found"));
                }

                long remaining = 0;

                if (order.getExpiresAt() != null) {
                        remaining = Duration
                                        .between(Instant.now(), order.getExpiresAt())
                                        .getSeconds();

                        remaining = Math.max(0, remaining);
                }

                return Result.ok(new OrderStatusDto(
                                order.getId(),
                                order.getStatus(),
                                order.getExpiresAt(),
                                remaining));
        }

        /* Get a single order by ID. */
        @Transactional(readOnly = true)
        public Result<OrderResponseDto> getOrderById(
                        Long orderId,
                        Authentication auth,
                        String token) {

                Order order = orderRepository.findById(orderId).orElse(null);

                if (order == null) {
                        return Result.fail(ApiError.notFound("Order not found"));
                }

                // ----------------------------
                // Allow manager or admin access.
                // ----------------------------
                if (auth != null && auth.isAuthenticated()
                                && auth.getPrincipal() instanceof CustomUserDetails user) {

                        boolean isAdmin = user.getAuthorities().stream()
                                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                        if (isAdmin) {
                                return Result.ok(orderMapper.toDto(order));
                        }

                        // ----------------------------
                        // Limit staff access to shops on this order.
                        // ----------------------------
                        if (hasGuideOrAboveAccessToAllOrderShops(order, user.getId())) {
                                return Result.ok(orderMapper.toDto(order));
                        }

                        // ----------------------------
                        // Allow access for the logged-in owner.
                        // ----------------------------
                        if (order.getUser() != null &&
                                        order.getUser().getId().equals(user.getId())) {

                                return Result.ok(orderMapper.toDto(order));
                        }
                }

                // ----------------------------
                // 4️⃣ Guest access via token
                // ----------------------------
                if (token != null
                                && order.getReservationToken() != null
                                && token.equals(order.getReservationToken().toString())) {

                        return Result.ok(orderMapper.toDto(order));
                }

                return Result.fail(ApiError.forbidden("Not allowed to view this order"));
        }

        private boolean hasGuideOrAboveAccessToAllOrderShops(Order order, UUID userId) {

                if (userId == null || order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
                        return false;
                }

                Set<Long> shopIds = new HashSet<>();

                for (OrderItem item : order.getOrderItems()) {
                        Long shopId = item.getShopId();

                        if (shopId == null && item.getTour() != null && item.getTour().getShop() != null) {
                                shopId = item.getTour().getShop().getId();
                        }

                        if (shopId == null) {
                                return false;
                        }

                        shopIds.add(shopId);
                }

                return shopIds.stream().allMatch(shopId -> shopUserRepository.findByShopIdAndUserId(shopId, userId)
                                .filter(membership -> membership.getStatus() == ShopUserStatus.ACTIVE)
                                .filter(membership -> membership.getRole().getLevel() >= AccessLevel.GUIDE.getLevel())
                                .isPresent());
        }

        @Transactional(readOnly = true)
        public Result<OrderItemResponseDto> getOrderItemById(Long itemId) {

                OrderItem item = orderItemRepository.findByIdWithOrderAndUser(itemId)
                                .orElse(null);

                if (item == null) {
                        return Result.fail(ApiError.notFound("OrderItem not found"));
                }

                try {
                        assertCanAccessOrderItem(item);
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

                return Result.ok(orderItemMapper.toDto(item));
        }

        /* List all orders for a specific user. */
        @Transactional(readOnly = true)
        public Result<List<OrderResponseDto>> getOrdersByUser(UUID userId) {

                if (userId == null) {
                        return Result.fail(ApiError.badRequest("User ID is required"));
                }

                List<OrderResponseDto> orders = orderRepository.findByUserId(userId)
                                .stream()
                                .map(orderMapper::toDto)
                                .toList();

                return Result.ok(orders);
        }

        /* List all OrderItems for a given shop (provider) across all orders. */
        @Transactional(readOnly = true)
        @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.SHOP_ID)
        public Result<List<OrderItemResponseDto>> getOrderItemsByShop(Long shopId) {

                if (shopId == null) {
                        return Result.fail(ApiError.badRequest("Shop ID is required"));
                }

                List<OrderItemResponseDto> items = orderItemRepository.findByShopId(shopId)
                                .stream()
                                .map(orderItemMapper::toDto)
                                .toList();

                return Result.ok(items);
        }

        @Transactional(readOnly = true)
        public Result<List<OrderItemResponseDto>> getOrderItemsByManager(UUID managerId) {

                if (managerId == null) {
                        return Result.fail(ApiError.badRequest("Manager ID is required"));
                }

                UUID currentUserId = currentUserService.getCurrentUserId();

                if (!currentUserId.equals(managerId)) {
                        return Result.fail(ApiError.forbidden(
                                        "Not allowed to view another manager's orders"));
                }

                List<OrderItemResponseDto> items = orderItemRepository.findByManagerId(managerId)
                                .stream()
                                .map(orderItemMapper::toDto)
                                .toList();

                return Result.ok(items);
        }

        @Transactional(readOnly = true)
        public Result<List<OrderItemResponseDto>> getOrderItemsByUser(UUID userId) {

                if (userId == null) {
                        return Result.fail(ApiError.badRequest("User ID is required"));
                }

                try {
                        assertSelfOrAdmin(userId);
                } catch (AccessDeniedException ex) {
                        return Result.fail(ApiError.forbidden(ex.getMessage()));
                }

                List<OrderItemResponseDto> items = orderItemRepository.findByUserId(userId)
                                .stream()
                                .map(orderItemMapper::toDto)
                                .toList();

                return Result.ok(items);
        }

        @Transactional
        @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.ITEM_ID)
        public Result<OrderItemResponseDto> assignManagerToOrderItem(
                        Long itemId,
                        UUID newManagerId,
                        UUID actingUserId,
                        String actingUserRole) {
                // Load the order item.
                OrderItem item = orderItemRepository.findById(itemId).orElse(null);

                if (item == null) {
                        return Result.fail(ApiError.notFound("Order item not found"));
                }

                // Check authorization.
                boolean isAssignedManager = item.getManager() != null &&
                                item.getManager().getId().equals(actingUserId);

                boolean isPrivilegedRole = "ADMIN".equals(actingUserRole) ||
                                "MANAGER".equals(actingUserRole) ||
                                "OWNER".equals(actingUserRole);

                if (!isAssignedManager && !isPrivilegedRole) {
                        return Result.fail(ApiError.forbidden(
                                        "You are not authorized to reassign this order item."));
                }

                // Handle unassign requests.
                if (newManagerId == null) {
                        item.setManager(null);
                        item.setStatus(OrderStatus.PENDING);
                } else {
                        User newManager = userRepository.findById(newManagerId).orElse(null);

                        if (newManager == null) {
                                return Result.fail(ApiError.notFound("Manager not found"));
                        }

                        item.setManager(newManager);
                }

                // 4️⃣ Save and return
                OrderItem saved = orderItemRepository.save(item);
                return Result.ok(orderItemMapper.toDto(saved));
        }

        @Transactional
        @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.ITEM_ID)
        public Result<OrderItemResponseDto> confirmOrderItem(Long itemId, UUID managerId) {

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        return Result.fail(ApiError.forbidden(
                                        "Unauthorized: No valid authentication found"));
                }

                UUID currentUserId = userDetails.getId();

                // Validate managerId.
                if (!currentUserId.equals(managerId)) {
                        return Result.fail(ApiError.forbidden(
                                        "You cannot confirm on behalf of another manager"));
                }

                // Verify the target user's role.
                boolean isManager = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

                if (!isManager) {
                        return Result.fail(ApiError.forbidden(
                                        "Only managers can confirm orders"));
                }

                // Query the database only after validation passes.
                OrderItem item = orderItemRepository.findById(itemId)
                                .orElse(null);

                if (item == null) {
                        return Result.fail(ApiError.notFound("OrderItem not found"));
                }

                User manager = userRepository.findById(managerId)
                                .orElse(null);

                if (manager == null) {
                        return Result.fail(ApiError.notFound("Manager not found"));
                }

                item.setManager(manager);
                item.setStatus(OrderStatus.CONFIRMED);

                orderItemRepository.save(item);

                return Result.ok(orderItemMapper.toDto(item));
        }

        @Transactional
        @ShopAccess(value = AccessLevel.GUIDE, source = ShopIdSource.ITEM_ID)
        public Result<OrderItemResponseDto> updateOrderItemStatus(Long itemId, OrderStatus status) {

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        return Result.fail(ApiError.forbidden("Unauthorized: No valid authentication found"));
                }

                UUID currentUserId = userDetails.getId();

                boolean isManager = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

                boolean isAdmin = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!isManager && !isAdmin) {
                        return Result.fail(ApiError.forbidden("Only managers or admins can update order items"));
                }

                OrderItem item = orderItemRepository.findById(itemId)
                                .orElse(null);

                if (item == null) {
                        return Result.fail(ApiError.notFound("OrderItem not found"));
                }

                // Assigned manager OR admin
                if (item.getManager() != null &&
                                !item.getManager().getId().equals(currentUserId) &&
                                !isAdmin) {
                        return Result.fail(ApiError.forbidden("You cannot modify this order item"));
                }

                item.setStatus(status);
                orderItemRepository.save(item);

                return Result.ok(orderItemMapper.toDto(item));
        }

        private void assertSelfOrAdmin(UUID userId) {

                UUID currentUserId = currentUserService.getCurrentUserId();

                if (currentUserId == null) {
                        throw new AccessDeniedException("Unauthorized");
                }

                boolean isAdmin = currentUserService.hasRole("ADMIN");

                if (!isAdmin && !currentUserId.equals(userId)) {
                        throw new AccessDeniedException("You are not allowed to access these items");
                }
        }

        private void assertCanAccessOrderItem(OrderItem item) {
                UUID currentUserId = currentUserService.getCurrentUserId();

                if (currentUserId == null) {
                        throw new AccessDeniedException("Unauthorized");
                }

                if (currentUserService.hasRole("ADMIN")) {
                        return;
                }

                if (item.getOrder() != null
                                && item.getOrder().getUser() != null
                                && currentUserId.equals(item.getOrder().getUser().getId())) {
                        return;
                }

                Long shopId = item.getShopId();
                if (shopId == null && item.getTour() != null && item.getTour().getShop() != null) {
                        shopId = item.getTour().getShop().getId();
                }

                if (shopId != null) {
                        var membership = shopUserRepository.findByShopIdAndUserId(shopId, currentUserId).orElse(null);

                        if (membership != null
                                        && membership.getStatus() == ShopUserStatus.ACTIVE
                                        && membership.getRole().getLevel() >= AccessLevel.GUIDE.getLevel()) {
                                return;
                        }
                }

                throw new AccessDeniedException("You are not allowed to access this order item");
        }

        public Result<OrderItem> getOrderItemEntity(Long id) {
                return orderItemRepository.findByIdWithOrderAndUser(id)
                                .map(Result::ok)
                                .orElse(Result.fail(ApiError.notFound("Order item not found")));
        }

        private String normalizeQuery(String query) {
                if (query == null || query.isBlank()) {
                        return null;
                }

                return query.trim();
        }

        private Specification<Order> buildAdminOrderSpecification(
                        String query,
                        OrderStatus status,
                        Instant createdFrom,
                        Instant createdTo) {

                return (root, criteriaQuery, criteriaBuilder) -> {
                        List<Predicate> predicates = new ArrayList<>();

                        if (status != null) {
                                predicates.add(criteriaBuilder.equal(root.get("status"), status));
                        }

                        if (createdFrom != null) {
                                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                                                root.get("createdAt"),
                                                createdFrom));
                        }

                        if (createdTo != null) {
                                predicates.add(criteriaBuilder.lessThan(
                                                root.get("createdAt"),
                                                createdTo));
                        }

                        if (query != null) {
                                predicates.add(criteriaBuilder.like(
                                                criteriaBuilder.function(
                                                                "to_char",
                                                                String.class,
                                                                root.get("id"),
                                                                criteriaBuilder.literal("FM999999999999999999")),
                                                "%" + query + "%"));
                        }

                        return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
                };
        }

        private OrderStatus normalizeStatus(String status) {
                if (status == null || status.isBlank()) {
                        return null;
                }

                try {
                        return OrderStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
                } catch (IllegalArgumentException ex) {
                        return null;
                }
        }
}
