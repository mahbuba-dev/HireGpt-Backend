import { prisma } from '../../lib/prisma';
import { notificationService } from '../notification/notification.service';
import { ApplicationStatus } from '../../generated/enums';


export class JobApplicationService {
  // Create a new job application and notify recruiter
  async applyToJob({ jobId, jobSeekerId, recruiterId, resumeUrl, coverLetter }: {
    jobId: string;
    jobSeekerId: string;
    recruiterId: string;
    resumeUrl: string;
    coverLetter?: string;
  }) {
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId,
        recruiterId,
        resumeUrl,
        coverLetter,
        status: ApplicationStatus.PENDING,
      },
    });
    // Notify recruiter
    await notificationService.createNotification({
      type: 'NEW_APPLICATION',
      message: `A new candidate has applied to your job posting.`,
      userId: recruiterId,
    });
    return application;
  }

  // Update application status and notify candidate
  async updateApplicationStatus({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) {
    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });
    // Notify candidate
    await notificationService.createNotification({
      type: 'APPLICATION_STATUS_UPDATE',
      message: `Your application status was updated to: ${status}.`,
      userId: application.jobSeekerId,
    });
    return application;
  }

  // Candidate: get applied jobs
  async getAppliedJobs(jobSeekerId: string) {
    return prisma.jobApplication.findMany({
      where: { jobSeekerId },
      include: { job: true },
      // Removed orderBy: { createdAt: 'desc' } as createdAt is not a valid field for ordering
    });
  }

  // Candidate: get saved jobs (assumes a SavedJob model exists)
  async getSavedJobs(candidateId: string) {
    // If your SavedJob model has a candidates relation, use this:
    return prisma.savedJob.findMany({
      where: { candidates: { some: { id: candidateId } } },
      include: { job: true },
      // Remove orderBy if createdAt does not exist on SavedJob
    });
  }

  // Recruiter: get applicants for a job (with resume)
  async getApplicantsForJob(recruiterId: string, jobId: string) {
    return prisma.jobApplication.findMany({
      where: { recruiterId, jobId },
      include: {
        candidate: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            resume: true, // Use 'resume' if that's the correct field/relation
            profilePhoto: true,
          },
        },
      },
      // Remove orderBy if createdAt does not exist on JobApplication
    });
  }
}
