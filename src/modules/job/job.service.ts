import { prisma } from '../../lib/prisma';
import { notificationService } from '../notification/notification.service';
import { UserRole } from '../../generated/enums';

export class JobService {
  async createJob(data: any) {
    const { tags = [], ...jobData } = data;
    // Create job
    const job = await prisma.job.create({
      data: jobData,
    });
    // Create JobTag records
    if (tags.length > 0) {
      await prisma.jobTag.createMany({
        data: tags.map((tag: string) => ({ jobId: job.id, tag })),
        skipDuplicates: true,
      });
    }
    // Notify all admins
    await notificationService.createNotification({
      type: 'NEW_JOB_POST',
      message: `A new job "${job.title}" was posted by recruiter.`,
      role: UserRole.ADMIN,
    });
    // Return job with tags
    return { ...job, tags };
  }

  async getAllJobs() {
    const jobs = await prisma.job.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    // Attach tags to each job
    const jobIds = jobs.map(j => j.id);
    const tags = await prisma.jobTag.findMany({ where: { jobId: { in: jobIds } } });
    const tagMap = new Map<string, string[]>();
    for (const tag of tags) {
      if (!tagMap.has(tag.jobId)) tagMap.set(tag.jobId, []);
      tagMap.get(tag.jobId)!.push(tag.tag);
    }
    return jobs.map(j => ({ ...j, tags: tagMap.get(j.id) || [] }));
  }

  async getJobById(id: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return null;
    const tags = await prisma.jobTag.findMany({ where: { jobId: id } });
    return { ...job, tags: tags.map(t => t.tag) };
  }

  async updateJob(id: string, data: any) {
    const { tags, ...jobData } = data;
    const job = await prisma.job.update({
      where: { id },
      data: jobData,
    });
    if (tags) {
      // Remove old tags not in new list
      await prisma.jobTag.deleteMany({
        where: { jobId: id, tag: { notIn: tags } },
      });
      // Add new tags
      for (const tag of tags) {
        await prisma.jobTag.upsert({
          where: { jobId_tag: { jobId: id, tag } },
          update: {},
          create: { jobId: id, tag },
        });
      }
    }
    // Return job with tags
    const tagRecords = await prisma.jobTag.findMany({ where: { jobId: id } });
    return { ...job, tags: tagRecords.map(t => t.tag) };
  }

  async deleteJob(id: string) {
    // Soft delete
    await prisma.job.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    return true;
  }
}