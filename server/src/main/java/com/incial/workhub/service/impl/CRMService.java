package com.incial.workhub.service.impl;

import com.incial.workhub.repository.CRMRepository;
import com.incial.workhub.service.repo.ICRMService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CRMService implements ICRMService {

    private CRMRepository crmRepository;



}
