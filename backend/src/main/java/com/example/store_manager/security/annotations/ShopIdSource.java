package com.example.store_manager.security.annotations;

public enum ShopIdSource {
    SHOP_ID, // Long shopId
    TOUR_ID, // Long tourId
    SESSION_ID, // Long sessionId
    ITEM_ID, // Long itemId
    DTO_TOUR_ID, // TourScheduleCreateDto
    SCHEDULE_ID
}
