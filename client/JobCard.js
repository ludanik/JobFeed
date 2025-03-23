import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { saveJob, unsaveJob } from '../services/jobService';
import { BookmarkIcon, BookmarkFilledIcon } from '../icons';

function JobCard({ job, showActions = true }) {
  const { currentUser, savedJobs, addSavedJob, removeSavedJob } = useAuth();
  const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isSaved) {
        await unsaveJob(job.id);
        removeSavedJob(job.id);
      } else {
        await saveJob(job.id);
        addSavedJob(job);
      }
    } catch (error) {
      console.error('Error toggling job save status:', error);
    }
  };

  return (
    <Link 
      to={`/jobs/${job.id}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start gap-4">
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
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">{job.title}</h3>
              <p className="text-gray-700">{job.company.name}</p>
              <p className="text-gray-600">{job.location}</p>
            </div>
            
            {currentUser && showActions && (
              <button 
                onClick={handleSaveToggle}
                className="p-2 text-gray-600 hover:text-blue-600"
                aria-label={isSaved ? "Unsave job" : "Save job"}
              >
                {isSaved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
              </button>
            )}
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {job.jobType}
            </span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              {job.experienceLevel}
            </span>
            {job.salaryMin && job.salaryMax && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
              </span>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>Posted {formatDistanceToNow(new Date(job.createdAt))} ago</span>
            {job.skills.length > 0 && (
              <span>{job.skills.length} skills required</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default JobCard;
