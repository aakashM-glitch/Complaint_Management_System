package com.complaint.service;

import com.complaint.entity.Token;
import com.complaint.entity.User;
import com.complaint.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TokenService {

    @Autowired
    private TokenRepository tokenRepository;

    @Value("${jwt.expiration}")
    private Long expiration;

    public Token saveToken(String jwtToken, User user) {
        // Revoke all existing tokens for this user (optional - you can allow multiple tokens)
        // revokeAllUserTokens(user);
        
        // Convert milliseconds to seconds for LocalDateTime
        long expirationSeconds = expiration / 1000;
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expirationSeconds);
        Token token = new Token(jwtToken, user, expiresAt);
        return tokenRepository.save(token);
    }

    public Optional<Token> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    public boolean isTokenValid(String token) {
        Optional<Token> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return false;
        }
        Token storedToken = tokenOpt.get();
        return storedToken.isValid();
    }

    public void revokeToken(String token) {
        tokenRepository.findByToken(token).ifPresent(t -> {
            t.setRevoked(true);
            t.setExpired(true);
            tokenRepository.save(t);
        });
    }

    public void revokeAllUserTokens(User user) {
        List<Token> tokens = tokenRepository.findByUserAndExpiredFalseAndRevokedFalse(user);
        tokens.forEach(token -> {
            token.setRevoked(true);
            token.setExpired(true);
        });
        tokenRepository.saveAll(tokens);
    }

    public List<Token> getUserTokens(User user) {
        return tokenRepository.findByUser(user);
    }

    public List<Token> getActiveUserTokens(User user) {
        return tokenRepository.findByUserAndExpiredFalseAndRevokedFalse(user);
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<Token> expiredTokens = tokenRepository.findExpiredTokens(now);
        
        for (Token token : expiredTokens) {
            if (token.getExpiresAt().isBefore(now)) {
                token.setExpired(true);
            }
        }
        tokenRepository.saveAll(expiredTokens);
        
        // Delete old expired/revoked tokens (older than 7 days)
        LocalDateTime cutoffDate = now.minusDays(7);
        tokenRepository.deleteExpiredTokens(cutoffDate);
    }
}
