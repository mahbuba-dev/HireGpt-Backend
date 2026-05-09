import { Router } from "express";
import { reqruiterController } from "./reqruiter.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";
import { updateReqruiterValidationSchema } from "./reqruiter.validationSchema";
import { reqruiterApplicationUpload } from "./reqruiterApplication.upload";

const router = Router();

router.get("/", reqruiterController.getAllReqruiters);
router.get("/:id", reqruiterController.getReqruiterById);
router.post(
  "/apply",
  reqruiterApplicationUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  checkAuth(UserRole.CANDIDATE),
  reqruiterController.applyReqruiter
);

router.put(
  "/:id",
  validateRequest(updateReqruiterValidationSchema),
  checkAuth(UserRole.ADMIN, UserRole.RECRUITER),
  reqruiterController.updateReqruiter
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.RECRUITER),
  reqruiterController.deleteReqruiter
);

export const reqruiterRouter = router;
