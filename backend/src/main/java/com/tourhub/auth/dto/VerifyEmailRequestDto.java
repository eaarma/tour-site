package com.tourhub.auth.dto;

import lombok.Data;

@Data
public class VerifyEmailRequestDto {
    private String token;
}
