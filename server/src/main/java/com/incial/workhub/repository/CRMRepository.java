package com.incial.workhub.repository;

import com.incial.workhub.model.CRM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CRMRepository extends JpaRepository<CRM,Long> {
}
