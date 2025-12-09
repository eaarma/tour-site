package com.example.store_manager.security.annotations;

public enum AccessLevel {
    VIEW(0),
    GUIDE(1),
    MANAGER(2),
    OWNER(3),
    ADMIN(4);

    private final int level;

    AccessLevel(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }
}
