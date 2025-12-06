package com.incial.workhub.dto;

import com.incial.workhub.enums.USER_ROLE;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;

    private String email;

    private String password;

    private USER_ROLE role;
}
