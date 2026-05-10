import { Router } from "express";

import { UserRole } from "../../generated/enums";
import { checkAuth } from "../../middleware/cheackAuth";
import { conversationsController } from "./conversations.controler";

const router = Router();

router.get(
	"/admin",
	checkAuth(UserRole.ADMIN),
	conversationsController.getAllConversationsForAdmin
);

export const conversationsRoutes = router;
