package com.complaint.service;

import com.complaint.entity.Role;
import com.complaint.entity.User;
import com.complaint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findByResetToken(String resetToken) {
        return userRepository.findByResetToken(resetToken);
    }

    public User saveUser(User user) {
        // Only encode if it's a raw password (length < 60 is a crude check for BCrypt,
        // but better to check if it's already encoded.
        // In the context of resetPassword, we know we set a raw password.)
        if (user.getPassword() != null && user.getPassword().length() < 60) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }
}
