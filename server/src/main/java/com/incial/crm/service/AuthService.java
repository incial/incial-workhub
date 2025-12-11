package com.incial.crm.service;

import com.incial.crm.dto.LoginRequest;
import com.incial.crm.dto.LoginResponse;
import com.incial.crm.dto.RegisterRequest;
import com.incial.crm.dto.RegisterResponse;
import com.incial.crm.dto.UserDto;
import com.incial.crm.entity.User;
import com.incial.crm.repository.UserRepository;
import com.incial.crm.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public RegisterResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User with email " + request.getEmail() + " already exists");
        }

        // Set default role if not provided
        String role = request.getRole();
        if (role == null || role.isEmpty()) {
            role = "ROLE_EMPLOYEE";
        } else if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }

        // Validate role
        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_EMPLOYEE") && !role.equals("ROLE_SUPER_ADMIN")) {
            throw new RuntimeException("Invalid role. Must be ADMIN, EMPLOYEE, or SUPER_ADMIN");
        }

        // Create new user (createdAt is set automatically by @PrePersist)
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        UserDto userDto = UserDto.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();

        return RegisterResponse.builder()
                .statusCode(201)
                .message("User registered successfully")
                .user(userDto)
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            String token = jwtUtil.generateToken(user.getEmail());

            UserDto userDto = UserDto.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();

            return LoginResponse.builder()
                    .statusCode(200)
                    .token(token)
                    .role(user.getRole())
                    .message("Login successful")
                    .user(userDto)
                    .build();

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

}
