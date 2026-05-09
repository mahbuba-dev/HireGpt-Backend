import express from 'express';
import { checkAuth } from '../../middleware/cheackAuth';
import { UserRole } from '../../generated/enums';
import { StatsController } from './stats.controler';

const router = express.Router();

router.get(
    '/',
    checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER), // Only allow authenticated users with these roles
    StatsController.getDashboardStatsData
)


export const StatsRoutes = router;