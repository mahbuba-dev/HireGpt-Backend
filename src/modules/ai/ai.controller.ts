import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponsr";
import { aiService } from "./ai.service";
import { parseResumeController } from "./controllers/parseResume.controller";
import { jobRecommendationsController } from "./controllers/jobRecommendations.controller";

const askSupport = catchAsync(async (req: Request, res: Response) => {
  const result = await aiService.askSupport(req.body);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "AI support response generated successfully",
    data: result,
  });
});

export const aiController = {
  askSupport,
  parseResumeController,
  jobRecommendationsController,
};
