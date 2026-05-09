import { prisma } from "../../lib/prisma";
import { UserRole } from "../../generated/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";

// ADMIN dashboard stats
const getAdminStats = async () => {
  const [totalUsers, totalRecruiters, totalCandidates, totalJobs, totalApplications] = await Promise.all([
    prisma.user.count(),
    prisma.recruiter.count(),
    prisma.candidate.count(),
    prisma.job.count(),
    prisma.jobApplication.count(),
  ]);

  // Optionally, add revenue or payment stats if you have a payment model
  // const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });

  return {
    totalUsers,
    totalRecruiters,
    totalCandidates,
    totalJobs,
    totalApplications,
    // totalRevenue: totalRevenue._sum.amount || 0,
  };
};

// RECRUITER dashboard stats
const getRecruiterStats = async (user: IRequestUser) => {
  // Find recruiter profile
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
  if (!recruiter) return { jobsPosted: 0, applicationsReceived: 0, jobs: [], applicationStatusDistribution: [] };

  // Jobs posted by this recruiter
  const jobs = await prisma.job.findMany({ where: { recruiterId: recruiter.id } });
  const jobIds = jobs.map(j => j.id);
  const jobsPosted = jobs.length;

  // Applications received for recruiter's jobs
  const applicationsReceived = await prisma.jobApplication.count({ where: { jobId: { in: jobIds } } });

  // Application status distribution
  const applicationStatusDistribution = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { jobId: { in: jobIds } },
    _count: { id: true },
  });
  const formattedStatus = applicationStatusDistribution.map((item: { status: string, _count: { id: number } }) => ({
    status: item.status,
    count: item._count.id,
  }));

  return {
    jobsPosted,
    applicationsReceived,
    jobs,
    applicationStatusDistribution: formattedStatus,
  };
};

// CANDIDATE dashboard stats
const getCandidateStats = async (user: IRequestUser) => {
  // Find candidate profile
  const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
  if (!candidate) return { applicationsSubmitted: 0, jobsAppliedTo: 0, applicationStatusDistribution: [] };

  // Applications submitted by this candidate
  const applications = await prisma.jobApplication.findMany({ where: { jobSeekerId: candidate.id } });
  const applicationsSubmitted = applications.length;
  const jobsAppliedTo = new Set(applications.map(a => a.jobId)).size;

  // Application status distribution
  const applicationStatusDistribution = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { jobSeekerId: candidate.id },
    _count: { id: true },
  });
  const formattedStatus = applicationStatusDistribution.map((item: { status: string, _count: { id: number } }) => ({
    status: item.status,
    count: item._count.id,
  }));

  return {
    applicationsSubmitted,
    jobsAppliedTo,
    applicationStatusDistribution: formattedStatus,
  };
};

const getDashboardStatsData = async (user: IRequestUser) => {
  switch (user.userRole) {
    case UserRole.ADMIN:
      return getAdminStats();
    case UserRole.RECRUITER:
      return getRecruiterStats(user);
    case UserRole.CANDIDATE:
      return getCandidateStats(user);
    default:
      throw new Error("Invalid user role");
  }
};

export const StatsService = {
  getDashboardStatsData,
};

