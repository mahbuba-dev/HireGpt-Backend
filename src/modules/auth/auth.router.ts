import { Router } from "express";
import { authControler } from "./auth.controler";
import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { changePasswordZodSchema, candidateDemoLoginZodSchema, forgotPasswordZodSchema, loginZodSchema, registerZodSchema, updateProfileSchema } from "./auth.validation";

const router = Router()

router.post("/register", validateRequest(registerZodSchema), authControler.registeredUser)
router.post("/login", validateRequest(loginZodSchema), authControler.loginUser)
router.post("/demo-login", validateRequest(candidateDemoLoginZodSchema), authControler.candidateDemoLogin)
router.post("/demo-login/reqruiter", authControler.reqruiterDemoLogin)
router.post("/demo-login/admin", authControler.adminDemoLogin)
router.get("/me", checkAuth(), authControler.getMe)
router.post("/refresh-token", authControler.getNewToken)
router.post('/change-password', 
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(changePasswordZodSchema),
  authControler.changePassword)

router.post("/logOut", checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER), authControler.logOutUser)
export const authRoutes = router

router.post("/verify-email", authControler.verifyEmail)
router.post("/forget-password", validateRequest(forgotPasswordZodSchema), authControler.forgetPassword)
router.post("/reset-password", authControler.resetPassword)

router.get("/login/google", authControler.googleLogin)
router.get("/google/success", authControler.googleLoginSuccess)
router.get("/oauth/error", authControler.handlerOAuthError)
router.get("/check-email", authControler.checkEmailAvailability);
router.put(
  "/update-profile",
  checkAuth(),
  validateRequest(updateProfileSchema),
  authControler.updateProfile
);
