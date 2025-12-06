package com.incial.workhub.service.impl;

import com.incial.workhub.dto.Response;
import com.incial.workhub.exception.OurException;
import com.incial.workhub.model.CRM;
import com.incial.workhub.repository.CRMRepository;
import com.incial.workhub.service.repo.ICRMService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CRMService implements ICRMService {

    private final CRMRepository crmRepository;

    @Override
    public Response getAllCRMs() {
        Response response = new Response();
        try {
            List<CRM> crmList = crmRepository.findAll();
            response.setCrmList(crmList);
            response.setStatusCode(200);
            response.setMessage("CRM entries fetched successfully");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while fetching CRM entries: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response updateCRM(Long id, CRM request) {
        Response response = new Response();

        try {
            CRM crm = crmRepository.findById(id)
                    .orElseThrow(() -> new OurException("CRM entry not found."));

            // Update only non-null fields
            if (request.getCompany() != null) crm.setCompany(request.getCompany());
            if (request.getPhone() != null) crm.setPhone(request.getPhone());
            if (request.getEmail() != null) crm.setEmail(request.getEmail());
            if (request.getContactName() != null) crm.setContactName(request.getContactName());
            if (request.getAssignedTo() != null) crm.setAssignedTo(request.getAssignedTo());
            if (request.getLastContact() != null) crm.setLastContact(request.getLastContact());
            if (request.getNextFollowUp() != null) crm.setNextFollowUp(request.getNextFollowUp());
            if (request.getDealValue() != null) crm.setDealValue(request.getDealValue());
            if (request.getNotes() != null) crm.setNotes(request.getNotes());

            if (request.getTags() != null) crm.setTags(request.getTags());
            if (request.getWork() != null) crm.setWork(request.getWork());
            if (request.getStatus() != null) crm.setStatus(request.getStatus());
            if (request.getLeadSources() != null) crm.setLeadSources(request.getLeadSources());

            crmRepository.save(crm);

            response.setStatusCode(200);
            response.setMessage("CRM updated successfully");
            response.setCrm(crm);

        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while updating CRM: " + e.getMessage());
        }

        return response;
    }

    @Override
    public Response deleteCrm(Long id) {
        Response response = new Response();
        try {
            CRM crm = crmRepository.findById(id)
                    .orElseThrow(() -> new OurException("CRM entry not found."));

            crmRepository.deleteById(id);

            response.setStatusCode(200);
            response.setMessage("CRM deleted successfully");

        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error occurred while deleting CRM: " + e.getMessage());
        }
        return response;
    }
}

