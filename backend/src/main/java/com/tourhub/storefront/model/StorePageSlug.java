package com.tourhub.storefront.model;

import java.util.Arrays;

public enum StorePageSlug {
    FAQ("faq"),
    PRIVACY("privacy"),
    TERMS("terms"),
    REFUND("refund"),
    CONTACT("contact");

    private final String value;

    StorePageSlug(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static StorePageSlug fromValue(String value) {
        return Arrays.stream(values())
                .filter(slug -> slug.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unsupported store page slug. Allowed slugs: "
                                + Arrays.stream(values())
                                        .map(StorePageSlug::getValue)
                                        .reduce((left, right) -> left + ", " + right)
                                        .orElse("")));
    }
}
