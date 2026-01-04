package com.example.store_manager.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.store_manager.model.User;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  @Query("""
          SELECT COUNT(su) > 0
          FROM ShopUser su
          WHERE su.user.email = :email
            AND su.shop.id = :shopId
            AND su.status = 'ACTIVE'
      """)
  boolean userBelongsToShop(
      @Param("email") String email,
      @Param("shopId") Long shopId);
}
