package com.tourhub.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tourhub.payment.model.StripeEvent;

public interface StripeEventRepository extends JpaRepository<StripeEvent, Long> {

    boolean existsByStripeEventId(String stripeEventId);
}
