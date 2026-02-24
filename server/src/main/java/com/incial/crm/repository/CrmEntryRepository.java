package com.incial.crm.repository;

import com.incial.crm.entity.CrmEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmEntryRepository extends JpaRepository<CrmEntry, Long> {
    
    // Query for onboarded companies (active registry entries)
    // Includes: onboarded, on progress, Quote Sent
    @Query("SELECT c FROM CrmEntry c WHERE LOWER(c.status) IN ('onboarded', 'on progress', 'quote sent')")
    List<CrmEntry> findOnboardedEntries();
    
    // Query for completed companies
    @Query("SELECT c FROM CrmEntry c WHERE LOWER(c.status) = 'completed'")
    List<CrmEntry> findCompletedEntries();
    
    // Query for dropped companies
    @Query("SELECT c FROM CrmEntry c WHERE LOWER(c.status) = 'drop'")
    List<CrmEntry> findDroppedEntries();
}
