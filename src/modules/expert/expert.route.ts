import { Router } from "express";
import { expertController } from "./expert.controler";
import { validateRequest } from "../../middleware/validateRequest";

import { checkAuth } from "../../middleware/cheackAuth";
import { Role } from "../../generated/enums";
import { updateExpertValidationSchema } from "./expert.validationSchema";
import { expertApplicationUpload } from "./expertApplication.upload";

const router = Router()

router.get("/", expertController.getAllExperts)
router.get("/:id", expertController.getExpertById)
router.post(
	"/apply",
	expertApplicationUpload.single("resume"),
	checkAuth(Role.CLIENT),
	expertController.applyExpert
)

router.put("/:id", validateRequest(updateExpertValidationSchema), 
checkAuth(Role.ADMIN, Role.EXPERT), expertController.updateExpert)

router.delete("/:id", checkAuth(Role.ADMIN, Role.EXPERT ), expertController.deleteExpert)
export const expertRouter = router