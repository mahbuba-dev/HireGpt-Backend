import { Router } from "express";


import { validateRequest } from "../../middleware/validateRequest";

import {
	createIndustryValidation,
	industryIdValidation,
	updateIndustryValidation,
} from "./industry.validation";
import { industryController } from "./industry.controler";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";

const router = Router();

router.post(
	"/",
	checkAuth(UserRole.ADMIN),
	multerUpload.single("file"),
	validateRequest(createIndustryValidation),
	industryController.createIndustry
);

router.get("/", industryController.getAllIndustries);
router.get("/:id", validateRequest(industryIdValidation), industryController.getIndustryById);

router.delete(
	"/:id",
	checkAuth(UserRole.ADMIN),
	validateRequest(industryIdValidation),
	industryController.deleteIndustry
);
router.put(
	"/:id",
	checkAuth(UserRole.ADMIN),
	multerUpload.single("file"),
	validateRequest(updateIndustryValidation),
	industryController.updateIndustry
);


export const industryRouter = router;