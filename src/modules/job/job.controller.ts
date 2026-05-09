import { Request, Response } from 'express';
import { JobService } from './job.service';
import { createJobSchema, updateJobSchema } from './job.validation';

const jobService = new JobService();
export class JobController {
  async createJob(req: Request, res: Response) {
    const parse = createJobSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });
    const job = await jobService.createJob(parse.data);
    res.status(201).json(job);
  }

  async getAllJobs(_req: Request, res: Response) {
    const jobs = await jobService.getAllJobs();
    res.json(jobs);
  }

  async getJobById(req: Request, res: Response) {
    const job = await jobService.getJobById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  }

  async updateJob(req: Request, res: Response) {
    const parse = updateJobSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.errors });
    const job = await jobService.updateJob(req.params.id, parse.data);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  }

  async deleteJob(req: Request, res: Response) {
    const deleted = await jobService.deleteJob(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Job not found' });
    res.status(204).send();
  }
}