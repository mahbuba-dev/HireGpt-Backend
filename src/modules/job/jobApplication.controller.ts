import { Request, Response } from 'express';
import { JobApplicationService } from './jobApplication.service';
import { ApplicationStatus } from '../../generated/enums';

const jobApplicationService = new JobApplicationService();


export class JobApplicationController {
  async applyToJob(req: Request, res: Response) {
    let { jobId, jobSeekerId, recruiterId, resumeUrl, coverLetter } = req.body;
    // Handle possible array types from query/params
    if (Array.isArray(jobId)) jobId = jobId[0];
    if (Array.isArray(jobSeekerId)) jobSeekerId = jobSeekerId[0];
    if (Array.isArray(recruiterId)) recruiterId = recruiterId[0];
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume is required (resumeUrl)' });
    }
    const application = await jobApplicationService.applyToJob({ jobId, jobSeekerId, recruiterId, resumeUrl, coverLetter });
    res.status(201).json(application);
  }

  async updateApplicationStatus(req: Request, res: Response) {
    const { applicationId, status } = req.body;
    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const application = await jobApplicationService.updateApplicationStatus({ applicationId, status });
    res.json(application);
  }

  // Candidate: get applied jobs
  async getAppliedJobs(req: Request, res: Response) {
    let jobSeekerId = req.user.userId;
    if (Array.isArray(jobSeekerId)) jobSeekerId = jobSeekerId[0];
    const jobs = await jobApplicationService.getAppliedJobs(jobSeekerId);
    res.json(jobs);
  }

  // Candidate: get saved jobs
  async getSavedJobs(req: Request, res: Response) {
    let jobSeekerId = req.user.userId;
    if (Array.isArray(jobSeekerId)) jobSeekerId = jobSeekerId[0];
    const jobs = await jobApplicationService.getSavedJobs(jobSeekerId);
    res.json(jobs);
  }

  // Recruiter: get applicants for a job
  async getApplicantsForJob(req: Request, res: Response) {
    let recruiterId = req.user.userId;
    let jobId = req.params.jobId;
    if (Array.isArray(recruiterId)) recruiterId = recruiterId[0];
    if (Array.isArray(jobId)) jobId = jobId[0];
    const applicants = await jobApplicationService.getApplicantsForJob(recruiterId, jobId);
    res.json(applicants);
  }
}
