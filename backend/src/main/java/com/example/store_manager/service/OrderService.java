package com.example.store_manager.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

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
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.repository.OrderRepository;
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
        private final TourScheduleRepository tourScheduleRepository;
        private final CurrentUserService currentUserService;
        private final TourSessionRepository tourSessionRepository;
        private final PaymentService paymentService;

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

                        int available = schedule.getAvailableParticipants();

                        if (itemDto.getParticipants() > available) {
                                return Result.fail(
                                                ApiError.badRequest("Not enough spots available for this schedule"));
                        }

                        // ✅ Inventory mutation
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

                        BigDecimal price = tour.getPrice().multiply(
                                        BigDecimal.valueOf(itemDto.getParticipants()));

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
                order.setReservationToken(null);

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
        public Result<OrderResponseDto> getOrderById(Long orderId) {

                return orderRepository.findById(orderId)
                                .map(orderMapper::toDto)
                                .map(Result::ok)
                                .orElseGet(() -> Result.fail(ApiError.notFound("Order not found")));
        }

        @Transactional(readOnly = true)
        public Result<OrderItemResponseDto> getOrderItemById(Long itemId) {

                return orderItemRepository.findById(itemId)
                                .map(orderItemMapper::toDto)
                                .map(Result::ok)
                                .orElseGet(() -> Result.fail(ApiError.notFound("OrderItem not found")));
        }

        /* List all orders for a specific user. */
        @Transactional(readOnly = true)
        @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.DTO_TOUR_ID)
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
                // 1️⃣ Load order item
                OrderItem item = orderItemRepository.findById(itemId).orElse(null);

                if (item == null) {
                        return Result.fail(ApiError.notFound("Order item not found"));
                }

                // 2️⃣ Authorization check
                boolean isAssignedManager = item.getManager() != null &&
                                item.getManager().getId().equals(actingUserId);

                boolean isPrivilegedRole = "ADMIN".equals(actingUserRole) ||
                                "MANAGER".equals(actingUserRole) ||
                                "OWNER".equals(actingUserRole);

                if (!isAssignedManager && !isPrivilegedRole) {
                        return Result.fail(ApiError.forbidden(
                                        "You are not authorized to reassign this order item."));
                }

                // 3️⃣ Handle unassign
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

                // 1️⃣ Manager ID check
                if (!currentUserId.equals(managerId)) {
                        return Result.fail(ApiError.forbidden(
                                        "You cannot confirm on behalf of another manager"));
                }

                // 2️⃣ Role check
                boolean isManager = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

                if (!isManager) {
                        return Result.fail(ApiError.forbidden(
                                        "Only managers can confirm orders"));
                }

                // 3️⃣ ONLY NOW hit the database
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

}