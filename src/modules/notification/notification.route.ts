import { Router } from "express";
import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";
import { notificationController } from "./notification.controler";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createNotificationValidation,
  notificationIdValidation,
} from "./notification.validation";

const router = Router();

router.get(
  "/my",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  notificationController.getMyNotifications
);

router.get(
  "/unread-count",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  notificationController.getUnreadCount
);

router.patch(
  "/read-all",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  notificationController.markAllAsRead
);

router.patch(
  "/:id/read",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  validateRequest(notificationIdValidation),
  notificationController.markAsRead
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  validateRequest(notificationIdValidation),
  notificationController.deleteNotification
);

router.post("/", checkAuth(UserRole.ADMIN), validateRequest(createNotificationValidation), notificationController.createNotification);
router.get("/", checkAuth(UserRole.ADMIN), notificationController.getAllNotifications);

export const notificationRouter = router;
