package com.incial.workhub.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CRM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String phone;
    private String email;

    private String contactName;
    private String assignedTo;

    private LocalDate lastContact;
    private LocalDate nextFollowUp;

    private BigDecimal dealValue;

    private String notes;

    private String status;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> tags;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> work;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> leadSources;
}
