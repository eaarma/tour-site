package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.ShopUser;

@Repository
public interface ShopUserRepository extends JpaRepository<ShopUser, Long> {
    List<ShopUser> findByShopId(Long shopId);
    List<ShopUser> findByUserId(UUID userId);
    Optional<ShopUser> findByShopIdAndUserId(Long shopId, UUID userId);
}