package com.incial.workhub.controller;

import com.incial.workhub.dto.LoginRequest;
import com.incial.workhub.dto.RegisterRequest;
import com.incial.workhub.dto.Response;
import com.incial.workhub.service.impl.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Response> register(@RequestBody RegisterRequest request) {
        Response response = authService.register(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Response> login(@RequestBody LoginRequest loginRequest) {
        Response response = authService.login(loginRequest);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }


}