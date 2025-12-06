package com.incial.workhub.service.impl;

import com.incial.workhub.dto.LoginRequest;
import com.incial.workhub.dto.RegisterRequest;
import com.incial.workhub.dto.Response;
import com.incial.workhub.enums.USER_ROLE;
import com.incial.workhub.exception.OurException;
import com.incial.workhub.model.User;
import com.incial.workhub.repository.UserRepository;
import com.incial.workhub.security.JwtTokenProvider;
import com.incial.workhub.service.repo.IAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    private final UserRepository userRepository;


    @Transactional
    @Override
    public Response register(RegisterRequest request) {
        Response response = new Response();
        try {
            // Validate password
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new OurException("Password cannot be null or empty");
            }

            // Validate email
            String email = request.getEmail().trim();
            if (userRepository.existsByEmail(email)) {
                throw new OurException("Email already exists: " + email);
            }

            // Create User
            User user = new User();
            user.setName(request.getName());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(request.getPassword()));

            // Role
            user.setRole(request.getRole() != null ? request.getRole() : USER_ROLE.ROLE_EMPLOYEE);

            User savedUser = userRepository.save(user);



            response.setStatusCode(200);
            response.setMessage("User registered successfully");

        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred during user registration: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response login(LoginRequest loginRequest) {
        Response response = new Response();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new OurException("User not found"));

            String token = jwtTokenProvider.generateToken(user);

            response.setStatusCode(200);
            response.setToken(token);
            response.setRole(user.getRole().name());
            response.setMessage("Login successful");

        } catch (BadCredentialsException e) {
            response.setStatusCode(401);
            response.setMessage("Invalid email or password");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred during login: " + e.getMessage());
        }
        return response;
    }
}
