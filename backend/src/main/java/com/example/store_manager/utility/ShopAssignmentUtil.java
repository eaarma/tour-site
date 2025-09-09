package com.example.store_manager.utility;

import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.repository.ShopRepository;
import com.example.store_manager.repository.ShopUserRepository;

@Component
public class ShopAssignmentUtil {

    private final ShopRepository shopRepository;
    private final ShopUserRepository shopUserRepository;

    public ShopAssignmentUtil(ShopRepository shopRepository, ShopUserRepository shopUserRepository) {
        this.shopRepository = shopRepository;
        this.shopUserRepository = shopUserRepository;
    }

    public Shop assignRandomShopToManager() {
        List<Shop> allShops = shopRepository.findAll();

        Set<Long> takenShopIds = shopUserRepository.findAll().stream()
                .filter(su -> su.getRole() == ShopUserRole.MANAGER)
                .map(su -> su.getShop().getId())
                .collect(Collectors.toSet());

        List<Shop> availableShops = allShops.stream()
                .filter(shop -> !takenShopIds.contains(shop.getId()))
                .collect(Collectors.toList());

        if (availableShops.isEmpty()) {
            throw new RuntimeException("No available shops to assign");
        }

        return availableShops.get(new Random().nextInt(availableShops.size()));
    }
}