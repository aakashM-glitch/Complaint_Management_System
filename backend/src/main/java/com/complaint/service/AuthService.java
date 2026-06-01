package com.complaint.service;

import com.complaint.dto.AuthResponse;
import com.complaint.dto.ForgotPasswordRequest;
import com.complaint.dto.LoginRequest;
import com.complaint.dto.RegisterRequest;
import com.complaint.dto.ResetPasswordRequest;
import com.complaint.entity.Role;
import com.complaint.entity.User;
import com.complaint.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole() != null ? request.getRole() : Role.USER);

        // Set specialization for engineers
        if (request.getSpecialization() != null && !request.getSpecialization().isEmpty()) {
            user.setSpecialization(request.getSpecialization());
        }

        User savedUser = userService.registerUser(user);
        String tokenString = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId());

        // Save token to database
        tokenService.saveToken(tokenString, savedUser);

        return new AuthResponse(tokenString, savedUser.getEmail(), savedUser.getName(), savedUser.getRole(),
                savedUser.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String tokenString = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        // Save token to database
        tokenService.saveToken(tokenString, user);

        return new AuthResponse(tokenString, user.getEmail(), user.getName(), user.getRole(), user.getId());
    }

    public void logout(String token) {
        tokenService.revokeToken(token);
    }

    public void logoutAll(String token) {
        // Extract user from token
        String email = jwtUtil.extractUsername(token);
        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        tokenService.revokeAllUserTokens(user);
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "If an account exists with this email, a reset link has been sent."));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userService.saveUser(user);

        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userService.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(request.getNewPassword()); // UserService handles encryption
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userService.saveUser(user);
    }
}
