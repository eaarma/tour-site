package com.example.store_manager.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    // Additional custom queries can go here if needed
}