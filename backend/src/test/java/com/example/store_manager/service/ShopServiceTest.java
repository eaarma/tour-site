package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.store_manager.dto.shop.ShopCreateRequestDto;
import com.example.store_manager.dto.shop.ShopDto;
import com.example.store_manager.mapper.ShopMapper;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class ShopServiceTest {

    @Mock
    private ShopRepository shopRepository;

    @Mock
    private ShopMapper shopMapper;

    @Mock
    private ShopUserService shopUserService;

    @Mock
    private ShopUserRepository shopUserRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ShopService shopService;

    @Test
    void createShop_returnsOk_whenValid() {
        UUID userId = UUID.randomUUID();

        ShopCreateRequestDto dto = new ShopCreateRequestDto();
        dto.setName("Test Shop");
        dto.setDescription("Description");

        Shop savedShop = Shop.builder().id(1L).build();
        User user = new User();
        ShopDto shopDto = new ShopDto();

        when(shopRepository.save(any(Shop.class))).thenReturn(savedShop);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(shopMapper.toDto(savedShop)).thenReturn(shopDto);

        Result<ShopDto> result = shopService.createShop(dto, userId);

        assertTrue(result.isOk());
        assertSame(shopDto, result.get());

        verify(shopRepository).save(any(Shop.class));
        verify(shopUserRepository).save(argThat(shopUser -> shopUser.getShop().equals(savedShop) &&
                shopUser.getUser().equals(user) &&
                shopUser.getRole() == ShopUserRole.OWNER &&
                shopUser.getStatus() == ShopUserStatus.ACTIVE));
    }

    @Test
    void createShop_returnsFail_whenUserNotFound() {
        UUID userId = UUID.randomUUID();
        ShopCreateRequestDto dto = new ShopCreateRequestDto();

        when(shopRepository.save(any())).thenReturn(new Shop());
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Result<ShopDto> result = shopService.createShop(dto, userId);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("User not found", result.error().message());

        verify(shopUserRepository, never()).save(any());
    }

    @Test
    void getShop_returnsOk_whenShopExists() {
        Shop shop = new Shop();
        ShopDto dto = new ShopDto();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(shopMapper.toDto(shop)).thenReturn(dto);

        Result<ShopDto> result = shopService.getShop(1L);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getShop_returnsFail_whenShopNotFound() {
        when(shopRepository.findById(99L)).thenReturn(Optional.empty());

        Result<ShopDto> result = shopService.getShop(99L);

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Shop not found", result.error().message());
    }

    @Test
    void updateShop_returnsOk_whenValid() {
        ShopCreateRequestDto dto = new ShopCreateRequestDto();
        Shop shop = new Shop();
        ShopDto shopDto = new ShopDto();

        when(shopRepository.findById(1L)).thenReturn(Optional.of(shop));
        when(shopRepository.save(shop)).thenReturn(shop);
        when(shopMapper.toDto(shop)).thenReturn(shopDto);

        Result<ShopDto> result = shopService.updateShop(1L, dto);

        assertTrue(result.isOk());
        assertSame(shopDto, result.get());

        verify(shopMapper).updateShopFromDto(dto, shop);
        verify(shopRepository).save(shop);
    }

    @Test
    void updateShop_returnsFail_whenShopNotFound() {
        when(shopRepository.findById(99L)).thenReturn(Optional.empty());

        Result<ShopDto> result = shopService.updateShop(99L, new ShopCreateRequestDto());

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
        assertEquals("Shop not found", result.error().message());
    }

    @Test
    void getAllShops_returnsEmptyOkResult_whenNoShops() {
        when(shopRepository.findAll()).thenReturn(List.of());

        Result<List<ShopDto>> result = shopService.getAllShops();

        assertTrue(result.isOk());
        assertTrue(result.get().isEmpty());
        verify(shopMapper, never()).toDto(any());
    }

    @Test
    void getAllShops_returnsMappedShops() {
        Shop shop = new Shop();
        ShopDto dto = new ShopDto();

        when(shopRepository.findAll()).thenReturn(List.of(shop));
        when(shopMapper.toDto(shop)).thenReturn(dto);

        Result<List<ShopDto>> result = shopService.getAllShops();

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }
}
