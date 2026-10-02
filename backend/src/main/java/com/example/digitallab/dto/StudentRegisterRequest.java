package com.example.digitallab.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentRegisterRequest {
    @NotBlank
    private String fullName;
    @NotBlank
    private String registerNumber;
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String department;
    @NotNull
    private Integer year;
    @NotBlank
    private String section;
}
