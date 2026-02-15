package com.example.store_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.store_manager.model.StripeEvent;

public interface StripeEventRepository extends JpaRepository<StripeEvent, Long> {

    boolean existsByStripeEventId(String stripeEventId);
}
