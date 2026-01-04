package com.example.store_manager.security.annotations;

import java.lang.annotation.*;
import com.example.store_manager.security.annotations.ShopIdSource;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ShopAccess {
    AccessLevel value() default AccessLevel.VIEW;

    ShopIdSource source();
}
