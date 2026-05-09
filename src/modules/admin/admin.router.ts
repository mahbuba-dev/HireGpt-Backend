import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/cheackAuth";

import { adminController } from "./admin.controler";
import { adminIdValidationSchema, updateAdminValidationSchema } from "./admin.validation";
import { UserRole } from "../../generated/enums";

const router = Router();

router.get("/", checkAuth(UserRole.ADMIN), adminController.getAllAdmin);
router.get("/:id", checkAuth(UserRole.ADMIN), validateRequest(adminIdValidationSchema), adminController.getAdminById);
router.put("/:id", checkAuth(UserRole.ADMIN), validateRequest(updateAdminValidationSchema), adminController.updateAdmin);

router.delete("/:id", checkAuth(UserRole.ADMIN), validateRequest(adminIdValidationSchema), adminController.deleteAdmin);
export const adminRouter = router;