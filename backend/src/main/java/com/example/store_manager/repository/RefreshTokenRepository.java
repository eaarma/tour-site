package com.example.store_manager.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.store_manager.model.RefreshToken;
import com.example.store_manager.model.User;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // ✅ Used during refresh
    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    Optional<RefreshToken> findByToken(String token);

    // ✅ Revoke a single token
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
                UPDATE RefreshToken r
                SET r.revoked = true
                WHERE r.token = :token
            """)
    void revokeByToken(@Param("token") String token);

    // ✅ Revoke all tokens for a user (logout everywhere)
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
                UPDATE RefreshToken r
                SET r.revoked = true
                WHERE r.user = :user
            """)
    void revokeAllByUser(@Param("user") User user);
}
