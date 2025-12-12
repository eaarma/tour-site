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
        public OrderResponseDto createOrder(OrderCreateRequestDto dto, UUID userId) {
                User user = null;

                if (userId != null) {
                        user = userRepository.findById(userId)
                                        .orElseThrow(() -> new RuntimeException("User not found"));
                }

                // 1. Create main Order
                Order order = Order.builder()
                                .user(user)
                                .paymentMethod(dto.getPaymentMethod())
                                .status(OrderStatus.PENDING)
                                .build();

                // 2. For each order item
                // 2. For each order item
                for (OrderItemCreateRequestDto itemDto : dto.getItems()) {

                        // Load tour & schedule
                        Tour tour = tourRepository.findById(itemDto.getTourId())
                                        .orElseThrow(() -> new RuntimeException("Tour not found"));

                        TourSchedule schedule = tourScheduleRepository.findById(itemDto.getScheduleId())
                                        .orElseThrow(() -> new RuntimeException("Schedule not found"));

                        // Prevent overbooking
                        int newBooked = schedule.getBookedParticipants() + itemDto.getParticipants();
                        if (newBooked > schedule.getMaxParticipants()) {
                                throw new RuntimeException("Not enough spots available for this schedule.");
                        }

                        // Update schedule
                        schedule.setBookedParticipants(newBooked);
                        if ("PRIVATE".equalsIgnoreCase(tour.getType())) {
                                schedule.setStatus("BOOKED");
                        } else {
                                schedule.setStatus(newBooked >= schedule.getMaxParticipants() ? "BOOKED" : "ACTIVE");
                        }
                        tourScheduleRepository.save(schedule);

                        // ⭐ NEW SESSION logic
                        TourSession session = getOrCreateSession(
                                        tour,
                                        itemDto.getScheduledAt(),
                                        itemDto.getParticipants());

                        // Snapshot
                        TourSnapshotDto snapshot = TourSnapshotDto.builder()
                                        .id(tour.getId())
                                        .title(tour.getTitle())
                                        .description(tour.getDescription())
                                        .price(tour.getPrice())
                                        .build();

                        // Create item
                        OrderItem item = OrderItem.builder()
                                        .order(order)
                                        .tour(tour)
                                        .session(session) // ⭐ NEW
                                        .shopId(tour.getShop().getId())
                                        .tourTitle(tour.getTitle())
                                        .scheduledAt(itemDto.getScheduledAt()) // keep for now
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

                // 3. Calculate total price
                BigDecimal totalPrice = order.getOrderItems().stream()
                                .map(OrderItem::getPricePaid)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                order.setTotalPrice(totalPrice);

                // 4. Save everything
                Order saved = orderRepository.save(order);

                return orderMapper.toDto(saved);
        }

        /**
         * Get a single order by ID.
         */
        @Transactional(readOnly = true)
        public OrderResponseDto getOrderById(Long orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));
                return orderMapper.toDto(order);
        }

        @Transactional(readOnly = true)
        public OrderItemResponseDto getOrderItemById(Long itemId) {
                OrderItem item = orderItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("OrderItem not found"));

                return orderItemMapper.toDto(item);
        }

        /**
         * List all orders for a specific user.
         */
        @Transactional(readOnly = true)
        @ShopAccess(AccessLevel.MANAGER)
        public List<OrderResponseDto> getOrdersByUser(UUID userId) {
                return orderRepository.findByUserId(userId)
                                .stream()
                                .map(orderMapper::toDto)
                                .collect(Collectors.toList());
        }

        /**
         * List all OrderItems for a given shop (provider) across all orders.
         */
        @Transactional(readOnly = true)
        @ShopAccess(AccessLevel.GUIDE)
        public List<OrderItemResponseDto> getOrderItemsByShop(Long shopId) {
                List<OrderItem> items = orderItemRepository.findByShopId(shopId);

                return items.stream()
                                .map(orderItemMapper::toDto)
                                .collect(Collectors.toList());
        }

        @Transactional
        @ShopAccess(AccessLevel.MANAGER)
        public OrderItemResponseDto assignManagerToOrderItem(Long itemId,
                        UUID newManagerId,
                        UUID actingUserId,
                        String actingUserRole) {
                OrderItem item = orderItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("Order item not found"));

                // 1️⃣ Authorization check
                boolean isAssignedManager = item.getManager() != null &&
                                item.getManager().getId().equals(actingUserId);

                boolean isPrivilegedRole = actingUserRole.equals("ADMIN") ||
                                actingUserRole.equals("MANAGER") ||
                                actingUserRole.equals("OWNER");

                if (!isAssignedManager && !isPrivilegedRole) {
                        throw new RuntimeException("You are not authorized to reassign this order item.");
                }

                // 2️⃣ Handle null (unassign)
                if (newManagerId == null) {
                        item.setManager(null);
                        item.setStatus(OrderStatus.PENDING); // optional: reset status if unassigned
                } else {
                        User newManager = userRepository.findById(newManagerId)
                                        .orElseThrow(() -> new RuntimeException("Manager not found"));
                        item.setManager(newManager);
                }

                OrderItem saved = orderItemRepository.save(item);
                return orderItemMapper.toDto(saved);
        }

        @Transactional
        @ShopAccess(AccessLevel.GUIDE)
        public OrderItemResponseDto confirmOrderItem(Long itemId, UUID managerId) {
                // 1️⃣ Get authenticated user
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        throw new AccessDeniedException("Unauthorized: No valid authentication found");
                }

                UUID currentUserId = userDetails.getId();

                // 2️⃣ Ensure manager ID matches the logged-in user
                if (!currentUserId.equals(managerId)) {
                        throw new AccessDeniedException("You cannot confirm on behalf of another manager");
                }

                // 3️⃣ Optional: verify user has MANAGER role
                if (!userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"))) {
                        throw new AccessDeniedException("Only managers can confirm orders");
                }

                // 4️⃣ Fetch order item and manager entity
                OrderItem item = orderItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("OrderItem not found"));

                User manager = userRepository.findById(managerId)
                                .orElseThrow(() -> new RuntimeException("Manager not found"));

                // 5️⃣ Assign manager and confirm
                item.setManager(manager);
                item.setStatus(OrderStatus.CONFIRMED);

                orderItemRepository.save(item);

                return orderItemMapper.toDto(item);
        }

        @Transactional
        @ShopAccess(AccessLevel.GUIDE)
        public OrderItemResponseDto updateOrderItemStatus(Long itemId, OrderStatus status) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        throw new AccessDeniedException("Unauthorized: No valid authentication found");
                }

                UUID currentUserId = userDetails.getId();
                boolean isManager = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));
                boolean isAdmin = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                OrderItem item = orderItemRepository.findById(itemId)
                                .orElseThrow(() -> new RuntimeException("OrderItem not found"));

                // Only assigned manager or admin can update
                if (item.getManager() != null &&
                                !item.getManager().getId().equals(currentUserId) &&
                                !isAdmin) {
                        throw new AccessDeniedException("You cannot modify this order item");
                }

                if (!isManager && !isAdmin) {
                        throw new AccessDeniedException("Only managers or admins can update order items");
                }

                item.setStatus(status);
                orderItemRepository.save(item);

                return orderItemMapper.toDto(item);
        }

        @Transactional(readOnly = true)
        public List<OrderItemResponseDto> getOrderItemsByManager(UUID managerId) {

                UUID currentUserId = currentUserService.getCurrentUserId();
                if (!currentUserId.equals(managerId)) {
                        throw new AccessDeniedException("Not allowed to view another manager's orders.");
                }
                List<OrderItem> items = orderItemRepository.findByManagerId(managerId);

                return items.stream()
                                .map(orderItemMapper::toDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<OrderItemResponseDto> getOrderItemsByUser(UUID userId) {
                if (userId == null) {
                        throw new RuntimeException("User ID is required");
                }

                // ✅ Check access before proceeding
                assertSelfOrAdmin(userId);

                List<OrderItem> items = orderItemRepository.findByUserId(userId);

                return items.stream()
                                .map(orderItemMapper::toDto)
                                .collect(Collectors.toList());
        }

        private void assertSelfOrAdmin(UUID userId) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
                        throw new AccessDeniedException("Unauthorized");
                }

                boolean isAdmin = userDetails.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

                if (!isAdmin && !userDetails.getId().equals(userId)) {
                        throw new AccessDeniedException("You are not allowed to access these items");
                }
        }

        private TourSession getOrCreateSession(Tour tour, LocalDateTime scheduledAt, int participants) {

                LocalDate date = scheduledAt.toLocalDate();
                LocalTime time = scheduledAt.toLocalTime();

                // 1️⃣ Check if session exists
                Optional<TourSession> existing = tourSessionRepository
                                .findByTourIdAndDateAndTime(tour.getId(), date, time);

                if (existing.isPresent()) {
                        TourSession session = existing.get();

                        // Prevent overbooking
                        if (session.getRemaining() < participants) {
                                throw new RuntimeException("Not enough spots available in this session");
                        }

                        session.setRemaining(session.getRemaining() - participants);
                        return tourSessionRepository.save(session);
                }

                // 2️⃣ If session doesn't exist → create one
                TourSession session = TourSession.builder()
                                .tour(tour)
                                .date(date)
                                .time(time)
                                .capacity(participants) // fallback only; normally session is created from schedule
                                .remaining(0) // fully used because no schedule? You may adjust this behavior.
                                .build();

                return tourSessionRepository.save(session);
        }

}