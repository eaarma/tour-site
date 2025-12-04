package com.example.store_manager.security.annotations;

public enum AccessLevel {
    VIEW, // User must belong to the shop
    MANAGER, // User must be MANAGER of the shop
    OWNER // User must be OWNER of the shop
}