package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.User;
import com.example.store_manager.model.UserStatus;

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

    Page<User> findByStatus(UserStatus status, Pageable pageable);

    @Query("""
                SELECT u FROM User u
                WHERE (:status IS NULL OR u.status = :status)
                  AND (
                    :applyQuery = false OR
                    LOWER(u.email) LIKE :queryPattern OR
                    LOWER(u.name) LIKE :queryPattern
                  )
            """)
    Page<User> searchUsers(
            @Param("applyQuery") boolean applyQuery,
            @Param("queryPattern") String queryPattern,
            @Param("status") UserStatus status,
            Pageable pageable);
}
