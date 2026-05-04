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
import { expertApplicationUpload } from "../expert/expertApplication.upload";

const router = Router();

// Accept both JSON and multipart/form-data on the apply endpoints.
// .fields() also tolerates pure-JSON requests (no files) as a no-op.
const applicationUploadMiddleware = expertApplicationUpload.fields([
  { name: "resume", maxCount: 1 },
  { name: "profilePhoto", maxCount: 1 },
]);

router.post(
  "/applications",
  checkAuth(Role.CLIENT),
  applicationUploadMiddleware,
  validateRequest(submitApplicationValidationSchema),
  expertVerificationController.submitApplication
);

// Backward-compatible alias for older frontend builds.
router.post(
  "/apply",
  checkAuth(Role.CLIENT),
  applicationUploadMiddleware,
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
