package com.tourhub.payment.model;

public enum PaymentStatus {
    PENDING, // payment intent created
    SUCCEEDED, // confirmed by payment provider
    FAILED, // payment failed
    REFUNDED, // fully refunded
    PARTIALLY_REFUNDED
}
