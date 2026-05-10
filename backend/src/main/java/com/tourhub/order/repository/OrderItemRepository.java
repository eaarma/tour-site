package com.tourhub.order.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.session.model.TourSession;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi FROM OrderItem oi WHERE oi.tour.shop.id = :shopId")
    List<OrderItem> findByShopId(@Param("shopId") Long shopId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.manager.id = :managerId")
    List<OrderItem> findByManagerId(@Param("managerId") UUID managerId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.manager.id = :managerId AND oi.status = :status")
    List<OrderItem> findByManagerIdAndStatus(
            @Param("managerId") UUID managerId,
            @Param("status") OrderStatus status);

    @Query("""
                SELECT oi
                FROM OrderItem oi
                WHERE oi.order.user.id = :userId
                ORDER BY oi.scheduledAt DESC
            """)
    List<OrderItem> findByUserId(@Param("userId") UUID userId);

    // Use the correct path and named parameter.
    @Query("""
                SELECT oi.tour.shop.id
                FROM OrderItem oi
                WHERE oi.id = :itemId
            """)
    Long findShopIdByItemId(@Param("itemId") Long itemId);

    @Query("""
                SELECT oi
                FROM OrderItem oi
                JOIN FETCH oi.order o
                WHERE oi.id = :id
            """)
    Optional<OrderItem> findByIdWithOrder(@Param("id") Long id);

    @Query("""
                select oi from OrderItem oi
                join fetch oi.order o
                left join fetch o.user
                where oi.id = :id
            """)
    Optional<OrderItem> findByIdWithOrderAndUser(@Param("id") Long id);

    @Query("""
                SELECT oi
                FROM OrderItem oi
                JOIN FETCH oi.order o
                WHERE oi.session.id = :sessionId
                  AND oi.status = :status
            """)
    List<OrderItem> findBySessionIdAndStatus(
            @Param("sessionId") Long sessionId,
            @Param("status") OrderStatus status);

    @Query("""
                SELECT oi
                FROM OrderItem oi
                WHERE oi.session.id = :sessionId
                  AND oi.status = com.tourhub.order.model.OrderStatus.PAID
            """)
    List<OrderItem> findPaidBySessionId(@Param("sessionId") Long sessionId);

    @Query("""
                SELECT oi
                FROM OrderItem oi
                JOIN FETCH oi.schedule sch
                WHERE oi.session.id = :sessionId
                AND oi.status = 'PAID'
            """)
    List<OrderItem> findPaidBySessionIdWithSchedule(@Param("sessionId") Long sessionId);

}
