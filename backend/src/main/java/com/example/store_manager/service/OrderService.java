package com.example.store_manager.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
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
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderItemRepository;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CustomUserDetails;

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

        /**
         * Create a new order with multiple items.
         */
        public OrderResponseDto createOrder(OrderCreateRequestDto dto, UUID userId) {
                User user = null;
                if (userId != null) {
                        user = userRepository.findById(userId)
                                        .orElseThrow(() -> new RuntimeException("User not found"));
                }

                // 1️. Create master Order
                Order order = Order.builder()
                                .user(user)
                                .paymentMethod(dto.getPaymentMethod())
                                .status(OrderStatus.PENDING)
                                .build();

                // 2️. Build OrderItems from DTOs
                for (OrderItemCreateRequestDto itemDto : dto.getItems()) {
                        Tour tour = tourRepository.findById(itemDto.getTourId())
                                        .orElseThrow(() -> new RuntimeException("Tour not found"));

                        TourSnapshotDto snapshot = TourSnapshotDto.builder()
                                        .id(tour.getId())
                                        .title(tour.getTitle())
                                        .description(tour.getDescription())
                                        .price(tour.getPrice())
                                        .build();

                        OrderItem item = OrderItem.builder()
                                        .order(order)
                                        .tour(tour)
                                        .shopId(tour.getShop().getId())
                                        .tourTitle(tour.getTitle())
                                        .scheduledAt(itemDto.getScheduledAt())
                                        .participants(itemDto.getParticipants())
                                        .name(dto.getName())
                                        .email(dto.getEmail())
                                        .phone(dto.getPhone())
                                        .nationality(dto.getNationality())
                                        .paymentMethod(dto.getPaymentMethod())
                                        .status(OrderStatus.PENDING)
                                        .pricePaid(tour.getPrice()
                                                        .multiply(BigDecimal.valueOf(itemDto.getParticipants())))
                                        .tourSnapshot(orderMapper.toJsonSnapshot(snapshot))
                                        .build();

                        order.getOrderItems().add(item);
                }

                // 3. Calculate total price
                BigDecimal totalPrice = order.getOrderItems().stream()
                                .map(OrderItem::getPricePaid)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                order.setTotalPrice(totalPrice);

                // 4️. Save order
                Order saved = orderRepository.save(order);

                // 5️. Return DTO
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
        public List<OrderItemResponseDto> getOrderItemsByShop(Long shopId) {
                List<OrderItem> items = orderItemRepository.findByShopId(shopId);

                for (OrderItem i : items) {
                        System.out.println("OrderItem " + i.getId() + " manager: " +
                                        (i.getManager() != null ? i.getManager().getName() : "null"));
                }

                return items.stream()
                                .map(orderItemMapper::toDto)
                                .collect(Collectors.toList());
        }

        @Transactional
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

}