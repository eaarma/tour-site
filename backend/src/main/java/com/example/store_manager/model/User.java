package com.example.store_manager.model;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;
    private String phone;
    private String nationality;

    @Enumerated(EnumType.STRING)
    private Role role;

    // Admin-only fields, nullable
    private String bio;
    private String experience;
    private String languages;

     @ManyToOne
    @JoinColumn(name = "shop_id")
    private Shop shop;
}