import { Router } from 'express';
import { JobController } from './job.controller';
import jobApplicationRouter from './jobApplication.router';
const router = Router();
const controller = new JobController();
router.post('/', (req, res) => controller.createJob(req, res));
router.get('/', (req, res) => controller.getAllJobs(req, res));
router.get('/:id', (req, res) => controller.getJobById(req, res));
router.put('/:id', (req, res) => controller.updateJob(req, res));
router.delete('/:id', (req, res) => controller.deleteJob(req, res));
// Mount job application endpoints
router.use('/applications', jobApplicationRouter);
export default router;