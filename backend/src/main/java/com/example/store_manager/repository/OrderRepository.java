package com.example.store_manager.repository;

import java.util.List;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Fetch all orders for a specific user
    List<Order> findByUserId(UUID userId);
}