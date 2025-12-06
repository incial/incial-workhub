package com.incial.workhub.service.repo;

import com.incial.workhub.dto.Response;
import com.incial.workhub.model.CRM;

public interface ICRMService {
    Response getAllCRMs();

    Response updateCRM(Long id, CRM request);

    Response deleteCrm(Long id);
}
