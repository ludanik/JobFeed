// File: src/main/java/com/example/jobsclone/controller/JobController.java
package com.example.jobsclone.controller;

import com.example.jobsclone.dto.JobDTO;
import com.example.jobsclone.model.Job;
import com.example.jobsclone.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {
    
    private final JobService jobService;
    
    @GetMapping
    public ResponseEntity<Page<JobDTO>> getAllJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> jobTypes,
            @RequestParam(required = false) List<String> experienceLevels,
            @RequestParam(required = false) List<Long> skillIds,
            Pageable pageable) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, location, jobTypes, experienceLevels, skillIds, pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<JobDTO> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<JobDTO> createJob(@RequestBody JobDTO jobDTO) {
        return ResponseEntity.ok(jobService.createJob(jobDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') and @jobService.isJobOwner(#id, principal.username)")
    public ResponseEntity<JobDTO> updateJob(@PathVariable Long id, @RequestBody JobDTO jobDTO) {
        return ResponseEntity.ok(jobService.updateJob(id, jobDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER') and @jobService.isJobOwner(#id, principal.username)")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> applyForJob(@PathVariable Long id, @RequestBody String coverLetter) {
        jobService.applyForJob(id, coverLetter);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> saveJob(@PathVariable Long id) {
        jobService.saveJob(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}/save")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> unsaveJob(@PathVariable Long id) {
        jobService.unsaveJob(id);
        return ResponseEntity.noContent().build();
    }
}
