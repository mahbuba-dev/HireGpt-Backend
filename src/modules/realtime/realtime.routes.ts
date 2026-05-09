import { Router, type Request, type Response } from "express";

import { Role, UserRole } from "../../generated/enums";
import { checkAuth } from "../../middleware/cheackAuth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import {
  createAblyTokenRequest,
  userChannel,
} from "../../lib/ably";

const router = Router();

router.get(
  "/token",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  catchAsync(async (req: Request, res: Response) => {
    if (!envVars.ABLY_API_KEY) {
      throw new AppError(
        status.SERVICE_UNAVAILABLE,
        "Realtime service is not configured. Set ABLY_API_KEY on the server."
      );
    }

    const userId = req.user.userId;

    // Capability map:
    //  - private-room-*       → full chat access (subscribe/publish/presence/history)
    //  - private-user-<id>    → user's own fan-out channel (subscribe only)
    const capability: Record<string, string[]> = {
      "private-room-*": ["subscribe", "publish", "presence", "history"],
      [userChannel(userId)]: ["subscribe"],
    };

    const tokenRequest = await createAblyTokenRequest(userId, capability);

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Ably token issued",
      data: tokenRequest,
    });
  })
);

export const realtimeRoutes = router;
