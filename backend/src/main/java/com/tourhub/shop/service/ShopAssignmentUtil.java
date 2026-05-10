package com.tourhub.shop.service;

import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.tourhub.shop.model.Shop;
import com.tourhub.shop.model.ShopUserRole;
import com.tourhub.shop.repository.ShopRepository;
import com.tourhub.shop.repository.ShopUserRepository;

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
