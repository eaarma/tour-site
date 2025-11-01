package com.example.store_manager.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // ✅ Fetch all order items for a specific shop
    @Query("SELECT oi FROM OrderItem oi WHERE oi.tour.shop.id = :shopId")
    List<OrderItem> findByShopId(@Param("shopId") Long shopId);

    // ✅ Fetch all order items assigned to a specific manager
    @Query("SELECT oi FROM OrderItem oi WHERE oi.manager.id = :managerId")
    List<OrderItem> findByManagerId(@Param("managerId") UUID managerId);

    // ✅ Optional: fetch by status for a manager (if needed later)
    @Query("SELECT oi FROM OrderItem oi WHERE oi.manager.id = :managerId AND oi.status = :status")
    List<OrderItem> findByManagerIdAndStatus(
            @Param("managerId") UUID managerId,
            @Param("status") OrderStatus status);

    // ✅ Simple helper for direct lookup (faster than scanning all orders)
    Optional<OrderItem> findById(Long id);

    @Query("""
            SELECT oi
            FROM OrderItem oi
            WHERE oi.order.user.id = :userId
            ORDER BY oi.scheduledAt DESC
            """)
    List<OrderItem> findByUserId(@Param("userId") UUID userId);
}
