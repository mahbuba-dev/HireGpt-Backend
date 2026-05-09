import { Router } from 'express';
import { JobApplicationController } from './jobApplication.controller';

const router = Router();
const controller = new JobApplicationController();


// Resume upload (Cloudinary)
import { multerUpload } from '../../config/multer.config';
router.post('/upload-resume', multerUpload.single('resume'), (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
	// Cloudinary URL is in req.file.path
	res.json({ url: req.file.path });
});

router.post('/apply', (req, res) => controller.applyToJob(req, res));
router.put('/status', (req, res) => controller.updateApplicationStatus(req, res));

// Candidate: get applied jobs
router.get('/applied', (req, res) => controller.getAppliedJobs(req, res));
// Candidate: get saved jobs
router.get('/saved', (req, res) => controller.getSavedJobs(req, res));
// Recruiter: get applicants for a job
router.get('/applicants/:jobId', (req, res) => controller.getApplicantsForJob(req, res));

export default router;
