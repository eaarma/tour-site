package com.example.store_manager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.store_manager.model.Shop;

@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
        Optional<Shop> findByName(String name); 
}