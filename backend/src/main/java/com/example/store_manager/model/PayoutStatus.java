package com.example.store_manager.model;

public enum PayoutStatus {
    PENDING, // ready to be paid
    PROCESSING, // admin triggered payout
    COMPLETED, // successfully paid
    FAILED
}
