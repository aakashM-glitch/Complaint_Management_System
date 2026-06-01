package com.complaint.repository;

import com.complaint.entity.Token;
import com.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    
    Optional<Token> findByToken(String token);
    
    List<Token> findByUser(User user);
    
    List<Token> findByUserAndExpiredFalseAndRevokedFalse(User user);
    
    @Modifying
    @Query("UPDATE Token t SET t.expired = true WHERE t.user = :user AND t.expired = false AND t.revoked = false")
    int revokeAllUserTokens(@Param("user") User user);
    
    @Modifying
    @Query("UPDATE Token t SET t.expired = true WHERE t.token = :token")
    int revokeToken(@Param("token") String token);
    
    @Modifying
    @Query("DELETE FROM Token t WHERE t.expired = true OR t.revoked = true OR t.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    @Query("SELECT t FROM Token t WHERE t.expiresAt < :now AND (t.expired = false OR t.revoked = false)")
    List<Token> findExpiredTokens(@Param("now") LocalDateTime now);
}
