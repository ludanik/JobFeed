// File: src/main/java/com/example/jobsclone/service/JobService.java
package com.example.jobsclone.service;

import com.example.jobsclone.dto.JobDTO;
import com.example.jobsclone.exception.ResourceNotFoundException;
import com.example.jobsclone.mapper.JobMapper;
import com.example.jobsclone.model.Application;
import com.example.jobsclone.model.Job;
import com.example.jobsclone.model.User;
import com.example.jobsclone.repository.JobRepository;
import com.example.jobsclone.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {
    
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobMapper jobMapper;
    
    public Page<JobDTO> searchJobs(String keyword, String location, List<String> jobTypes, 
                                   List<String> experienceLevels, List<Long> skillIds, Pageable pageable) {
        Specification<Job> spec = Specification.where(null);
        
        if (keyword != null && !keyword.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + keyword.toLowerCase() + "%")
                )
            );
        }
        
        if (location != null && !location.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%")
            );
        }
        
        if (jobTypes != null && !jobTypes.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("jobType").in(jobTypes));
        }
        
        if (experienceLevels != null && !experienceLevels.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("experienceLevel").in(experienceLevels));
        }
        
        if (skillIds != null && !skillIds.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                return root.join("skills").get("id").in(skillIds);
            });
        }
        
        // Only return active jobs
        spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), "ACTIVE"));
        
        return jobRepository.findAll(spec, pageable).map(jobMapper::toDTO);
    }
    
    public JobDTO getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return jobMapper.toDTO(job);
    }
    
    @Transactional
    public JobDTO createJob(JobDTO jobDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Job job = jobMapper.toEntity(jobDTO);
        Job savedJob = jobRepository.save(job);
        return jobMapper.toDTO(savedJob);
    }
    
    @Transactional
    public JobDTO updateJob(Long id, JobDTO jobDTO) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
                
        jobMapper.updateJobFromDTO(jobDTO, job);
        Job updatedJob = jobRepository.save(job);
        return jobMapper.toDTO(updatedJob);
    }
    
    @Transactional
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        job.setStatus("CLOSED");
        jobRepository.save(job);
    }
    
    @Transactional
    public void applyForJob(Long jobId, String coverLetter) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
                
        Application application = new Application();
        application.setUser(user);
        application.setJob(job);
        application.setCoverLetter(coverLetter);
        application.setStatus("PENDING");
        
        job.getApplications().add(application);
        jobRepository.save(job);
    }
    
    @Transactional
    public void saveJob(Long jobId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
                
        user.getSavedJobs().add(job);
        userRepository.save(user);
    }
    
    @Transactional
    public void unsaveJob(Long jobId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
                
        user.getSavedJobs().remove(job);
        userRepository.save(user);
    }
    
    public boolean isJobOwner(Long jobId, String email) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));
                
        return job.getCompany().getUser().getEmail().equals(email);
    }
}
