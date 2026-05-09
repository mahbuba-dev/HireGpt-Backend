import {  Router } from "express";
import { userController } from "./user.controler";
import { validateRequest } from "../../middleware/validateRequest";
import { createAdminZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";





const router = Router()


// Profile update (all users)
router.put("/profile", checkAuth(), userController.updateProfile);

router.get("/clients", checkAuth(UserRole.ADMIN), userController.getAllClients)
router.post("/create-admin", validateRequest(createAdminZodSchema), checkAuth(UserRole.ADMIN), userController.createAdmin)

export const userRouter = router