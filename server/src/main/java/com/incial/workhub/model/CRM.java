package com.incial.workhub.model;

import com.incial.workhub.enums.LEAD_SOURCE;
import com.incial.workhub.enums.STATUS;
import com.incial.workhub.enums.TAG;
import com.incial.workhub.enums.WORK;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
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

    private TAG tag;
    private WORK work;
    private STATUS status;
    private LEAD_SOURCE leadSource; 

}

