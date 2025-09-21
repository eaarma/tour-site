package com.example.store_manager.model;

public enum OrderStatus {
    // Before payment
    PENDING, // User has placed order but not paid yet
    EXPIRED, // Payment window expired or reservation not completed

    // After payment
    PAID, // Fully paid and all items confirmed
    PARTIALLY_PAID, // (optional) if you ever allow split payments
    CONFIRMED, // All items are locked in / tickets issued

    // Cancellations & Refunds
    CANCELLED, // Entire order or item was cancelled before confirmation
    PARTIALLY_CANCELLED, // For master order: some items cancelled, others active
    REFUNDED, // Full refund issued
    PARTIALLY_REFUNDED, // For master order: some items refunded

    // Edge cases
    COMPLETED, // Tour(s) took place successfully
    FAILED // Payment failed or order processing error
}