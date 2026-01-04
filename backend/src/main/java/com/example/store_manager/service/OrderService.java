package com.example.store_manager.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.tour.TourSnapshotDto;
import com.example.store_manager.mapper.OrderItemMapper;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.TourSession;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.repository.TourScheduleRepository;
import com.example.store_manager.repository.TourSessionRepository;

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

        /**
         * Create a new order with multiple items.
         */

        @Transactional
        public Result<OrderResponseDto> createOrder(OrderCreateRequestDto dto, UUID userId) {

                User user = null;

                if (userId != null) {
                        user = userRepository.findById(userId)
                                        .orElse(null);

                        if (user == null) {
                                return Result.fail(ApiError.notFound("User not found"));
                        }
                }

                Order order = Order.builder()
                                .user(user)
                                .paymentMethod(dto.getPaymentMethod())
                                .status(OrderStatus.PENDING)
                                .build();

                for (OrderItemCreateRequestDto itemDto : dto.getItems()) {

                        Tour tour = tourRepository.findById(itemDto.getTourId())
                                        .orElse(null);

                        if (tour == null) {
                                return Result.fail(ApiError.notFound("Tour not found"));
                        }

                        TourSchedule schedule = tourScheduleRepository.findById(itemDto.getScheduleId())
                                        .orElse(null);

                        if (schedule == null) {
                                return Result.fail(ApiError.notFound("Schedule not found"));
                        }

                        int newBooked = schedule.getBookedParticipants() + itemDto.getParticipants();
                        if (newBooked > schedule.getMaxParticipants()) {
                                return Result.fail(
                                                ApiError.badRequest("Not enough spots available for this schedule"));
                        }

                        schedule.setBookedParticipants(newBooked);

                        if ("PRIVATE".equalsIgnoreCase(tour.getType())) {
                                schedule.setStatus("BOOKED");
                        } else {
                                schedule.setStatus(
                                                newBooked >= schedule.getMaxParticipants() ? "BOOKED" : "ACTIVE");
                        }

                        tourScheduleRepository.save(schedule);

                        Result<TourSession> sessionResult = createOrUpdateSession(tour, itemDto.getScheduledAt(),
                                        itemDto.getParticipants());

                        if (sessionResult.isFail()) {
                                return Result.fail(sessionResult.error());
                        }

                        TourSession session = sessionResult.get();

                        TourSnapshotDto snapshot = TourSnapshotDto.builder()
                                        .id(tour.getId())
                                        .title(tour.getTitle())
                                        .description(tour.getDescription())
                                        .price(tour.getPrice())
                                        .build();

                        OrderItem item = OrderItem.builder()
                                        .order(order)
                                        .tour(tour)
                                        .session(session)
                                        .shopId(tour.getShop().getId())
                                        .tourTitle(tour.getTitle())
                                        .scheduledAt(itemDto.getScheduledAt())
                                        .participants(itemDto.getParticipants())
                                        .name(dto.getName())
                                        .email(dto.getEmail())
                                        .phone(dto.getPhone())
                                        .nationality(dto.getNationality())
                                        .preferredLanguage(itemDto.getPreferredLanguage())
                                        .comment(itemDto.getComment())
                                        .paymentMethod(dto.getPaymentMethod())
                                        .status(OrderStatus.CONFIRMED)
                                        .pricePaid(
                                                        tour.getPrice().multiply(
                                                                        BigDecimal.valueOf(itemDto.getParticipants())))
                                        .tourSnapshot(orderMapper.toJsonSnapshot(snapshot))
                                        .build();

                        order.getOrderItems().add(item);
                }

                BigDecimal totalPrice = order.getOrderItems().stream()
                                .map(OrderItem::getPricePaid)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                order.setTotalPrice(totalPrice);

                Order saved = orderRepository.save(order);

                return Result.ok(orderMapper.toDto(saved));
        }

        private Result<TourSession> createOrUpdateSession(
                        Tour tour,
                        LocalDateTime scheduledAt,
                        int participants) {

                LocalDate date = scheduledAt.toLocalDate();
                LocalTime time = scheduledAt.toLocalTime();

                Optional<TourSession> existing = tourSessionRepository.findByTourIdAndDateAndTime(
                                tour.getId(), date, time);

                if (existing.isPresent()) {
                        TourSession session = existing.get();

                        if (session.getRemaining() < participants) {
                                return Result.fail(
                                                ApiError.badRequest("Not enough spots available in this session"));
                        }

                        session.setRemaining(session.getRemaining() - participants);
                        return Result.ok(tourSessionRepository.save(session));
                }

                TourSession session = TourSession.builder()
                                .tour(tour)
                                .date(date)
                                .time(time)
                                .capacity(participants)
                                .remaining(0)
                                .build();

                return Result.ok(tourSessionRepository.save(session));
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