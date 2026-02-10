package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.mapper.OrderItemMapper;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.model.Shop;
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
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderMapper orderMapper;

    // other dependencies can be mocked later when needed
    @Mock
    private UserRepository userRepository;

    @Mock
    private TourRepository tourRepository;

    @Mock
    private OrderItemMapper orderItemMapper;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private TourScheduleRepository tourScheduleRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private TourSessionRepository tourSessionRepository;

    @InjectMocks
    private OrderService service;

    // getOrderById
    @Test
    void getOrderById_returnsOk_whenOrderExists() {
        Order order = new Order();
        OrderResponseDto dto = new OrderResponseDto();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderMapper.toDto(order)).thenReturn(dto);

        Result<OrderResponseDto> result = service.getOrderById(1L);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getOrderById_returnsFail_whenOrderNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        Result<OrderResponseDto> result = service.getOrderById(99L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Order not found", result.error().message());
    }

    // getOrderItemById
    @Test
    void getOrderItemById_returnsOk_whenItemExists() {
        OrderItem item = new OrderItem();
        item.setId(1L);

        OrderItemResponseDto dto = new OrderItemResponseDto();

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(orderItemMapper.toDto(item)).thenReturn(dto);

        Result<OrderItemResponseDto> result = service.getOrderItemById(1L);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getOrderItemById_returnsFail_whenItemNotFound() {
        when(orderItemRepository.findById(99L)).thenReturn(Optional.empty());

        Result<OrderItemResponseDto> result = service.getOrderItemById(99L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    // getOrdersByUser
    @Test
    void getOrdersByUser_returnsOkResult_withOrders() {
        UUID userId = UUID.randomUUID();

        Order order = new Order();
        OrderResponseDto dto = new OrderResponseDto();

        when(orderRepository.findByUserId(userId)).thenReturn(List.of(order));
        when(orderMapper.toDto(order)).thenReturn(dto);

        Result<List<OrderResponseDto>> result = service.getOrdersByUser(userId);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getOrdersByUser_returnsOkResult_withEmptyList() {
        UUID userId = UUID.randomUUID();

        when(orderRepository.findByUserId(userId)).thenReturn(List.of());

        Result<List<OrderResponseDto>> result = service.getOrdersByUser(userId);

        assertTrue(result.isOk());
        assertTrue(result.get().isEmpty());
    }

    @Test
    void getOrdersByUser_returnsFail_whenUserIdIsNull() {
        Result<List<OrderResponseDto>> result = service.getOrdersByUser(null);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    // getOrderItemsByShop
    @Test
    void getOrderItemsByShop_returnsOkResult_withItems() {
        Long shopId = 1L;

        OrderItem item = new OrderItem();
        OrderItemResponseDto dto = new OrderItemResponseDto();

        when(orderItemRepository.findByShopId(shopId)).thenReturn(List.of(item));
        when(orderItemMapper.toDto(item)).thenReturn(dto);

        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByShop(shopId);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getOrderItemsByShop_returnsOkResult_withEmptyList() {
        Long shopId = 1L;

        when(orderItemRepository.findByShopId(shopId)).thenReturn(List.of());

        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByShop(shopId);

        assertTrue(result.isOk());
        assertTrue(result.get().isEmpty());
    }

    @Test
    void getOrderItemsByShop_returnsFail_whenShopIdIsNull() {
        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByShop(null);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    // getOrderItemsByManager
    @Test
    void getOrderItemsByManager_returnsOk_whenSelf() {
        UUID managerId = UUID.randomUUID();

        OrderItem item = new OrderItem();
        OrderItemResponseDto dto = new OrderItemResponseDto();

        when(currentUserService.getCurrentUserId()).thenReturn(managerId);
        when(orderItemRepository.findByManagerId(managerId)).thenReturn(List.of(item));
        when(orderItemMapper.toDto(item)).thenReturn(dto);

        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByManager(managerId);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
    }

    @Test
    void getOrderItemsByManager_returnsForbidden_whenDifferentManager() {
        UUID managerId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId()).thenReturn(otherId);

        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByManager(managerId);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void getOrderItemsByManager_returnsBadRequest_whenManagerIdNull() {
        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByManager(null);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    // getOrderItemsByUser
    @Test
    void getOrderItemsByUser_returnsOkResult_whenUserIsSelf() {
        UUID userId = UUID.randomUUID();

        OrderItem item = new OrderItem();
        OrderItemResponseDto dto = new OrderItemResponseDto();

        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(orderItemRepository.findByUserId(userId)).thenReturn(List.of(item));
        when(orderItemMapper.toDto(item)).thenReturn(dto);

        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByUser(userId);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getOrderItemsByUser_returnsFail_whenUserIsDifferentAndNotAdmin() {
        UUID requestedUserId = UUID.randomUUID();
        UUID currentUserId = UUID.randomUUID();

        when(currentUserService.getCurrentUserId()).thenReturn(currentUserId);

        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByUser(requestedUserId);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void getOrderItemsByUser_returnsFail_whenUserIdIsNull() {
        Result<List<OrderItemResponseDto>> result = service.getOrderItemsByUser(null);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    // assignManagerToOrderItem
    @Test
    void assignManagerToOrderItem_allowsAssignedManager() {
        UUID actingUserId = UUID.randomUUID();
        UUID newManagerId = UUID.randomUUID();

        User actingManager = new User();
        actingManager.setId(actingUserId);

        User newManager = new User();
        newManager.setId(newManagerId);

        OrderItem item = new OrderItem();
        item.setManager(actingManager);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(newManagerId)).thenReturn(Optional.of(newManager));
        when(orderItemRepository.save(item)).thenReturn(item);
        when(orderItemMapper.toDto(item)).thenReturn(new OrderItemResponseDto());

        Result<OrderItemResponseDto> result = service.assignManagerToOrderItem(
                1L,
                newManagerId,
                actingUserId,
                "GUIDE");

        assertTrue(result.isOk());
        assertEquals(newManager, item.getManager());
    }

    @Test
    void assignManagerToOrderItem_allowsPrivilegedRole() {
        UUID actingUserId = UUID.randomUUID();
        UUID newManagerId = UUID.randomUUID();

        User newManager = new User();
        newManager.setId(newManagerId);

        OrderItem item = new OrderItem();
        item.setManager(null);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(newManagerId)).thenReturn(Optional.of(newManager));
        when(orderItemRepository.save(item)).thenReturn(item);
        when(orderItemMapper.toDto(item)).thenReturn(new OrderItemResponseDto());

        Result<OrderItemResponseDto> result = service.assignManagerToOrderItem(
                1L,
                newManagerId,
                actingUserId,
                "ADMIN");

        assertTrue(result.isOk());
        assertEquals(newManager, item.getManager());
    }

    @Test
    void assignManagerToOrderItem_returnsFail_whenUnauthorized() {
        UUID actingUserId = UUID.randomUUID();
        UUID otherManagerId = UUID.randomUUID();

        User assignedManager = new User();
        assignedManager.setId(otherManagerId);

        OrderItem item = new OrderItem();
        item.setManager(assignedManager);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));

        Result<OrderItemResponseDto> result = service.assignManagerToOrderItem(
                1L,
                UUID.randomUUID(),
                actingUserId,
                "GUIDE");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        assertEquals(
                "You are not authorized to reassign this order item.",
                result.error().message());

        verify(orderItemRepository, never()).save(any());
    }

    @Test
    void assignManagerToOrderItem_returnsFail_whenOrderItemNotFound() {
        when(orderItemRepository.findById(99L)).thenReturn(Optional.empty());

        Result<OrderItemResponseDto> result = service.assignManagerToOrderItem(
                99L,
                UUID.randomUUID(),
                UUID.randomUUID(),
                "ADMIN");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Order item not found", result.error().message());
    }

    @Test
    void assignManagerToOrderItem_returnsFail_whenManagerNotFound() {
        UUID managerId = UUID.randomUUID();

        OrderItem item = new OrderItem();

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(managerId)).thenReturn(Optional.empty());

        Result<OrderItemResponseDto> result = service.assignManagerToOrderItem(
                1L,
                managerId,
                UUID.randomUUID(),
                "ADMIN");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Manager not found", result.error().message());
    }

    @Test
    void assignManagerToOrderItem_unassignsManager_whenManagerIdIsNull() {
        UUID actingUserId = UUID.randomUUID();

        User manager = new User();
        manager.setId(actingUserId);

        OrderItem item = new OrderItem();
        item.setManager(manager);
        item.setStatus(OrderStatus.CONFIRMED);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(orderItemRepository.save(item)).thenReturn(item);
        when(orderItemMapper.toDto(item)).thenReturn(new OrderItemResponseDto());

        Result<OrderItemResponseDto> result = service.assignManagerToOrderItem(
                1L,
                null,
                actingUserId,
                "GUIDE");

        assertTrue(result.isOk());
        assertNull(item.getManager());
        assertEquals(OrderStatus.PENDING, item.getStatus());
    }

    // confirmOrderItem

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockLoggedInUser(UUID userId, String... roles) {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn(userId);

        // ✅ IMPORTANT: Use doReturn + raw cast to avoid wildcard capture hell
        if (roles != null) {
            List<GrantedAuthority> auths = Arrays.stream(roles)
                    .map(SimpleGrantedAuthority::new)
                    .map(a -> (GrantedAuthority) a)
                    .toList();

            @SuppressWarnings({ "rawtypes", "unchecked" })
            Collection<? extends GrantedAuthority> casted = (Collection) auths;

            doReturn(casted).when(userDetails).getAuthorities();
        }

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void mockLoggedInUser(UUID userId) {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn(userId);

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void confirmOrderItem_throws_whenUnauthenticated() {
        SecurityContextHolder.clearContext();

        SecurityContextHolder.clearContext();

        Result<OrderItemResponseDto> result = service.confirmOrderItem(1L, UUID.randomUUID());

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void confirmOrderItem_throws_whenManagerIdDoesNotMatchLoggedInUser() {
        UUID loggedInId = UUID.randomUUID();
        UUID otherManagerId = UUID.randomUUID();

        mockLoggedInUser(loggedInId); // ✅ NO roles

        Result<OrderItemResponseDto> result = service.confirmOrderItem(1L, otherManagerId);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        assertEquals(
                "You cannot confirm on behalf of another manager",
                result.error().message());
    }

    @Test
    void confirmOrderItem_throws_whenUserIsNotManager() {
        UUID managerId = UUID.randomUUID();

        mockLoggedInUser(managerId, "ROLE_GUIDE"); // not manager

        Result<OrderItemResponseDto> result = service.confirmOrderItem(1L, managerId);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        assertEquals(
                "Only managers can confirm orders",
                result.error().message());

        // Optional: ensure we never hit DB calls
        verify(orderItemRepository, never()).findById(anyLong());
        verify(userRepository, never()).findById(any());
    }

    @Test
    void confirmOrderItem_throws_whenOrderItemNotFound() {
        UUID managerId = UUID.randomUUID();

        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn(managerId);
        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_MANAGER"));

        doReturn(authorities).when(userDetails).getAuthorities();

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContextHolder.getContext().setAuthentication(auth);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.empty());

        when(orderItemRepository.findById(1L)).thenReturn(Optional.empty());

        Result<OrderItemResponseDto> result = service.confirmOrderItem(1L, managerId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("OrderItem not found", result.error().message());

    }

    @Test
    void confirmOrderItem_throws_whenManagerEntityNotFound() {
        UUID managerId = UUID.randomUUID();

        OrderItem item = new OrderItem();

        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn(managerId);
        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_MANAGER"));

        doReturn(authorities).when(userDetails).getAuthorities();

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContextHolder.getContext().setAuthentication(auth);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(managerId)).thenReturn(Optional.empty());

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(managerId)).thenReturn(Optional.empty());

        Result<OrderItemResponseDto> result = service.confirmOrderItem(1L, managerId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Manager not found", result.error().message());

    }

    @Test
    void confirmOrderItem_confirmsItem_whenValid() {
        UUID managerId = UUID.randomUUID();

        User manager = new User();
        manager.setId(managerId);

        OrderItem item = new OrderItem();
        item.setStatus(OrderStatus.PENDING);

        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn(managerId);
        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_MANAGER"));

        doReturn(authorities).when(userDetails).getAuthorities();

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContextHolder.getContext().setAuthentication(auth);

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(managerId)).thenReturn(Optional.of(manager));
        when(orderItemMapper.toDto(item)).thenReturn(new OrderItemResponseDto());

        Result<OrderItemResponseDto> result = service.confirmOrderItem(1L, managerId);

        assertTrue(result.isOk());
        assertNotNull(result.get());
        assertEquals(OrderStatus.CONFIRMED, item.getStatus());
        assertEquals(manager, item.getManager());

    }

    @Test
    void updateOrderItemStatus_returnsOk_whenManagerUpdatesOwnItem() {
        UUID managerId = UUID.randomUUID();

        User manager = new User();
        manager.setId(managerId);

        OrderItem item = new OrderItem();
        item.setManager(manager);
        item.setStatus(OrderStatus.PENDING);

        mockLoggedInUser(managerId, "ROLE_MANAGER");

        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(orderItemMapper.toDto(item)).thenReturn(new OrderItemResponseDto());

        Result<OrderItemResponseDto> result = service.updateOrderItemStatus(1L, OrderStatus.CONFIRMED);

        assertTrue(result.isOk());
        assertEquals(OrderStatus.CONFIRMED, item.getStatus());
        verify(orderItemRepository).save(item);
    }

    @Test
    void updateOrderItemStatus_returnsFail_whenUnauthenticated() {
        SecurityContextHolder.clearContext();

        Result<OrderItemResponseDto> result = service.updateOrderItemStatus(1L, OrderStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void updateOrderItemStatus_returnsFail_whenUserIsNotManagerOrAdmin() {
        UUID userId = UUID.randomUUID();

        mockLoggedInUser(userId, "ROLE_GUIDE");

        Result<OrderItemResponseDto> result = service.updateOrderItemStatus(1L, OrderStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void updateOrderItemStatus_returnsFail_whenItemNotFound() {
        UUID managerId = UUID.randomUUID();

        mockLoggedInUser(managerId, "ROLE_MANAGER");
        when(orderItemRepository.findById(1L)).thenReturn(Optional.empty());

        Result<OrderItemResponseDto> result = service.updateOrderItemStatus(1L, OrderStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    @Test
    void updateOrderItemStatus_returnsFail_whenManagerNotAssigned() {
        UUID actingManagerId = UUID.randomUUID();
        UUID assignedManagerId = UUID.randomUUID();

        User assignedManager = new User();
        assignedManager.setId(assignedManagerId);

        OrderItem item = new OrderItem();
        item.setManager(assignedManager);

        mockLoggedInUser(actingManagerId, "ROLE_MANAGER");
        when(orderItemRepository.findById(1L)).thenReturn(Optional.of(item));

        Result<OrderItemResponseDto> result = service.updateOrderItemStatus(1L, OrderStatus.CONFIRMED);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void createOrder_returnsFail_whenScheduleOverbooked() {

        OrderCreateRequestDto dto = validCreateOrderDto();

        Tour tour = new Tour();
        tour.setId(1L);
        tour.setType("PUBLIC");
        tour.setPrice(BigDecimal.TEN);

        Shop shop = new Shop();
        shop.setId(1L);
        tour.setShop(shop);

        TourSchedule schedule = new TourSchedule();
        schedule.setId(1L);
        schedule.setBookedParticipants(10);
        schedule.setMaxParticipants(10);

        when(tourRepository.findById(1L))
                .thenReturn(Optional.of(tour));

        when(tourScheduleRepository.findByIdForUpdate(1L))
                .thenReturn(Optional.of(schedule));

        Result<OrderResponseDto> result = service.createOrder(dto, null);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());

        // Optional but good: ensure session logic was NOT touched
        verify(tourSessionRepository, never()).findByScheduleId(any());
        verify(tourSessionRepository, never()).save(any());
    }

    @Test
    void createOrder_returnsFail_whenUserNotFound() {
        UUID userId = UUID.randomUUID();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Result<OrderResponseDto> result = service.createOrder(validCreateOrderDto(), userId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    private OrderCreateRequestDto validCreateOrderDto() {
        OrderItemCreateRequestDto item = new OrderItemCreateRequestDto();
        item.setTourId(1L);
        item.setScheduleId(1L);
        item.setParticipants(2);
        item.setScheduledAt(LocalDateTime.now().plusDays(1));
        item.setPreferredLanguage("EN");

        OrderCreateRequestDto dto = new OrderCreateRequestDto();
        dto.setName("John Doe");
        dto.setEmail("john@test.com");
        dto.setPhone("123");
        dto.setNationality("US");
        dto.setPaymentMethod("CARD");
        dto.setItems(List.of(item));

        return dto;
    }

}
