package com.incial.workhub.service.repo;

import com.incial.workhub.dto.LoginRequest;
import com.incial.workhub.dto.RegisterRequest;
import com.incial.workhub.dto.Response;

public interface IAuthService {
    Response login(LoginRequest loginRequest);
    Response register(RegisterRequest request);
}
