package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;

@Repository
public interface ShopUserRepository extends JpaRepository<ShopUser, Long> {

  /*
   * -----------------------------
   * Basic lookups
   * -----------------------------
   */

  List<ShopUser> findByShopId(Long shopId);

  List<ShopUser> findByUserId(UUID userId);

  Optional<ShopUser> findByShopIdAndUserId(Long shopId, UUID userId);

  List<ShopUser> findByShopIdAndStatus(Long shopId, ShopUserStatus status);

  /*
   * -----------------------------
   * Existence checks (fast paths)
   * -----------------------------
   */

  boolean existsByUserIdAndShopId(UUID userId, Long shopId);

  boolean existsByUserIdAndShopIdAndRole(
      UUID userId,
      Long shopId,
      ShopUserRole role);

  /*
   * -----------------------------
   * Role lookup (authorization)
   * -----------------------------
   */

  @Query("""
          SELECT su.role
          FROM ShopUser su
          WHERE su.user.id = :userId
            AND su.shop.id = :shopId
      """)
  Optional<ShopUserRole> findRole(
      @Param("userId") UUID userId,
      @Param("shopId") Long shopId);

  /*
   * -----------------------------
   * Fetch joins (avoid N+1)
   * -----------------------------
   */

  @Query("""
          SELECT su
          FROM ShopUser su
          JOIN FETCH su.user
          WHERE su.shop.id = :shopId
      """)
  List<ShopUser> findByShopIdWithUser(@Param("shopId") Long shopId);
}
