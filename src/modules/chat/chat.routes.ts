import { Router } from "express";

import { checkAuth } from "../../middleware/cheackAuth";
import { UserRole } from "../../generated/enums";
import { chatController } from "./chat.controller";
import { chatUpload } from "./chat.upload";
import { validateRequest } from "../../middleware/validateRequest";
import { toggleMessageReactionValidation } from "./chat.validation";

const router = Router();

router.get("/rooms", checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN), chatController.getRooms);
router.post("/rooms", checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN), chatController.createOrGetRoom);
router.get(
  "/rooms/:roomId/messages",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.getRoomMessages
);
router.post(
  "/rooms/:roomId/messages",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.postTextMessage
);
router.post(
  "/rooms/:roomId/attachments",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatUpload.single("file"),
  chatController.postAttachmentMessage
);
router.post(
  "/rooms/:roomId/messages/:messageId/reactions",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(toggleMessageReactionValidation),
  chatController.toggleMessageReaction
);
router.post(
  "/rooms/:roomId/calls",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.createCall
);
router.patch(
  "/calls/:callId/status",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.updateCallStatus
);
router.delete(
  "/rooms/:roomId/messages/:messageId",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.deleteMessage
);

export const chatRoutes = router;
