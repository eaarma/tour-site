package com.example.store_manager.model;

public enum ShopUserRole {
    CUSTOMER(0),
    GUIDE(1),
    MANAGER(2),
    OWNER(3),
    ADMIN(4);

    private final int level;

    ShopUserRole(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }
}
