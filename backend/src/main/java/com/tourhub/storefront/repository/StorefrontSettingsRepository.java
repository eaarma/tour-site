package com.tourhub.storefront.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tourhub.storefront.model.StorefrontSettings;

@Repository
public interface StorefrontSettingsRepository extends JpaRepository<StorefrontSettings, Long> {

    Optional<StorefrontSettings> findTopByOrderByIdAsc();
}
