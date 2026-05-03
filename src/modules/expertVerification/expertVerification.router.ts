import { Router } from "express";

import {
  submitApplicationValidationSchema,
  adminApplicationsListValidationSchema,
  adminNewApplicantsListValidationSchema,
  applicationResumeAccessValidationSchema,
  applicationIdParamValidationSchema,
  reviewApplicationValidationSchema,
  verifyExpertValidationSchema,
} from "./expertVerification.validation";
import { checkAuth } from "../../middleware/cheackAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { expertVerificationController } from "./expertVerification.controler";
import { Role } from "../../generated/enums";

const router = Router();

router.post(
  "/applications",
  checkAuth(Role.CLIENT),
  validateRequest(submitApplicationValidationSchema),
  expertVerificationController.submitApplication
);

// Backward-compatible alias for older frontend builds.
router.post(
  "/apply",
  checkAuth(Role.CLIENT),
  validateRequest(submitApplicationValidationSchema),
  expertVerificationController.submitApplication
);

router.get(
  "/new-applicants",
  checkAuth(Role.ADMIN),
  validateRequest(adminNewApplicantsListValidationSchema),
  expertVerificationController.getNewApplicants
);

router.get(
  "/applications/me",
  checkAuth(Role.CLIENT, Role.EXPERT, Role.ADMIN),
  expertVerificationController.getMyApplications
);

router.get(
  "/applications",
  checkAuth(Role.ADMIN),
  validateRequest(adminApplicationsListValidationSchema),
  expertVerificationController.getAllApplications
);

router.get(
  "/applications/:id",
  checkAuth(Role.ADMIN),
  validateRequest(applicationIdParamValidationSchema),
  expertVerificationController.getApplicationById
);

router.patch(
  "/applications/:id/review",
  checkAuth(Role.ADMIN),
  validateRequest(reviewApplicationValidationSchema),
  expertVerificationController.reviewApplication
);

router.get(
  "/applications/:id/resume",
  checkAuth(Role.ADMIN),
  validateRequest(applicationResumeAccessValidationSchema),
  expertVerificationController.openApplicationResume
);

router.patch(
  "/verify/:id",
  checkAuth(Role.ADMIN),
  validateRequest(verifyExpertValidationSchema),
  expertVerificationController.verifyExpert
);

export const expertVerificationRouter = router;
