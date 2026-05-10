package com.tourhub.security.annotations;

import java.lang.annotation.*;
import com.tourhub.security.annotations.ShopIdSource;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface ShopAccess {
    AccessLevel value() default AccessLevel.VIEW;

    ShopIdSource source();
}

