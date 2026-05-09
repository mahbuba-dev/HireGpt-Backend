import { Router } from "express";
import { candidateController } from "./candidate.controller";
import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";

const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), candidateController.getAllCandidates);
router.get("/me", checkAuth(UserRole.CANDIDATE, UserRole.ADMIN), candidateController.getMyProfile);
router.get("/:id", checkAuth(UserRole.ADMIN), candidateController.getCandidateById);
router.put("/:id", checkAuth(UserRole.ADMIN, UserRole.CANDIDATE), candidateController.updateCandidate);
router.delete("/:id", checkAuth(UserRole.ADMIN), candidateController.deleteCandidate);

export const candidateRouter = router;