// File: src/pages/JobSearchPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import JobCard from '../components/JobCard';
import JobFilters from '../components/JobFilters';
import Pagination from '../components/Pagination';
import { searchJobs } from '../services/jobService';

function JobSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    keyword: queryParams.get('keyword') || '',
    location: queryParams.get('location') || '',
    jobTypes: queryParams.getAll('jobType'),
    experienceLevels: queryParams.getAll('experienceLevel'),
    skillIds: queryParams.getAll('skillId').map(id => Number(id)),
    page: parseInt(queryParams.get('page')) || 0,
    size: 10
  });

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const data = await searchJobs(filters);
        setJobs(data.content);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    
    // Update URL query params
    const params = new URLSearchParams();
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.location) params.set('location', filters.location);
    filters.jobTypes.forEach(type => params.append('jobType', type));
    filters.experienceLevels.forEach(level => params.append('experienceLevel', level));
    filters.skillIds.forEach(id => params.append('skillId', id));
    params.set('page', filters.page);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 0 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-1/4">
        <JobFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>
      
      <div className="md:w-3/4">
        <h1 className="text-2xl font-bold mb-6">Job Search Results</h1>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            
            <Pagination 
              currentPage={filters.page} 
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <h3 className="text-xl mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearchPage;
