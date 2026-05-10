import { Router } from "express";

import { checkAuth } from "../../middleware/cheackAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserRole } from "../../generated/enums";
import { aiController } from "./ai.controller";
import { aiAdvancedController } from "./controllers/aiAdvanced.controller";
import { aiChatController } from "./controllers/aiChat.controller";
import { aiOpsController } from "./controllers/aiOps.controller";
import { aiRagController } from "./controllers/aiRag.controller";
import { aiValidation, z } from "./ai.validation";
import { aiLogger } from "./utils/aiLogger";
import { rateLimit } from "./utils/rateLimiter";
import { aiErrorHandler } from "./utils/aiErrorHandler";
import multer from "multer";
import { multerUpload } from "../../config/multer.config";
import { parseResumeController } from "./controllers/parseResume.controller";
import { jobRecommendationsController } from "./controllers/jobRecommendations.controller";

const router = Router();

// Logging + metrics on all AI requests
router.use(aiLogger);

// Per-endpoint rate limits (per minute)
const recommendationsLimiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "ai-rec" });
const industryCreationLimiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "ai-industry" });
const searchLimiter = rateLimit({ windowMs: 60_000, max: 15, keyPrefix: "ai-search" });
const summaryLimiter = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "ai-summary" });
const chatLimiter = rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "ai-chat" });
const docLimiter = rateLimit({ windowMs: 60_000, max: 3, keyPrefix: "ai-doc" });
const supportLimiter = rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "ai-support" });

/* -------------------- Ops endpoints -------------------- */
router.get("/health", aiOpsController.health);
router.get("/metrics", aiOpsController.metrics);

/* -------------------- Existing support endpoint -------------------- */
router.post(
  "/support",
  supportLimiter,
  validateRequest(aiValidation.askSupport),
  aiController.askSupport
);

/* -------------------- Phase 2 endpoints -------------------- */
router.post(
  "/recommendations",
  recommendationsLimiter,
  validateRequest(aiValidation.recommendations),
  aiAdvancedController.recommendations
);

router.post(
  "/industry-creation",
  industryCreationLimiter,
  validateRequest(aiValidation.industryCreation),
  aiAdvancedController.industryCreation
);

router.post(
  "/search",
  searchLimiter,
  validateRequest(aiValidation.search),
  aiAdvancedController.search
);

router.post(
  "/summary",
  summaryLimiter,
  validateRequest(aiValidation.summary),
  aiAdvancedController.summary
);

router.post(
  "/chat",
  chatLimiter,
  validateRequest(aiValidation.chat),
  aiAdvancedController.chat
);

router.post(
  "/chat/messages",
  chatLimiter,
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(aiValidation.persistedChatMessage),
  aiChatController.sendMessage
);

router.get(
  "/chat/conversations",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  aiChatController.listConversations
);

router.get(
  "/chat/conversations/:conversationId",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(aiValidation.conversationParams),
  aiChatController.getConversation
);

router.patch(
  "/chat/conversations/:conversationId/messages/:messageId/feedback",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(aiValidation.messageFeedback),
  aiChatController.updateMessageFeedback
);

router.post(
  "/document-analysis",
  docLimiter,
  validateRequest(aiValidation.documentAnalysis),
  aiAdvancedController.documentAnalysis
);

router.post(
  "/rag/query",
  searchLimiter,
  validateRequest(aiValidation.ragQuery),
  aiRagController.query
);

// AI-scoped error normalization (503 / provider errors)
router.use(aiErrorHandler);
/* -------------------- AI Resume Parsing & Recommendations -------------------- */
router.post(
  "/parse-resume",
  multerUpload.single("resume"),
  parseResumeController
);

router.post(
  "/job-recommendations",
  validateRequest(
    z.object({
      body: z.object({
        userProfile: z.any(),
        jobList: z.array(z.any()),
      }),
    })
  ),
  jobRecommendationsController
);

export const aiRoutes = router;
