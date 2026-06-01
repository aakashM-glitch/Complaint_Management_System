package com.complaint.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "tokens", indexes = {
    @Index(name = "idx_token", columnList = "token"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_expired", columnList = "expired")
})
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean expired = false;

    @Column(nullable = false)
    private Boolean revoked = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiresAt == null) {
            // Default expiration: 24 hours from now
            expiresAt = LocalDateTime.now().plusHours(24);
        }
    }

    public Token() {
    }

    public Token(String token, User user, LocalDateTime expiresAt) {
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
        this.expired = false;
        this.revoked = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Boolean getExpired() {
        return expired;
    }

    public void setExpired(Boolean expired) {
        this.expired = expired;
    }

    public Boolean getRevoked() {
        return revoked;
    }

    public void setRevoked(Boolean revoked) {
        this.revoked = revoked;
    }

    public boolean isValid() {
        return !expired && !revoked && expiresAt.isAfter(LocalDateTime.now());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Token token1 = (Token) o;
        return Objects.equals(id, token1.id) && Objects.equals(token, token1.token);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, token);
    }

    @Override
    public String toString() {
        return "Token{" +
                "id=" + id +
                ", user=" + (user != null ? user.getEmail() : null) +
                ", expired=" + expired +
                ", revoked=" + revoked +
                ", expiresAt=" + expiresAt +
                '}';
    }
}
