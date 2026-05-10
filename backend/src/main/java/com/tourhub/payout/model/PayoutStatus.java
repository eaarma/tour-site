package com.tourhub.payout.model;

public enum PayoutStatus {
    PENDING, // ready to be paid
    PROCESSING, // admin triggered payout
    COMPLETED, // successfully paid
    FAILED
}
