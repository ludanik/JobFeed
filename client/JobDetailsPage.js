import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getJobById, applyForJob, saveJob, unsaveJob } from '../services/jobService';
import JobSkills from '../components/JobSkills';
import ApplicationForm from '../components/ApplicationForm';
import { formatDistanceToNow } from 'date-fns';

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, savedJobs, addSavedJob, removeSavedJob } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const isSaved = savedJobs.some(savedJob => savedJob.id === parseInt(id));
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const data = await getJobById(id);
        setJob(data);
        setError(null);
      } catch (err) {
        setError('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id]);
  
  const handleSaveToggle = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    
    try {
      if (isSaved) {
        await unsaveJob(id);
        removeSavedJob(parseInt(id));
      } else {
        await saveJob(id);
        addSavedJob(job);
      }
    } catch (error) {
      console.error('Error toggling job save status:', error);
    }
  };
  
  const handleApply = async (coverLetter) => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    
    try {
      await applyForJob(id, coverLetter);
      setApplicationStatus('success');
      setShowApplicationForm(false);
    } catch (error) {
      setApplicationStatus('error');
      console.error('Error applying for job:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="mb-8">{error || "Job not found"}</p>
        <button 
          onClick={() => navigate('/jobs')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Job Search
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Job header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-6">
          {job.company.logo ? (
            <img 
              src={job.company.logo} 
              alt={job.company.name} 
              className="w-20 h-20 rounded object-contain bg-gray-100"
            />
          ) : (
            <div className="w-20 h-20 rounded bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">
                {job.company.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
            <p className="text-lg text-blue-700 mb-2">
              <a href={`/company/${job.company.id}`} className="hover:underline">
                {job.company.name}
              </a>
            </p>
            <p className="text-gray-600 mb-4">{job.location}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                {job.jobType}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded">
                {job.experienceLevel}
              </span>
              {job.salaryMin && job.salaryMax && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
                  ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowApplicationForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
              >
                Apply Now
              </button>
              
              <button
                onClick={handleSaveToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                  isSaved 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-500'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-4">
          Posted {formatDistanceToNow(new Date(job.createdAt))} ago
        </div>
      </div>
      
      {/* Application form */}
      {showApplicationForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Apply for this position</h2>
          <ApplicationForm onSubmit={handleApply} onCancel={() => setShowApplicationForm(false)} />
        </div>
      )}
      
      {/* Application status */}
      {applicationStatus === 'success' && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-medium">Your application has been submitted successfully!</p>
          <p>You can track the status of your applications in your dashboard.</p>
        </div>
      )}
      
      {applicationStatus === 'error' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-medium">There was an error submitting your application.</p>
          <p>Please try again later.</p>
        </div>
      )}
      
      {/* Job description */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Job Description</h2>
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>
      
      {/* Skills required */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Skills</h2>
        {job.skills.length > 0 ? (
          <JobSkills skills={job.skills} />
        ) : (
          <p className="text-gray-600">No specific skills mentioned for this role.</p>
        )}
      </div>
      
      {/* About the company */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">About {job.company.name}</h2>
        <div className="flex items-start gap-4 mb-4">
          {job.company.logo ? (
            <img 
              src={job.company.logo} 
              alt={job.company.name} 
              className="w-16 h-16 rounded object-contain bg-gray-100"
            />
          ) : (
            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-400">
                {job.company.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium">
              <a href={`/company/${job.company.id}`} className="text-blue-600 hover:underline">
                {job.company.name}
              </a>
            </h3>
            <p className="text-gray-600">{job.company.industry} · {job.company.size}</p>
          </div>
        </div>
        {job.company.description ? (
          <p className="text-gray-700">{job.company.description}</p>
        ) : (
          <p className="text-gray-600">No company description available.</p>
        )}
        {job.company.website && (
          <a 
            href={job.company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            Visit company website
          </a>
        )}
      </div>
    </div>
  );
}

export default JobDetailsPage;
