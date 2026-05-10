var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/index.ts
import { Router as Router15 } from "express";

// src/modules/auth/auth.router.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import status3 from "http-status";

// src/errorHelpers/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/config/env.ts
import dotenv from "dotenv";
import status from "http-status";
dotenv.config({ quiet: true });
var loadEnvVariables = () => {
  const requiredEnvVariables = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_EXPIRY",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASSWORD",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD"
    // "BETTER_AUTH_SESSION_TOKEN_EXPIRY",
    // "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE"
  ];
  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(status.INTERNAL_SERVER_ERROR, `Environment variable "${variable}" is required but missing in the .env file.`);
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASSWORD: process.env.EMAIL_SENDER_SMTP_PASSWORD,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER || (process.env.NODE_ENV === "production" ? "openai" : "gemini"),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.0-flash"
    // BETTER_AUTH_SESSION_TOKEN_EXPIRY: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRY as string,
    // BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string
  };
};
var envVars = loadEnvVariables();

// src/utilis/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/utilis/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/utilis/token.ts
var isProduction = envVars.NODE_ENV === "production";
var getCookieBaseOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/"
});
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRY }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRY }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    ...getCookieBaseOptions(),
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    ...getCookieBaseOptions(),
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  const options = {
    ...getCookieBaseOptions(),
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  };
  CookieUtils.setCookie(res, "better-auth.session_token", token, options);
  CookieUtils.setCookie(res, "__Secure-better-auth.session_token", token, options);
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";

// src/generated/enums.ts
var CallStatus = {
  ACTIVE: "ACTIVE",
  ENDED: "ENDED"
};
var UserRole = {
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  CANDIDATE: "CANDIDATE"
};
var ReviewStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};
var ApplicationStatus = {
  PENDING: "PENDING",
  REVIEWED: "REVIEWED",
  SHORTLISTED: "SHORTLISTED",
  REJECTED: "REJECTED",
  ACCEPTED: "ACCEPTED"
};
var AIChatMessageRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
  SYSTEM: "SYSTEM"
};
var MessageType = {
  TEXT: "TEXT",
  FILE: "FILE",
  SYSTEM: "SYSTEM"
};

// src/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// src/generated/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": `model Admin {
  id            String    @id @default(uuid())
  userId        String    @unique
  name          String
  email         String    @unique
  profilePhoto  String?
  contactNumber String?
  permissions   Json?
  lastLoginAt   DateTime?
  status        String    @default("ACTIVE")
  isDeleted     Boolean   @default(false)
  deletedAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([userId])
  @@map("admin")
}

model AIChatMessage {
  id             String            @id @default(uuid())
  conversationId String
  role           AIChatMessageRole
  content        String
  isVoice        Boolean           @default(false)
  audioUrl       String?
  createdAt      DateTime          @default(now())
  conversation   AIConversation    @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  attachments    Attachment[]      @relation("AIChatMessageToAttachment")
}

model AIConversation {
  id          String          @id @default(uuid())
  userId      String
  contextType AIContextType   @default(CAREER_ASSISTANT)
  title       String?         @db.VarChar(160)
  isPinned    Boolean         @default(false)
  isArchived  Boolean         @default(false)
  totalTokens Int?
  lastModel   String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  messages    AIChatMessage[]
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  candidates  Candidate[]     @relation("AIConversationToCandidate")
  recruiters  Recruiter[]     @relation("AIConversationToRecruiter")

  @@index([userId])
  @@index([contextType])
  @@map("ai_conversations")
}

model AIRecommendation {
  id        String   @id @default(uuid())
  userId    String
  type      String
  entityId  String
  score     Float
  reason    String?
  createdAt DateTime @default(now())
}

model Attachment {
  id             String          @id @default(uuid())
  messageId      String
  fileUrl        String
  fileName       String
  fileType       String
  fileSize       Int
  isResume       Boolean         @default(false)
  isPrivate      Boolean         @default(false)
  aiAnalyzed     Boolean         @default(false)
  aiSummary      String?
  createdAt      DateTime        @default(now())
  message        Message         @relation(fields: [messageId], references: [id], onDelete: Cascade)
  aichatMessages AIChatMessage[] @relation("AIChatMessageToAttachment")

  @@index([messageId])
  @@map("attachments")
}

model User {
  id                 String            @id
  name               String
  email              String            @unique
  emailVerified      Boolean           @default(false)
  image              String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  role               String            @default("Candidate")
  status             String            @default("Active")
  needPasswordChange Boolean           @default(false)
  isDeleted          Boolean           @default(false)
  deletedAt          DateTime?
  accounts           Account[]
  admins             Admin?
  aiConversations    AIConversation[]
  candidates         Candidate?
  messageReactions   MessageReaction[]
  notifications      Notification[]
  recruiters         Recruiter?
  resumes            Resume[]
  savedJobs          SavedJob[]
  sessions           Session[]
  userPresences      UserPresence?
  testimonials       Testimonial[]

  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

model CallParticipant {
  id        String        @id @default(uuid())
  callId    String
  userId    String
  role      UserRole
  joinedAt  DateTime?
  leftAt    DateTime?
  aiScore   Float?
  createdAt DateTime      @default(now())
  call      InterviewCall @relation(fields: [callId], references: [id], onDelete: Cascade)

  @@index([callId])
  @@index([userId])
  @@map("call_participants")
}

model Candidate {
  id           String           @id @default(uuid())
  fullName     String
  email        String           @unique
  profilePhoto String?
  phone        String?
  address      String?
  headline     String?
  summary      String?
  experience   Int              @default(0)
  skills       String[]         @default([])
  aiScore      Float?
  aiTags       String[]         @default([])
  isDeleted    Boolean          @default(false)
  deletedAt    DateTime?
  userId       String           @unique
  resumeid     String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  chatRooms    ChatRoom[]
  interviews   Interview[]
  applications JobApplication[]
  resume       Resume?          @relation(fields: [resumeid], references: [id])
  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  aiChats      AIConversation[] @relation("AIConversationToCandidate")
  savedJobs    SavedJob[]       @relation("CandidateToSavedJob")

  @@index([email])
  @@index([isDeleted])
  @@map("candidates")
}

model ChatRoom {
  id           String          @id @default(uuid())
  jobSeekerId  String?
  recruiterId  String?
  isAIChat     Boolean         @default(false)
  jobId        String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  job          Job?            @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidate    Candidate?      @relation(fields: [jobSeekerId], references: [id], onDelete: Cascade)
  recruiter    Recruiter?      @relation(fields: [recruiterId], references: [id], onDelete: Cascade)
  calls        InterviewCall[]
  messages     Message[]
  typingStates TypingState[]

  @@unique([jobSeekerId, recruiterId, jobId])
  @@index([jobSeekerId])
  @@index([recruiterId])
  @@index([jobId])
  @@map("chat_rooms")
}

// Added for chat and review features
enum CallStatus {
  ACTIVE
  ENDED
}

enum UserRole {
  ADMIN
  RECRUITER
  CANDIDATE
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BLOCKED
  DELETED
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum JobStatus {
  DRAFT
  OPEN
  CLOSED
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  SHORTLISTED
  REJECTED
  ACCEPTED
}

enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  REMOTE
  INTERNSHIP
}

enum ExperienceLevel {
  ENTRY
  MID
  SENIOR
  LEAD
}

enum AIChatMessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum AIMessageFeedback {
  LIKE
  DISLIKE
}

enum AIFeatureType {
  RESUME_ANALYSIS
  JOB_MATCHING
  CHAT_ASSISTANT
  COVER_LETTER
  SKILL_GAP_ANALYSIS
}

enum InterviewStatus {
  SCHEDULED
  ONGOING
  COMPLETED
  CANCELLED
}

enum InterviewType {
  AI
  HUMAN
}

enum MessageType {
  TEXT
  FILE
  SYSTEM
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  SYSTEM
}

enum MatchScoreLevel {
  LOW
  MEDIUM
  HIGH
  VERY_HIGH
}

enum PaymentStatus {
  PAID
  UNPAID
  FAILED
  REFUNDED
}

enum PriorityLevel {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum AIIntentType {
  ASK_JOB
  ASK_SKILL
  RESUME_HELP
  COVER_LETTER
  SALARY_QUERY
  JOB_RECOMMENDATION
  INTERVIEW_PREP
}

enum AIContextType {
  GENERAL_CHAT
  JOB_MATCHING
  RESUME_REVIEW
  COVER_LETTER
  INTERVIEW_PREP
  JOB_DESCRIPTION
  CAREER_GUIDANCE
  CAREER_ASSISTANT
  SKILL_ANALYSIS
  RECRUITER_ASSISTANT
  CONTENT_GENERATION
  FILE_ANALYSIS
  VOICE_CHAT
}

model Industry {
  id          String      @id @default(uuid())
  name        String      @unique @db.VarChar(100)
  description String?
  icon        String?     @db.VarChar(255)
  slug        String?     @unique
  isActive    Boolean     @default(true)
  jobCount    Int         @default(0)
  userCount   Int         @default(0)
  isDeleted   Boolean     @default(false)
  deletedAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  jobs        Job[]
  recruiters  Recruiter[] @relation("IndustryToRecruiter")

  @@index([isDeleted])
  @@index([name])
  @@index([slug])
  @@map("industries")
}

model Interview {
  id              String          @id @default(uuid())
  jobId           String
  applicationId   String
  recruiterId     String
  candidateId     String
  type            InterviewType   @default(AI)
  status          InterviewStatus @default(SCHEDULED)
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?
  durationMinutes Int?
  aiScore         Float?
  aiFeedback      String?
  meetingLink     String?
  notes           String?
  isDeleted       Boolean         @default(false)
  deletedAt       DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  application     JobApplication  @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  job             Job             @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidate       Candidate       @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  recruiter       Recruiter       @relation(fields: [recruiterId], references: [id], onDelete: Cascade)

  @@index([jobId])
  @@index([applicationId])
  @@index([status])
  @@map("interviews")
}

model InterviewCall {
  id           String            @id @default(uuid())
  chatRoomId   String
  jobId        String?
  status       InterviewStatus   @default(SCHEDULED)
  scheduledAt  DateTime?
  startedAt    DateTime?
  endedAt      DateTime?
  duration     Int?
  aiScore      Float?
  aiFeedback   String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  participants CallParticipant[]
  chatRoom     ChatRoom          @relation(fields: [chatRoomId], references: [id], onDelete: Cascade)
  job          Job?              @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([chatRoomId])
  @@index([jobId])
  @@index([status])
  @@map("interview_calls")
}

model Job {
  id               String           @id @default(uuid())
  title            String
  description      String
  responsibilities String?
  requirements     String
  location         String?
  isRemote         Boolean          @default(false)
  salaryMin        Int?
  salaryMax        Int?
  currency         String           @default("USD")
  type             JobType
  experienceLevel  ExperienceLevel
  status           JobStatus        @default(OPEN)
  aiSummary        String?
  aiTags           String[]         @default([])
  aiScore          Float?
  recruiterId      String
  industryId       String?
  isDeleted        Boolean          @default(false)
  deletedAt        DateTime?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  jobTags          JobTag[]
  chatRooms        ChatRoom[]
  interviewCalls   InterviewCall[]
  interviews       Interview[]
  applications     JobApplication[]
  industry         Industry?        @relation(fields: [industryId], references: [id])
  recruiter        Recruiter        @relation("RecruiterJobs", fields: [recruiterId], references: [id], onDelete: Cascade)
  savedBy          SavedJob[]

  @@index([recruiterId])
  @@index([status])
  @@index([industryId])
  @@map("jobs")
}

model JobApplication {
  id             String            @id @default(uuid())
  jobSeekerId    String
  jobId          String
  recruiterId    String
  status         ApplicationStatus @default(PENDING)
  aiScore        Float?
  aiMatchReasons String[]
  resumeUrl      String?
  coverLetter    String?
  appliedAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  interview      Interview[]
  job            Job               @relation(fields: [jobId], references: [id], onDelete: Cascade)
  candidate      Candidate         @relation(fields: [jobSeekerId], references: [id], onDelete: Cascade)
  recruiter      Recruiter         @relation(fields: [recruiterId], references: [id], onDelete: Cascade)

  @@index([jobId])
  @@index([jobSeekerId])
  @@index([recruiterId])
  @@map("job_applications")
}

model JobTag {
  id    String @id @default(uuid())
  jobId String
  tag   String
  job   Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([jobId, tag])
  @@index([jobId])
}

model Message {
  id          String            @id @default(uuid())
  roomId      String
  senderId    String
  senderRole  UserRole
  type        MessageType       @default(TEXT)
  text        String?
  aiIntent    AIIntentType?
  aiScore     Float?
  isAI        Boolean           @default(false)
  createdAt   DateTime          @default(now())
  attachments Attachment[]
  reactions   MessageReaction[]
  room        ChatRoom          @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId])
  @@index([senderId])
  @@map("messages")
}

model MessageReaction {
  id             String   @id @default(uuid())
  messageId      String
  userId         String
  emoji          String   @db.VarChar(32)
  isAIReaction   Boolean  @default(false)
  sentimentScore Float?
  createdAt      DateTime @default(now())
  message        Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId, emoji])
  @@index([messageId])
  @@index([userId])
  @@map("message_reactions")
}

model Notification {
  id         String           @id @default(uuid())
  userId     String
  type       NotificationType
  title      String?
  message    String
  entityType String?
  entityId   String?
  isAI       Boolean          @default(false)
  priority   PriorityLevel    @default(MEDIUM)
  read       Boolean          @default(false)
  readAt     DateTime?
  createdAt  DateTime         @default(now())
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@index([read])
  @@map("notifications")
}

model Recruiter {
  id              String           @id @default(uuid())
  userId          String           @unique
  fullName        String
  email           String           @unique
  profilePhoto    String?
  phone           String?
  bio             String?
  companyName     String?
  designation     String?
  experience      Int              @default(0)
  hiringBudget    Int?
  verified        Boolean          @default(false)
  totalJobsPosted Int              @default(0)
  activeJobs      Int              @default(0)
  isSeeded        Boolean          @default(false)
  isDeleted       Boolean          @default(false)
  deletedAt       DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  chatRooms       ChatRoom[]
  interviews      Interview[]
  jobApplications JobApplication[]
  jobs            Job[]            @relation("RecruiterJobs")
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  analytics       RecruiterStats?
  chats           AIConversation[] @relation("AIConversationToRecruiter")
  industries      Industry[]       @relation("IndustryToRecruiter")

  @@index([email])
  @@index([userId])
  @@map("recruiter")
}

model RecruiterStats {
  id                 String    @id @default(uuid())
  recruiterId        String    @unique
  totalJobsPosted    Int       @default(0)
  activeJobs         Int       @default(0)
  totalApplications  Int       @default(0)
  shortlistedCount   Int       @default(0)
  hiredCount         Int       @default(0)
  avgResponseTimeMin Int?
  ratingScore        Float     @default(0)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  recruiter          Recruiter @relation(fields: [recruiterId], references: [id], onDelete: Cascade)

  @@map("recruiter_stats")
}

model Resume {
  id              String      @id @default(uuid())
  userId          String
  fileUrl         String
  fileName        String?
  fileType        String?
  aiSummary       String?
  aiScore         Float?
  extractedSkills String[]
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  candidates      Candidate[]
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("resumes")
}

model SavedJob {
  id         String      @id @default(uuid())
  userId     String
  jobId      String
  createdAt  DateTime    @default(now())
  job        Job         @relation(fields: [jobId], references: [id], onDelete: Cascade)
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  candidates Candidate[] @relation("CandidateToSavedJob")

  @@unique([userId, jobId])
  @@index([userId])
  @@index([jobId])
  @@map("saved_jobs")
}

// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client"
  output   = "../../src/generated"
}

datasource db {
  provider = "postgresql"
}

// Testimonial model for user feedback
model Testimonial {
  id        String   @id @default(uuid())
  userId    String
  userRole  String // 'CANDIDATE' or 'RECRUITER'
  content   String
  rating    Int // 1-5 star rating
  meta      String? // Optional meta info (e.g., job title, company)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model TypingState {
  id        String   @id @default(uuid())
  roomId    String
  userId    String
  isTyping  Boolean  @default(false)
  isAI      Boolean  @default(false)
  updatedAt DateTime @updatedAt
  room      ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([roomId, userId])
  @@index([roomId])
  @@map("typing_states")
}

model UserPresence {
  userId     String   @id
  isOnline   Boolean  @default(false)
  lastSeen   DateTime @default(now())
  lastAction String?
  updatedAt  DateTime @updatedAt
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([isOnline])
  @@map("user_presence")
}
`,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"permissions","kind":"scalar","type":"Json"},{"name":"lastLoginAt","kind":"scalar","type":"DateTime"},{"name":"status","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admin"},"AIChatMessage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"AIChatMessageRole"},{"name":"content","kind":"scalar","type":"String"},{"name":"isVoice","kind":"scalar","type":"Boolean"},{"name":"audioUrl","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"conversation","kind":"object","type":"AIConversation","relationName":"AIChatMessageToAIConversation"},{"name":"attachments","kind":"object","type":"Attachment","relationName":"AIChatMessageToAttachment"}],"dbName":null},"AIConversation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"contextType","kind":"enum","type":"AIContextType"},{"name":"title","kind":"scalar","type":"String"},{"name":"isPinned","kind":"scalar","type":"Boolean"},{"name":"isArchived","kind":"scalar","type":"Boolean"},{"name":"totalTokens","kind":"scalar","type":"Int"},{"name":"lastModel","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"messages","kind":"object","type":"AIChatMessage","relationName":"AIChatMessageToAIConversation"},{"name":"user","kind":"object","type":"User","relationName":"AIConversationToUser"},{"name":"candidates","kind":"object","type":"Candidate","relationName":"AIConversationToCandidate"},{"name":"recruiters","kind":"object","type":"Recruiter","relationName":"AIConversationToRecruiter"}],"dbName":"ai_conversations"},"AIRecommendation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"score","kind":"scalar","type":"Float"},{"name":"reason","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Attachment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"messageId","kind":"scalar","type":"String"},{"name":"fileUrl","kind":"scalar","type":"String"},{"name":"fileName","kind":"scalar","type":"String"},{"name":"fileType","kind":"scalar","type":"String"},{"name":"fileSize","kind":"scalar","type":"Int"},{"name":"isResume","kind":"scalar","type":"Boolean"},{"name":"isPrivate","kind":"scalar","type":"Boolean"},{"name":"aiAnalyzed","kind":"scalar","type":"Boolean"},{"name":"aiSummary","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"message","kind":"object","type":"Message","relationName":"AttachmentToMessage"},{"name":"aichatMessages","kind":"object","type":"AIChatMessage","relationName":"AIChatMessageToAttachment"}],"dbName":"attachments"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"admins","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"aiConversations","kind":"object","type":"AIConversation","relationName":"AIConversationToUser"},{"name":"candidates","kind":"object","type":"Candidate","relationName":"CandidateToUser"},{"name":"messageReactions","kind":"object","type":"MessageReaction","relationName":"MessageReactionToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"recruiters","kind":"object","type":"Recruiter","relationName":"RecruiterToUser"},{"name":"resumes","kind":"object","type":"Resume","relationName":"ResumeToUser"},{"name":"savedJobs","kind":"object","type":"SavedJob","relationName":"SavedJobToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"userPresences","kind":"object","type":"UserPresence","relationName":"UserToUserPresence"},{"name":"testimonials","kind":"object","type":"Testimonial","relationName":"TestimonialToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"CallParticipant":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"callId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"joinedAt","kind":"scalar","type":"DateTime"},{"name":"leftAt","kind":"scalar","type":"DateTime"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"call","kind":"object","type":"InterviewCall","relationName":"CallParticipantToInterviewCall"}],"dbName":"call_participants"},"Candidate":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"headline","kind":"scalar","type":"String"},{"name":"summary","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"skills","kind":"scalar","type":"String"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"aiTags","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"resumeid","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"chatRooms","kind":"object","type":"ChatRoom","relationName":"CandidateToChatRoom"},{"name":"interviews","kind":"object","type":"Interview","relationName":"CandidateToInterview"},{"name":"applications","kind":"object","type":"JobApplication","relationName":"CandidateToJobApplication"},{"name":"resume","kind":"object","type":"Resume","relationName":"CandidateToResume"},{"name":"user","kind":"object","type":"User","relationName":"CandidateToUser"},{"name":"aiChats","kind":"object","type":"AIConversation","relationName":"AIConversationToCandidate"},{"name":"savedJobs","kind":"object","type":"SavedJob","relationName":"CandidateToSavedJob"}],"dbName":"candidates"},"ChatRoom":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"jobSeekerId","kind":"scalar","type":"String"},{"name":"recruiterId","kind":"scalar","type":"String"},{"name":"isAIChat","kind":"scalar","type":"Boolean"},{"name":"jobId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"job","kind":"object","type":"Job","relationName":"ChatRoomToJob"},{"name":"candidate","kind":"object","type":"Candidate","relationName":"CandidateToChatRoom"},{"name":"recruiter","kind":"object","type":"Recruiter","relationName":"ChatRoomToRecruiter"},{"name":"calls","kind":"object","type":"InterviewCall","relationName":"ChatRoomToInterviewCall"},{"name":"messages","kind":"object","type":"Message","relationName":"ChatRoomToMessage"},{"name":"typingStates","kind":"object","type":"TypingState","relationName":"ChatRoomToTypingState"}],"dbName":"chat_rooms"},"Industry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"icon","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"jobCount","kind":"scalar","type":"Int"},{"name":"userCount","kind":"scalar","type":"Int"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"jobs","kind":"object","type":"Job","relationName":"IndustryToJob"},{"name":"recruiters","kind":"object","type":"Recruiter","relationName":"IndustryToRecruiter"}],"dbName":"industries"},"Interview":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"jobId","kind":"scalar","type":"String"},{"name":"applicationId","kind":"scalar","type":"String"},{"name":"recruiterId","kind":"scalar","type":"String"},{"name":"candidateId","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"InterviewType"},{"name":"status","kind":"enum","type":"InterviewStatus"},{"name":"scheduledAt","kind":"scalar","type":"DateTime"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"endedAt","kind":"scalar","type":"DateTime"},{"name":"durationMinutes","kind":"scalar","type":"Int"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"aiFeedback","kind":"scalar","type":"String"},{"name":"meetingLink","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"application","kind":"object","type":"JobApplication","relationName":"InterviewToJobApplication"},{"name":"job","kind":"object","type":"Job","relationName":"InterviewToJob"},{"name":"candidate","kind":"object","type":"Candidate","relationName":"CandidateToInterview"},{"name":"recruiter","kind":"object","type":"Recruiter","relationName":"InterviewToRecruiter"}],"dbName":"interviews"},"InterviewCall":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"chatRoomId","kind":"scalar","type":"String"},{"name":"jobId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"InterviewStatus"},{"name":"scheduledAt","kind":"scalar","type":"DateTime"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"endedAt","kind":"scalar","type":"DateTime"},{"name":"duration","kind":"scalar","type":"Int"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"aiFeedback","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"participants","kind":"object","type":"CallParticipant","relationName":"CallParticipantToInterviewCall"},{"name":"chatRoom","kind":"object","type":"ChatRoom","relationName":"ChatRoomToInterviewCall"},{"name":"job","kind":"object","type":"Job","relationName":"InterviewCallToJob"}],"dbName":"interview_calls"},"Job":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"responsibilities","kind":"scalar","type":"String"},{"name":"requirements","kind":"scalar","type":"String"},{"name":"location","kind":"scalar","type":"String"},{"name":"isRemote","kind":"scalar","type":"Boolean"},{"name":"salaryMin","kind":"scalar","type":"Int"},{"name":"salaryMax","kind":"scalar","type":"Int"},{"name":"currency","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"JobType"},{"name":"experienceLevel","kind":"enum","type":"ExperienceLevel"},{"name":"status","kind":"enum","type":"JobStatus"},{"name":"aiSummary","kind":"scalar","type":"String"},{"name":"aiTags","kind":"scalar","type":"String"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"recruiterId","kind":"scalar","type":"String"},{"name":"industryId","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"jobTags","kind":"object","type":"JobTag","relationName":"JobToJobTag"},{"name":"chatRooms","kind":"object","type":"ChatRoom","relationName":"ChatRoomToJob"},{"name":"interviewCalls","kind":"object","type":"InterviewCall","relationName":"InterviewCallToJob"},{"name":"interviews","kind":"object","type":"Interview","relationName":"InterviewToJob"},{"name":"applications","kind":"object","type":"JobApplication","relationName":"JobToJobApplication"},{"name":"industry","kind":"object","type":"Industry","relationName":"IndustryToJob"},{"name":"recruiter","kind":"object","type":"Recruiter","relationName":"RecruiterJobs"},{"name":"savedBy","kind":"object","type":"SavedJob","relationName":"JobToSavedJob"}],"dbName":"jobs"},"JobApplication":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"jobSeekerId","kind":"scalar","type":"String"},{"name":"jobId","kind":"scalar","type":"String"},{"name":"recruiterId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ApplicationStatus"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"aiMatchReasons","kind":"scalar","type":"String"},{"name":"resumeUrl","kind":"scalar","type":"String"},{"name":"coverLetter","kind":"scalar","type":"String"},{"name":"appliedAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"interview","kind":"object","type":"Interview","relationName":"InterviewToJobApplication"},{"name":"job","kind":"object","type":"Job","relationName":"JobToJobApplication"},{"name":"candidate","kind":"object","type":"Candidate","relationName":"CandidateToJobApplication"},{"name":"recruiter","kind":"object","type":"Recruiter","relationName":"JobApplicationToRecruiter"}],"dbName":"job_applications"},"JobTag":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"jobId","kind":"scalar","type":"String"},{"name":"tag","kind":"scalar","type":"String"},{"name":"job","kind":"object","type":"Job","relationName":"JobToJobTag"}],"dbName":null},"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"senderRole","kind":"enum","type":"UserRole"},{"name":"type","kind":"enum","type":"MessageType"},{"name":"text","kind":"scalar","type":"String"},{"name":"aiIntent","kind":"enum","type":"AIIntentType"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"isAI","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"attachments","kind":"object","type":"Attachment","relationName":"AttachmentToMessage"},{"name":"reactions","kind":"object","type":"MessageReaction","relationName":"MessageToMessageReaction"},{"name":"room","kind":"object","type":"ChatRoom","relationName":"ChatRoomToMessage"}],"dbName":"messages"},"MessageReaction":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"messageId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"emoji","kind":"scalar","type":"String"},{"name":"isAIReaction","kind":"scalar","type":"Boolean"},{"name":"sentimentScore","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"message","kind":"object","type":"Message","relationName":"MessageToMessageReaction"},{"name":"user","kind":"object","type":"User","relationName":"MessageReactionToUser"}],"dbName":"message_reactions"},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"NotificationType"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"entityType","kind":"scalar","type":"String"},{"name":"entityId","kind":"scalar","type":"String"},{"name":"isAI","kind":"scalar","type":"Boolean"},{"name":"priority","kind":"enum","type":"PriorityLevel"},{"name":"read","kind":"scalar","type":"Boolean"},{"name":"readAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":"notifications"},"Recruiter":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"companyName","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"hiringBudget","kind":"scalar","type":"Int"},{"name":"verified","kind":"scalar","type":"Boolean"},{"name":"totalJobsPosted","kind":"scalar","type":"Int"},{"name":"activeJobs","kind":"scalar","type":"Int"},{"name":"isSeeded","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"chatRooms","kind":"object","type":"ChatRoom","relationName":"ChatRoomToRecruiter"},{"name":"interviews","kind":"object","type":"Interview","relationName":"InterviewToRecruiter"},{"name":"jobApplications","kind":"object","type":"JobApplication","relationName":"JobApplicationToRecruiter"},{"name":"jobs","kind":"object","type":"Job","relationName":"RecruiterJobs"},{"name":"user","kind":"object","type":"User","relationName":"RecruiterToUser"},{"name":"analytics","kind":"object","type":"RecruiterStats","relationName":"RecruiterToRecruiterStats"},{"name":"chats","kind":"object","type":"AIConversation","relationName":"AIConversationToRecruiter"},{"name":"industries","kind":"object","type":"Industry","relationName":"IndustryToRecruiter"}],"dbName":"recruiter"},"RecruiterStats":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"recruiterId","kind":"scalar","type":"String"},{"name":"totalJobsPosted","kind":"scalar","type":"Int"},{"name":"activeJobs","kind":"scalar","type":"Int"},{"name":"totalApplications","kind":"scalar","type":"Int"},{"name":"shortlistedCount","kind":"scalar","type":"Int"},{"name":"hiredCount","kind":"scalar","type":"Int"},{"name":"avgResponseTimeMin","kind":"scalar","type":"Int"},{"name":"ratingScore","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"recruiter","kind":"object","type":"Recruiter","relationName":"RecruiterToRecruiterStats"}],"dbName":"recruiter_stats"},"Resume":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"fileUrl","kind":"scalar","type":"String"},{"name":"fileName","kind":"scalar","type":"String"},{"name":"fileType","kind":"scalar","type":"String"},{"name":"aiSummary","kind":"scalar","type":"String"},{"name":"aiScore","kind":"scalar","type":"Float"},{"name":"extractedSkills","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"candidates","kind":"object","type":"Candidate","relationName":"CandidateToResume"},{"name":"user","kind":"object","type":"User","relationName":"ResumeToUser"}],"dbName":"resumes"},"SavedJob":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"jobId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"job","kind":"object","type":"Job","relationName":"JobToSavedJob"},{"name":"user","kind":"object","type":"User","relationName":"SavedJobToUser"},{"name":"candidates","kind":"object","type":"Candidate","relationName":"CandidateToSavedJob"}],"dbName":"saved_jobs"},"Testimonial":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"userRole","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"meta","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"TestimonialToUser"}],"dbName":null},"TypingState":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"roomId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"isTyping","kind":"scalar","type":"Boolean"},{"name":"isAI","kind":"scalar","type":"Boolean"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"room","kind":"object","type":"ChatRoom","relationName":"ChatRoomToTypingState"}],"dbName":"typing_states"},"UserPresence":{"fields":[{"name":"userId","kind":"scalar","type":"String"},{"name":"isOnline","kind":"scalar","type":"Boolean"},{"name":"lastSeen","kind":"scalar","type":"DateTime"},{"name":"lastAction","kind":"scalar","type":"String"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserPresence"}],"dbName":"user_presence"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","accounts","admins","conversation","attachments","message","reactions","job","jobTags","chatRooms","call","participants","chatRoom","_count","interviewCalls","interview","interviews","applications","candidates","resume","aiChats","savedJobs","candidate","jobApplications","jobs","recruiter","analytics","chats","recruiters","industries","application","industry","savedBy","calls","messages","room","typingStates","aichatMessages","aiConversations","messageReactions","notifications","resumes","sessions","userPresences","testimonials","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","data","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","create","update","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","having","_min","_max","Admin.groupBy","Admin.aggregate","AIChatMessage.findUnique","AIChatMessage.findUniqueOrThrow","AIChatMessage.findFirst","AIChatMessage.findFirstOrThrow","AIChatMessage.findMany","AIChatMessage.createOne","AIChatMessage.createMany","AIChatMessage.createManyAndReturn","AIChatMessage.updateOne","AIChatMessage.updateMany","AIChatMessage.updateManyAndReturn","AIChatMessage.upsertOne","AIChatMessage.deleteOne","AIChatMessage.deleteMany","AIChatMessage.groupBy","AIChatMessage.aggregate","AIConversation.findUnique","AIConversation.findUniqueOrThrow","AIConversation.findFirst","AIConversation.findFirstOrThrow","AIConversation.findMany","AIConversation.createOne","AIConversation.createMany","AIConversation.createManyAndReturn","AIConversation.updateOne","AIConversation.updateMany","AIConversation.updateManyAndReturn","AIConversation.upsertOne","AIConversation.deleteOne","AIConversation.deleteMany","_avg","_sum","AIConversation.groupBy","AIConversation.aggregate","AIRecommendation.findUnique","AIRecommendation.findUniqueOrThrow","AIRecommendation.findFirst","AIRecommendation.findFirstOrThrow","AIRecommendation.findMany","AIRecommendation.createOne","AIRecommendation.createMany","AIRecommendation.createManyAndReturn","AIRecommendation.updateOne","AIRecommendation.updateMany","AIRecommendation.updateManyAndReturn","AIRecommendation.upsertOne","AIRecommendation.deleteOne","AIRecommendation.deleteMany","AIRecommendation.groupBy","AIRecommendation.aggregate","Attachment.findUnique","Attachment.findUniqueOrThrow","Attachment.findFirst","Attachment.findFirstOrThrow","Attachment.findMany","Attachment.createOne","Attachment.createMany","Attachment.createManyAndReturn","Attachment.updateOne","Attachment.updateMany","Attachment.updateManyAndReturn","Attachment.upsertOne","Attachment.deleteOne","Attachment.deleteMany","Attachment.groupBy","Attachment.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","CallParticipant.findUnique","CallParticipant.findUniqueOrThrow","CallParticipant.findFirst","CallParticipant.findFirstOrThrow","CallParticipant.findMany","CallParticipant.createOne","CallParticipant.createMany","CallParticipant.createManyAndReturn","CallParticipant.updateOne","CallParticipant.updateMany","CallParticipant.updateManyAndReturn","CallParticipant.upsertOne","CallParticipant.deleteOne","CallParticipant.deleteMany","CallParticipant.groupBy","CallParticipant.aggregate","Candidate.findUnique","Candidate.findUniqueOrThrow","Candidate.findFirst","Candidate.findFirstOrThrow","Candidate.findMany","Candidate.createOne","Candidate.createMany","Candidate.createManyAndReturn","Candidate.updateOne","Candidate.updateMany","Candidate.updateManyAndReturn","Candidate.upsertOne","Candidate.deleteOne","Candidate.deleteMany","Candidate.groupBy","Candidate.aggregate","ChatRoom.findUnique","ChatRoom.findUniqueOrThrow","ChatRoom.findFirst","ChatRoom.findFirstOrThrow","ChatRoom.findMany","ChatRoom.createOne","ChatRoom.createMany","ChatRoom.createManyAndReturn","ChatRoom.updateOne","ChatRoom.updateMany","ChatRoom.updateManyAndReturn","ChatRoom.upsertOne","ChatRoom.deleteOne","ChatRoom.deleteMany","ChatRoom.groupBy","ChatRoom.aggregate","Industry.findUnique","Industry.findUniqueOrThrow","Industry.findFirst","Industry.findFirstOrThrow","Industry.findMany","Industry.createOne","Industry.createMany","Industry.createManyAndReturn","Industry.updateOne","Industry.updateMany","Industry.updateManyAndReturn","Industry.upsertOne","Industry.deleteOne","Industry.deleteMany","Industry.groupBy","Industry.aggregate","Interview.findUnique","Interview.findUniqueOrThrow","Interview.findFirst","Interview.findFirstOrThrow","Interview.findMany","Interview.createOne","Interview.createMany","Interview.createManyAndReturn","Interview.updateOne","Interview.updateMany","Interview.updateManyAndReturn","Interview.upsertOne","Interview.deleteOne","Interview.deleteMany","Interview.groupBy","Interview.aggregate","InterviewCall.findUnique","InterviewCall.findUniqueOrThrow","InterviewCall.findFirst","InterviewCall.findFirstOrThrow","InterviewCall.findMany","InterviewCall.createOne","InterviewCall.createMany","InterviewCall.createManyAndReturn","InterviewCall.updateOne","InterviewCall.updateMany","InterviewCall.updateManyAndReturn","InterviewCall.upsertOne","InterviewCall.deleteOne","InterviewCall.deleteMany","InterviewCall.groupBy","InterviewCall.aggregate","Job.findUnique","Job.findUniqueOrThrow","Job.findFirst","Job.findFirstOrThrow","Job.findMany","Job.createOne","Job.createMany","Job.createManyAndReturn","Job.updateOne","Job.updateMany","Job.updateManyAndReturn","Job.upsertOne","Job.deleteOne","Job.deleteMany","Job.groupBy","Job.aggregate","JobApplication.findUnique","JobApplication.findUniqueOrThrow","JobApplication.findFirst","JobApplication.findFirstOrThrow","JobApplication.findMany","JobApplication.createOne","JobApplication.createMany","JobApplication.createManyAndReturn","JobApplication.updateOne","JobApplication.updateMany","JobApplication.updateManyAndReturn","JobApplication.upsertOne","JobApplication.deleteOne","JobApplication.deleteMany","JobApplication.groupBy","JobApplication.aggregate","JobTag.findUnique","JobTag.findUniqueOrThrow","JobTag.findFirst","JobTag.findFirstOrThrow","JobTag.findMany","JobTag.createOne","JobTag.createMany","JobTag.createManyAndReturn","JobTag.updateOne","JobTag.updateMany","JobTag.updateManyAndReturn","JobTag.upsertOne","JobTag.deleteOne","JobTag.deleteMany","JobTag.groupBy","JobTag.aggregate","Message.findUnique","Message.findUniqueOrThrow","Message.findFirst","Message.findFirstOrThrow","Message.findMany","Message.createOne","Message.createMany","Message.createManyAndReturn","Message.updateOne","Message.updateMany","Message.updateManyAndReturn","Message.upsertOne","Message.deleteOne","Message.deleteMany","Message.groupBy","Message.aggregate","MessageReaction.findUnique","MessageReaction.findUniqueOrThrow","MessageReaction.findFirst","MessageReaction.findFirstOrThrow","MessageReaction.findMany","MessageReaction.createOne","MessageReaction.createMany","MessageReaction.createManyAndReturn","MessageReaction.updateOne","MessageReaction.updateMany","MessageReaction.updateManyAndReturn","MessageReaction.upsertOne","MessageReaction.deleteOne","MessageReaction.deleteMany","MessageReaction.groupBy","MessageReaction.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","Recruiter.findUnique","Recruiter.findUniqueOrThrow","Recruiter.findFirst","Recruiter.findFirstOrThrow","Recruiter.findMany","Recruiter.createOne","Recruiter.createMany","Recruiter.createManyAndReturn","Recruiter.updateOne","Recruiter.updateMany","Recruiter.updateManyAndReturn","Recruiter.upsertOne","Recruiter.deleteOne","Recruiter.deleteMany","Recruiter.groupBy","Recruiter.aggregate","RecruiterStats.findUnique","RecruiterStats.findUniqueOrThrow","RecruiterStats.findFirst","RecruiterStats.findFirstOrThrow","RecruiterStats.findMany","RecruiterStats.createOne","RecruiterStats.createMany","RecruiterStats.createManyAndReturn","RecruiterStats.updateOne","RecruiterStats.updateMany","RecruiterStats.updateManyAndReturn","RecruiterStats.upsertOne","RecruiterStats.deleteOne","RecruiterStats.deleteMany","RecruiterStats.groupBy","RecruiterStats.aggregate","Resume.findUnique","Resume.findUniqueOrThrow","Resume.findFirst","Resume.findFirstOrThrow","Resume.findMany","Resume.createOne","Resume.createMany","Resume.createManyAndReturn","Resume.updateOne","Resume.updateMany","Resume.updateManyAndReturn","Resume.upsertOne","Resume.deleteOne","Resume.deleteMany","Resume.groupBy","Resume.aggregate","SavedJob.findUnique","SavedJob.findUniqueOrThrow","SavedJob.findFirst","SavedJob.findFirstOrThrow","SavedJob.findMany","SavedJob.createOne","SavedJob.createMany","SavedJob.createManyAndReturn","SavedJob.updateOne","SavedJob.updateMany","SavedJob.updateManyAndReturn","SavedJob.upsertOne","SavedJob.deleteOne","SavedJob.deleteMany","SavedJob.groupBy","SavedJob.aggregate","Testimonial.findUnique","Testimonial.findUniqueOrThrow","Testimonial.findFirst","Testimonial.findFirstOrThrow","Testimonial.findMany","Testimonial.createOne","Testimonial.createMany","Testimonial.createManyAndReturn","Testimonial.updateOne","Testimonial.updateMany","Testimonial.updateManyAndReturn","Testimonial.upsertOne","Testimonial.deleteOne","Testimonial.deleteMany","Testimonial.groupBy","Testimonial.aggregate","TypingState.findUnique","TypingState.findUniqueOrThrow","TypingState.findFirst","TypingState.findFirstOrThrow","TypingState.findMany","TypingState.createOne","TypingState.createMany","TypingState.createManyAndReturn","TypingState.updateOne","TypingState.updateMany","TypingState.updateManyAndReturn","TypingState.upsertOne","TypingState.deleteOne","TypingState.deleteMany","TypingState.groupBy","TypingState.aggregate","UserPresence.findUnique","UserPresence.findUniqueOrThrow","UserPresence.findFirst","UserPresence.findFirstOrThrow","UserPresence.findMany","UserPresence.createOne","UserPresence.createMany","UserPresence.createManyAndReturn","UserPresence.updateOne","UserPresence.updateMany","UserPresence.updateManyAndReturn","UserPresence.upsertOne","UserPresence.deleteOne","UserPresence.deleteMany","UserPresence.groupBy","UserPresence.aggregate","AND","OR","NOT","userId","isOnline","lastSeen","lastAction","updatedAt","equals","in","notIn","lt","lte","gt","gte","contains","startsWith","endsWith","not","id","roomId","isTyping","isAI","userRole","content","rating","meta","createdAt","jobId","fileUrl","fileName","fileType","aiSummary","aiScore","extractedSkills","isActive","has","hasEvery","hasSome","recruiterId","totalJobsPosted","activeJobs","totalApplications","shortlistedCount","hiredCount","avgResponseTimeMin","ratingScore","fullName","email","profilePhoto","phone","bio","companyName","designation","experience","hiringBudget","verified","isSeeded","isDeleted","deletedAt","NotificationType","type","title","entityType","entityId","PriorityLevel","priority","read","readAt","messageId","emoji","isAIReaction","sentimentScore","senderId","UserRole","senderRole","MessageType","text","AIIntentType","aiIntent","tag","jobSeekerId","ApplicationStatus","status","aiMatchReasons","resumeUrl","coverLetter","appliedAt","description","responsibilities","requirements","location","isRemote","salaryMin","salaryMax","currency","JobType","ExperienceLevel","experienceLevel","JobStatus","aiTags","industryId","chatRoomId","InterviewStatus","scheduledAt","startedAt","endedAt","duration","aiFeedback","applicationId","candidateId","InterviewType","durationMinutes","meetingLink","notes","name","icon","slug","jobCount","userCount","isAIChat","address","headline","summary","skills","resumeid","callId","role","joinedAt","leftAt","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","emailVerified","image","needPasswordChange","every","some","none","fileSize","isResume","isPrivate","aiAnalyzed","score","reason","AIContextType","contextType","isPinned","isArchived","totalTokens","lastModel","conversationId","AIChatMessageRole","isVoice","audioUrl","contactNumber","permissions","lastLoginAt","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","roomId_userId","userId_jobId","jobSeekerId_recruiterId_jobId","jobId_tag","messageId_userId_emoji","is","isNot","connectOrCreate","upsert","set","disconnect","delete","connect","updateMany","deleteMany","createMany","push","increment","decrement","multiply","divide"]'),
  graph: "1w-PAsADEQMAALkGACD4AwAA4wcAMPkDAAAHABD6AwAA4wcAMPsDAQAAAAH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIagEAQAAAAGpBAEAuAYAIbIEIAC2BgAhswRAAIcHACHLBAEAggcAIesEAQCCBwAhnwUBALgGACGgBQAA5AcAIKEFQACHBwAhAQAAAAEAIBEDAAC5BgAg-AMAAOUHADD5AwAAAwAQ-gMAAOUHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIf0EAQCCBwAh_gQBAIIHACH_BAEAuAYAIYAFAQC4BgAhgQUBALgGACGCBUAAhwcAIYMFQACHBwAhhAUBALgGACGFBQEAuAYAIQgDAADwBwAg_wQAAOYHACCABQAA5gcAIIEFAADmBwAgggUAAOYHACCDBQAA5gcAIIQFAADmBwAghQUAAOYHACARAwAAuQYAIPgDAADlBwAw-QMAAAMAEPoDAADlBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIf0EAQCCBwAh_gQBAIIHACH_BAEAuAYAIYAFAQC4BgAhgQUBALgGACGCBUAAhwcAIYMFQACHBwAhhAUBALgGACGFBQEAuAYAIQMAAAADACABAAAEADACAAAFACARAwAAuQYAIPgDAADjBwAw-QMAAAcAEPoDAADjBwAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGoBAEAggcAIakEAQC4BgAhsgQgALYGACGzBEAAhwcAIcsEAQCCBwAh6wQBAIIHACGfBQEAuAYAIaAFAADkBwAgoQVAAIcHACEBAAAABwAgEQMAALkGACAVAACmBwAgHwAAugcAICUAAN0HACD4AwAA4QcAMPkDAAAJABD6AwAA4QcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhtgQBALgGACGWBQAA4geWBSKXBSAAtgYAIZgFIAC2BgAhmQUCAMwGACGaBQEAuAYAIQcDAADwBwAgFQAA7g0AIB8AAPcNACAlAACDDgAgtgQAAOYHACCZBQAA5gcAIJoFAADmBwAgEQMAALkGACAVAACmBwAgHwAAugcAICUAAN0HACD4AwAA4QcAMPkDAAAJABD6AwAA4QcAMPsDAQCCBwAh_wNAALcGACGLBAEAAAABkwRAALcGACG2BAEAuAYAIZYFAADiB5YFIpcFIAC2BgAhmAUgALYGACGZBQIAzAYAIZoFAQC4BgAhAwAAAAkAIAEAAAoAMAIAAAsAIAwGAADgBwAgBwAAsQcAIPgDAADeBwAw-QMAAA0AEPoDAADeBwAwiwQBAIIHACGQBAEAggcAIZMEQAC3BgAh9wQAAN8HnQUimwUBAIIHACGdBSAAtgYAIZ4FAQC4BgAhAwYAAIQOACAHAADwDQAgngUAAOYHACAMBgAA4AcAIAcAALEHACD4AwAA3gcAMPkDAAANABD6AwAA3gcAMIsEAQAAAAGQBAEAggcAIZMEQAC3BgAh9wQAAN8HnQUimwUBAIIHACGdBSAAtgYAIZ4FAQC4BgAhAwAAAA0AIAEAAA4AMAIAAA8AIBAIAADbBwAgKAAA3QcAIPgDAADcBwAw-QMAABEAEPoDAADcBwAwiwQBAIIHACGTBEAAtwYAIZUEAQCCBwAhlgQBAIIHACGXBAEAggcAIZgEAQC4BgAhvQQBAIIHACGPBQIAywYAIZAFIAC2BgAhkQUgALYGACGSBSAAtgYAIQMIAACCDgAgKAAAgw4AIJgEAADmBwAgEAgAANsHACAoAADdBwAg-AMAANwHADD5AwAAEQAQ-gMAANwHADCLBAEAAAABkwRAALcGACGVBAEAggcAIZYEAQCCBwAhlwQBAIIHACGYBAEAuAYAIb0EAQCCBwAhjwUCAMsGACGQBSAAtgYAIZEFIAC2BgAhkgUgALYGACEDAAAAEQAgAQAAEgAwAgAAEwAgAwAAABEAIAEAABIAMAIAABMAIAwDAAC5BgAgCAAA2wcAIPgDAADaBwAw-QMAABYAEPoDAADaBwAw-wMBAIIHACGLBAEAggcAIZMEQAC3BgAhvQQBAIIHACG-BAEAggcAIb8EIAC2BgAhwAQIAKUHACEDAwAA8AcAIAgAAIIOACDABAAA5gcAIA0DAAC5BgAgCAAA2wcAIPgDAADaBwAw-QMAABYAEPoDAADaBwAw-wMBAIIHACGLBAEAAAABkwRAALcGACG9BAEAggcAIb4EAQCCBwAhvwQgALYGACHABAgApQcAIawFAADZBwAgAwAAABYAIAEAABcAMAIAABgAICELAAC_BwAgDAAAswcAIBEAAMAHACATAAC0BwAgFAAAtQcAIBwAAM4GACAiAADBBwAgIwAAkAcAIPgDAAC7BwAw-QMAABoAEPoDAAC7BwAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhmAQBALgGACGZBAgApQcAIZ8EAQCCBwAhsgQgALYGACGzBEAAhwcAIbUEAAC8B9kEIrYEAQCCBwAhywQAAL4H3AQi0AQBAIIHACHRBAEAuAYAIdIEAQCCBwAh0wQBALgGACHUBCAAtgYAIdUEAgDMBgAh1gQCAMwGACHXBAEAggcAIdoEAAC9B9oEItwEAADCBgAg3QQBALgGACEBAAAAGgAgBwoAAMQHACD4AwAA2AcAMPkDAAAcABD6AwAA2AcAMIsEAQCCBwAhlAQBAIIHACHIBAEAggcAIQEKAAD7DQAgCAoAAMQHACD4AwAA2AcAMPkDAAAcABD6AwAA2AcAMIsEAQAAAAGUBAEAggcAIcgEAQCCBwAhqwUAANcHACADAAAAHAAgAQAAHQAwAgAAHgAgEAoAANIHACAZAACLBwAgHAAAjgcAICQAAMAHACAlAADVBwAgJwAA1gcAIPgDAADUBwAw-QMAACAAEPoDAADUBwAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhlAQBALgGACGfBAEAuAYAIckEAQC4BgAh8AQgALYGACEJCgAA-w0AIBkAAM8NACAcAADTCwAgJAAA-Q0AICUAAIAOACAnAACBDgAglAQAAOYHACCfBAAA5gcAIMkEAADmBwAgEQoAANIHACAZAACLBwAgHAAAjgcAICQAAMAHACAlAADVBwAgJwAA1gcAIPgDAADUBwAw-QMAACAAEPoDAADUBwAw_wNAALcGACGLBAEAAAABkwRAALcGACGUBAEAuAYAIZ8EAQC4BgAhyQQBALgGACHwBCAAtgYAIaoFAADTBwAgAwAAACAAIAEAACEAMAIAACIAIBIKAADSBwAgDgAA0QcAIA8AAKwHACD4AwAA0AcAMPkDAAAkABD6AwAA0AcAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQC4BgAhmQQIAKUHACHLBAAAzAfgBCLeBAEAggcAIeAEQACHBwAh4QRAAIcHACHiBEAAhwcAIeMEAgDMBgAh5AQBALgGACEKCgAA-w0AIA4AAP8NACAPAADvDQAglAQAAOYHACCZBAAA5gcAIOAEAADmBwAg4QQAAOYHACDiBAAA5gcAIOMEAADmBwAg5AQAAOYHACASCgAA0gcAIA4AANEHACAPAACsBwAg-AMAANAHADD5AwAAJAAQ-gMAANAHADD_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZQEAQC4BgAhmQQIAKUHACHLBAAAzAfgBCLeBAEAggcAIeAEQACHBwAh4QRAAIcHACHiBEAAhwcAIeMEAgDMBgAh5AQBALgGACEDAAAAJAAgAQAAJQAwAgAAJgAgDA0AAM8HACD4AwAAzgcAMPkDAAAoABD6AwAAzgcAMPsDAQCCBwAhiwQBAIIHACGTBEAAtwYAIZkECAClBwAh9gQBAIIHACH3BAAArgfDBCL4BEAAhwcAIfkEQACHBwAhBA0AAP4NACCZBAAA5gcAIPgEAADmBwAg-QQAAOYHACAMDQAAzwcAIPgDAADOBwAw-QMAACgAEPoDAADOBwAw-wMBAIIHACGLBAEAAAABkwRAALcGACGZBAgApQcAIfYEAQCCBwAh9wQAAK4HwwQi-ARAAIcHACH5BEAAhwcAIQMAAAAoACABAAApADACAAAqACABAAAAGgAgAQAAACgAIBoKAADEBwAgGQAAyQcAIBwAAM4GACAhAADNBwAg-AMAAMoHADD5AwAALgAQ-gMAAMoHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGUBAEAggcAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAAMsH6AQiywQAAMwH4AQi4ARAALcGACHhBEAAhwcAIeIEQACHBwAh5AQBALgGACHlBAEAggcAIeYEAQCCBwAh6AQCAMwGACHpBAEAuAYAIeoEAQC4BgAhDAoAAPsNACAZAADPDQAgHAAA0wsAICEAAP0NACCZBAAA5gcAILMEAADmBwAg4QQAAOYHACDiBAAA5gcAIOQEAADmBwAg6AQAAOYHACDpBAAA5gcAIOoEAADmBwAgGgoAAMQHACAZAADJBwAgHAAAzgYAICEAAM0HACD4AwAAygcAMPkDAAAuABD6AwAAygcAMP8DQAC3BgAhiwQBAAAAAZMEQAC3BgAhlAQBAIIHACGZBAgApQcAIZ8EAQCCBwAhsgQgALYGACGzBEAAhwcAIbUEAADLB-gEIssEAADMB-AEIuAEQAC3BgAh4QRAAIcHACHiBEAAhwcAIeQEAQC4BgAh5QQBAIIHACHmBAEAggcAIegEAgDMBgAh6QQBALgGACHqBAEAuAYAIQMAAAAuACABAAAvADACAAAwACADAAAALgAgAQAALwAwAgAAMAAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAuACABAAAvADACAAAwACASCgAAxAcAIBIAALQHACAZAADJBwAgHAAAzgYAIPgDAADHBwAw-QMAADUAEPoDAADHBwAw_wNAALcGACGLBAEAggcAIZQEAQCCBwAhmQQIAKUHACGfBAEAggcAIckEAQCCBwAhywQAAMgHywQizAQAAMIGACDNBAEAuAYAIc4EAQC4BgAhzwRAALcGACEHCgAA-w0AIBIAAPINACAZAADPDQAgHAAA0wsAIJkEAADmBwAgzQQAAOYHACDOBAAA5gcAIBIKAADEBwAgEgAAtAcAIBkAAMkHACAcAADOBgAg-AMAAMcHADD5AwAANQAQ-gMAAMcHADD_A0AAtwYAIYsEAQAAAAGUBAEAggcAIZkECAClBwAhnwQBAIIHACHJBAEAggcAIcsEAADIB8sEIswEAADCBgAgzQQBALgGACHOBAEAuAYAIc8EQAC3BgAhAwAAADUAIAEAADYAMAIAADcAIBADAAC5BgAgFQAApgcAIPgDAACkBwAw-QMAADkAEPoDAACkBwAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGVBAEAggcAIZYEAQC4BgAhlwQBALgGACGYBAEAuAYAIZkECAClBwAhmgQAAMIGACCbBCAAtgYAIQEAAAA5ACAcAwAAuQYAIAwAALMHACATAAC0BwAgFAAAtQcAIBYAAMYHACAXAACKBwAgGAAAkAcAIPgDAADFBwAw-QMAADsAEPoDAADFBwAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGZBAgApQcAIacEAQCCBwAhqAQBAIIHACGpBAEAuAYAIaoEAQC4BgAhrgQCAMsGACGyBCAAtgYAIbMEQACHBwAh3AQAAMIGACDxBAEAuAYAIfIEAQC4BgAh8wQBALgGACH0BAAAwgYAIPUEAQC4BgAhDwMAAPAHACAMAADxDQAgEwAA8g0AIBQAAPMNACAWAAD8DQAgFwAAzg0AIBgAANMNACCZBAAA5gcAIKkEAADmBwAgqgQAAOYHACCzBAAA5gcAIPEEAADmBwAg8gQAAOYHACDzBAAA5gcAIPUEAADmBwAgHAMAALkGACAMAACzBwAgEwAAtAcAIBQAALUHACAWAADGBwAgFwAAigcAIBgAAJAHACD4AwAAxQcAMPkDAAA7ABD6AwAAxQcAMPsDAQAAAAH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZkECAClBwAhpwQBAIIHACGoBAEAAAABqQQBALgGACGqBAEAuAYAIa4EAgDLBgAhsgQgALYGACGzBEAAhwcAIdwEAADCBgAg8QQBALgGACHyBAEAuAYAIfMEAQC4BgAh9AQAAMIGACD1BAEAuAYAIQMAAAA7ACABAAA8ADACAAA9ACABAAAAOwAgAwAAAAkAIAEAAAoAMAIAAAsAIAoDAAC5BgAgCgAAxAcAIBUAAKYHACD4AwAAwwcAMPkDAABBABD6AwAAwwcAMPsDAQCCBwAhiwQBAIIHACGTBEAAtwYAIZQEAQCCBwAhAwMAAPAHACAKAAD7DQAgFQAA7g0AIAsDAAC5BgAgCgAAxAcAIBUAAKYHACD4AwAAwwcAMPkDAABBABD6AwAAwwcAMPsDAQCCBwAhiwQBAAAAAZMEQAC3BgAhlAQBAIIHACGpBQAAwgcAIAMAAABBACABAABCADACAABDACADAAAAOwAgAQAAPAAwAgAAPQAgAQAAADsAIAEAAAAgACABAAAALgAgAQAAADUAIAEAAAAJACABAAAAQQAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAuACABAAAvADACAAAwACADAAAANQAgAQAANgAwAgAANwAgEAsAAPgNACAMAADxDQAgEQAA-Q0AIBMAAPINACAUAADzDQAgHAAA0wsAICIAAPoNACAjAADTDQAgmAQAAOYHACCZBAAA5gcAILMEAADmBwAg0QQAAOYHACDTBAAA5gcAINUEAADmBwAg1gQAAOYHACDdBAAA5gcAICELAAC_BwAgDAAAswcAIBEAAMAHACATAAC0BwAgFAAAtQcAIBwAAM4GACAiAADBBwAgIwAAkAcAIPgDAAC7BwAw-QMAABoAEPoDAAC7BwAw_wNAALcGACGLBAEAAAABkwRAALcGACGYBAEAuAYAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAALwH2QQitgQBAIIHACHLBAAAvgfcBCLQBAEAggcAIdEEAQC4BgAh0gQBAIIHACHTBAEAuAYAIdQEIAC2BgAh1QQCAMwGACHWBAIAzAYAIdcEAQCCBwAh2gQAAL0H2gQi3AQAAMIGACDdBAEAuAYAIQMAAAAaACABAABPADACAABQACAPHAAAzgYAIPgDAADKBgAw-QMAAFIAEPoDAADKBgAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhnwQBAIIHACGgBAIAywYAIaEEAgDLBgAhogQCAMsGACGjBAIAywYAIaQEAgDLBgAhpQQCAMwGACGmBAgAzQYAIQEAAABSACADAAAACQAgAQAACgAwAgAACwAgERsAALYHACAfAAC6BwAg-AMAALkHADD5AwAAVQAQ-gMAALkHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGbBCAAtgYAIbIEIAC2BgAhswRAAIcHACHQBAEAuAYAIesEAQCCBwAh7AQBALgGACHtBAEAuAYAIe4EAgDLBgAh7wQCAMsGACEGGwAA9A0AIB8AAPcNACCzBAAA5gcAINAEAADmBwAg7AQAAOYHACDtBAAA5gcAIBEbAAC2BwAgHwAAugcAIPgDAAC5BwAw-QMAAFUAEPoDAAC5BwAw_wNAALcGACGLBAEAAAABkwRAALcGACGbBCAAtgYAIbIEIAC2BgAhswRAAIcHACHQBAEAuAYAIesEAQAAAAHsBAEAuAYAIe0EAQAAAAHuBAIAywYAIe8EAgDLBgAhAwAAAFUAIAEAAFYAMAIAAFcAIAMAAAAaACABAABPADACAABQACAeAwAAuQYAIAwAALMHACATAAC0BwAgGgAAtQcAIBsAALYHACAdAAC3BwAgHgAAigcAICAAALgHACD4AwAAsgcAMPkDAABaABD6AwAAsgcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhoAQCAMsGACGhBAIAywYAIacEAQCCBwAhqAQBAIIHACGpBAEAuAYAIaoEAQC4BgAhqwQBALgGACGsBAEAuAYAIa0EAQC4BgAhrgQCAMsGACGvBAIAzAYAIbAEIAC2BgAhsQQgALYGACGyBCAAtgYAIbMEQACHBwAhDwMAAPAHACAMAADxDQAgEwAA8g0AIBoAAPMNACAbAAD0DQAgHQAA9Q0AIB4AAM4NACAgAAD2DQAgqQQAAOYHACCqBAAA5gcAIKsEAADmBwAgrAQAAOYHACCtBAAA5gcAIK8EAADmBwAgswQAAOYHACAeAwAAuQYAIAwAALMHACATAAC0BwAgGgAAtQcAIBsAALYHACAdAAC3BwAgHgAAigcAICAAALgHACD4AwAAsgcAMPkDAABaABD6AwAAsgcAMPsDAQAAAAH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIaAEAgDLBgAhoQQCAMsGACGnBAEAggcAIagEAQAAAAGpBAEAuAYAIaoEAQC4BgAhqwQBALgGACGsBAEAuAYAIa0EAQC4BgAhrgQCAMsGACGvBAIAzAYAIbAEIAC2BgAhsQQgALYGACGyBCAAtgYAIbMEQACHBwAhAwAAAFoAIAEAAFsAMAIAAFwAIAEAAAAaACABAAAAWgAgAQAAACAAIAEAAAAuACABAAAANQAgAQAAABoAIAEAAAAJACABAAAAVQAgAQAAAC4AIAMAAAA1ACABAAA2ADACAAA3ACABAAAAVQAgAwAAAEEAIAEAAEIAMAIAAEMAIAEAAAAcACABAAAAIAAgAQAAACQAIAEAAAAuACABAAAANQAgAQAAAEEAIAEAAAA7ACABAAAAWgAgAwAAACQAIAEAACUAMAIAACYAIBAHAACxBwAgCQAAjAcAICYAAKwHACD4AwAArQcAMPkDAABzABD6AwAArQcAMIsEAQCCBwAhjAQBAIIHACGOBCAAtgYAIZMEQAC3BgAhmQQIAKUHACG1BAAArwfFBCLBBAEAggcAIcMEAACuB8MEIsUEAQC4BgAhxwQAALAHxwQjBgcAAPANACAJAADQDQAgJgAA7w0AIJkEAADmBwAgxQQAAOYHACDHBAAA5gcAIBAHAACxBwAgCQAAjAcAICYAAKwHACD4AwAArQcAMPkDAABzABD6AwAArQcAMIsEAQAAAAGMBAEAggcAIY4EIAC2BgAhkwRAALcGACGZBAgApQcAIbUEAACvB8UEIsEEAQCCBwAhwwQAAK4HwwQixQQBALgGACHHBAAAsAfHBCMDAAAAcwAgAQAAdAAwAgAAdQAgCiYAAKwHACD4AwAAqwcAMPkDAAB3ABD6AwAAqwcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIYwEAQCCBwAhjQQgALYGACGOBCAAtgYAIQEmAADvDQAgCyYAAKwHACD4AwAAqwcAMPkDAAB3ABD6AwAAqwcAMPsDAQCCBwAh_wNAALcGACGLBAEAAAABjAQBAIIHACGNBCAAtgYAIY4EIAC2BgAhqAUAAKoHACADAAAAdwAgAQAAeAAwAgAAeQAgAQAAACQAIAEAAABzACABAAAAdwAgAQAAABEAIAEAAAAWACADAAAADQAgAQAADgAwAgAADwAgAQAAAA0AIAEAAAARACADAAAAOwAgAQAAPAAwAgAAPQAgAwAAAFoAIAEAAFsAMAIAAFwAIAEAAAANACABAAAAOwAgAQAAAFoAIAEAAAA7ACADAAAAFgAgAQAAFwAwAgAAGAAgEAMAALkGACAIAQCCBwAh-AMAAKcHADD5AwAAigEAEPoDAACnBwAw-wMBAIIHACGLBAEAggcAIY4EIAC2BgAhkwRAALcGACG1BAAAqAe1BCK2BAEAuAYAIbcEAQC4BgAhuAQBALgGACG6BAAAqQe6BCK7BCAAtgYAIbwEQACHBwAhBQMAAPAHACC2BAAA5gcAILcEAADmBwAguAQAAOYHACC8BAAA5gcAIBADAAC5BgAgCAEAggcAIfgDAACnBwAw-QMAAIoBABD6AwAApwcAMPsDAQCCBwAhiwQBAAAAAY4EIAC2BgAhkwRAALcGACG1BAAAqAe1BCK2BAEAuAYAIbcEAQC4BgAhuAQBALgGACG6BAAAqQe6BCK7BCAAtgYAIbwEQACHBwAhAwAAAIoBACABAACLAQAwAgAAjAEAIAEAAABaACAGAwAA8AcAIBUAAO4NACCWBAAA5gcAIJcEAADmBwAgmAQAAOYHACCZBAAA5gcAIBADAAC5BgAgFQAApgcAIPgDAACkBwAw-QMAADkAEPoDAACkBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZUEAQCCBwAhlgQBALgGACGXBAEAuAYAIZgEAQC4BgAhmQQIAKUHACGaBAAAwgYAIJsEIAC2BgAhAwAAADkAIAEAAI8BADACAACQAQAgAwAAAEEAIAEAAEIAMAIAAEMAIAwDAAC5BgAg-AMAAKMHADD5AwAAkwEAEPoDAACjBwAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACH8BEAAtwYAIYYFAQCCBwAhhwUBALgGACGIBQEAuAYAIQMDAADwBwAghwUAAOYHACCIBQAA5gcAIAwDAAC5BgAg-AMAAKMHADD5AwAAkwEAEPoDAACjBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIfwEQAC3BgAhhgUBAAAAAYcFAQC4BgAhiAUBALgGACEDAAAAkwEAIAEAAJQBADACAACVAQAgCQMAALkGACD4AwAAtQYAMPkDAACXAQAQ-gMAALUGADD7AwEAggcAIfwDIAC2BgAh_QNAALcGACH-AwEAuAYAIf8DQAC3BgAhAQAAAJcBACAMAwAAuQYAIPgDAACiBwAw-QMAAJkBABD6AwAAogcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIY8EAQCCBwAhkAQBAIIHACGRBAIAywYAIZIEAQC4BgAhkwRAALcGACECAwAA8AcAIJIEAADmBwAgDAMAALkGACD4AwAAogcAMPkDAACZAQAQ-gMAAKIHADD7AwEAggcAIf8DQAC3BgAhiwQBAAAAAY8EAQCCBwAhkAQBAIIHACGRBAIAywYAIZIEAQC4BgAhkwRAALcGACEDAAAAmQEAIAEAAJoBADACAACbAQAgAQAAAAMAIAEAAAAJACABAAAAFgAgAQAAAIoBACABAAAAOQAgAQAAAEEAIAEAAACTAQAgAQAAAJkBACABAAAAAQAgBgMAAPAHACCpBAAA5gcAILMEAADmBwAgnwUAAOYHACCgBQAA5gcAIKEFAADmBwAgAwAAAAcAIAEAAKYBADACAAABACADAAAABwAgAQAApgEAMAIAAAEAIAMAAAAHACABAACmAQAwAgAAAQAgDgMAAO0NACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABqAQBAAAAAakEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAABnwUBAAAAAaAFgAAAAAGhBUAAAAABATUAAKoBACAN-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGpBAEAAAABsgQgAAAAAbMEQAAAAAHLBAEAAAAB6wQBAAAAAZ8FAQAAAAGgBYAAAAABoQVAAAAAAQE1AACsAQAwATUAAKwBADAOAwAA7A0AIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhqAQBAO0HACGpBAEA7AcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAhnwUBAOwHACGgBYAAAAABoQVAAJAIACECAAAAAQAgNQAArwEAIA37AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhqQQBAOwHACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIZ8FAQDsBwAhoAWAAAAAAaEFQACQCAAhAgAAAAcAIDUAALEBACACAAAABwAgNQAAsQEAIAMAAAABACA8AACqAQAgPQAArwEAIAEAAAABACABAAAABwAgCBAAAOkNACBCAADrDQAgQwAA6g0AIKkEAADmBwAgswQAAOYHACCfBQAA5gcAIKAFAADmBwAgoQUAAOYHACAQ-AMAAJ8HADD5AwAAuAEAEPoDAACfBwAw-wMBAKcGACH_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACGoBAEApwYAIakEAQCqBgAhsgQgAKgGACGzBEAA0AYAIcsEAQCnBgAh6wQBAKcGACGfBQEAqgYAIaAFAACgBwAgoQVAANAGACEDAAAABwAgAQAAtwEAMEEAALgBACADAAAABwAgAQAApgEAMAIAAAEAIAEAAAAPACABAAAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgCQYAAIoKACAHAACECwAgiwQBAAAAAZAEAQAAAAGTBEAAAAAB9wQAAACdBQKbBQEAAAABnQUgAAAAAZ4FAQAAAAEBNQAAwAEAIAeLBAEAAAABkAQBAAAAAZMEQAAAAAH3BAAAAJ0FApsFAQAAAAGdBSAAAAABngUBAAAAAQE1AADCAQAwATUAAMIBADAJBgAAiAoAIAcAAPgKACCLBAEA7QcAIZAEAQDtBwAhkwRAAOsHACH3BAAAhgqdBSKbBQEA7QcAIZ0FIADqBwAhngUBAOwHACECAAAADwAgNQAAxQEAIAeLBAEA7QcAIZAEAQDtBwAhkwRAAOsHACH3BAAAhgqdBSKbBQEA7QcAIZ0FIADqBwAhngUBAOwHACECAAAADQAgNQAAxwEAIAIAAAANACA1AADHAQAgAwAAAA8AIDwAAMABACA9AADFAQAgAQAAAA8AIAEAAAANACAEEAAA5g0AIEIAAOgNACBDAADnDQAgngUAAOYHACAK-AMAAJsHADD5AwAAzgEAEPoDAACbBwAwiwQBAKcGACGQBAEApwYAIZMEQACpBgAh9wQAAJwHnQUimwUBAKcGACGdBSAAqAYAIZ4FAQCqBgAhAwAAAA0AIAEAAM0BADBBAADOAQAgAwAAAA0AIAEAAA4AMAIAAA8AIAEAAAALACABAAAACwAgAwAAAAkAIAEAAAoAMAIAAAsAIAMAAAAJACABAAAKADACAAALACADAAAACQAgAQAACgAwAgAACwAgDgMAAIcLACAVAADrCwAgHwAAiAsAICUAAIYLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABtgQBAAAAAZYFAAAAlgUClwUgAAAAAZgFIAAAAAGZBQIAAAABmgUBAAAAAQE1AADWAQAgCvsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAG2BAEAAAABlgUAAACWBQKXBSAAAAABmAUgAAAAAZkFAgAAAAGaBQEAAAABATUAANgBADABNQAA2AEAMA4DAAClCAAgFQAA4QsAIB8AAKYIACAlAACkCAAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACG2BAEA7AcAIZYFAAChCJYFIpcFIADqBwAhmAUgAOoHACGZBQIAoggAIZoFAQDsBwAhAgAAAAsAIDUAANsBACAK-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACG2BAEA7AcAIZYFAAChCJYFIpcFIADqBwAhmAUgAOoHACGZBQIAoggAIZoFAQDsBwAhAgAAAAkAIDUAAN0BACACAAAACQAgNQAA3QEAIAMAAAALACA8AADWAQAgPQAA2wEAIAEAAAALACABAAAACQAgCBAAAOENACBCAADkDQAgQwAA4w0AIGQAAOINACBlAADlDQAgtgQAAOYHACCZBQAA5gcAIJoFAADmBwAgDfgDAACXBwAw-QMAAOQBABD6AwAAlwcAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIZMEQACpBgAhtgQBAKoGACGWBQAAmAeWBSKXBSAAqAYAIZgFIACoBgAhmQUCAMYGACGaBQEAqgYAIQMAAAAJACABAADjAQAwQQAA5AEAIAMAAAAJACABAAAKADACAAALACAK-AMAAJYHADD5AwAA6gEAEPoDAACWBwAw-wMBAIIHACGLBAEAAAABkwRAALcGACG1BAEAggcAIbgEAQCCBwAhkwUIAM0GACGUBQEAuAYAIQEAAADnAQAgAQAAAOcBACAK-AMAAJYHADD5AwAA6gEAEPoDAACWBwAw-wMBAIIHACGLBAEAggcAIZMEQAC3BgAhtQQBAIIHACG4BAEAggcAIZMFCADNBgAhlAUBALgGACEBlAUAAOYHACADAAAA6gEAIAEAAOsBADACAADnAQAgAwAAAOoBACABAADrAQAwAgAA5wEAIAMAAADqAQAgAQAA6wEAMAIAAOcBACAH-wMBAAAAAYsEAQAAAAGTBEAAAAABtQQBAAAAAbgEAQAAAAGTBQgAAAABlAUBAAAAAQE1AADvAQAgB_sDAQAAAAGLBAEAAAABkwRAAAAAAbUEAQAAAAG4BAEAAAABkwUIAAAAAZQFAQAAAAEBNQAA8QEAMAE1AADxAQAwB_sDAQDtBwAhiwQBAO0HACGTBEAA6wcAIbUEAQDtBwAhuAQBAO0HACGTBQgAvQoAIZQFAQDsBwAhAgAAAOcBACA1AAD0AQAgB_sDAQDtBwAhiwQBAO0HACGTBEAA6wcAIbUEAQDtBwAhuAQBAO0HACGTBQgAvQoAIZQFAQDsBwAhAgAAAOoBACA1AAD2AQAgAgAAAOoBACA1AAD2AQAgAwAAAOcBACA8AADvAQAgPQAA9AEAIAEAAADnAQAgAQAAAOoBACAGEAAA3A0AIEIAAN8NACBDAADeDQAgZAAA3Q0AIGUAAOANACCUBQAA5gcAIAr4AwAAlQcAMPkDAAD9AQAQ-gMAAJUHADD7AwEApwYAIYsEAQCnBgAhkwRAAKkGACG1BAEApwYAIbgEAQCnBgAhkwUIAMcGACGUBQEAqgYAIQMAAADqAQAgAQAA_AEAMEEAAP0BACADAAAA6gEAIAEAAOsBADACAADnAQAgAQAAABMAIAEAAAATACADAAAAEQAgAQAAEgAwAgAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACANCAAAggsAICgAAIwKACCLBAEAAAABkwRAAAAAAZUEAQAAAAGWBAEAAAABlwQBAAAAAZgEAQAAAAG9BAEAAAABjwUCAAAAAZAFIAAAAAGRBSAAAAABkgUgAAAAAQE1AACFAgAgC4sEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAb0EAQAAAAGPBQIAAAABkAUgAAAAAZEFIAAAAAGSBSAAAAABATUAAIcCADABNQAAhwIAMA0IAACACwAgKAAA_AkAIIsEAQDtBwAhkwRAAOsHACGVBAEA7QcAIZYEAQDtBwAhlwQBAO0HACGYBAEA7AcAIb0EAQDtBwAhjwUCAPsHACGQBSAA6gcAIZEFIADqBwAhkgUgAOoHACECAAAAEwAgNQAAigIAIAuLBAEA7QcAIZMEQADrBwAhlQQBAO0HACGWBAEA7QcAIZcEAQDtBwAhmAQBAOwHACG9BAEA7QcAIY8FAgD7BwAhkAUgAOoHACGRBSAA6gcAIZIFIADqBwAhAgAAABEAIDUAAIwCACACAAAAEQAgNQAAjAIAIAMAAAATACA8AACFAgAgPQAAigIAIAEAAAATACABAAAAEQAgBhAAANcNACBCAADaDQAgQwAA2Q0AIGQAANgNACBlAADbDQAgmAQAAOYHACAO-AMAAJQHADD5AwAAkwIAEPoDAACUBwAwiwQBAKcGACGTBEAAqQYAIZUEAQCnBgAhlgQBAKcGACGXBAEApwYAIZgEAQCqBgAhvQQBAKcGACGPBQIAvAYAIZAFIACoBgAhkQUgAKgGACGSBSAAqAYAIQMAAAARACABAACSAgAwQQAAkwIAIAMAAAARACABAAASADACAAATACAbBAAAiAcAIAUAAIkHACAVAACLBwAgGAAAkAcAIB8AAI4HACApAACKBwAgKgAAjAcAICsAAI0HACAsAACPBwAgLQAAkQcAIC4AAJIHACAvAACTBwAg-AMAAIYHADD5AwAAmQIAEPoDAACGBwAw_wNAALcGACGLBAEAAAABkwRAALcGACGoBAEAAAABsgQgALYGACGzBEAAhwcAIcsEAQCCBwAh6wQBAIIHACH3BAEAggcAIYkFIAC2BgAhigUBALgGACGLBSAAtgYAIQEAAACWAgAgAQAAAJYCACAbBAAAiAcAIAUAAIkHACAVAACLBwAgGAAAkAcAIB8AAI4HACApAACKBwAgKgAAjAcAICsAAI0HACAsAACPBwAgLQAAkQcAIC4AAJIHACAvAACTBwAg-AMAAIYHADD5AwAAmQIAEPoDAACGBwAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhqAQBAIIHACGyBCAAtgYAIbMEQACHBwAhywQBAIIHACHrBAEAggcAIfcEAQCCBwAhiQUgALYGACGKBQEAuAYAIYsFIAC2BgAhDgQAAMwNACAFAADNDQAgFQAAzw0AIBgAANMNACAfAADTCwAgKQAAzg0AICoAANANACArAADRDQAgLAAA0g0AIC0AANQNACAuAADVDQAgLwAA1g0AILMEAADmBwAgigUAAOYHACADAAAAmQIAIAEAAJoCADACAACWAgAgAwAAAJkCACABAACaAgAwAgAAlgIAIAMAAACZAgAgAQAAmgIAMAIAAJYCACAYBAAAwA0AIAUAAMENACAVAADDDQAgGAAAyA0AIB8AAMYNACApAADCDQAgKgAAxA0AICsAAMUNACAsAADHDQAgLQAAyQ0AIC4AAMoNACAvAADLDQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABqAQBAAAAAbIEIAAAAAGzBEAAAAABywQBAAAAAesEAQAAAAH3BAEAAAABiQUgAAAAAYoFAQAAAAGLBSAAAAABATUAAJ4CACAM_wNAAAAAAYsEAQAAAAGTBEAAAAABqAQBAAAAAbIEIAAAAAGzBEAAAAABywQBAAAAAesEAQAAAAH3BAEAAAABiQUgAAAAAYoFAQAAAAGLBSAAAAABATUAAKACADABNQAAoAIAMBgEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACAqAADNDAAgKwAAzgwAICwAANAMACAtAADSDAAgLgAA0wwAIC8AANQMACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACECAAAAlgIAIDUAAKMCACAM_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhqAQBAO0HACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIfcEAQDtBwAhiQUgAOoHACGKBQEA7AcAIYsFIADqBwAhAgAAAJkCACA1AAClAgAgAgAAAJkCACA1AAClAgAgAwAAAJYCACA8AACeAgAgPQAAowIAIAEAAACWAgAgAQAAAJkCACAFEAAAxgwAIEIAAMgMACBDAADHDAAgswQAAOYHACCKBQAA5gcAIA_4AwAAhQcAMPkDAACsAgAQ-gMAAIUHADD_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACGoBAEApwYAIbIEIACoBgAhswRAANAGACHLBAEApwYAIesEAQCnBgAh9wQBAKcGACGJBSAAqAYAIYoFAQCqBgAhiwUgAKgGACEDAAAAmQIAIAEAAKsCADBBAACsAgAgAwAAAJkCACABAACaAgAwAgAAlgIAIAEAAACVAQAgAQAAAJUBACADAAAAkwEAIAEAAJQBADACAACVAQAgAwAAAJMBACABAACUAQAwAgAAlQEAIAMAAACTAQAgAQAAlAEAMAIAAJUBACAJAwAAxQwAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAH8BEAAAAABhgUBAAAAAYcFAQAAAAGIBQEAAAABATUAALQCACAI-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAfwEQAAAAAGGBQEAAAABhwUBAAAAAYgFAQAAAAEBNQAAtgIAMAE1AAC2AgAwCQMAAMQMACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIfwEQADrBwAhhgUBAO0HACGHBQEA7AcAIYgFAQDsBwAhAgAAAJUBACA1AAC5AgAgCPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAh_ARAAOsHACGGBQEA7QcAIYcFAQDsBwAhiAUBAOwHACECAAAAkwEAIDUAALsCACACAAAAkwEAIDUAALsCACADAAAAlQEAIDwAALQCACA9AAC5AgAgAQAAAJUBACABAAAAkwEAIAUQAADBDAAgQgAAwwwAIEMAAMIMACCHBQAA5gcAIIgFAADmBwAgC_gDAACEBwAw-QMAAMICABD6AwAAhAcAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIZMEQACpBgAh_ARAAKkGACGGBQEApwYAIYcFAQCqBgAhiAUBAKoGACEDAAAAkwEAIAEAAMECADBBAADCAgAgAwAAAJMBACABAACUAQAwAgAAlQEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgDgMAAMAMACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAAB_QQBAAAAAf4EAQAAAAH_BAEAAAABgAUBAAAAAYEFAQAAAAGCBUAAAAABgwVAAAAAAYQFAQAAAAGFBQEAAAABATUAAMoCACAN-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAf0EAQAAAAH-BAEAAAAB_wQBAAAAAYAFAQAAAAGBBQEAAAABggVAAAAAAYMFQAAAAAGEBQEAAAABhQUBAAAAAQE1AADMAgAwATUAAMwCADAOAwAAvwwAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAh_QQBAO0HACH-BAEA7QcAIf8EAQDsBwAhgAUBAOwHACGBBQEA7AcAIYIFQACQCAAhgwVAAJAIACGEBQEA7AcAIYUFAQDsBwAhAgAAAAUAIDUAAM8CACAN-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACH9BAEA7QcAIf4EAQDtBwAh_wQBAOwHACGABQEA7AcAIYEFAQDsBwAhggVAAJAIACGDBUAAkAgAIYQFAQDsBwAhhQUBAOwHACECAAAAAwAgNQAA0QIAIAIAAAADACA1AADRAgAgAwAAAAUAIDwAAMoCACA9AADPAgAgAQAAAAUAIAEAAAADACAKEAAAvAwAIEIAAL4MACBDAAC9DAAg_wQAAOYHACCABQAA5gcAIIEFAADmBwAgggUAAOYHACCDBQAA5gcAIIQFAADmBwAghQUAAOYHACAQ-AMAAIMHADD5AwAA2AIAEPoDAACDBwAw-wMBAKcGACH_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACH9BAEApwYAIf4EAQCnBgAh_wQBAKoGACGABQEAqgYAIYEFAQCqBgAhggVAANAGACGDBUAA0AYAIYQFAQCqBgAhhQUBAKoGACEDAAAAAwAgAQAA1wIAMEEAANgCACADAAAAAwAgAQAABAAwAgAABQAgCfgDAACBBwAw-QMAAN4CABD6AwAAgQcAMP8DQAC3BgAhiwQBAAAAAZMEQAC3BgAh-gQBAIIHACH7BAEAggcAIfwEQAC3BgAhAQAAANsCACABAAAA2wIAIAn4AwAAgQcAMPkDAADeAgAQ-gMAAIEHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACH6BAEAggcAIfsEAQCCBwAh_ARAALcGACEAAwAAAN4CACABAADfAgAwAgAA2wIAIAMAAADeAgAgAQAA3wIAMAIAANsCACADAAAA3gIAIAEAAN8CADACAADbAgAgBv8DQAAAAAGLBAEAAAABkwRAAAAAAfoEAQAAAAH7BAEAAAAB_ARAAAAAAQE1AADjAgAgBv8DQAAAAAGLBAEAAAABkwRAAAAAAfoEAQAAAAH7BAEAAAAB_ARAAAAAAQE1AADlAgAwATUAAOUCADAG_wNAAOsHACGLBAEA7QcAIZMEQADrBwAh-gQBAO0HACH7BAEA7QcAIfwEQADrBwAhAgAAANsCACA1AADoAgAgBv8DQADrBwAhiwQBAO0HACGTBEAA6wcAIfoEAQDtBwAh-wQBAO0HACH8BEAA6wcAIQIAAADeAgAgNQAA6gIAIAIAAADeAgAgNQAA6gIAIAMAAADbAgAgPAAA4wIAID0AAOgCACABAAAA2wIAIAEAAADeAgAgAxAAALkMACBCAAC7DAAgQwAAugwAIAn4AwAAgAcAMPkDAADxAgAQ-gMAAIAHADD_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACH6BAEApwYAIfsEAQCnBgAh_ARAAKkGACEDAAAA3gIAIAEAAPACADBBAADxAgAgAwAAAN4CACABAADfAgAwAgAA2wIAIAEAAAAqACABAAAAKgAgAwAAACgAIAEAACkAMAIAACoAIAMAAAAoACABAAApADACAAAqACADAAAAKAAgAQAAKQAwAgAAKgAgCQ0AALgMACD7AwEAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAAB9gQBAAAAAfcEAAAAwwQC-ARAAAAAAfkEQAAAAAEBNQAA-QIAIAj7AwEAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAAB9gQBAAAAAfcEAAAAwwQC-ARAAAAAAfkEQAAAAAEBNQAA-wIAMAE1AAD7AgAwCQ0AALcMACD7AwEA7QcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIfYEAQDtBwAh9wQAALIJwwQi-ARAAJAIACH5BEAAkAgAIQIAAAAqACA1AAD-AgAgCPsDAQDtBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAh9gQBAO0HACH3BAAAsgnDBCL4BEAAkAgAIfkEQACQCAAhAgAAACgAIDUAAIADACACAAAAKAAgNQAAgAMAIAMAAAAqACA8AAD5AgAgPQAA_gIAIAEAAAAqACABAAAAKAAgCBAAALIMACBCAAC1DAAgQwAAtAwAIGQAALMMACBlAAC2DAAgmQQAAOYHACD4BAAA5gcAIPkEAADmBwAgC_gDAAD_BgAw-QMAAIcDABD6AwAA_wYAMPsDAQCnBgAhiwQBAKcGACGTBEAAqQYAIZkECADBBgAh9gQBAKcGACH3BAAA3AbDBCL4BEAA0AYAIfkEQADQBgAhAwAAACgAIAEAAIYDADBBAACHAwAgAwAAACgAIAEAACkAMAIAACoAIAEAAAA9ACABAAAAPQAgAwAAADsAIAEAADwAMAIAAD0AIAMAAAA7ACABAAA8ADACAAA9ACADAAAAOwAgAQAAPAAwAgAAPQAgGQMAAKsLACAMAACnCwAgEwAAqAsAIBQAAKkLACAWAACqCwAgFwAArAsAIBgAAMgLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGuBAIAAAABsgQgAAAAAbMEQAAAAAHcBAAApgsAIPEEAQAAAAHyBAEAAAAB8wQBAAAAAfQEAAClCwAg9QQBAAAAAQE1AACPAwAgEvsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACD1BAEAAAABATUAAJEDADABNQAAkQMAMAEAAAA5ACAZAwAAlggAIAwAAJIIACATAACTCAAgFAAAlAgAIBYAAJUIACAXAACXCAAgGAAAvgsAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIa4EAgD7BwAhsgQgAOoHACGzBEAAkAgAIdwEAACPCAAg8QQBAOwHACHyBAEA7AcAIfMEAQDsBwAh9AQAAI0IACD1BAEA7AcAIQIAAAA9ACA1AACVAwAgEvsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIa4EAgD7BwAhsgQgAOoHACGzBEAAkAgAIdwEAACPCAAg8QQBAOwHACHyBAEA7AcAIfMEAQDsBwAh9AQAAI0IACD1BAEA7AcAIQIAAAA7ACA1AACXAwAgAgAAADsAIDUAAJcDACABAAAAOQAgAwAAAD0AIDwAAI8DACA9AACVAwAgAQAAAD0AIAEAAAA7ACANEAAArQwAIEIAALAMACBDAACvDAAgZAAArgwAIGUAALEMACCZBAAA5gcAIKkEAADmBwAgqgQAAOYHACCzBAAA5gcAIPEEAADmBwAg8gQAAOYHACDzBAAA5gcAIPUEAADmBwAgFfgDAAD-BgAw-QMAAJ8DABD6AwAA_gYAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIZMEQACpBgAhmQQIAMEGACGnBAEApwYAIagEAQCnBgAhqQQBAKoGACGqBAEAqgYAIa4EAgC8BgAhsgQgAKgGACGzBEAA0AYAIdwEAADCBgAg8QQBAKoGACHyBAEAqgYAIfMEAQCqBgAh9AQAAMIGACD1BAEAqgYAIQMAAAA7ACABAACeAwAwQQAAnwMAIAMAAAA7ACABAAA8ADACAAA9ACABAAAAIgAgAQAAACIAIAMAAAAgACABAAAhADACAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIA0KAADnCgAgGQAAnAoAIBwAAJ0KACAkAACeCgAgJQAAnwoAICcAAKAKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABnwQBAAAAAckEAQAAAAHwBCAAAAABATUAAKcDACAH_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZ8EAQAAAAHJBAEAAAAB8AQgAAAAAQE1AACpAwAwATUAAKkDADABAAAAGgAgAQAAADsAIAEAAABaACANCgAA5QoAIBkAAMMJACAcAADECQAgJAAAxQkAICUAAMYJACAnAADHCQAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAOwHACGfBAEA7AcAIckEAQDsBwAh8AQgAOoHACECAAAAIgAgNQAArwMAIAf_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7AcAIZ8EAQDsBwAhyQQBAOwHACHwBCAA6gcAIQIAAAAgACA1AACxAwAgAgAAACAAIDUAALEDACABAAAAGgAgAQAAADsAIAEAAABaACADAAAAIgAgPAAApwMAID0AAK8DACABAAAAIgAgAQAAACAAIAYQAACqDAAgQgAArAwAIEMAAKsMACCUBAAA5gcAIJ8EAADmBwAgyQQAAOYHACAK-AMAAP0GADD5AwAAuwMAEPoDAAD9BgAw_wNAAKkGACGLBAEApwYAIZMEQACpBgAhlAQBAKoGACGfBAEAqgYAIckEAQCqBgAh8AQgAKgGACEDAAAAIAAgAQAAugMAMEEAALsDACADAAAAIAAgAQAAIQAwAgAAIgAgAQAAAFcAIAEAAABXACADAAAAVQAgAQAAVgAwAgAAVwAgAwAAAFUAIAEAAFYAMAIAAFcAIAMAAABVACABAABWADACAABXACAOGwAAtwoAIB8AAKkMACD_A0AAAAABiwQBAAAAAZMEQAAAAAGbBCAAAAABsgQgAAAAAbMEQAAAAAHQBAEAAAAB6wQBAAAAAewEAQAAAAHtBAEAAAAB7gQCAAAAAe8EAgAAAAEBNQAAwwMAIAz_A0AAAAABiwQBAAAAAZMEQAAAAAGbBCAAAAABsgQgAAAAAbMEQAAAAAHQBAEAAAAB6wQBAAAAAewEAQAAAAHtBAEAAAAB7gQCAAAAAe8EAgAAAAEBNQAAxQMAMAE1AADFAwAwDhsAAMIIACAfAACgDAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmwQgAOoHACGyBCAA6gcAIbMEQACQCAAh0AQBAOwHACHrBAEA7QcAIewEAQDsBwAh7QQBAOwHACHuBAIA-wcAIe8EAgD7BwAhAgAAAFcAIDUAAMgDACAM_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmwQgAOoHACGyBCAA6gcAIbMEQACQCAAh0AQBAOwHACHrBAEA7QcAIewEAQDsBwAh7QQBAOwHACHuBAIA-wcAIe8EAgD7BwAhAgAAAFUAIDUAAMoDACACAAAAVQAgNQAAygMAIAMAAABXACA8AADDAwAgPQAAyAMAIAEAAABXACABAAAAVQAgCRAAAJsMACBCAACeDAAgQwAAnQwAIGQAAJwMACBlAACfDAAgswQAAOYHACDQBAAA5gcAIOwEAADmBwAg7QQAAOYHACAP-AMAAPwGADD5AwAA0QMAEPoDAAD8BgAw_wNAAKkGACGLBAEApwYAIZMEQACpBgAhmwQgAKgGACGyBCAAqAYAIbMEQADQBgAh0AQBAKoGACHrBAEApwYAIewEAQCqBgAh7QQBAKoGACHuBAIAvAYAIe8EAgC8BgAhAwAAAFUAIAEAANADADBBAADRAwAgAwAAAFUAIAEAAFYAMAIAAFcAIAEAAAAwACABAAAAMAAgAwAAAC4AIAEAAC8AMAIAADAAIAMAAAAuACABAAAvADACAAAwACADAAAALgAgAQAALwAwAgAAMAAgFwoAAIgJACAZAACJCQAgHAAAigkAICEAAJoJACD_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA6AQCywQAAADgBALgBEAAAAAB4QRAAAAAAeIEQAAAAAHkBAEAAAAB5QQBAAAAAeYEAQAAAAHoBAIAAAAB6QQBAAAAAeoEAQAAAAEBNQAA2QMAIBP_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA6AQCywQAAADgBALgBEAAAAAB4QRAAAAAAeIEQAAAAAHkBAEAAAAB5QQBAAAAAeYEAQAAAAHoBAIAAAAB6QQBAAAAAeoEAQAAAAEBNQAA2wMAMAE1AADbAwAwFwoAAIQJACAZAACFCQAgHAAAhgkAICEAAJgJACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7QcAIZkECACOCAAhnwQBAO0HACGyBCAA6gcAIbMEQACQCAAhtQQAAIEJ6AQiywQAAIIJ4AQi4ARAAOsHACHhBEAAkAgAIeIEQACQCAAh5AQBAOwHACHlBAEA7QcAIeYEAQDtBwAh6AQCAKIIACHpBAEA7AcAIeoEAQDsBwAhAgAAADAAIDUAAN4DACAT_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAACBCegEIssEAACCCeAEIuAEQADrBwAh4QRAAJAIACHiBEAAkAgAIeQEAQDsBwAh5QQBAO0HACHmBAEA7QcAIegEAgCiCAAh6QQBAOwHACHqBAEA7AcAIQIAAAAuACA1AADgAwAgAgAAAC4AIDUAAOADACADAAAAMAAgPAAA2QMAID0AAN4DACABAAAAMAAgAQAAAC4AIA0QAACWDAAgQgAAmQwAIEMAAJgMACBkAACXDAAgZQAAmgwAIJkEAADmBwAgswQAAOYHACDhBAAA5gcAIOIEAADmBwAg5AQAAOYHACDoBAAA5gcAIOkEAADmBwAg6gQAAOYHACAW-AMAAPgGADD5AwAA5wMAEPoDAAD4BgAw_wNAAKkGACGLBAEApwYAIZMEQACpBgAhlAQBAKcGACGZBAgAwQYAIZ8EAQCnBgAhsgQgAKgGACGzBEAA0AYAIbUEAAD5BugEIssEAAD1BuAEIuAEQACpBgAh4QRAANAGACHiBEAA0AYAIeQEAQCqBgAh5QQBAKcGACHmBAEApwYAIegEAgDGBgAh6QQBAKoGACHqBAEAqgYAIQMAAAAuACABAADmAwAwQQAA5wMAIAMAAAAuACABAAAvADACAAAwACABAAAAJgAgAQAAACYAIAMAAAAkACABAAAlADACAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACQAIAEAACUAMAIAACYAIA8KAACaCgAgDgAAtgkAIA8AALcJACD_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABmQQIAAAAAcsEAAAA4AQC3gQBAAAAAeAEQAAAAAHhBEAAAAAB4gRAAAAAAeMEAgAAAAHkBAEAAAABATUAAO8DACAM_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZkECAAAAAHLBAAAAOAEAt4EAQAAAAHgBEAAAAAB4QRAAAAAAeIEQAAAAAHjBAIAAAAB5AQBAAAAAQE1AADxAwAwATUAAPEDADABAAAAGgAgDwoAAJgKACAOAACmCQAgDwAApwkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhmQQIAI4IACHLBAAAggngBCLeBAEA7QcAIeAEQACQCAAh4QRAAJAIACHiBEAAkAgAIeMEAgCiCAAh5AQBAOwHACECAAAAJgAgNQAA9QMAIAz_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7AcAIZkECACOCAAhywQAAIIJ4AQi3gQBAO0HACHgBEAAkAgAIeEEQACQCAAh4gRAAJAIACHjBAIAoggAIeQEAQDsBwAhAgAAACQAIDUAAPcDACACAAAAJAAgNQAA9wMAIAEAAAAaACADAAAAJgAgPAAA7wMAID0AAPUDACABAAAAJgAgAQAAACQAIAwQAACRDAAgQgAAlAwAIEMAAJMMACBkAACSDAAgZQAAlQwAIJQEAADmBwAgmQQAAOYHACDgBAAA5gcAIOEEAADmBwAg4gQAAOYHACDjBAAA5gcAIOQEAADmBwAgD_gDAAD0BgAw-QMAAP8DABD6AwAA9AYAMP8DQACpBgAhiwQBAKcGACGTBEAAqQYAIZQEAQCqBgAhmQQIAMEGACHLBAAA9QbgBCLeBAEApwYAIeAEQADQBgAh4QRAANAGACHiBEAA0AYAIeMEAgDGBgAh5AQBAKoGACEDAAAAJAAgAQAA_gMAMEEAAP8DACADAAAAJAAgAQAAJQAwAgAAJgAgAQAAAFAAIAEAAABQACADAAAAGgAgAQAATwAwAgAAUAAgAwAAABoAIAEAAE8AMAIAAFAAIAMAAAAaACABAABPADACAABQACAeCwAArwoAIAwAALAKACARAACxCgAgEwAAsgoAIBQAALMKACAcAAC0CgAgIgAAyAoAICMAALUKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAg3QQBAAAAAQE1AACHBAAgFv8DQAAAAAGLBAEAAAABkwRAAAAAAZgEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADZBAK2BAEAAAABywQAAADcBALQBAEAAAAB0QQBAAAAAdIEAQAAAAHTBAEAAAAB1AQgAAAAAdUEAgAAAAHWBAIAAAAB1wQBAAAAAdoEAAAA2gQC3AQAAK4KACDdBAEAAAABATUAAIkEADABNQAAiQQAMAEAAABVACAeCwAA0ggAIAwAANMIACARAADUCAAgEwAA1QgAIBQAANYIACAcAADXCAAgIgAAxgoAICMAANgIACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGYBAEA7AcAIZkECACOCAAhnwQBAO0HACGyBCAA6gcAIbMEQACQCAAhtQQAAM0I2QQitgQBAO0HACHLBAAAzwjcBCLQBAEA7QcAIdEEAQDsBwAh0gQBAO0HACHTBAEA7AcAIdQEIADqBwAh1QQCAKIIACHWBAIAoggAIdcEAQDtBwAh2gQAAM4I2gQi3AQAANAIACDdBAEA7AcAIQIAAABQACA1AACNBAAgFv8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAzQjZBCK2BAEA7QcAIcsEAADPCNwEItAEAQDtBwAh0QQBAOwHACHSBAEA7QcAIdMEAQDsBwAh1AQgAOoHACHVBAIAoggAIdYEAgCiCAAh1wQBAO0HACHaBAAAzgjaBCLcBAAA0AgAIN0EAQDsBwAhAgAAABoAIDUAAI8EACACAAAAGgAgNQAAjwQAIAEAAABVACADAAAAUAAgPAAAhwQAID0AAI0EACABAAAAUAAgAQAAABoAIA0QAACMDAAgQgAAjwwAIEMAAI4MACBkAACNDAAgZQAAkAwAIJgEAADmBwAgmQQAAOYHACCzBAAA5gcAINEEAADmBwAg0wQAAOYHACDVBAAA5gcAINYEAADmBwAg3QQAAOYHACAZ-AMAAOoGADD5AwAAlwQAEPoDAADqBgAw_wNAAKkGACGLBAEApwYAIZMEQACpBgAhmAQBAKoGACGZBAgAwQYAIZ8EAQCnBgAhsgQgAKgGACGzBEAA0AYAIbUEAADrBtkEIrYEAQCnBgAhywQAAO0G3AQi0AQBAKcGACHRBAEAqgYAIdIEAQCnBgAh0wQBAKoGACHUBCAAqAYAIdUEAgDGBgAh1gQCAMYGACHXBAEApwYAIdoEAADsBtoEItwEAADCBgAg3QQBAKoGACEDAAAAGgAgAQAAlgQAMEEAAJcEACADAAAAGgAgAQAATwAwAgAAUAAgAQAAADcAIAEAAAA3ACADAAAANQAgAQAANgAwAgAANwAgAwAAADUAIAEAADYAMAIAADcAIAMAAAA1ACABAAA2ADACAAA3ACAPCgAA0woAIBIAAI0JACAZAACOCQAgHAAAjwkAIP8DQAAAAAGLBAEAAAABlAQBAAAAAZkECAAAAAGfBAEAAAAByQQBAAAAAcsEAAAAywQCzAQAAIwJACDNBAEAAAABzgQBAAAAAc8EQAAAAAEBNQAAnwQAIAv_A0AAAAABiwQBAAAAAZQEAQAAAAGZBAgAAAABnwQBAAAAAckEAQAAAAHLBAAAAMsEAswEAACMCQAgzQQBAAAAAc4EAQAAAAHPBEAAAAABATUAAKEEADABNQAAoQQAMA8KAADRCgAgEgAA9AgAIBkAAPUIACAcAAD2CAAg_wNAAOsHACGLBAEA7QcAIZQEAQDtBwAhmQQIAI4IACGfBAEA7QcAIckEAQDtBwAhywQAAPEIywQizAQAAPIIACDNBAEA7AcAIc4EAQDsBwAhzwRAAOsHACECAAAANwAgNQAApAQAIAv_A0AA6wcAIYsEAQDtBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhyQQBAO0HACHLBAAA8QjLBCLMBAAA8ggAIM0EAQDsBwAhzgQBAOwHACHPBEAA6wcAIQIAAAA1ACA1AACmBAAgAgAAADUAIDUAAKYEACADAAAANwAgPAAAnwQAID0AAKQEACABAAAANwAgAQAAADUAIAgQAACHDAAgQgAAigwAIEMAAIkMACBkAACIDAAgZQAAiwwAIJkEAADmBwAgzQQAAOYHACDOBAAA5gcAIA74AwAA5gYAMPkDAACtBAAQ-gMAAOYGADD_A0AAqQYAIYsEAQCnBgAhlAQBAKcGACGZBAgAwQYAIZ8EAQCnBgAhyQQBAKcGACHLBAAA5wbLBCLMBAAAwgYAIM0EAQCqBgAhzgQBAKoGACHPBEAAqQYAIQMAAAA1ACABAACsBAAwQQAArQQAIAMAAAA1ACABAAA2ADACAAA3ACABAAAAHgAgAQAAAB4AIAMAAAAcACABAAAdADACAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIAQKAACGDAAgiwQBAAAAAZQEAQAAAAHIBAEAAAABATUAALUEACADiwQBAAAAAZQEAQAAAAHIBAEAAAABATUAALcEADABNQAAtwQAMAQKAACFDAAgiwQBAO0HACGUBAEA7QcAIcgEAQDtBwAhAgAAAB4AIDUAALoEACADiwQBAO0HACGUBAEA7QcAIcgEAQDtBwAhAgAAABwAIDUAALwEACACAAAAHAAgNQAAvAQAIAMAAAAeACA8AAC1BAAgPQAAugQAIAEAAAAeACABAAAAHAAgAxAAAIIMACBCAACEDAAgQwAAgwwAIAb4AwAA5QYAMPkDAADDBAAQ-gMAAOUGADCLBAEApwYAIZQEAQCnBgAhyAQBAKcGACEDAAAAHAAgAQAAwgQAMEEAAMMEACADAAAAHAAgAQAAHQAwAgAAHgAgAQAAAHUAIAEAAAB1ACADAAAAcwAgAQAAdAAwAgAAdQAgAwAAAHMAIAEAAHQAMAIAAHUAIAMAAABzACABAAB0ADACAAB1ACANBwAAjgoAIAkAAI8KACAmAACBDAAgiwQBAAAAAYwEAQAAAAGOBCAAAAABkwRAAAAAAZkECAAAAAG1BAAAAMUEAsEEAQAAAAHDBAAAAMMEAsUEAQAAAAHHBAAAAMcEAwE1AADLBAAgCosEAQAAAAGMBAEAAAABjgQgAAAAAZMEQAAAAAGZBAgAAAABtQQAAADFBALBBAEAAAABwwQAAADDBALFBAEAAAABxwQAAADHBAMBNQAAzQQAMAE1AADNBAAwDQcAAOEJACAJAADiCQAgJgAAgAwAIIsEAQDtBwAhjAQBAO0HACGOBCAA6gcAIZMEQADrBwAhmQQIAI4IACG1BAAA3gnFBCLBBAEA7QcAIcMEAACyCcMEIsUEAQDsBwAhxwQAAN8JxwQjAgAAAHUAIDUAANAEACAKiwQBAO0HACGMBAEA7QcAIY4EIADqBwAhkwRAAOsHACGZBAgAjggAIbUEAADeCcUEIsEEAQDtBwAhwwQAALIJwwQixQQBAOwHACHHBAAA3wnHBCMCAAAAcwAgNQAA0gQAIAIAAABzACA1AADSBAAgAwAAAHUAIDwAAMsEACA9AADQBAAgAQAAAHUAIAEAAABzACAIEAAA-wsAIEIAAP4LACBDAAD9CwAgZAAA_AsAIGUAAP8LACCZBAAA5gcAIMUEAADmBwAgxwQAAOYHACAN-AMAANsGADD5AwAA2QQAEPoDAADbBgAwiwQBAKcGACGMBAEApwYAIY4EIACoBgAhkwRAAKkGACGZBAgAwQYAIbUEAADdBsUEIsEEAQCnBgAhwwQAANwGwwQixQQBAKoGACHHBAAA3gbHBCMDAAAAcwAgAQAA2AQAMEEAANkEACADAAAAcwAgAQAAdAAwAgAAdQAgAQAAABgAIAEAAAAYACADAAAAFgAgAQAAFwAwAgAAGAAgAwAAABYAIAEAABcAMAIAABgAIAMAAAAWACABAAAXADACAAAYACAJAwAA8AkAIAgAAPoLACD7AwEAAAABiwQBAAAAAZMEQAAAAAG9BAEAAAABvgQBAAAAAb8EIAAAAAHABAgAAAABATUAAOEEACAH-wMBAAAAAYsEAQAAAAGTBEAAAAABvQQBAAAAAb4EAQAAAAG_BCAAAAABwAQIAAAAAQE1AADjBAAwATUAAOMEADAJAwAA7gkAIAgAAPkLACD7AwEA7QcAIYsEAQDtBwAhkwRAAOsHACG9BAEA7QcAIb4EAQDtBwAhvwQgAOoHACHABAgAjggAIQIAAAAYACA1AADmBAAgB_sDAQDtBwAhiwQBAO0HACGTBEAA6wcAIb0EAQDtBwAhvgQBAO0HACG_BCAA6gcAIcAECACOCAAhAgAAABYAIDUAAOgEACACAAAAFgAgNQAA6AQAIAMAAAAYACA8AADhBAAgPQAA5gQAIAEAAAAYACABAAAAFgAgBhAAAPQLACBCAAD3CwAgQwAA9gsAIGQAAPULACBlAAD4CwAgwAQAAOYHACAK-AMAANoGADD5AwAA7wQAEPoDAADaBgAw-wMBAKcGACGLBAEApwYAIZMEQACpBgAhvQQBAKcGACG-BAEApwYAIb8EIACoBgAhwAQIAMEGACEDAAAAFgAgAQAA7gQAMEEAAO8EACADAAAAFgAgAQAAFwAwAgAAGAAgAQAAAIwBACABAAAAjAEAIAMAAACKAQAgAQAAiwEAMAIAAIwBACADAAAAigEAIAEAAIsBADACAACMAQAgAwAAAIoBACABAACLAQAwAgAAjAEAIA0DAADzCwAgCAEAAAAB-wMBAAAAAYsEAQAAAAGOBCAAAAABkwRAAAAAAbUEAAAAtQQCtgQBAAAAAbcEAQAAAAG4BAEAAAABugQAAAC6BAK7BCAAAAABvARAAAAAAQE1AAD3BAAgDAgBAAAAAfsDAQAAAAGLBAEAAAABjgQgAAAAAZMEQAAAAAG1BAAAALUEArYEAQAAAAG3BAEAAAABuAQBAAAAAboEAAAAugQCuwQgAAAAAbwEQAAAAAEBNQAA-QQAMAE1AAD5BAAwDQMAAPILACAIAQDtBwAh-wMBAO0HACGLBAEA7QcAIY4EIADqBwAhkwRAAOsHACG1BAAA8Au1BCK2BAEA7AcAIbcEAQDsBwAhuAQBAOwHACG6BAAA8Qu6BCK7BCAA6gcAIbwEQACQCAAhAgAAAIwBACA1AAD8BAAgDAgBAO0HACH7AwEA7QcAIYsEAQDtBwAhjgQgAOoHACGTBEAA6wcAIbUEAADwC7UEIrYEAQDsBwAhtwQBAOwHACG4BAEA7AcAIboEAADxC7oEIrsEIADqBwAhvARAAJAIACECAAAAigEAIDUAAP4EACACAAAAigEAIDUAAP4EACADAAAAjAEAIDwAAPcEACA9AAD8BAAgAQAAAIwBACABAAAAigEAIAcQAADtCwAgQgAA7wsAIEMAAO4LACC2BAAA5gcAILcEAADmBwAguAQAAOYHACC8BAAA5gcAIA8IAQCnBgAh-AMAANMGADD5AwAAhQUAEPoDAADTBgAw-wMBAKcGACGLBAEApwYAIY4EIACoBgAhkwRAAKkGACG1BAAA1Aa1BCK2BAEAqgYAIbcEAQCqBgAhuAQBAKoGACG6BAAA1Qa6BCK7BCAAqAYAIbwEQADQBgAhAwAAAIoBACABAACEBQAwQQAAhQUAIAMAAACKAQAgAQAAiwEAMAIAAIwBACABAAAAXAAgAQAAAFwAIAMAAABaACABAABbADACAABcACADAAAAWgAgAQAAWwAwAgAAXAAgAwAAAFoAIAEAAFsAMAIAAFwAIBsDAADtCgAgDAAA6QoAIBMAAOoKACAaAADrCgAgGwAA7AoAIB0AAO4KACAeAADsCwAgIAAA7woAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAEBNQAAjQUAIBP7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABoAQCAAAAAaEEAgAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAEAAAABqwQBAAAAAawEAQAAAAGtBAEAAAABrgQCAAAAAa8EAgAAAAGwBCAAAAABsQQgAAAAAbIEIAAAAAGzBEAAAAABATUAAI8FADABNQAAjwUAMBsDAAC1CAAgDAAAsQgAIBMAALIIACAaAACzCAAgGwAAtAgAIB0AALYIACAeAADZCwAgIAAAtwgAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhoAQCAPsHACGhBAIA-wcAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhqwQBAOwHACGsBAEA7AcAIa0EAQDsBwAhrgQCAPsHACGvBAIAoggAIbAEIADqBwAhsQQgAOoHACGyBCAA6gcAIbMEQACQCAAhAgAAAFwAIDUAAJIFACAT-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGrBAEA7AcAIawEAQDsBwAhrQQBAOwHACGuBAIA-wcAIa8EAgCiCAAhsAQgAOoHACGxBCAA6gcAIbIEIADqBwAhswRAAJAIACECAAAAWgAgNQAAlAUAIAIAAABaACA1AACUBQAgAwAAAFwAIDwAAI0FACA9AACSBQAgAQAAAFwAIAEAAABaACAMEAAA1AsAIEIAANcLACBDAADWCwAgZAAA1QsAIGUAANgLACCpBAAA5gcAIKoEAADmBwAgqwQAAOYHACCsBAAA5gcAIK0EAADmBwAgrwQAAOYHACCzBAAA5gcAIBb4AwAAzwYAMPkDAACbBQAQ-gMAAM8GADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIaAEAgC8BgAhoQQCALwGACGnBAEApwYAIagEAQCnBgAhqQQBAKoGACGqBAEAqgYAIasEAQCqBgAhrAQBAKoGACGtBAEAqgYAIa4EAgC8BgAhrwQCAMYGACGwBCAAqAYAIbEEIACoBgAhsgQgAKgGACGzBEAA0AYAIQMAAABaACABAACaBQAwQQAAmwUAIAMAAABaACABAABbADACAABcACAPHAAAzgYAIPgDAADKBgAw-QMAAFIAEPoDAADKBgAw_wNAALcGACGLBAEAAAABkwRAALcGACGfBAEAAAABoAQCAMsGACGhBAIAywYAIaIEAgDLBgAhowQCAMsGACGkBAIAywYAIaUEAgDMBgAhpgQIAM0GACEBAAAAngUAIAEAAACeBQAgAhwAANMLACClBAAA5gcAIAMAAABSACABAAChBQAwAgAAngUAIAMAAABSACABAAChBQAwAgAAngUAIAMAAABSACABAAChBQAwAgAAngUAIAwcAADSCwAg_wNAAAAAAYsEAQAAAAGTBEAAAAABnwQBAAAAAaAEAgAAAAGhBAIAAAABogQCAAAAAaMEAgAAAAGkBAIAAAABpQQCAAAAAaYECAAAAAEBNQAApQUAIAv_A0AAAAABiwQBAAAAAZMEQAAAAAGfBAEAAAABoAQCAAAAAaEEAgAAAAGiBAIAAAABowQCAAAAAaQEAgAAAAGlBAIAAAABpgQIAAAAAQE1AACnBQAwATUAAKcFADAMHAAA0QsAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZ8EAQDtBwAhoAQCAPsHACGhBAIA-wcAIaIEAgD7BwAhowQCAPsHACGkBAIA-wcAIaUEAgCiCAAhpgQIAL0KACECAAAAngUAIDUAAKoFACAL_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhnwQBAO0HACGgBAIA-wcAIaEEAgD7BwAhogQCAPsHACGjBAIA-wcAIaQEAgD7BwAhpQQCAKIIACGmBAgAvQoAIQIAAABSACA1AACsBQAgAgAAAFIAIDUAAKwFACADAAAAngUAIDwAAKUFACA9AACqBQAgAQAAAJ4FACABAAAAUgAgBhAAAMwLACBCAADPCwAgQwAAzgsAIGQAAM0LACBlAADQCwAgpQQAAOYHACAO-AMAAMUGADD5AwAAswUAEPoDAADFBgAw_wNAAKkGACGLBAEApwYAIZMEQACpBgAhnwQBAKcGACGgBAIAvAYAIaEEAgC8BgAhogQCALwGACGjBAIAvAYAIaQEAgC8BgAhpQQCAMYGACGmBAgAxwYAIQMAAABSACABAACyBQAwQQAAswUAIAMAAABSACABAAChBQAwAgAAngUAIAEAAACQAQAgAQAAAJABACADAAAAOQAgAQAAjwEAMAIAAJABACADAAAAOQAgAQAAjwEAMAIAAJABACADAAAAOQAgAQAAjwEAMAIAAJABACANAwAAywsAIBUAAMoLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAZkECAAAAAGaBAAAyQsAIJsEIAAAAAEBNQAAuwUAIAv7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAZkECAAAAAGaBAAAyQsAIJsEIAAAAAEBNQAAvQUAMAE1AAC9BQAwDQMAALULACAVAAC0CwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGVBAEA7QcAIZYEAQDsBwAhlwQBAOwHACGYBAEA7AcAIZkECACOCAAhmgQAALMLACCbBCAA6gcAIQIAAACQAQAgNQAAwAUAIAv7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZUEAQDtBwAhlgQBAOwHACGXBAEA7AcAIZgEAQDsBwAhmQQIAI4IACGaBAAAswsAIJsEIADqBwAhAgAAADkAIDUAAMIFACACAAAAOQAgNQAAwgUAIAMAAACQAQAgPAAAuwUAID0AAMAFACABAAAAkAEAIAEAAAA5ACAJEAAArgsAIEIAALELACBDAACwCwAgZAAArwsAIGUAALILACCWBAAA5gcAIJcEAADmBwAgmAQAAOYHACCZBAAA5gcAIA74AwAAwAYAMPkDAADJBQAQ-gMAAMAGADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIZUEAQCnBgAhlgQBAKoGACGXBAEAqgYAIZgEAQCqBgAhmQQIAMEGACGaBAAAwgYAIJsEIACoBgAhAwAAADkAIAEAAMgFADBBAADJBQAgAwAAADkAIAEAAI8BADACAACQAQAgAQAAAEMAIAEAAABDACADAAAAQQAgAQAAQgAwAgAAQwAgAwAAAEEAIAEAAEIAMAIAAEMAIAMAAABBACABAABCADACAABDACAHAwAA5QgAIAoAAK0LACAVAADmCAAg-wMBAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAQE1AADRBQAgBPsDAQAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAEBNQAA0wUAMAE1AADTBQAwBwMAAIIIACAKAACBCAAgFQAAgwgAIPsDAQDtBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhAgAAAEMAIDUAANYFACAE-wMBAO0HACGLBAEA7QcAIZMEQADrBwAhlAQBAO0HACECAAAAQQAgNQAA2AUAIAIAAABBACA1AADYBQAgAwAAAEMAIDwAANEFACA9AADWBQAgAQAAAEMAIAEAAABBACADEAAA_gcAIEIAAIAIACBDAAD_BwAgB_gDAAC_BgAw-QMAAN8FABD6AwAAvwYAMPsDAQCnBgAhiwQBAKcGACGTBEAAqQYAIZQEAQCnBgAhAwAAAEEAIAEAAN4FADBBAADfBQAgAwAAAEEAIAEAAEIAMAIAAEMAIAEAAACbAQAgAQAAAJsBACADAAAAmQEAIAEAAJoBADACAACbAQAgAwAAAJkBACABAACaAQAwAgAAmwEAIAMAAACZAQAgAQAAmgEAMAIAAJsBACAJAwAA_QcAIPsDAQAAAAH_A0AAAAABiwQBAAAAAY8EAQAAAAGQBAEAAAABkQQCAAAAAZIEAQAAAAGTBEAAAAABATUAAOcFACAI-wMBAAAAAf8DQAAAAAGLBAEAAAABjwQBAAAAAZAEAQAAAAGRBAIAAAABkgQBAAAAAZMEQAAAAAEBNQAA6QUAMAE1AADpBQAwCQMAAPwHACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGPBAEA7QcAIZAEAQDtBwAhkQQCAPsHACGSBAEA7AcAIZMEQADrBwAhAgAAAJsBACA1AADsBQAgCPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIY8EAQDtBwAhkAQBAO0HACGRBAIA-wcAIZIEAQDsBwAhkwRAAOsHACECAAAAmQEAIDUAAO4FACACAAAAmQEAIDUAAO4FACADAAAAmwEAIDwAAOcFACA9AADsBQAgAQAAAJsBACABAAAAmQEAIAYQAAD2BwAgQgAA-QcAIEMAAPgHACBkAAD3BwAgZQAA-gcAIJIEAADmBwAgC_gDAAC7BgAw-QMAAPUFABD6AwAAuwYAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIY8EAQCnBgAhkAQBAKcGACGRBAIAvAYAIZIEAQCqBgAhkwRAAKkGACEDAAAAmQEAIAEAAPQFADBBAAD1BQAgAwAAAJkBACABAACaAQAwAgAAmwEAIAEAAAB5ACABAAAAeQAgAwAAAHcAIAEAAHgAMAIAAHkAIAMAAAB3ACABAAB4ADACAAB5ACADAAAAdwAgAQAAeAAwAgAAeQAgByYAAPUHACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGMBAEAAAABjQQgAAAAAY4EIAAAAAEBNQAA_QUAIAb7AwEAAAAB_wNAAAAAAYsEAQAAAAGMBAEAAAABjQQgAAAAAY4EIAAAAAEBNQAA_wUAMAE1AAD_BQAwByYAAPQHACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGMBAEA7QcAIY0EIADqBwAhjgQgAOoHACECAAAAeQAgNQAAggYAIAb7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGMBAEA7QcAIY0EIADqBwAhjgQgAOoHACECAAAAdwAgNQAAhAYAIAIAAAB3ACA1AACEBgAgAwAAAHkAIDwAAP0FACA9AACCBgAgAQAAAHkAIAEAAAB3ACADEAAA8QcAIEIAAPMHACBDAADyBwAgCfgDAAC6BgAw-QMAAIsGABD6AwAAugYAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIYwEAQCnBgAhjQQgAKgGACGOBCAAqAYAIQMAAAB3ACABAACKBgAwQQAAiwYAIAMAAAB3ACABAAB4ADACAAB5ACAJAwAAuQYAIPgDAAC1BgAw-QMAAJcBABD6AwAAtQYAMPsDAQAAAAH8AyAAtgYAIf0DQAC3BgAh_gMBALgGACH_A0AAtwYAIQEAAACOBgAgAQAAAI4GACACAwAA8AcAIP4DAADmBwAgAwAAAJcBACABAACRBgAwAgAAjgYAIAMAAACXAQAgAQAAkQYAMAIAAI4GACADAAAAlwEAIAEAAJEGADACAACOBgAgBgMAAO8HACD7AwEAAAAB_AMgAAAAAf0DQAAAAAH-AwEAAAAB_wNAAAAAAQE1AACVBgAgBfsDAQAAAAH8AyAAAAAB_QNAAAAAAf4DAQAAAAH_A0AAAAABATUAAJcGADABNQAAlwYAMAYDAADuBwAg-wMBAO0HACH8AyAA6gcAIf0DQADrBwAh_gMBAOwHACH_A0AA6wcAIQIAAACOBgAgNQAAmgYAIAX7AwEA7QcAIfwDIADqBwAh_QNAAOsHACH-AwEA7AcAIf8DQADrBwAhAgAAAJcBACA1AACcBgAgAgAAAJcBACA1AACcBgAgAwAAAI4GACA8AACVBgAgPQAAmgYAIAEAAACOBgAgAQAAAJcBACAEEAAA5wcAIEIAAOkHACBDAADoBwAg_gMAAOYHACAI-AMAAKYGADD5AwAAowYAEPoDAACmBgAw-wMBAKcGACH8AyAAqAYAIf0DQACpBgAh_gMBAKoGACH_A0AAqQYAIQMAAACXAQAgAQAAogYAMEEAAKMGACADAAAAlwEAIAEAAJEGADACAACOBgAgCPgDAACmBgAw-QMAAKMGABD6AwAApgYAMPsDAQCnBgAh_AMgAKgGACH9A0AAqQYAIf4DAQCqBgAh_wNAAKkGACEOEAAArwYAIEIAALQGACBDAAC0BgAggAQBAAAAAYEEAQAAAASCBAEAAAAEgwQBAAAAAYQEAQAAAAGFBAEAAAABhgQBAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQCzBgAhBRAAAK8GACBCAACyBgAgQwAAsgYAIIAEIAAAAAGKBCAAsQYAIQsQAACvBgAgQgAAsAYAIEMAALAGACCABEAAAAABgQRAAAAABIIEQAAAAASDBEAAAAABhARAAAAAAYUEQAAAAAGGBEAAAAABigRAAK4GACEOEAAArAYAIEIAAK0GACBDAACtBgAggAQBAAAAAYEEAQAAAAWCBAEAAAAFgwQBAAAAAYQEAQAAAAGFBAEAAAABhgQBAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQCrBgAhDhAAAKwGACBCAACtBgAgQwAArQYAIIAEAQAAAAGBBAEAAAAFggQBAAAABYMEAQAAAAGEBAEAAAABhQQBAAAAAYYEAQAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAqwYAIQiABAIAAAABgQQCAAAABYIEAgAAAAWDBAIAAAABhAQCAAAAAYUEAgAAAAGGBAIAAAABigQCAKwGACELgAQBAAAAAYEEAQAAAAWCBAEAAAAFgwQBAAAAAYQEAQAAAAGFBAEAAAABhgQBAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQCtBgAhCxAAAK8GACBCAACwBgAgQwAAsAYAIIAEQAAAAAGBBEAAAAAEggRAAAAABIMEQAAAAAGEBEAAAAABhQRAAAAAAYYEQAAAAAGKBEAArgYAIQiABAIAAAABgQQCAAAABIIEAgAAAASDBAIAAAABhAQCAAAAAYUEAgAAAAGGBAIAAAABigQCAK8GACEIgARAAAAAAYEEQAAAAASCBEAAAAAEgwRAAAAAAYQEQAAAAAGFBEAAAAABhgRAAAAAAYoEQACwBgAhBRAAAK8GACBCAACyBgAgQwAAsgYAIIAEIAAAAAGKBCAAsQYAIQKABCAAAAABigQgALIGACEOEAAArwYAIEIAALQGACBDAAC0BgAggAQBAAAAAYEEAQAAAASCBAEAAAAEgwQBAAAAAYQEAQAAAAGFBAEAAAABhgQBAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQCzBgAhC4AEAQAAAAGBBAEAAAAEggQBAAAABIMEAQAAAAGEBAEAAAABhQQBAAAAAYYEAQAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAtAYAIQkDAAC5BgAg-AMAALUGADD5AwAAlwEAEPoDAAC1BgAw-wMBAIIHACH8AyAAtgYAIf0DQAC3BgAh_gMBALgGACH_A0AAtwYAIQKABCAAAAABigQgALIGACEIgARAAAAAAYEEQAAAAASCBEAAAAAEgwRAAAAAAYQEQAAAAAGFBEAAAAABhgRAAAAAAYoEQACwBgAhC4AEAQAAAAGBBAEAAAAFggQBAAAABYMEAQAAAAGEBAEAAAABhQQBAAAAAYYEAQAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEArQYAIR0EAACIBwAgBQAAiQcAIBUAAIsHACAYAACQBwAgHwAAjgcAICkAAIoHACAqAACMBwAgKwAAjQcAICwAAI8HACAtAACRBwAgLgAAkgcAIC8AAJMHACD4AwAAhgcAMPkDAACZAgAQ-gMAAIYHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGoBAEAggcAIbIEIAC2BgAhswRAAIcHACHLBAEAggcAIesEAQCCBwAh9wQBAIIHACGJBSAAtgYAIYoFAQC4BgAhiwUgALYGACGtBQAAmQIAIK4FAACZAgAgCfgDAAC6BgAw-QMAAIsGABD6AwAAugYAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIYwEAQCnBgAhjQQgAKgGACGOBCAAqAYAIQv4AwAAuwYAMPkDAAD1BQAQ-gMAALsGADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGPBAEApwYAIZAEAQCnBgAhkQQCALwGACGSBAEAqgYAIZMEQACpBgAhDRAAAK8GACBCAACvBgAgQwAArwYAIGQAAL4GACBlAACvBgAggAQCAAAAAYEEAgAAAASCBAIAAAAEgwQCAAAAAYQEAgAAAAGFBAIAAAABhgQCAAAAAYoEAgC9BgAhDRAAAK8GACBCAACvBgAgQwAArwYAIGQAAL4GACBlAACvBgAggAQCAAAAAYEEAgAAAASCBAIAAAAEgwQCAAAAAYQEAgAAAAGFBAIAAAABhgQCAAAAAYoEAgC9BgAhCIAECAAAAAGBBAgAAAAEggQIAAAABIMECAAAAAGEBAgAAAABhQQIAAAAAYYECAAAAAGKBAgAvgYAIQf4AwAAvwYAMPkDAADfBQAQ-gMAAL8GADD7AwEApwYAIYsEAQCnBgAhkwRAAKkGACGUBAEApwYAIQ74AwAAwAYAMPkDAADJBQAQ-gMAAMAGADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIZUEAQCnBgAhlgQBAKoGACGXBAEAqgYAIZgEAQCqBgAhmQQIAMEGACGaBAAAwgYAIJsEIACoBgAhDRAAAKwGACBCAADEBgAgQwAAxAYAIGQAAMQGACBlAADEBgAggAQIAAAAAYEECAAAAAWCBAgAAAAFgwQIAAAAAYQECAAAAAGFBAgAAAABhgQIAAAAAYoECADDBgAhBIAEAQAAAAWcBAEAAAABnQQBAAAABJ4EAQAAAAQNEAAArAYAIEIAAMQGACBDAADEBgAgZAAAxAYAIGUAAMQGACCABAgAAAABgQQIAAAABYIECAAAAAWDBAgAAAABhAQIAAAAAYUECAAAAAGGBAgAAAABigQIAMMGACEIgAQIAAAAAYEECAAAAAWCBAgAAAAFgwQIAAAAAYQECAAAAAGFBAgAAAABhgQIAAAAAYoECADEBgAhDvgDAADFBgAw-QMAALMFABD6AwAAxQYAMP8DQACpBgAhiwQBAKcGACGTBEAAqQYAIZ8EAQCnBgAhoAQCALwGACGhBAIAvAYAIaIEAgC8BgAhowQCALwGACGkBAIAvAYAIaUEAgDGBgAhpgQIAMcGACENEAAArAYAIEIAAKwGACBDAACsBgAgZAAAxAYAIGUAAKwGACCABAIAAAABgQQCAAAABYIEAgAAAAWDBAIAAAABhAQCAAAAAYUEAgAAAAGGBAIAAAABigQCAMkGACENEAAArwYAIEIAAL4GACBDAAC-BgAgZAAAvgYAIGUAAL4GACCABAgAAAABgQQIAAAABIIECAAAAASDBAgAAAABhAQIAAAAAYUECAAAAAGGBAgAAAABigQIAMgGACENEAAArwYAIEIAAL4GACBDAAC-BgAgZAAAvgYAIGUAAL4GACCABAgAAAABgQQIAAAABIIECAAAAASDBAgAAAABhAQIAAAAAYUECAAAAAGGBAgAAAABigQIAMgGACENEAAArAYAIEIAAKwGACBDAACsBgAgZAAAxAYAIGUAAKwGACCABAIAAAABgQQCAAAABYIEAgAAAAWDBAIAAAABhAQCAAAAAYUEAgAAAAGGBAIAAAABigQCAMkGACEPHAAAzgYAIPgDAADKBgAw-QMAAFIAEPoDAADKBgAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhnwQBAIIHACGgBAIAywYAIaEEAgDLBgAhogQCAMsGACGjBAIAywYAIaQEAgDLBgAhpQQCAMwGACGmBAgAzQYAIQiABAIAAAABgQQCAAAABIIEAgAAAASDBAIAAAABhAQCAAAAAYUEAgAAAAGGBAIAAAABigQCAK8GACEIgAQCAAAAAYEEAgAAAAWCBAIAAAAFgwQCAAAAAYQEAgAAAAGFBAIAAAABhgQCAAAAAYoEAgCsBgAhCIAECAAAAAGBBAgAAAAEggQIAAAABIMECAAAAAGEBAgAAAABhQQIAAAAAYYECAAAAAGKBAgAvgYAISADAAC5BgAgDAAAswcAIBMAALQHACAaAAC1BwAgGwAAtgcAIB0AALcHACAeAACKBwAgIAAAuAcAIPgDAACyBwAw-QMAAFoAEPoDAACyBwAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGgBAIAywYAIaEEAgDLBgAhpwQBAIIHACGoBAEAggcAIakEAQC4BgAhqgQBALgGACGrBAEAuAYAIawEAQC4BgAhrQQBALgGACGuBAIAywYAIa8EAgDMBgAhsAQgALYGACGxBCAAtgYAIbIEIAC2BgAhswRAAIcHACGtBQAAWgAgrgUAAFoAIBb4AwAAzwYAMPkDAACbBQAQ-gMAAM8GADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIaAEAgC8BgAhoQQCALwGACGnBAEApwYAIagEAQCnBgAhqQQBAKoGACGqBAEAqgYAIasEAQCqBgAhrAQBAKoGACGtBAEAqgYAIa4EAgC8BgAhrwQCAMYGACGwBCAAqAYAIbEEIACoBgAhsgQgAKgGACGzBEAA0AYAIQsQAACsBgAgQgAA0gYAIEMAANIGACCABEAAAAABgQRAAAAABYIEQAAAAAWDBEAAAAABhARAAAAAAYUEQAAAAAGGBEAAAAABigRAANEGACELEAAArAYAIEIAANIGACBDAADSBgAggARAAAAAAYEEQAAAAAWCBEAAAAAFgwRAAAAAAYQEQAAAAAGFBEAAAAABhgRAAAAAAYoEQADRBgAhCIAEQAAAAAGBBEAAAAAFggRAAAAABYMEQAAAAAGEBEAAAAABhQRAAAAAAYYEQAAAAAGKBEAA0gYAIQ8IAQCnBgAh-AMAANMGADD5AwAAhQUAEPoDAADTBgAw-wMBAKcGACGLBAEApwYAIY4EIACoBgAhkwRAAKkGACG1BAAA1Aa1BCK2BAEAqgYAIbcEAQCqBgAhuAQBAKoGACG6BAAA1Qa6BCK7BCAAqAYAIbwEQADQBgAhBxAAAK8GACBCAADZBgAgQwAA2QYAIIAEAAAAtQQCgQQAAAC1BAiCBAAAALUECIoEAADYBrUEIgcQAACvBgAgQgAA1wYAIEMAANcGACCABAAAALoEAoEEAAAAugQIggQAAAC6BAiKBAAA1ga6BCIHEAAArwYAIEIAANcGACBDAADXBgAggAQAAAC6BAKBBAAAALoECIIEAAAAugQIigQAANYGugQiBIAEAAAAugQCgQQAAAC6BAiCBAAAALoECIoEAADXBroEIgcQAACvBgAgQgAA2QYAIEMAANkGACCABAAAALUEAoEEAAAAtQQIggQAAAC1BAiKBAAA2Aa1BCIEgAQAAAC1BAKBBAAAALUECIIEAAAAtQQIigQAANkGtQQiCvgDAADaBgAw-QMAAO8EABD6AwAA2gYAMPsDAQCnBgAhiwQBAKcGACGTBEAAqQYAIb0EAQCnBgAhvgQBAKcGACG_BCAAqAYAIcAECADBBgAhDfgDAADbBgAw-QMAANkEABD6AwAA2wYAMIsEAQCnBgAhjAQBAKcGACGOBCAAqAYAIZMEQACpBgAhmQQIAMEGACG1BAAA3QbFBCLBBAEApwYAIcMEAADcBsMEIsUEAQCqBgAhxwQAAN4GxwQjBxAAAK8GACBCAADkBgAgQwAA5AYAIIAEAAAAwwQCgQQAAADDBAiCBAAAAMMECIoEAADjBsMEIgcQAACvBgAgQgAA4gYAIEMAAOIGACCABAAAAMUEAoEEAAAAxQQIggQAAADFBAiKBAAA4QbFBCIHEAAArAYAIEIAAOAGACBDAADgBgAggAQAAADHBAOBBAAAAMcECYIEAAAAxwQJigQAAN8GxwQjBxAAAKwGACBCAADgBgAgQwAA4AYAIIAEAAAAxwQDgQQAAADHBAmCBAAAAMcECYoEAADfBscEIwSABAAAAMcEA4EEAAAAxwQJggQAAADHBAmKBAAA4AbHBCMHEAAArwYAIEIAAOIGACBDAADiBgAggAQAAADFBAKBBAAAAMUECIIEAAAAxQQIigQAAOEGxQQiBIAEAAAAxQQCgQQAAADFBAiCBAAAAMUECIoEAADiBsUEIgcQAACvBgAgQgAA5AYAIEMAAOQGACCABAAAAMMEAoEEAAAAwwQIggQAAADDBAiKBAAA4wbDBCIEgAQAAADDBAKBBAAAAMMECIIEAAAAwwQIigQAAOQGwwQiBvgDAADlBgAw-QMAAMMEABD6AwAA5QYAMIsEAQCnBgAhlAQBAKcGACHIBAEApwYAIQ74AwAA5gYAMPkDAACtBAAQ-gMAAOYGADD_A0AAqQYAIYsEAQCnBgAhlAQBAKcGACGZBAgAwQYAIZ8EAQCnBgAhyQQBAKcGACHLBAAA5wbLBCLMBAAAwgYAIM0EAQCqBgAhzgQBAKoGACHPBEAAqQYAIQcQAACvBgAgQgAA6QYAIEMAAOkGACCABAAAAMsEAoEEAAAAywQIggQAAADLBAiKBAAA6AbLBCIHEAAArwYAIEIAAOkGACBDAADpBgAggAQAAADLBAKBBAAAAMsECIIEAAAAywQIigQAAOgGywQiBIAEAAAAywQCgQQAAADLBAiCBAAAAMsECIoEAADpBssEIhn4AwAA6gYAMPkDAACXBAAQ-gMAAOoGADD_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACGYBAEAqgYAIZkECADBBgAhnwQBAKcGACGyBCAAqAYAIbMEQADQBgAhtQQAAOsG2QQitgQBAKcGACHLBAAA7QbcBCLQBAEApwYAIdEEAQCqBgAh0gQBAKcGACHTBAEAqgYAIdQEIACoBgAh1QQCAMYGACHWBAIAxgYAIdcEAQCnBgAh2gQAAOwG2gQi3AQAAMIGACDdBAEAqgYAIQcQAACvBgAgQgAA8wYAIEMAAPMGACCABAAAANkEAoEEAAAA2QQIggQAAADZBAiKBAAA8gbZBCIHEAAArwYAIEIAAPEGACBDAADxBgAggAQAAADaBAKBBAAAANoECIIEAAAA2gQIigQAAPAG2gQiBxAAAK8GACBCAADvBgAgQwAA7wYAIIAEAAAA3AQCgQQAAADcBAiCBAAAANwECIoEAADuBtwEIgcQAACvBgAgQgAA7wYAIEMAAO8GACCABAAAANwEAoEEAAAA3AQIggQAAADcBAiKBAAA7gbcBCIEgAQAAADcBAKBBAAAANwECIIEAAAA3AQIigQAAO8G3AQiBxAAAK8GACBCAADxBgAgQwAA8QYAIIAEAAAA2gQCgQQAAADaBAiCBAAAANoECIoEAADwBtoEIgSABAAAANoEAoEEAAAA2gQIggQAAADaBAiKBAAA8QbaBCIHEAAArwYAIEIAAPMGACBDAADzBgAggAQAAADZBAKBBAAAANkECIIEAAAA2QQIigQAAPIG2QQiBIAEAAAA2QQCgQQAAADZBAiCBAAAANkECIoEAADzBtkEIg_4AwAA9AYAMPkDAAD_AwAQ-gMAAPQGADD_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACGUBAEAqgYAIZkECADBBgAhywQAAPUG4AQi3gQBAKcGACHgBEAA0AYAIeEEQADQBgAh4gRAANAGACHjBAIAxgYAIeQEAQCqBgAhBxAAAK8GACBCAAD3BgAgQwAA9wYAIIAEAAAA4AQCgQQAAADgBAiCBAAAAOAECIoEAAD2BuAEIgcQAACvBgAgQgAA9wYAIEMAAPcGACCABAAAAOAEAoEEAAAA4AQIggQAAADgBAiKBAAA9gbgBCIEgAQAAADgBAKBBAAAAOAECIIEAAAA4AQIigQAAPcG4AQiFvgDAAD4BgAw-QMAAOcDABD6AwAA-AYAMP8DQACpBgAhiwQBAKcGACGTBEAAqQYAIZQEAQCnBgAhmQQIAMEGACGfBAEApwYAIbIEIACoBgAhswRAANAGACG1BAAA-QboBCLLBAAA9QbgBCLgBEAAqQYAIeEEQADQBgAh4gRAANAGACHkBAEAqgYAIeUEAQCnBgAh5gQBAKcGACHoBAIAxgYAIekEAQCqBgAh6gQBAKoGACEHEAAArwYAIEIAAPsGACBDAAD7BgAggAQAAADoBAKBBAAAAOgECIIEAAAA6AQIigQAAPoG6AQiBxAAAK8GACBCAAD7BgAgQwAA-wYAIIAEAAAA6AQCgQQAAADoBAiCBAAAAOgECIoEAAD6BugEIgSABAAAAOgEAoEEAAAA6AQIggQAAADoBAiKBAAA-wboBCIP-AMAAPwGADD5AwAA0QMAEPoDAAD8BgAw_wNAAKkGACGLBAEApwYAIZMEQACpBgAhmwQgAKgGACGyBCAAqAYAIbMEQADQBgAh0AQBAKoGACHrBAEApwYAIewEAQCqBgAh7QQBAKoGACHuBAIAvAYAIe8EAgC8BgAhCvgDAAD9BgAw-QMAALsDABD6AwAA_QYAMP8DQACpBgAhiwQBAKcGACGTBEAAqQYAIZQEAQCqBgAhnwQBAKoGACHJBAEAqgYAIfAEIACoBgAhFfgDAAD-BgAw-QMAAJ8DABD6AwAA_gYAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIZMEQACpBgAhmQQIAMEGACGnBAEApwYAIagEAQCnBgAhqQQBAKoGACGqBAEAqgYAIa4EAgC8BgAhsgQgAKgGACGzBEAA0AYAIdwEAADCBgAg8QQBAKoGACHyBAEAqgYAIfMEAQCqBgAh9AQAAMIGACD1BAEAqgYAIQv4AwAA_wYAMPkDAACHAwAQ-gMAAP8GADD7AwEApwYAIYsEAQCnBgAhkwRAAKkGACGZBAgAwQYAIfYEAQCnBgAh9wQAANwGwwQi-ARAANAGACH5BEAA0AYAIQn4AwAAgAcAMPkDAADxAgAQ-gMAAIAHADD_A0AAqQYAIYsEAQCnBgAhkwRAAKkGACH6BAEApwYAIfsEAQCnBgAh_ARAAKkGACEJ-AMAAIEHADD5AwAA3gIAEPoDAACBBwAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAh-gQBAIIHACH7BAEAggcAIfwEQAC3BgAhC4AEAQAAAAGBBAEAAAAEggQBAAAABIMEAQAAAAGEBAEAAAABhQQBAAAAAYYEAQAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAtAYAIRD4AwAAgwcAMPkDAADYAgAQ-gMAAIMHADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIf0EAQCnBgAh_gQBAKcGACH_BAEAqgYAIYAFAQCqBgAhgQUBAKoGACGCBUAA0AYAIYMFQADQBgAhhAUBAKoGACGFBQEAqgYAIQv4AwAAhAcAMPkDAADCAgAQ-gMAAIQHADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIfwEQACpBgAhhgUBAKcGACGHBQEAqgYAIYgFAQCqBgAhD_gDAACFBwAw-QMAAKwCABD6AwAAhQcAMP8DQACpBgAhiwQBAKcGACGTBEAAqQYAIagEAQCnBgAhsgQgAKgGACGzBEAA0AYAIcsEAQCnBgAh6wQBAKcGACH3BAEApwYAIYkFIACoBgAhigUBAKoGACGLBSAAqAYAIRsEAACIBwAgBQAAiQcAIBUAAIsHACAYAACQBwAgHwAAjgcAICkAAIoHACAqAACMBwAgKwAAjQcAICwAAI8HACAtAACRBwAgLgAAkgcAIC8AAJMHACD4AwAAhgcAMPkDAACZAgAQ-gMAAIYHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGoBAEAggcAIbIEIAC2BgAhswRAAIcHACHLBAEAggcAIesEAQCCBwAh9wQBAIIHACGJBSAAtgYAIYoFAQC4BgAhiwUgALYGACEIgARAAAAAAYEEQAAAAAWCBEAAAAAFgwRAAAAAAYQEQAAAAAGFBEAAAAABhgRAAAAAAYoEQADSBgAhA4wFAAADACCNBQAAAwAgjgUAAAMAIBMDAAC5BgAg-AMAAOMHADD5AwAABwAQ-gMAAOMHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIagEAQCCBwAhqQQBALgGACGyBCAAtgYAIbMEQACHBwAhywQBAIIHACHrBAEAggcAIZ8FAQC4BgAhoAUAAOQHACChBUAAhwcAIa0FAAAHACCuBQAABwAgA4wFAAAJACCNBQAACQAgjgUAAAkAIB4DAAC5BgAgDAAAswcAIBMAALQHACAUAAC1BwAgFgAAxgcAIBcAAIoHACAYAACQBwAg-AMAAMUHADD5AwAAOwAQ-gMAAMUHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZkECAClBwAhpwQBAIIHACGoBAEAggcAIakEAQC4BgAhqgQBALgGACGuBAIAywYAIbIEIAC2BgAhswRAAIcHACHcBAAAwgYAIPEEAQC4BgAh8gQBALgGACHzBAEAuAYAIfQEAADCBgAg9QQBALgGACGtBQAAOwAgrgUAADsAIAOMBQAAFgAgjQUAABYAII4FAAAWACADjAUAAIoBACCNBQAAigEAII4FAACKAQAgIAMAALkGACAMAACzBwAgEwAAtAcAIBoAALUHACAbAAC2BwAgHQAAtwcAIB4AAIoHACAgAAC4BwAg-AMAALIHADD5AwAAWgAQ-gMAALIHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIaAEAgDLBgAhoQQCAMsGACGnBAEAggcAIagEAQCCBwAhqQQBALgGACGqBAEAuAYAIasEAQC4BgAhrAQBALgGACGtBAEAuAYAIa4EAgDLBgAhrwQCAMwGACGwBCAAtgYAIbEEIAC2BgAhsgQgALYGACGzBEAAhwcAIa0FAABaACCuBQAAWgAgA4wFAAA5ACCNBQAAOQAgjgUAADkAIAOMBQAAQQAgjQUAAEEAII4FAABBACADjAUAAJMBACCNBQAAkwEAII4FAACTAQAgCwMAALkGACD4AwAAtQYAMPkDAACXAQAQ-gMAALUGADD7AwEAggcAIfwDIAC2BgAh_QNAALcGACH-AwEAuAYAIf8DQAC3BgAhrQUAAJcBACCuBQAAlwEAIAOMBQAAmQEAII0FAACZAQAgjgUAAJkBACAO-AMAAJQHADD5AwAAkwIAEPoDAACUBwAwiwQBAKcGACGTBEAAqQYAIZUEAQCnBgAhlgQBAKcGACGXBAEApwYAIZgEAQCqBgAhvQQBAKcGACGPBQIAvAYAIZAFIACoBgAhkQUgAKgGACGSBSAAqAYAIQr4AwAAlQcAMPkDAAD9AQAQ-gMAAJUHADD7AwEApwYAIYsEAQCnBgAhkwRAAKkGACG1BAEApwYAIbgEAQCnBgAhkwUIAMcGACGUBQEAqgYAIQr4AwAAlgcAMPkDAADqAQAQ-gMAAJYHADD7AwEAggcAIYsEAQCCBwAhkwRAALcGACG1BAEAggcAIbgEAQCCBwAhkwUIAM0GACGUBQEAuAYAIQ34AwAAlwcAMPkDAADkAQAQ-gMAAJcHADD7AwEApwYAIf8DQACpBgAhiwQBAKcGACGTBEAAqQYAIbYEAQCqBgAhlgUAAJgHlgUilwUgAKgGACGYBSAAqAYAIZkFAgDGBgAhmgUBAKoGACEHEAAArwYAIEIAAJoHACBDAACaBwAggAQAAACWBQKBBAAAAJYFCIIEAAAAlgUIigQAAJkHlgUiBxAAAK8GACBCAACaBwAgQwAAmgcAIIAEAAAAlgUCgQQAAACWBQiCBAAAAJYFCIoEAACZB5YFIgSABAAAAJYFAoEEAAAAlgUIggQAAACWBQiKBAAAmgeWBSIK-AMAAJsHADD5AwAAzgEAEPoDAACbBwAwiwQBAKcGACGQBAEApwYAIZMEQACpBgAh9wQAAJwHnQUimwUBAKcGACGdBSAAqAYAIZ4FAQCqBgAhBxAAAK8GACBCAACeBwAgQwAAngcAIIAEAAAAnQUCgQQAAACdBQiCBAAAAJ0FCIoEAACdB50FIgcQAACvBgAgQgAAngcAIEMAAJ4HACCABAAAAJ0FAoEEAAAAnQUIggQAAACdBQiKBAAAnQedBSIEgAQAAACdBQKBBAAAAJ0FCIIEAAAAnQUIigQAAJ4HnQUiEPgDAACfBwAw-QMAALgBABD6AwAAnwcAMPsDAQCnBgAh_wNAAKkGACGLBAEApwYAIZMEQACpBgAhqAQBAKcGACGpBAEAqgYAIbIEIACoBgAhswRAANAGACHLBAEApwYAIesEAQCnBgAhnwUBAKoGACGgBQAAoAcAIKEFQADQBgAhDxAAAKwGACBCAAChBwAgQwAAoQcAIIAEgAAAAAGDBIAAAAABhASAAAAAAYUEgAAAAAGGBIAAAAABigSAAAAAAaIFAQAAAAGjBQEAAAABpAUBAAAAAaUFgAAAAAGmBYAAAAABpwWAAAAAAQyABIAAAAABgwSAAAAAAYQEgAAAAAGFBIAAAAABhgSAAAAAAYoEgAAAAAGiBQEAAAABowUBAAAAAaQFAQAAAAGlBYAAAAABpgWAAAAAAacFgAAAAAEMAwAAuQYAIPgDAACiBwAw-QMAAJkBABD6AwAAogcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIY8EAQCCBwAhkAQBAIIHACGRBAIAywYAIZIEAQC4BgAhkwRAALcGACEMAwAAuQYAIPgDAACjBwAw-QMAAJMBABD6AwAAowcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAh_ARAALcGACGGBQEAggcAIYcFAQC4BgAhiAUBALgGACEQAwAAuQYAIBUAAKYHACD4AwAApAcAMPkDAAA5ABD6AwAApAcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhlQQBAIIHACGWBAEAuAYAIZcEAQC4BgAhmAQBALgGACGZBAgApQcAIZoEAADCBgAgmwQgALYGACEIgAQIAAAAAYEECAAAAAWCBAgAAAAFgwQIAAAAAYQECAAAAAGFBAgAAAABhgQIAAAAAYoECADEBgAhA4wFAAA7ACCNBQAAOwAgjgUAADsAIBADAAC5BgAgCAEAggcAIfgDAACnBwAw-QMAAIoBABD6AwAApwcAMPsDAQCCBwAhiwQBAIIHACGOBCAAtgYAIZMEQAC3BgAhtQQAAKgHtQQitgQBALgGACG3BAEAuAYAIbgEAQC4BgAhugQAAKkHugQiuwQgALYGACG8BEAAhwcAIQSABAAAALUEAoEEAAAAtQQIggQAAAC1BAiKBAAA2Qa1BCIEgAQAAAC6BAKBBAAAALoECIIEAAAAugQIigQAANcGugQiAvsDAQAAAAGMBAEAAAABCiYAAKwHACD4AwAAqwcAMPkDAAB3ABD6AwAAqwcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIYwEAQCCBwAhjQQgALYGACGOBCAAtgYAIRIKAADSBwAgGQAAiwcAIBwAAI4HACAkAADABwAgJQAA1QcAICcAANYHACD4AwAA1AcAMPkDAAAgABD6AwAA1AcAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQC4BgAhnwQBALgGACHJBAEAuAYAIfAEIAC2BgAhrQUAACAAIK4FAAAgACAQBwAAsQcAIAkAAIwHACAmAACsBwAg-AMAAK0HADD5AwAAcwAQ-gMAAK0HADCLBAEAggcAIYwEAQCCBwAhjgQgALYGACGTBEAAtwYAIZkECAClBwAhtQQAAK8HxQQiwQQBAIIHACHDBAAArgfDBCLFBAEAuAYAIccEAACwB8cEIwSABAAAAMMEAoEEAAAAwwQIggQAAADDBAiKBAAA5AbDBCIEgAQAAADFBAKBBAAAAMUECIIEAAAAxQQIigQAAOIGxQQiBIAEAAAAxwQDgQQAAADHBAmCBAAAAMcECYoEAADgBscEIwOMBQAAEQAgjQUAABEAII4FAAARACAeAwAAuQYAIAwAALMHACATAAC0BwAgGgAAtQcAIBsAALYHACAdAAC3BwAgHgAAigcAICAAALgHACD4AwAAsgcAMPkDAABaABD6AwAAsgcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhoAQCAMsGACGhBAIAywYAIacEAQCCBwAhqAQBAIIHACGpBAEAuAYAIaoEAQC4BgAhqwQBALgGACGsBAEAuAYAIa0EAQC4BgAhrgQCAMsGACGvBAIAzAYAIbAEIAC2BgAhsQQgALYGACGyBCAAtgYAIbMEQACHBwAhA4wFAAAgACCNBQAAIAAgjgUAACAAIAOMBQAALgAgjQUAAC4AII4FAAAuACADjAUAADUAII0FAAA1ACCOBQAANQAgA4wFAAAaACCNBQAAGgAgjgUAABoAIBEcAADOBgAg-AMAAMoGADD5AwAAUgAQ-gMAAMoGADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGfBAEAggcAIaAEAgDLBgAhoQQCAMsGACGiBAIAywYAIaMEAgDLBgAhpAQCAMsGACGlBAIAzAYAIaYECADNBgAhrQUAAFIAIK4FAABSACADjAUAAFUAII0FAABVACCOBQAAVQAgERsAALYHACAfAAC6BwAg-AMAALkHADD5AwAAVQAQ-gMAALkHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGbBCAAtgYAIbIEIAC2BgAhswRAAIcHACHQBAEAuAYAIesEAQCCBwAh7AQBALgGACHtBAEAuAYAIe4EAgDLBgAh7wQCAMsGACEDjAUAAFoAII0FAABaACCOBQAAWgAgIQsAAL8HACAMAACzBwAgEQAAwAcAIBMAALQHACAUAAC1BwAgHAAAzgYAICIAAMEHACAjAACQBwAg-AMAALsHADD5AwAAGgAQ-gMAALsHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGYBAEAuAYAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAALwH2QQitgQBAIIHACHLBAAAvgfcBCLQBAEAggcAIdEEAQC4BgAh0gQBAIIHACHTBAEAuAYAIdQEIAC2BgAh1QQCAMwGACHWBAIAzAYAIdcEAQCCBwAh2gQAAL0H2gQi3AQAAMIGACDdBAEAuAYAIQSABAAAANkEAoEEAAAA2QQIggQAAADZBAiKBAAA8wbZBCIEgAQAAADaBAKBBAAAANoECIIEAAAA2gQIigQAAPEG2gQiBIAEAAAA3AQCgQQAAADcBAiCBAAAANwECIoEAADvBtwEIgOMBQAAHAAgjQUAABwAII4FAAAcACADjAUAACQAII0FAAAkACCOBQAAJAAgExsAALYHACAfAAC6BwAg-AMAALkHADD5AwAAVQAQ-gMAALkHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGbBCAAtgYAIbIEIAC2BgAhswRAAIcHACHQBAEAuAYAIesEAQCCBwAh7AQBALgGACHtBAEAuAYAIe4EAgDLBgAh7wQCAMsGACGtBQAAVQAgrgUAAFUAIAL7AwEAAAABlAQBAAAAAQoDAAC5BgAgCgAAxAcAIBUAAKYHACD4AwAAwwcAMPkDAABBABD6AwAAwwcAMPsDAQCCBwAhiwQBAIIHACGTBEAAtwYAIZQEAQCCBwAhIwsAAL8HACAMAACzBwAgEQAAwAcAIBMAALQHACAUAAC1BwAgHAAAzgYAICIAAMEHACAjAACQBwAg-AMAALsHADD5AwAAGgAQ-gMAALsHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGYBAEAuAYAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAALwH2QQitgQBAIIHACHLBAAAvgfcBCLQBAEAggcAIdEEAQC4BgAh0gQBAIIHACHTBAEAuAYAIdQEIAC2BgAh1QQCAMwGACHWBAIAzAYAIdcEAQCCBwAh2gQAAL0H2gQi3AQAAMIGACDdBAEAuAYAIa0FAAAaACCuBQAAGgAgHAMAALkGACAMAACzBwAgEwAAtAcAIBQAALUHACAWAADGBwAgFwAAigcAIBgAAJAHACD4AwAAxQcAMPkDAAA7ABD6AwAAxQcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhmQQIAKUHACGnBAEAggcAIagEAQCCBwAhqQQBALgGACGqBAEAuAYAIa4EAgDLBgAhsgQgALYGACGzBEAAhwcAIdwEAADCBgAg8QQBALgGACHyBAEAuAYAIfMEAQC4BgAh9AQAAMIGACD1BAEAuAYAIRIDAAC5BgAgFQAApgcAIPgDAACkBwAw-QMAADkAEPoDAACkBwAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGVBAEAggcAIZYEAQC4BgAhlwQBALgGACGYBAEAuAYAIZkECAClBwAhmgQAAMIGACCbBCAAtgYAIa0FAAA5ACCuBQAAOQAgEgoAAMQHACASAAC0BwAgGQAAyQcAIBwAAM4GACD4AwAAxwcAMPkDAAA1ABD6AwAAxwcAMP8DQAC3BgAhiwQBAIIHACGUBAEAggcAIZkECAClBwAhnwQBAIIHACHJBAEAggcAIcsEAADIB8sEIswEAADCBgAgzQQBALgGACHOBAEAuAYAIc8EQAC3BgAhBIAEAAAAywQCgQQAAADLBAiCBAAAAMsECIoEAADpBssEIh4DAAC5BgAgDAAAswcAIBMAALQHACAUAAC1BwAgFgAAxgcAIBcAAIoHACAYAACQBwAg-AMAAMUHADD5AwAAOwAQ-gMAAMUHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZkECAClBwAhpwQBAIIHACGoBAEAggcAIakEAQC4BgAhqgQBALgGACGuBAIAywYAIbIEIAC2BgAhswRAAIcHACHcBAAAwgYAIPEEAQC4BgAh8gQBALgGACHzBAEAuAYAIfQEAADCBgAg9QQBALgGACGtBQAAOwAgrgUAADsAIBoKAADEBwAgGQAAyQcAIBwAAM4GACAhAADNBwAg-AMAAMoHADD5AwAALgAQ-gMAAMoHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGUBAEAggcAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAAMsH6AQiywQAAMwH4AQi4ARAALcGACHhBEAAhwcAIeIEQACHBwAh5AQBALgGACHlBAEAggcAIeYEAQCCBwAh6AQCAMwGACHpBAEAuAYAIeoEAQC4BgAhBIAEAAAA6AQCgQQAAADoBAiCBAAAAOgECIoEAAD7BugEIgSABAAAAOAEAoEEAAAA4AQIggQAAADgBAiKBAAA9wbgBCIUCgAAxAcAIBIAALQHACAZAADJBwAgHAAAzgYAIPgDAADHBwAw-QMAADUAEPoDAADHBwAw_wNAALcGACGLBAEAggcAIZQEAQCCBwAhmQQIAKUHACGfBAEAggcAIckEAQCCBwAhywQAAMgHywQizAQAAMIGACDNBAEAuAYAIc4EAQC4BgAhzwRAALcGACGtBQAANQAgrgUAADUAIAwNAADPBwAg-AMAAM4HADD5AwAAKAAQ-gMAAM4HADD7AwEAggcAIYsEAQCCBwAhkwRAALcGACGZBAgApQcAIfYEAQCCBwAh9wQAAK4HwwQi-ARAAIcHACH5BEAAhwcAIRQKAADSBwAgDgAA0QcAIA8AAKwHACD4AwAA0AcAMPkDAAAkABD6AwAA0AcAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQC4BgAhmQQIAKUHACHLBAAAzAfgBCLeBAEAggcAIeAEQACHBwAh4QRAAIcHACHiBEAAhwcAIeMEAgDMBgAh5AQBALgGACGtBQAAJAAgrgUAACQAIBIKAADSBwAgDgAA0QcAIA8AAKwHACD4AwAA0AcAMPkDAAAkABD6AwAA0AcAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQC4BgAhmQQIAKUHACHLBAAAzAfgBCLeBAEAggcAIeAEQACHBwAh4QRAAIcHACHiBEAAhwcAIeMEAgDMBgAh5AQBALgGACEDjAUAACgAII0FAAAoACCOBQAAKAAgIwsAAL8HACAMAACzBwAgEQAAwAcAIBMAALQHACAUAAC1BwAgHAAAzgYAICIAAMEHACAjAACQBwAg-AMAALsHADD5AwAAGgAQ-gMAALsHADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGYBAEAuAYAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAALwH2QQitgQBAIIHACHLBAAAvgfcBCLQBAEAggcAIdEEAQC4BgAh0gQBAIIHACHTBAEAuAYAIdQEIAC2BgAh1QQCAMwGACHWBAIAzAYAIdcEAQCCBwAh2gQAAL0H2gQi3AQAAMIGACDdBAEAuAYAIa0FAAAaACCuBQAAGgAgA5QEAQAAAAGfBAEAAAAByQQBAAAAARAKAADSBwAgGQAAiwcAIBwAAI4HACAkAADABwAgJQAA1QcAICcAANYHACD4AwAA1AcAMPkDAAAgABD6AwAA1AcAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQC4BgAhnwQBALgGACHJBAEAuAYAIfAEIAC2BgAhA4wFAABzACCNBQAAcwAgjgUAAHMAIAOMBQAAdwAgjQUAAHcAII4FAAB3ACAClAQBAAAAAcgEAQAAAAEHCgAAxAcAIPgDAADYBwAw-QMAABwAEPoDAADYBwAwiwQBAIIHACGUBAEAggcAIcgEAQCCBwAhA_sDAQAAAAG9BAEAAAABvgQBAAAAAQwDAAC5BgAgCAAA2wcAIPgDAADaBwAw-QMAABYAEPoDAADaBwAw-wMBAIIHACGLBAEAggcAIZMEQAC3BgAhvQQBAIIHACG-BAEAggcAIb8EIAC2BgAhwAQIAKUHACESBwAAsQcAIAkAAIwHACAmAACsBwAg-AMAAK0HADD5AwAAcwAQ-gMAAK0HADCLBAEAggcAIYwEAQCCBwAhjgQgALYGACGTBEAAtwYAIZkECAClBwAhtQQAAK8HxQQiwQQBAIIHACHDBAAArgfDBCLFBAEAuAYAIccEAACwB8cEI60FAABzACCuBQAAcwAgEAgAANsHACAoAADdBwAg-AMAANwHADD5AwAAEQAQ-gMAANwHADCLBAEAggcAIZMEQAC3BgAhlQQBAIIHACGWBAEAggcAIZcEAQCCBwAhmAQBALgGACG9BAEAggcAIY8FAgDLBgAhkAUgALYGACGRBSAAtgYAIZIFIAC2BgAhA4wFAAANACCNBQAADQAgjgUAAA0AIAwGAADgBwAgBwAAsQcAIPgDAADeBwAw-QMAAA0AEPoDAADeBwAwiwQBAIIHACGQBAEAggcAIZMEQAC3BgAh9wQAAN8HnQUimwUBAIIHACGdBSAAtgYAIZ4FAQC4BgAhBIAEAAAAnQUCgQQAAACdBQiCBAAAAJ0FCIoEAACeB50FIhMDAAC5BgAgFQAApgcAIB8AALoHACAlAADdBwAg-AMAAOEHADD5AwAACQAQ-gMAAOEHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIbYEAQC4BgAhlgUAAOIHlgUilwUgALYGACGYBSAAtgYAIZkFAgDMBgAhmgUBALgGACGtBQAACQAgrgUAAAkAIBEDAAC5BgAgFQAApgcAIB8AALoHACAlAADdBwAg-AMAAOEHADD5AwAACQAQ-gMAAOEHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIbYEAQC4BgAhlgUAAOIHlgUilwUgALYGACGYBSAAtgYAIZkFAgDMBgAhmgUBALgGACEEgAQAAACWBQKBBAAAAJYFCIIEAAAAlgUIigQAAJoHlgUiEQMAALkGACD4AwAA4wcAMPkDAAAHABD6AwAA4wcAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhqAQBAIIHACGpBAEAuAYAIbIEIAC2BgAhswRAAIcHACHLBAEAggcAIesEAQCCBwAhnwUBALgGACGgBQAA5AcAIKEFQACHBwAhDIAEgAAAAAGDBIAAAAABhASAAAAAAYUEgAAAAAGGBIAAAAABigSAAAAAAaIFAQAAAAGjBQEAAAABpAUBAAAAAaUFgAAAAAGmBYAAAAABpwWAAAAAAREDAAC5BgAg-AMAAOUHADD5AwAAAwAQ-gMAAOUHADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIf0EAQCCBwAh_gQBAIIHACH_BAEAuAYAIYAFAQC4BgAhgQUBALgGACGCBUAAhwcAIYMFQACHBwAhhAUBALgGACGFBQEAuAYAIQAAAAABsQUgAAAAAQGxBUAAAAABAbEFAQAAAAEBsQUBAAAAAQU8AADTDwAgPQAA1g8AIK8FAADUDwAgsAUAANUPACC0BQAAlgIAIAM8AADTDwAgrwUAANQPACC0BQAAlgIAIA4EAADMDQAgBQAAzQ0AIBUAAM8NACAYAADTDQAgHwAA0wsAICkAAM4NACAqAADQDQAgKwAA0Q0AICwAANINACAtAADUDQAgLgAA1Q0AIC8AANYNACCzBAAA5gcAIIoFAADmBwAgAAAABTwAAM4PACA9AADRDwAgrwUAAM8PACCwBQAA0A8AILQFAAAiACADPAAAzg8AIK8FAADPDwAgtAUAACIAIAAAAAAABbEFAgAAAAG5BQIAAAABugUCAAAAAbsFAgAAAAG8BQIAAAABBTwAAMkPACA9AADMDwAgrwUAAMoPACCwBQAAyw8AILQFAACWAgAgAzwAAMkPACCvBQAAyg8AILQFAACWAgAgAAAABTwAAMAOACA9AADHDwAgrwUAAMEOACCwBQAAxg8AILQFAABQACAFPAAAsA8AID0AAMQPACCvBQAAsQ8AILAFAADDDwAgtAUAAJYCACAKPAAAhAgAMD0AAIgIADCvBQAAhQgAMLAFAACGCAAwsQUAAIcIADCyBQAAhwgAMLMFAACHCAAwtAUAAIcIADC1BQAAiQgAMLYFAACKCAAwGAMAAKsLACAMAACnCwAgEwAAqAsAIBQAAKkLACAWAACqCwAgFwAArAsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACD1BAEAAAABAgAAAD0AIDwAAKQLACADAAAAPQAgPAAApAsAID0AAJEIACAcAwAAuQYAIAwAALMHACATAAC0BwAgFAAAtQcAIBYAAMYHACAXAACKBwAgGAAAkAcAIPgDAADFBwAw-QMAADsAEPoDAADFBwAw-wMBAAAAAf8DQAC3BgAhiwQBAAAAAZMEQAC3BgAhmQQIAKUHACGnBAEAggcAIagEAQAAAAGpBAEAuAYAIaoEAQC4BgAhrgQCAMsGACGyBCAAtgYAIbMEQACHBwAh3AQAAMIGACDxBAEAuAYAIfIEAQC4BgAh8wQBALgGACH0BAAAwgYAIPUEAQC4BgAhAgAAAD0AIDUAAJEIACACAAAAiwgAIDUAAIwIACAV-AMAAIoIADD5AwAAiwgAEPoDAACKCAAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGZBAgApQcAIacEAQCCBwAhqAQBAIIHACGpBAEAuAYAIaoEAQC4BgAhrgQCAMsGACGyBCAAtgYAIbMEQACHBwAh3AQAAMIGACDxBAEAuAYAIfIEAQC4BgAh8wQBALgGACH0BAAAwgYAIPUEAQC4BgAhFfgDAACKCAAw-QMAAIsIABD6AwAAiggAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhmQQIAKUHACGnBAEAggcAIagEAQCCBwAhqQQBALgGACGqBAEAuAYAIa4EAgDLBgAhsgQgALYGACGzBEAAhwcAIdwEAADCBgAg8QQBALgGACHyBAEAuAYAIfMEAQC4BgAh9AQAAMIGACD1BAEAuAYAIRL7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGuBAIA-wcAIbIEIADqBwAhswRAAJAIACHcBAAAjwgAIPEEAQDsBwAh8gQBAOwHACHzBAEA7AcAIfQEAACNCAAg9QQBAOwHACECsQUBAAAABLgFAQAAAAUFsQUIAAAAAbkFCAAAAAG6BQgAAAABuwUIAAAAAbwFCAAAAAECsQUBAAAABLgFAQAAAAUBsQVAAAAAARgDAACWCAAgDAAAkggAIBMAAJMIACAUAACUCAAgFgAAlQgAIBcAAJcIACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGuBAIA-wcAIbIEIADqBwAhswRAAJAIACHcBAAAjwgAIPEEAQDsBwAh8gQBAOwHACHzBAEA7AcAIfQEAACNCAAg9QQBAOwHACELPAAAmwsAMD0AAJ8LADCvBQAAnAsAMLAFAACdCwAwsQUAALwJADCyBQAAvAkAMLMFAAC8CQAwtAUAALwJADC1BQAAoAsAMLYFAAC_CQAwtwUAAJ4LACALPAAAkgsAMD0AAJYLADCvBQAAkwsAMLAFAACUCwAwsQUAAPsIADCyBQAA-wgAMLMFAAD7CAAwtAUAAPsIADC1BQAAlwsAMLYFAAD-CAAwtwUAAJULACALPAAAiQsAMD0AAI0LADCvBQAAigsAMLAFAACLCwAwsQUAAOsIADCyBQAA6wgAMLMFAADrCAAwtAUAAOsIADC1BQAAjgsAMLYFAADuCAAwtwUAAIwLACAHPAAAxA4AID0AAMEPACCvBQAAxQ4AILAFAADADwAgsgUAADkAILMFAAA5ACC0BQAAkAEAIAU8AADCDgAgPQAAvg8AIK8FAADDDgAgsAUAAL0PACC0BQAAlgIAIAo8AACYCAAwPQAAnAgAMK8FAACZCAAwsAUAAJoIADCxBQAAmwgAMLIFAACbCAAwswUAAJsIADC0BQAAmwgAMLUFAACdCAAwtgUAAJ4IADANAwAAhwsAIB8AAIgLACAlAACGCwAg-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAbYEAQAAAAGWBQAAAJYFApcFIAAAAAGYBSAAAAABmQUCAAAAAZoFAQAAAAECAAAACwAgPAAAhQsAIAMAAAALACA8AACFCwAgPQAAowgAIBEDAAC5BgAgFQAApgcAIB8AALoHACAlAADdBwAg-AMAAOEHADD5AwAACQAQ-gMAAOEHADD7AwEAggcAIf8DQAC3BgAhiwQBAAAAAZMEQAC3BgAhtgQBALgGACGWBQAA4geWBSKXBSAAtgYAIZgFIAC2BgAhmQUCAMwGACGaBQEAuAYAIQIAAAALACA1AACjCAAgAgAAAJ8IACA1AACgCAAgDfgDAACeCAAw-QMAAJ8IABD6AwAAnggAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhtgQBALgGACGWBQAA4geWBSKXBSAAtgYAIZgFIAC2BgAhmQUCAMwGACGaBQEAuAYAIQ34AwAAnggAMPkDAACfCAAQ-gMAAJ4IADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIbYEAQC4BgAhlgUAAOIHlgUilwUgALYGACGYBSAAtgYAIZkFAgDMBgAhmgUBALgGACEK-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACG2BAEA7AcAIZYFAAChCJYFIpcFIADqBwAhmAUgAOoHACGZBQIAoggAIZoFAQDsBwAhAbEFAAAAlgUCBbEFAgAAAAG5BQIAAAABugUCAAAAAbsFAgAAAAG8BQIAAAABDQMAAKUIACAfAACmCAAgJQAApAgAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhtgQBAOwHACGWBQAAoQiWBSKXBSAA6gcAIZgFIADqBwAhmQUCAKIIACGaBQEA7AcAIQs8AADwCgAwPQAA9AoAMK8FAADxCgAwsAUAAPIKADCxBQAAgAoAMLIFAACACgAwswUAAIAKADC0BQAAgAoAMLUFAAD1CgAwtgUAAIMKADC3BQAA8woAIAU8AADJDgAgPQAAuw8AIK8FAADKDgAgsAUAALoPACC0BQAAlgIAIAo8AACnCAAwPQAAqwgAMK8FAACoCAAwsAUAAKkIADCxBQAAqggAMLIFAACqCAAwswUAAKoIADC0BQAAqggAMLUFAACsCAAwtgUAAK0IADAaAwAA7QoAIAwAAOkKACATAADqCgAgGgAA6woAIBsAAOwKACAdAADuCgAgIAAA7woAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAECAAAAXAAgPAAA6AoAIAMAAABcACA8AADoCgAgPQAAsAgAIB4DAAC5BgAgDAAAswcAIBMAALQHACAaAAC1BwAgGwAAtgcAIB0AALcHACAeAACKBwAgIAAAuAcAIPgDAACyBwAw-QMAAFoAEPoDAACyBwAw-wMBAAAAAf8DQAC3BgAhiwQBAAAAAZMEQAC3BgAhoAQCAMsGACGhBAIAywYAIacEAQCCBwAhqAQBAAAAAakEAQC4BgAhqgQBALgGACGrBAEAuAYAIawEAQC4BgAhrQQBALgGACGuBAIAywYAIa8EAgDMBgAhsAQgALYGACGxBCAAtgYAIbIEIAC2BgAhswRAAIcHACECAAAAXAAgNQAAsAgAIAIAAACuCAAgNQAArwgAIBb4AwAArQgAMPkDAACuCAAQ-gMAAK0IADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIaAEAgDLBgAhoQQCAMsGACGnBAEAggcAIagEAQCCBwAhqQQBALgGACGqBAEAuAYAIasEAQC4BgAhrAQBALgGACGtBAEAuAYAIa4EAgDLBgAhrwQCAMwGACGwBCAAtgYAIbEEIAC2BgAhsgQgALYGACGzBEAAhwcAIRb4AwAArQgAMPkDAACuCAAQ-gMAAK0IADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIaAEAgDLBgAhoQQCAMsGACGnBAEAggcAIagEAQCCBwAhqQQBALgGACGqBAEAuAYAIasEAQC4BgAhrAQBALgGACGtBAEAuAYAIa4EAgDLBgAhrwQCAMwGACGwBCAAtgYAIbEEIAC2BgAhsgQgALYGACGzBEAAhwcAIRP7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIaAEAgD7BwAhoQQCAPsHACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIasEAQDsBwAhrAQBAOwHACGtBAEA7AcAIa4EAgD7BwAhrwQCAKIIACGwBCAA6gcAIbEEIADqBwAhsgQgAOoHACGzBEAAkAgAIRoDAAC1CAAgDAAAsQgAIBMAALIIACAaAACzCAAgGwAAtAgAIB0AALYIACAgAAC3CAAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGrBAEA7AcAIawEAQDsBwAhrQQBAOwHACGuBAIA-wcAIa8EAgCiCAAhsAQgAOoHACGxBCAA6gcAIbIEIADqBwAhswRAAJAIACELPAAA3QoAMD0AAOEKADCvBQAA3goAMLAFAADfCgAwsQUAALwJADCyBQAAvAkAMLMFAAC8CQAwtAUAALwJADC1BQAA4goAMLYFAAC_CQAwtwUAAOAKACALPAAA1AoAMD0AANgKADCvBQAA1QoAMLAFAADWCgAwsQUAAPsIADCyBQAA-wgAMLMFAAD7CAAwtAUAAPsIADC1BQAA2QoAMLYFAAD-CAAwtwUAANcKACALPAAAyQoAMD0AAM0KADCvBQAAygoAMLAFAADLCgAwsQUAAOsIADCyBQAA6wgAMLMFAADrCAAwtAUAAOsIADC1BQAAzgoAMLYFAADuCAAwtwUAAMwKACALPAAAvgoAMD0AAMIKADCvBQAAvwoAMLAFAADACgAwsQUAAMcIADCyBQAAxwgAMLMFAADHCAAwtAUAAMcIADC1BQAAwwoAMLYFAADKCAAwtwUAAMEKACAFPAAA0Q4AID0AALgPACCvBQAA0g4AILAFAAC3DwAgtAUAAJYCACAHPAAAuAoAID0AALsKACCvBQAAuQoAILAFAAC6CgAgsgUAAFIAILMFAABSACC0BQAAngUAIAo8AAC4CAAwPQAAvAgAMK8FAAC5CAAwsAUAALoIADCxBQAAuwgAMLIFAAC7CAAwswUAALsIADC0BQAAuwgAMLUFAAC9CAAwtgUAAL4IADANGwAAtwoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZsEIAAAAAGyBCAAAAABswRAAAAAAdAEAQAAAAHrBAEAAAAB7AQBAAAAAe0EAQAAAAHuBAIAAAAB7wQCAAAAAQIAAABXACA8AAC2CgAgAwAAAFcAIDwAALYKACA9AADBCAAgERsAALYHACAfAAC6BwAg-AMAALkHADD5AwAAVQAQ-gMAALkHADD_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZsEIAC2BgAhsgQgALYGACGzBEAAhwcAIdAEAQC4BgAh6wQBAAAAAewEAQC4BgAh7QQBAAAAAe4EAgDLBgAh7wQCAMsGACECAAAAVwAgNQAAwQgAIAIAAAC_CAAgNQAAwAgAIA_4AwAAvggAMPkDAAC_CAAQ-gMAAL4IADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGbBCAAtgYAIbIEIAC2BgAhswRAAIcHACHQBAEAuAYAIesEAQCCBwAh7AQBALgGACHtBAEAuAYAIe4EAgDLBgAh7wQCAMsGACEP-AMAAL4IADD5AwAAvwgAEPoDAAC-CAAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhmwQgALYGACGyBCAAtgYAIbMEQACHBwAh0AQBALgGACHrBAEAggcAIewEAQC4BgAh7QQBALgGACHuBAIAywYAIe8EAgDLBgAhDP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZsEIADqBwAhsgQgAOoHACGzBEAAkAgAIdAEAQDsBwAh6wQBAO0HACHsBAEA7AcAIe0EAQDsBwAh7gQCAPsHACHvBAIA-wcAIQ0bAADCCAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmwQgAOoHACGyBCAA6gcAIbMEQACQCAAh0AQBAOwHACHrBAEA7QcAIewEAQDsBwAh7QQBAOwHACHuBAIA-wcAIe8EAgD7BwAhCzwAAMMIADA9AADICAAwrwUAAMQIADCwBQAAxQgAMLEFAADHCAAwsgUAAMcIADCzBQAAxwgAMLQFAADHCAAwtQUAAMkIADC2BQAAyggAMLcFAADGCAAgHAsAAK8KACAMAACwCgAgEQAAsQoAIBMAALIKACAUAACzCgAgHAAAtAoAICMAALUKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAgAgAAAFAAIDwAAK0KACADAAAAUAAgPAAArQoAID0AANEIACABNQAAtg8AMCELAAC_BwAgDAAAswcAIBEAAMAHACATAAC0BwAgFAAAtQcAIBwAAM4GACAiAADBBwAgIwAAkAcAIPgDAAC7BwAw-QMAABoAEPoDAAC7BwAw_wNAALcGACGLBAEAAAABkwRAALcGACGYBAEAuAYAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAALwH2QQitgQBAIIHACHLBAAAvgfcBCLQBAEAggcAIdEEAQC4BgAh0gQBAIIHACHTBAEAuAYAIdQEIAC2BgAh1QQCAMwGACHWBAIAzAYAIdcEAQCCBwAh2gQAAL0H2gQi3AQAAMIGACDdBAEAuAYAIQIAAABQACA1AADRCAAgAgAAAMsIACA1AADMCAAgGfgDAADKCAAw-QMAAMsIABD6AwAAyggAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZgEAQC4BgAhmQQIAKUHACGfBAEAggcAIbIEIAC2BgAhswRAAIcHACG1BAAAvAfZBCK2BAEAggcAIcsEAAC-B9wEItAEAQCCBwAh0QQBALgGACHSBAEAggcAIdMEAQC4BgAh1AQgALYGACHVBAIAzAYAIdYEAgDMBgAh1wQBAIIHACHaBAAAvQfaBCLcBAAAwgYAIN0EAQC4BgAhGfgDAADKCAAw-QMAAMsIABD6AwAAyggAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZgEAQC4BgAhmQQIAKUHACGfBAEAggcAIbIEIAC2BgAhswRAAIcHACG1BAAAvAfZBCK2BAEAggcAIcsEAAC-B9wEItAEAQCCBwAh0QQBALgGACHSBAEAggcAIdMEAQC4BgAh1AQgALYGACHVBAIAzAYAIdYEAgDMBgAh1wQBAIIHACHaBAAAvQfaBCLcBAAAwgYAIN0EAQC4BgAhFf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAzQjZBCK2BAEA7QcAIcsEAADPCNwEItAEAQDtBwAh0QQBAOwHACHSBAEA7QcAIdMEAQDsBwAh1AQgAOoHACHVBAIAoggAIdYEAgCiCAAh1wQBAO0HACHaBAAAzgjaBCLcBAAA0AgAIAGxBQAAANkEAgGxBQAAANoEAgGxBQAAANwEAgKxBQEAAAAEuAUBAAAABRwLAADSCAAgDAAA0wgAIBEAANQIACATAADVCAAgFAAA1ggAIBwAANcIACAjAADYCAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmAQBAOwHACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAgCzwAAKEKADA9AACmCgAwrwUAAKIKADCwBQAAowoAMLEFAAClCgAwsgUAAKUKADCzBQAApQoAMLQFAAClCgAwtQUAAKcKADC2BQAAqAoAMLcFAACkCgAgCzwAALgJADA9AAC9CQAwrwUAALkJADCwBQAAugkAMLEFAAC8CQAwsgUAALwJADCzBQAAvAkAMLQFAAC8CQAwtQUAAL4JADC2BQAAvwkAMLcFAAC7CQAgCzwAAJsJADA9AACgCQAwrwUAAJwJADCwBQAAnQkAMLEFAACfCQAwsgUAAJ8JADCzBQAAnwkAMLQFAACfCQAwtQUAAKEJADC2BQAAogkAMLcFAACeCQAgCzwAAJAJADA9AACUCQAwrwUAAJEJADCwBQAAkgkAMLEFAAD7CAAwsgUAAPsIADCzBQAA-wgAMLQFAAD7CAAwtQUAAJUJADC2BQAA_ggAMLcFAACTCQAgCzwAAOcIADA9AADsCAAwrwUAAOgIADCwBQAA6QgAMLEFAADrCAAwsgUAAOsIADCzBQAA6wgAMLQFAADrCAAwtQUAAO0IADC2BQAA7ggAMLcFAADqCAAgBTwAAOYOACA9AAC0DwAgrwUAAOcOACCwBQAAsw8AILQFAABcACALPAAA2QgAMD0AAN4IADCvBQAA2ggAMLAFAADbCAAwsQUAAN0IADCyBQAA3QgAMLMFAADdCAAwtAUAAN0IADC1BQAA3wgAMLYFAADgCAAwtwUAANwIACAFAwAA5QgAIBUAAOYIACD7AwEAAAABiwQBAAAAAZMEQAAAAAECAAAAQwAgPAAA5AgAIAMAAABDACA8AADkCAAgPQAA4wgAIAE1AACyDwAwCwMAALkGACAKAADEBwAgFQAApgcAIPgDAADDBwAw-QMAAEEAEPoDAADDBwAw-wMBAIIHACGLBAEAAAABkwRAALcGACGUBAEAggcAIakFAADCBwAgAgAAAEMAIDUAAOMIACACAAAA4QgAIDUAAOIIACAH-AMAAOAIADD5AwAA4QgAEPoDAADgCAAw-wMBAIIHACGLBAEAggcAIZMEQAC3BgAhlAQBAIIHACEH-AMAAOAIADD5AwAA4QgAEPoDAADgCAAw-wMBAIIHACGLBAEAggcAIZMEQAC3BgAhlAQBAIIHACED-wMBAO0HACGLBAEA7QcAIZMEQADrBwAhBQMAAIIIACAVAACDCAAg-wMBAO0HACGLBAEA7QcAIZMEQADrBwAhBQMAAOUIACAVAADmCAAg-wMBAAAAAYsEAQAAAAGTBEAAAAABAzwAALAPACCvBQAAsQ8AILQFAACWAgAgAzwAAIQIADCvBQAAhQgAMLQFAACHCAAwDRIAAI0JACAZAACOCQAgHAAAjwkAIP8DQAAAAAGLBAEAAAABmQQIAAAAAZ8EAQAAAAHJBAEAAAABywQAAADLBALMBAAAjAkAIM0EAQAAAAHOBAEAAAABzwRAAAAAAQIAAAA3ACA8AACLCQAgAwAAADcAIDwAAIsJACA9AADzCAAgATUAAK8PADASCgAAxAcAIBIAALQHACAZAADJBwAgHAAAzgYAIPgDAADHBwAw-QMAADUAEPoDAADHBwAw_wNAALcGACGLBAEAAAABlAQBAIIHACGZBAgApQcAIZ8EAQCCBwAhyQQBAIIHACHLBAAAyAfLBCLMBAAAwgYAIM0EAQC4BgAhzgQBALgGACHPBEAAtwYAIQIAAAA3ACA1AADzCAAgAgAAAO8IACA1AADwCAAgDvgDAADuCAAw-QMAAO8IABD6AwAA7ggAMP8DQAC3BgAhiwQBAIIHACGUBAEAggcAIZkECAClBwAhnwQBAIIHACHJBAEAggcAIcsEAADIB8sEIswEAADCBgAgzQQBALgGACHOBAEAuAYAIc8EQAC3BgAhDvgDAADuCAAw-QMAAO8IABD6AwAA7ggAMP8DQAC3BgAhiwQBAIIHACGUBAEAggcAIZkECAClBwAhnwQBAIIHACHJBAEAggcAIcsEAADIB8sEIswEAADCBgAgzQQBALgGACHOBAEAuAYAIc8EQAC3BgAhCv8DQADrBwAhiwQBAO0HACGZBAgAjggAIZ8EAQDtBwAhyQQBAO0HACHLBAAA8QjLBCLMBAAA8ggAIM0EAQDsBwAhzgQBAOwHACHPBEAA6wcAIQGxBQAAAMsEAgKxBQEAAAAEuAUBAAAABQ0SAAD0CAAgGQAA9QgAIBwAAPYIACD_A0AA6wcAIYsEAQDtBwAhmQQIAI4IACGfBAEA7QcAIckEAQDtBwAhywQAAPEIywQizAQAAPIIACDNBAEA7AcAIc4EAQDsBwAhzwRAAOsHACELPAAA9wgAMD0AAPwIADCvBQAA-AgAMLAFAAD5CAAwsQUAAPsIADCyBQAA-wgAMLMFAAD7CAAwtAUAAPsIADC1BQAA_QgAMLYFAAD-CAAwtwUAAPoIACAFPAAAlw8AID0AAK0PACCvBQAAmA8AILAFAACsDwAgtAUAAD0AIAU8AACVDwAgPQAAqg8AIK8FAACWDwAgsAUAAKkPACC0BQAAXAAgFQoAAIgJACAZAACJCQAgHAAAigkAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHmBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABAgAAADAAIDwAAIcJACADAAAAMAAgPAAAhwkAID0AAIMJACABNQAAqA8AMBoKAADEBwAgGQAAyQcAIBwAAM4GACAhAADNBwAg-AMAAMoHADD5AwAALgAQ-gMAAMoHADD_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZQEAQCCBwAhmQQIAKUHACGfBAEAggcAIbIEIAC2BgAhswRAAIcHACG1BAAAywfoBCLLBAAAzAfgBCLgBEAAtwYAIeEEQACHBwAh4gRAAIcHACHkBAEAuAYAIeUEAQCCBwAh5gQBAIIHACHoBAIAzAYAIekEAQC4BgAh6gQBALgGACECAAAAMAAgNQAAgwkAIAIAAAD_CAAgNQAAgAkAIBb4AwAA_ggAMPkDAAD_CAAQ-gMAAP4IADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGUBAEAggcAIZkECAClBwAhnwQBAIIHACGyBCAAtgYAIbMEQACHBwAhtQQAAMsH6AQiywQAAMwH4AQi4ARAALcGACHhBEAAhwcAIeIEQACHBwAh5AQBALgGACHlBAEAggcAIeYEAQCCBwAh6AQCAMwGACHpBAEAuAYAIeoEAQC4BgAhFvgDAAD-CAAw-QMAAP8IABD6AwAA_ggAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQCCBwAhmQQIAKUHACGfBAEAggcAIbIEIAC2BgAhswRAAIcHACG1BAAAywfoBCLLBAAAzAfgBCLgBEAAtwYAIeEEQACHBwAh4gRAAIcHACHkBAEAuAYAIeUEAQCCBwAh5gQBAIIHACHoBAIAzAYAIekEAQC4BgAh6gQBALgGACES_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAACBCegEIssEAACCCeAEIuAEQADrBwAh4QRAAJAIACHiBEAAkAgAIeQEAQDsBwAh5gQBAO0HACHoBAIAoggAIekEAQDsBwAh6gQBAOwHACEBsQUAAADoBAIBsQUAAADgBAIVCgAAhAkAIBkAAIUJACAcAACGCQAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAACBCegEIssEAACCCeAEIuAEQADrBwAh4QRAAJAIACHiBEAAkAgAIeQEAQDsBwAh5gQBAO0HACHoBAIAoggAIekEAQDsBwAh6gQBAOwHACEFPAAAnQ8AID0AAKYPACCvBQAAng8AILAFAAClDwAgtAUAAFAAIAU8AACbDwAgPQAAow8AIK8FAACcDwAgsAUAAKIPACC0BQAAPQAgBTwAAJkPACA9AACgDwAgrwUAAJoPACCwBQAAnw8AILQFAABcACAVCgAAiAkAIBkAAIkJACAcAACKCQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZkECAAAAAGfBAEAAAABsgQgAAAAAbMEQAAAAAG1BAAAAOgEAssEAAAA4AQC4ARAAAAAAeEEQAAAAAHiBEAAAAAB5AQBAAAAAeYEAQAAAAHoBAIAAAAB6QQBAAAAAeoEAQAAAAEDPAAAnQ8AIK8FAACeDwAgtAUAAFAAIAM8AACbDwAgrwUAAJwPACC0BQAAPQAgAzwAAJkPACCvBQAAmg8AILQFAABcACANEgAAjQkAIBkAAI4JACAcAACPCQAg_wNAAAAAAYsEAQAAAAGZBAgAAAABnwQBAAAAAckEAQAAAAHLBAAAAMsEAswEAACMCQAgzQQBAAAAAc4EAQAAAAHPBEAAAAABAbEFAQAAAAQEPAAA9wgAMK8FAAD4CAAwtAUAAPsIADC3BQAA-ggAIAM8AACXDwAgrwUAAJgPACC0BQAAPQAgAzwAAJUPACCvBQAAlg8AILQFAABcACAVGQAAiQkAIBwAAIoJACAhAACaCQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA6AQCywQAAADgBALgBEAAAAAB4QRAAAAAAeIEQAAAAAHkBAEAAAAB5QQBAAAAAeYEAQAAAAHoBAIAAAAB6QQBAAAAAeoEAQAAAAECAAAAMAAgPAAAmQkAIAMAAAAwACA8AACZCQAgPQAAlwkAIAE1AACUDwAwAgAAADAAIDUAAJcJACACAAAA_wgAIDUAAJYJACAS_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAgQnoBCLLBAAAggngBCLgBEAA6wcAIeEEQACQCAAh4gRAAJAIACHkBAEA7AcAIeUEAQDtBwAh5gQBAO0HACHoBAIAoggAIekEAQDsBwAh6gQBAOwHACEVGQAAhQkAIBwAAIYJACAhAACYCQAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAgQnoBCLLBAAAggngBCLgBEAA6wcAIeEEQACQCAAh4gRAAJAIACHkBAEA7AcAIeUEAQDtBwAh5gQBAO0HACHoBAIAoggAIekEAQDsBwAh6gQBAOwHACEFPAAAjw8AID0AAJIPACCvBQAAkA8AILAFAACRDwAgtAUAADcAIBUZAACJCQAgHAAAigkAICEAAJoJACD_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHlBAEAAAAB5gQBAAAAAegEAgAAAAHpBAEAAAAB6gQBAAAAAQM8AACPDwAgrwUAAJAPACC0BQAANwAgDQ4AALYJACAPAAC3CQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAcsEAAAA4AQC3gQBAAAAAeAEQAAAAAHhBEAAAAAB4gRAAAAAAeMEAgAAAAHkBAEAAAABAgAAACYAIDwAALUJACADAAAAJgAgPAAAtQkAID0AAKUJACABNQAAjg8AMBIKAADSBwAgDgAA0QcAIA8AAKwHACD4AwAA0AcAMPkDAAAkABD6AwAA0AcAMP8DQAC3BgAhiwQBAAAAAZMEQAC3BgAhlAQBALgGACGZBAgApQcAIcsEAADMB-AEIt4EAQCCBwAh4ARAAIcHACHhBEAAhwcAIeIEQACHBwAh4wQCAMwGACHkBAEAuAYAIQIAAAAmACA1AAClCQAgAgAAAKMJACA1AACkCQAgD_gDAACiCQAw-QMAAKMJABD6AwAAogkAMP8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIZQEAQC4BgAhmQQIAKUHACHLBAAAzAfgBCLeBAEAggcAIeAEQACHBwAh4QRAAIcHACHiBEAAhwcAIeMEAgDMBgAh5AQBALgGACEP-AMAAKIJADD5AwAAowkAEPoDAACiCQAw_wNAALcGACGLBAEAggcAIZMEQAC3BgAhlAQBALgGACGZBAgApQcAIcsEAADMB-AEIt4EAQCCBwAh4ARAAIcHACHhBEAAhwcAIeIEQACHBwAh4wQCAMwGACHkBAEAuAYAIQv_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIcsEAACCCeAEIt4EAQDtBwAh4ARAAJAIACHhBEAAkAgAIeIEQACQCAAh4wQCAKIIACHkBAEA7AcAIQ0OAACmCQAgDwAApwkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhywQAAIIJ4AQi3gQBAO0HACHgBEAAkAgAIeEEQACQCAAh4gRAAJAIACHjBAIAoggAIeQEAQDsBwAhCzwAAKgJADA9AACtCQAwrwUAAKkJADCwBQAAqgkAMLEFAACsCQAwsgUAAKwJADCzBQAArAkAMLQFAACsCQAwtQUAAK4JADC2BQAArwkAMLcFAACrCQAgBTwAAIgPACA9AACMDwAgrwUAAIkPACCwBQAAiw8AILQFAAAiACAH-wMBAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAfcEAAAAwwQC-ARAAAAAAfkEQAAAAAECAAAAKgAgPAAAtAkAIAMAAAAqACA8AAC0CQAgPQAAswkAIAE1AACKDwAwDA0AAM8HACD4AwAAzgcAMPkDAAAoABD6AwAAzgcAMPsDAQCCBwAhiwQBAAAAAZMEQAC3BgAhmQQIAKUHACH2BAEAggcAIfcEAACuB8MEIvgEQACHBwAh-QRAAIcHACECAAAAKgAgNQAAswkAIAIAAACwCQAgNQAAsQkAIAv4AwAArwkAMPkDAACwCQAQ-gMAAK8JADD7AwEAggcAIYsEAQCCBwAhkwRAALcGACGZBAgApQcAIfYEAQCCBwAh9wQAAK4HwwQi-ARAAIcHACH5BEAAhwcAIQv4AwAArwkAMPkDAACwCQAQ-gMAAK8JADD7AwEAggcAIYsEAQCCBwAhkwRAALcGACGZBAgApQcAIfYEAQCCBwAh9wQAAK4HwwQi-ARAAIcHACH5BEAAhwcAIQf7AwEA7QcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIfcEAACyCcMEIvgEQACQCAAh-QRAAJAIACEBsQUAAADDBAIH-wMBAO0HACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACH3BAAAsgnDBCL4BEAAkAgAIfkEQACQCAAhB_sDAQAAAAGLBAEAAAABkwRAAAAAAZkECAAAAAH3BAAAAMMEAvgEQAAAAAH5BEAAAAABDQ4AALYJACAPAAC3CQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAcsEAAAA4AQC3gQBAAAAAeAEQAAAAAHhBEAAAAAB4gRAAAAAAeMEAgAAAAHkBAEAAAABBDwAAKgJADCvBQAAqQkAMLQFAACsCQAwtwUAAKsJACADPAAAiA8AIK8FAACJDwAgtAUAACIAIAsZAACcCgAgHAAAnQoAICQAAJ4KACAlAACfCgAgJwAAoAoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZ8EAQAAAAHJBAEAAAAB8AQgAAAAAQIAAAAiACA8AACbCgAgAwAAACIAIDwAAJsKACA9AADCCQAgATUAAIcPADARCgAA0gcAIBkAAIsHACAcAACOBwAgJAAAwAcAICUAANUHACAnAADWBwAg-AMAANQHADD5AwAAIAAQ-gMAANQHADD_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZQEAQC4BgAhnwQBALgGACHJBAEAuAYAIfAEIAC2BgAhqgUAANMHACACAAAAIgAgNQAAwgkAIAIAAADACQAgNQAAwQkAIAr4AwAAvwkAMPkDAADACQAQ-gMAAL8JADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGUBAEAuAYAIZ8EAQC4BgAhyQQBALgGACHwBCAAtgYAIQr4AwAAvwkAMPkDAADACQAQ-gMAAL8JADD_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGUBAEAuAYAIZ8EAQC4BgAhyQQBALgGACHwBCAAtgYAIQb_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGfBAEA7AcAIckEAQDsBwAh8AQgAOoHACELGQAAwwkAIBwAAMQJACAkAADFCQAgJQAAxgkAICcAAMcJACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGfBAEA7AcAIckEAQDsBwAh8AQgAOoHACEHPAAA6w4AID0AAIUPACCvBQAA7A4AILAFAACEDwAgsgUAADsAILMFAAA7ACC0BQAAPQAgBzwAAOkOACA9AACCDwAgrwUAAOoOACCwBQAAgQ8AILIFAABaACCzBQAAWgAgtAUAAFwAIAs8AACQCgAwPQAAlAoAMK8FAACRCgAwsAUAAJIKADCxBQAAnwkAMLIFAACfCQAwswUAAJ8JADC0BQAAnwkAMLUFAACVCgAwtgUAAKIJADC3BQAAkwoAIAs8AADUCQAwPQAA2QkAMK8FAADVCQAwsAUAANYJADCxBQAA2AkAMLIFAADYCQAwswUAANgJADC0BQAA2AkAMLUFAADaCQAwtgUAANsJADC3BQAA1wkAIAs8AADICQAwPQAAzQkAMK8FAADJCQAwsAUAAMoJADCxBQAAzAkAMLIFAADMCQAwswUAAMwJADC0BQAAzAkAMLUFAADOCQAwtgUAAM8JADC3BQAAywkAIAX7AwEAAAAB_wNAAAAAAYsEAQAAAAGNBCAAAAABjgQgAAAAAQIAAAB5ACA8AADTCQAgAwAAAHkAIDwAANMJACA9AADSCQAgATUAAIAPADALJgAArAcAIPgDAACrBwAw-QMAAHcAEPoDAACrBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGMBAEAggcAIY0EIAC2BgAhjgQgALYGACGoBQAAqgcAIAIAAAB5ACA1AADSCQAgAgAAANAJACA1AADRCQAgCfgDAADPCQAw-QMAANAJABD6AwAAzwkAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIYwEAQCCBwAhjQQgALYGACGOBCAAtgYAIQn4AwAAzwkAMPkDAADQCQAQ-gMAAM8JADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGMBAEAggcAIY0EIAC2BgAhjgQgALYGACEF-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhjQQgAOoHACGOBCAA6gcAIQX7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGNBCAA6gcAIY4EIADqBwAhBfsDAQAAAAH_A0AAAAABiwQBAAAAAY0EIAAAAAGOBCAAAAABCwcAAI4KACAJAACPCgAgiwQBAAAAAY4EIAAAAAGTBEAAAAABmQQIAAAAAbUEAAAAxQQCwQQBAAAAAcMEAAAAwwQCxQQBAAAAAccEAAAAxwQDAgAAAHUAIDwAAI0KACADAAAAdQAgPAAAjQoAID0AAOAJACABNQAA_w4AMBAHAACxBwAgCQAAjAcAICYAAKwHACD4AwAArQcAMPkDAABzABD6AwAArQcAMIsEAQAAAAGMBAEAggcAIY4EIAC2BgAhkwRAALcGACGZBAgApQcAIbUEAACvB8UEIsEEAQCCBwAhwwQAAK4HwwQixQQBALgGACHHBAAAsAfHBCMCAAAAdQAgNQAA4AkAIAIAAADcCQAgNQAA3QkAIA34AwAA2wkAMPkDAADcCQAQ-gMAANsJADCLBAEAggcAIYwEAQCCBwAhjgQgALYGACGTBEAAtwYAIZkECAClBwAhtQQAAK8HxQQiwQQBAIIHACHDBAAArgfDBCLFBAEAuAYAIccEAACwB8cEIw34AwAA2wkAMPkDAADcCQAQ-gMAANsJADCLBAEAggcAIYwEAQCCBwAhjgQgALYGACGTBEAAtwYAIZkECAClBwAhtQQAAK8HxQQiwQQBAIIHACHDBAAArgfDBCLFBAEAuAYAIccEAACwB8cEIwmLBAEA7QcAIY4EIADqBwAhkwRAAOsHACGZBAgAjggAIbUEAADeCcUEIsEEAQDtBwAhwwQAALIJwwQixQQBAOwHACHHBAAA3wnHBCMBsQUAAADFBAIBsQUAAADHBAMLBwAA4QkAIAkAAOIJACCLBAEA7QcAIY4EIADqBwAhkwRAAOsHACGZBAgAjggAIbUEAADeCcUEIsEEAQDtBwAhwwQAALIJwwQixQQBAOwHACHHBAAA3wnHBCMLPAAA8QkAMD0AAPYJADCvBQAA8gkAMLAFAADzCQAwsQUAAPUJADCyBQAA9QkAMLMFAAD1CQAwtAUAAPUJADC1BQAA9wkAMLYFAAD4CQAwtwUAAPQJACALPAAA4wkAMD0AAOgJADCvBQAA5AkAMLAFAADlCQAwsQUAAOcJADCyBQAA5wkAMLMFAADnCQAwtAUAAOcJADC1BQAA6QkAMLYFAADqCQAwtwUAAOYJACAHAwAA8AkAIPsDAQAAAAGLBAEAAAABkwRAAAAAAb4EAQAAAAG_BCAAAAABwAQIAAAAAQIAAAAYACA8AADvCQAgAwAAABgAIDwAAO8JACA9AADtCQAgATUAAP4OADANAwAAuQYAIAgAANsHACD4AwAA2gcAMPkDAAAWABD6AwAA2gcAMPsDAQCCBwAhiwQBAAAAAZMEQAC3BgAhvQQBAIIHACG-BAEAggcAIb8EIAC2BgAhwAQIAKUHACGsBQAA2QcAIAIAAAAYACA1AADtCQAgAgAAAOsJACA1AADsCQAgCvgDAADqCQAw-QMAAOsJABD6AwAA6gkAMPsDAQCCBwAhiwQBAIIHACGTBEAAtwYAIb0EAQCCBwAhvgQBAIIHACG_BCAAtgYAIcAECAClBwAhCvgDAADqCQAw-QMAAOsJABD6AwAA6gkAMPsDAQCCBwAhiwQBAIIHACGTBEAAtwYAIb0EAQCCBwAhvgQBAIIHACG_BCAAtgYAIcAECAClBwAhBvsDAQDtBwAhiwQBAO0HACGTBEAA6wcAIb4EAQDtBwAhvwQgAOoHACHABAgAjggAIQcDAADuCQAg-wMBAO0HACGLBAEA7QcAIZMEQADrBwAhvgQBAO0HACG_BCAA6gcAIcAECACOCAAhBTwAAPkOACA9AAD8DgAgrwUAAPoOACCwBQAA-w4AILQFAACWAgAgBwMAAPAJACD7AwEAAAABiwQBAAAAAZMEQAAAAAG-BAEAAAABvwQgAAAAAcAECAAAAAEDPAAA-Q4AIK8FAAD6DgAgtAUAAJYCACALKAAAjAoAIIsEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAY8FAgAAAAGQBSAAAAABkQUgAAAAAZIFIAAAAAECAAAAEwAgPAAAiwoAIAMAAAATACA8AACLCgAgPQAA-wkAIAE1AAD4DgAwEAgAANsHACAoAADdBwAg-AMAANwHADD5AwAAEQAQ-gMAANwHADCLBAEAAAABkwRAALcGACGVBAEAggcAIZYEAQCCBwAhlwQBAIIHACGYBAEAuAYAIb0EAQCCBwAhjwUCAMsGACGQBSAAtgYAIZEFIAC2BgAhkgUgALYGACECAAAAEwAgNQAA-wkAIAIAAAD5CQAgNQAA-gkAIA74AwAA-AkAMPkDAAD5CQAQ-gMAAPgJADCLBAEAggcAIZMEQAC3BgAhlQQBAIIHACGWBAEAggcAIZcEAQCCBwAhmAQBALgGACG9BAEAggcAIY8FAgDLBgAhkAUgALYGACGRBSAAtgYAIZIFIAC2BgAhDvgDAAD4CQAw-QMAAPkJABD6AwAA-AkAMIsEAQCCBwAhkwRAALcGACGVBAEAggcAIZYEAQCCBwAhlwQBAIIHACGYBAEAuAYAIb0EAQCCBwAhjwUCAMsGACGQBSAAtgYAIZEFIAC2BgAhkgUgALYGACEKiwQBAO0HACGTBEAA6wcAIZUEAQDtBwAhlgQBAO0HACGXBAEA7QcAIZgEAQDsBwAhjwUCAPsHACGQBSAA6gcAIZEFIADqBwAhkgUgAOoHACELKAAA_AkAIIsEAQDtBwAhkwRAAOsHACGVBAEA7QcAIZYEAQDtBwAhlwQBAO0HACGYBAEA7AcAIY8FAgD7BwAhkAUgAOoHACGRBSAA6gcAIZIFIADqBwAhCjwAAP0JADA9AACBCgAwrwUAAP4JADCwBQAA_wkAMLEFAACACgAwsgUAAIAKADCzBQAAgAoAMLQFAACACgAwtQUAAIIKADC2BQAAgwoAMAgGAACKCgAgiwQBAAAAAZAEAQAAAAGTBEAAAAAB9wQAAACdBQKbBQEAAAABnQUgAAAAAZ4FAQAAAAECAAAADwAgPAAAiQoAIAMAAAAPACA8AACJCgAgPQAAhwoAIAwGAADgBwAgBwAAsQcAIPgDAADeBwAw-QMAAA0AEPoDAADeBwAwiwQBAAAAAZAEAQCCBwAhkwRAALcGACH3BAAA3wedBSKbBQEAggcAIZ0FIAC2BgAhngUBALgGACECAAAADwAgNQAAhwoAIAIAAACECgAgNQAAhQoAIAr4AwAAgwoAMPkDAACECgAQ-gMAAIMKADCLBAEAggcAIZAEAQCCBwAhkwRAALcGACH3BAAA3wedBSKbBQEAggcAIZ0FIAC2BgAhngUBALgGACEK-AMAAIMKADD5AwAAhAoAEPoDAACDCgAwiwQBAIIHACGQBAEAggcAIZMEQAC3BgAh9wQAAN8HnQUimwUBAIIHACGdBSAAtgYAIZ4FAQC4BgAhB4sEAQDtBwAhkAQBAO0HACGTBEAA6wcAIfcEAACGCp0FIpsFAQDtBwAhnQUgAOoHACGeBQEA7AcAIQGxBQAAAJ0FAggGAACICgAgiwQBAO0HACGQBAEA7QcAIZMEQADrBwAh9wQAAIYKnQUimwUBAO0HACGdBSAA6gcAIZ4FAQDsBwAhBTwAAPMOACA9AAD2DgAgrwUAAPQOACCwBQAA9Q4AILQFAAALACAIBgAAigoAIIsEAQAAAAGQBAEAAAABkwRAAAAAAfcEAAAAnQUCmwUBAAAAAZ0FIAAAAAGeBQEAAAABAzwAAPMOACCvBQAA9A4AILQFAAALACALKAAAjAoAIIsEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAY8FAgAAAAGQBSAAAAABkQUgAAAAAZIFIAAAAAEDPAAA_QkAMK8FAAD-CQAwtAUAAIAKADALBwAAjgoAIAkAAI8KACCLBAEAAAABjgQgAAAAAZMEQAAAAAGZBAgAAAABtQQAAADFBALBBAEAAAABwwQAAADDBALFBAEAAAABxwQAAADHBAMEPAAA8QkAMK8FAADyCQAwtAUAAPUJADC3BQAA9AkAIAQ8AADjCQAwrwUAAOQJADC0BQAA5wkAMLcFAADmCQAgDQoAAJoKACAOAAC2CQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZkECAAAAAHLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeMEAgAAAAHkBAEAAAABAgAAACYAIDwAAJkKACADAAAAJgAgPAAAmQoAID0AAJcKACABNQAA8g4AMAIAAAAmACA1AACXCgAgAgAAAKMJACA1AACWCgAgC_8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhmQQIAI4IACHLBAAAggngBCLgBEAAkAgAIeEEQACQCAAh4gRAAJAIACHjBAIAoggAIeQEAQDsBwAhDQoAAJgKACAOAACmCQAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAOwHACGZBAgAjggAIcsEAACCCeAEIuAEQACQCAAh4QRAAJAIACHiBEAAkAgAIeMEAgCiCAAh5AQBAOwHACEHPAAA7Q4AID0AAPAOACCvBQAA7g4AILAFAADvDgAgsgUAABoAILMFAAAaACC0BQAAUAAgDQoAAJoKACAOAAC2CQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZkECAAAAAHLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeMEAgAAAAHkBAEAAAABAzwAAO0OACCvBQAA7g4AILQFAABQACALGQAAnAoAIBwAAJ0KACAkAACeCgAgJQAAnwoAICcAAKAKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGfBAEAAAAByQQBAAAAAfAEIAAAAAEDPAAA6w4AIK8FAADsDgAgtAUAAD0AIAM8AADpDgAgrwUAAOoOACC0BQAAXAAgBDwAAJAKADCvBQAAkQoAMLQFAACfCQAwtwUAAJMKACAEPAAA1AkAMK8FAADVCQAwtAUAANgJADC3BQAA1wkAIAQ8AADICQAwrwUAAMkJADC0BQAAzAkAMLcFAADLCQAgAosEAQAAAAHIBAEAAAABAgAAAB4AIDwAAKwKACADAAAAHgAgPAAArAoAID0AAKsKACABNQAA6A4AMAgKAADEBwAg-AMAANgHADD5AwAAHAAQ-gMAANgHADCLBAEAAAABlAQBAIIHACHIBAEAggcAIasFAADXBwAgAgAAAB4AIDUAAKsKACACAAAAqQoAIDUAAKoKACAG-AMAAKgKADD5AwAAqQoAEPoDAACoCgAwiwQBAIIHACGUBAEAggcAIcgEAQCCBwAhBvgDAACoCgAw-QMAAKkKABD6AwAAqAoAMIsEAQCCBwAhlAQBAIIHACHIBAEAggcAIQKLBAEA7QcAIcgEAQDtBwAhAosEAQDtBwAhyAQBAO0HACECiwQBAAAAAcgEAQAAAAEcCwAArwoAIAwAALAKACARAACxCgAgEwAAsgoAIBQAALMKACAcAAC0CgAgIwAAtQoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZgEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADZBAK2BAEAAAABywQAAADcBALQBAEAAAAB0QQBAAAAAdIEAQAAAAHTBAEAAAAB1AQgAAAAAdUEAgAAAAHWBAIAAAAB1wQBAAAAAdoEAAAA2gQC3AQAAK4KACABsQUBAAAABAQ8AAChCgAwrwUAAKIKADC0BQAApQoAMLcFAACkCgAgBDwAALgJADCvBQAAuQkAMLQFAAC8CQAwtwUAALsJACAEPAAAmwkAMK8FAACcCQAwtAUAAJ8JADC3BQAAngkAIAQ8AACQCQAwrwUAAJEJADC0BQAA-wgAMLcFAACTCQAgBDwAAOcIADCvBQAA6AgAMLQFAADrCAAwtwUAAOoIACADPAAA5g4AIK8FAADnDgAgtAUAAFwAIAQ8AADZCAAwrwUAANoIADC0BQAA3QgAMLcFAADcCAAgDRsAALcKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGbBCAAAAABsgQgAAAAAbMEQAAAAAHQBAEAAAAB6wQBAAAAAewEAQAAAAHtBAEAAAAB7gQCAAAAAe8EAgAAAAEEPAAAwwgAMK8FAADECAAwtAUAAMcIADC3BQAAxggAIAr_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAaIEAgAAAAGjBAIAAAABpAQCAAAAAaUEAgAAAAGmBAgAAAABAgAAAJ4FACA8AAC4CgAgAwAAAFIAIDwAALgKACA9AAC8CgAgDAAAAFIAIDUAALwKACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhogQCAPsHACGjBAIA-wcAIaQEAgD7BwAhpQQCAKIIACGmBAgAvQoAIQr_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhogQCAPsHACGjBAIA-wcAIaQEAgD7BwAhpQQCAKIIACGmBAgAvQoAIQWxBQgAAAABuQUIAAAAAboFCAAAAAG7BQgAAAABvAUIAAAAARwLAACvCgAgDAAAsAoAIBEAALEKACATAACyCgAgFAAAswoAICIAAMgKACAjAAC1CgAg_wNAAAAAAYsEAQAAAAGTBEAAAAABmAQBAAAAAZkECAAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAg3QQBAAAAAQIAAABQACA8AADHCgAgAwAAAFAAIDwAAMcKACA9AADFCgAgATUAAOUOADACAAAAUAAgNQAAxQoAIAIAAADLCAAgNQAAxAoAIBX_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGYBAEA7AcAIZkECACOCAAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAg3QQBAOwHACEcCwAA0ggAIAwAANMIACARAADUCAAgEwAA1QgAIBQAANYIACAiAADGCgAgIwAA2AgAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGyBCAA6gcAIbMEQACQCAAhtQQAAM0I2QQitgQBAO0HACHLBAAAzwjcBCLQBAEA7QcAIdEEAQDsBwAh0gQBAO0HACHTBAEA7AcAIdQEIADqBwAh1QQCAKIIACHWBAIAoggAIdcEAQDtBwAh2gQAAM4I2gQi3AQAANAIACDdBAEA7AcAIQc8AADgDgAgPQAA4w4AIK8FAADhDgAgsAUAAOIOACCyBQAAVQAgswUAAFUAILQFAABXACAcCwAArwoAIAwAALAKACARAACxCgAgEwAAsgoAIBQAALMKACAiAADICgAgIwAAtQoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZgEAQAAAAGZBAgAAAABsgQgAAAAAbMEQAAAAAG1BAAAANkEArYEAQAAAAHLBAAAANwEAtAEAQAAAAHRBAEAAAAB0gQBAAAAAdMEAQAAAAHUBCAAAAAB1QQCAAAAAdYEAgAAAAHXBAEAAAAB2gQAAADaBALcBAAArgoAIN0EAQAAAAEDPAAA4A4AIK8FAADhDgAgtAUAAFcAIA0KAADTCgAgEgAAjQkAIBkAAI4JACD_A0AAAAABiwQBAAAAAZQEAQAAAAGZBAgAAAAByQQBAAAAAcsEAAAAywQCzAQAAIwJACDNBAEAAAABzgQBAAAAAc8EQAAAAAECAAAANwAgPAAA0goAIAMAAAA3ACA8AADSCgAgPQAA0AoAIAE1AADfDgAwAgAAADcAIDUAANAKACACAAAA7wgAIDUAAM8KACAK_wNAAOsHACGLBAEA7QcAIZQEAQDtBwAhmQQIAI4IACHJBAEA7QcAIcsEAADxCMsEIswEAADyCAAgzQQBAOwHACHOBAEA7AcAIc8EQADrBwAhDQoAANEKACASAAD0CAAgGQAA9QgAIP8DQADrBwAhiwQBAO0HACGUBAEA7QcAIZkECACOCAAhyQQBAO0HACHLBAAA8QjLBCLMBAAA8ggAIM0EAQDsBwAhzgQBAOwHACHPBEAA6wcAIQU8AADaDgAgPQAA3Q4AIK8FAADbDgAgsAUAANwOACC0BQAAUAAgDQoAANMKACASAACNCQAgGQAAjgkAIP8DQAAAAAGLBAEAAAABlAQBAAAAAZkECAAAAAHJBAEAAAABywQAAADLBALMBAAAjAkAIM0EAQAAAAHOBAEAAAABzwRAAAAAAQM8AADaDgAgrwUAANsOACC0BQAAUAAgFQoAAIgJACAZAACJCQAgIQAAmgkAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABsgQgAAAAAbMEQAAAAAG1BAAAAOgEAssEAAAA4AQC4ARAAAAAAeEEQAAAAAHiBEAAAAAB5AQBAAAAAeUEAQAAAAHmBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABAgAAADAAIDwAANwKACADAAAAMAAgPAAA3AoAID0AANsKACABNQAA2Q4AMAIAAAAwACA1AADbCgAgAgAAAP8IACA1AADaCgAgEv8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhmQQIAI4IACGyBCAA6gcAIbMEQACQCAAhtQQAAIEJ6AQiywQAAIIJ4AQi4ARAAOsHACHhBEAAkAgAIeIEQACQCAAh5AQBAOwHACHlBAEA7QcAIeYEAQDtBwAh6AQCAKIIACHpBAEA7AcAIeoEAQDsBwAhFQoAAIQJACAZAACFCQAgIQAAmAkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhmQQIAI4IACGyBCAA6gcAIbMEQACQCAAhtQQAAIEJ6AQiywQAAIIJ4AQi4ARAAOsHACHhBEAAkAgAIeIEQACQCAAh5AQBAOwHACHlBAEA7QcAIeYEAQDtBwAh6AQCAKIIACHpBAEA7AcAIeoEAQDsBwAhFQoAAIgJACAZAACJCQAgIQAAmgkAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABsgQgAAAAAbMEQAAAAAG1BAAAAOgEAssEAAAA4AQC4ARAAAAAAeEEQAAAAAHiBEAAAAAB5AQBAAAAAeUEAQAAAAHmBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABCwoAAOcKACAZAACcCgAgJAAAngoAICUAAJ8KACAnAACgCgAg_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAckEAQAAAAHwBCAAAAABAgAAACIAIDwAAOYKACADAAAAIgAgPAAA5goAID0AAOQKACABNQAA2A4AMAIAAAAiACA1AADkCgAgAgAAAMAJACA1AADjCgAgBv8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhyQQBAOwHACHwBCAA6gcAIQsKAADlCgAgGQAAwwkAICQAAMUJACAlAADGCQAgJwAAxwkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhyQQBAOwHACHwBCAA6gcAIQc8AADTDgAgPQAA1g4AIK8FAADUDgAgsAUAANUOACCyBQAAGgAgswUAABoAILQFAABQACALCgAA5woAIBkAAJwKACAkAACeCgAgJQAAnwoAICcAAKAKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAAByQQBAAAAAfAEIAAAAAEDPAAA0w4AIK8FAADUDgAgtAUAAFAAIBoDAADtCgAgDAAA6QoAIBMAAOoKACAaAADrCgAgGwAA7AoAIB0AAO4KACAgAADvCgAg-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAaAEAgAAAAGhBAIAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAasEAQAAAAGsBAEAAAABrQQBAAAAAa4EAgAAAAGvBAIAAAABsAQgAAAAAbEEIAAAAAGyBCAAAAABswRAAAAAAQQ8AADdCgAwrwUAAN4KADC0BQAAvAkAMLcFAADgCgAgBDwAANQKADCvBQAA1QoAMLQFAAD7CAAwtwUAANcKACAEPAAAyQoAMK8FAADKCgAwtAUAAOsIADC3BQAAzAoAIAQ8AAC-CgAwrwUAAL8KADC0BQAAxwgAMLcFAADBCgAgAzwAANEOACCvBQAA0g4AILQFAACWAgAgAzwAALgKACCvBQAAuQoAILQFAACeBQAgAzwAALgIADCvBQAAuQgAMLQFAAC7CAAwBwcAAIQLACCLBAEAAAABkAQBAAAAAZMEQAAAAAH3BAAAAJ0FAp0FIAAAAAGeBQEAAAABAgAAAA8AIDwAAIMLACADAAAADwAgPAAAgwsAID0AAPcKACABNQAA0A4AMAIAAAAPACA1AAD3CgAgAgAAAIQKACA1AAD2CgAgBosEAQDtBwAhkAQBAO0HACGTBEAA6wcAIfcEAACGCp0FIp0FIADqBwAhngUBAOwHACEHBwAA-AoAIIsEAQDtBwAhkAQBAO0HACGTBEAA6wcAIfcEAACGCp0FIp0FIADqBwAhngUBAOwHACEKPAAA-QoAMD0AAPwKADCvBQAA-goAMLAFAAD7CgAwsQUAAPUJADCyBQAA9QkAMLMFAAD1CQAwtAUAAPUJADC1BQAA_QoAMLYFAAD4CQAwDAgAAIILACCLBAEAAAABkwRAAAAAAZUEAQAAAAGWBAEAAAABlwQBAAAAAZgEAQAAAAG9BAEAAAABjwUCAAAAAZAFIAAAAAGRBSAAAAABkgUgAAAAAQIAAAATACA8AACBCwAgAwAAABMAIDwAAIELACA9AAD_CgAgAgAAABMAIDUAAP8KACACAAAA-QkAIDUAAP4KACALiwQBAO0HACGTBEAA6wcAIZUEAQDtBwAhlgQBAO0HACGXBAEA7QcAIZgEAQDsBwAhvQQBAO0HACGPBQIA-wcAIZAFIADqBwAhkQUgAOoHACGSBSAA6gcAIQwIAACACwAgiwQBAO0HACGTBEAA6wcAIZUEAQDtBwAhlgQBAO0HACGXBAEA7QcAIZgEAQDsBwAhvQQBAO0HACGPBQIA-wcAIZAFIADqBwAhkQUgAOoHACGSBSAA6gcAIQU8AADLDgAgPQAAzg4AIK8FAADMDgAgsAUAAM0OACC0BQAAdQAgDAgAAIILACCLBAEAAAABkwRAAAAAAZUEAQAAAAGWBAEAAAABlwQBAAAAAZgEAQAAAAG9BAEAAAABjwUCAAAAAZAFIAAAAAGRBSAAAAABkgUgAAAAAQM8AADLDgAgrwUAAMwOACC0BQAAdQAgBwcAAIQLACCLBAEAAAABkAQBAAAAAZMEQAAAAAH3BAAAAJ0FAp0FIAAAAAGeBQEAAAABAzwAAPkKADCvBQAA-goAMLQFAAD1CQAwDQMAAIcLACAfAACICwAgJQAAhgsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAG2BAEAAAABlgUAAACWBQKXBSAAAAABmAUgAAAAAZkFAgAAAAGaBQEAAAABBDwAAPAKADCvBQAA8QoAMLQFAACACgAwtwUAAPMKACADPAAAyQ4AIK8FAADKDgAgtAUAAJYCACADPAAApwgAMK8FAACoCAAwtAUAAKoIADANCgAA0woAIBIAAI0JACAcAACPCQAg_wNAAAAAAYsEAQAAAAGUBAEAAAABmQQIAAAAAZ8EAQAAAAHLBAAAAMsEAswEAACMCQAgzQQBAAAAAc4EAQAAAAHPBEAAAAABAgAAADcAIDwAAJELACADAAAANwAgPAAAkQsAID0AAJALACABNQAAyA4AMAIAAAA3ACA1AACQCwAgAgAAAO8IACA1AACPCwAgCv8DQADrBwAhiwQBAO0HACGUBAEA7QcAIZkECACOCAAhnwQBAO0HACHLBAAA8QjLBCLMBAAA8ggAIM0EAQDsBwAhzgQBAOwHACHPBEAA6wcAIQ0KAADRCgAgEgAA9AgAIBwAAPYIACD_A0AA6wcAIYsEAQDtBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhywQAAPEIywQizAQAAPIIACDNBAEA7AcAIc4EAQDsBwAhzwRAAOsHACENCgAA0woAIBIAAI0JACAcAACPCQAg_wNAAAAAAYsEAQAAAAGUBAEAAAABmQQIAAAAAZ8EAQAAAAHLBAAAAMsEAswEAACMCQAgzQQBAAAAAc4EAQAAAAHPBEAAAAABFQoAAIgJACAcAACKCQAgIQAAmgkAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHlBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABAgAAADAAIDwAAJoLACADAAAAMAAgPAAAmgsAID0AAJkLACABNQAAxw4AMAIAAAAwACA1AACZCwAgAgAAAP8IACA1AACYCwAgEv8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAgQnoBCLLBAAAggngBCLgBEAA6wcAIeEEQACQCAAh4gRAAJAIACHkBAEA7AcAIeUEAQDtBwAh6AQCAKIIACHpBAEA7AcAIeoEAQDsBwAhFQoAAIQJACAcAACGCQAgIQAAmAkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAgQnoBCLLBAAAggngBCLgBEAA6wcAIeEEQACQCAAh4gRAAJAIACHkBAEA7AcAIeUEAQDtBwAh6AQCAKIIACHpBAEA7AcAIeoEAQDsBwAhFQoAAIgJACAcAACKCQAgIQAAmgkAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHlBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABCwoAAOcKACAcAACdCgAgJAAAngoAICUAAJ8KACAnAACgCgAg_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZ8EAQAAAAHwBCAAAAABAgAAACIAIDwAAKMLACADAAAAIgAgPAAAowsAID0AAKILACABNQAAxg4AMAIAAAAiACA1AACiCwAgAgAAAMAJACA1AAChCwAgBv8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhnwQBAOwHACHwBCAA6gcAIQsKAADlCgAgHAAAxAkAICQAAMUJACAlAADGCQAgJwAAxwkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhnwQBAOwHACHwBCAA6gcAIQsKAADnCgAgHAAAnQoAICQAAJ4KACAlAACfCgAgJwAAoAoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGfBAEAAAAB8AQgAAAAARgDAACrCwAgDAAApwsAIBMAAKgLACAUAACpCwAgFgAAqgsAIBcAAKwLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGuBAIAAAABsgQgAAAAAbMEQAAAAAHcBAAApgsAIPEEAQAAAAHyBAEAAAAB8wQBAAAAAfQEAAClCwAg9QQBAAAAAQGxBQEAAAAEAbEFAQAAAAQEPAAAmwsAMK8FAACcCwAwtAUAALwJADC3BQAAngsAIAQ8AACSCwAwrwUAAJMLADC0BQAA-wgAMLcFAACVCwAgBDwAAIkLADCvBQAAigsAMLQFAADrCAAwtwUAAIwLACADPAAAxA4AIK8FAADFDgAgtAUAAJABACADPAAAwg4AIK8FAADDDgAgtAUAAJYCACADPAAAmAgAMK8FAACZCAAwtAUAAJsIADADPAAAwA4AIK8FAADBDgAgtAUAAFAAIAAAAAAAArEFAQAAAAS4BQEAAAAFCzwAALYLADA9AAC6CwAwrwUAALcLADCwBQAAuAsAMLEFAACHCAAwsgUAAIcIADCzBQAAhwgAMLQFAACHCAAwtQUAALsLADC2BQAAiggAMLcFAAC5CwAgBTwAALoOACA9AAC-DgAgrwUAALsOACCwBQAAvQ4AILQFAACWAgAgFwMAAKsLACAMAACnCwAgEwAAqAsAIBQAAKkLACAXAACsCwAgGAAAyAsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACACAAAAPQAgPAAAxwsAIAMAAAA9ACA8AADHCwAgPQAAvQsAIAE1AAC8DgAwAgAAAD0AIDUAAL0LACACAAAAiwgAIDUAALwLACAR-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhrgQCAPsHACGyBCAA6gcAIbMEQACQCAAh3AQAAI8IACDxBAEA7AcAIfIEAQDsBwAh8wQBAOwHACH0BAAAjQgAIBcDAACWCAAgDAAAkggAIBMAAJMIACAUAACUCAAgFwAAlwgAIBgAAL4LACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGuBAIA-wcAIbIEIADqBwAhswRAAJAIACHcBAAAjwgAIPEEAQDsBwAh8gQBAOwHACHzBAEA7AcAIfQEAACNCAAgCjwAAL8LADA9AADCCwAwrwUAAMALADCwBQAAwQsAMLEFAADdCAAwsgUAAN0IADCzBQAA3QgAMLQFAADdCAAwtQUAAMMLADC2BQAA4AgAMAYDAADlCAAgCgAArQsAIPsDAQAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAECAAAAQwAgPAAAxgsAIAMAAABDACA8AADGCwAgPQAAxQsAIAIAAABDACA1AADFCwAgAgAAAOEIACA1AADECwAgBPsDAQDtBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhBgMAAIIIACAKAACBCAAg-wMBAO0HACGLBAEA7QcAIZMEQADrBwAhlAQBAO0HACEGAwAA5QgAIAoAAK0LACD7AwEAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABFwMAAKsLACAMAACnCwAgEwAAqAsAIBQAAKkLACAXAACsCwAgGAAAyAsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACADPAAAvwsAMK8FAADACwAwtAUAAN0IADABsQUBAAAABAQ8AAC2CwAwrwUAALcLADC0BQAAhwgAMLcFAAC5CwAgAzwAALoOACCvBQAAuw4AILQFAACWAgAgAAAAAAAFPAAAtQ4AID0AALgOACCvBQAAtg4AILAFAAC3DgAgtAUAAFwAIAM8AAC1DgAgrwUAALYOACC0BQAAXAAgDwMAAPAHACAMAADxDQAgEwAA8g0AIBoAAPMNACAbAAD0DQAgHQAA9Q0AIB4AAM4NACAgAAD2DQAgqQQAAOYHACCqBAAA5gcAIKsEAADmBwAgrAQAAOYHACCtBAAA5gcAIK8EAADmBwAgswQAAOYHACAAAAAAAAo8AADaCwAwPQAA3QsAMK8FAADbCwAwsAUAANwLADCxBQAAmwgAMLIFAACbCAAwswUAAJsIADC0BQAAmwgAMLUFAADeCwAwtgUAAJ4IADANAwAAhwsAIBUAAOsLACAlAACGCwAg-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAbYEAQAAAAGWBQAAAJYFApcFIAAAAAGYBSAAAAABmQUCAAAAAZoFAQAAAAECAAAACwAgPAAA6gsAIAMAAAALACA8AADqCwAgPQAA4AsAIAIAAAALACA1AADgCwAgAgAAAJ8IACA1AADfCwAgCvsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhtgQBAOwHACGWBQAAoQiWBSKXBSAA6gcAIZgFIADqBwAhmQUCAKIIACGaBQEA7AcAIQ0DAAClCAAgFQAA4QsAICUAAKQIACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIbYEAQDsBwAhlgUAAKEIlgUilwUgAOoHACGYBSAA6gcAIZkFAgCiCAAhmgUBAOwHACEKPAAA4gsAMD0AAOULADCvBQAA4wsAMLAFAADkCwAwsQUAAIcIADCyBQAAhwgAMLMFAACHCAAwtAUAAIcIADC1BQAA5gsAMLYFAACKCAAwGAMAAKsLACAMAACnCwAgEwAAqAsAIBQAAKkLACAWAACqCwAgGAAAyAsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACD1BAEAAAABAgAAAD0AIDwAAOkLACADAAAAPQAgPAAA6QsAID0AAOgLACACAAAAPQAgNQAA6AsAIAIAAACLCAAgNQAA5wsAIBL7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGuBAIA-wcAIbIEIADqBwAhswRAAJAIACHcBAAAjwgAIPEEAQDsBwAh8gQBAOwHACHzBAEA7AcAIfQEAACNCAAg9QQBAOwHACEYAwAAlggAIAwAAJIIACATAACTCAAgFAAAlAgAIBYAAJUIACAYAAC-CwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhrgQCAPsHACGyBCAA6gcAIbMEQACQCAAh3AQAAI8IACDxBAEA7AcAIfIEAQDsBwAh8wQBAOwHACH0BAAAjQgAIPUEAQDsBwAhGAMAAKsLACAMAACnCwAgEwAAqAsAIBQAAKkLACAWAACqCwAgGAAAyAsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACD1BAEAAAABDQMAAIcLACAVAADrCwAgJQAAhgsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAG2BAEAAAABlgUAAACWBQKXBSAAAAABmAUgAAAAAZkFAgAAAAGaBQEAAAABAzwAAOILADCvBQAA4wsAMLQFAACHCAAwAzwAANoLADCvBQAA2wsAMLQFAACbCAAwAAAAAbEFAAAAtQQCAbEFAAAAugQCBTwAALAOACA9AACzDgAgrwUAALEOACCwBQAAsg4AILQFAACWAgAgAzwAALAOACCvBQAAsQ4AILQFAACWAgAgAAAAAAAFPAAAqw4AID0AAK4OACCvBQAArA4AILAFAACtDgAgtAUAAHUAIAM8AACrDgAgrwUAAKwOACC0BQAAdQAgAAAAAAAFPAAApg4AID0AAKkOACCvBQAApw4AILAFAACoDgAgtAUAACIAIAM8AACmDgAgrwUAAKcOACC0BQAAIgAgAAAABTwAAKEOACA9AACkDgAgrwUAAKIOACCwBQAAow4AILQFAABQACADPAAAoQ4AIK8FAACiDgAgtAUAAFAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKPAAAoQwAMD0AAKQMADCvBQAAogwAMLAFAACjDAAwsQUAAKoIADCyBQAAqggAMLMFAACqCAAwtAUAAKoIADC1BQAApQwAMLYFAACtCAAwGgMAAO0KACAMAADpCgAgEwAA6goAIBoAAOsKACAbAADsCgAgHQAA7goAIB4AAOwLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABoAQCAAAAAaEEAgAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAEAAAABqwQBAAAAAawEAQAAAAGtBAEAAAABrgQCAAAAAa8EAgAAAAGwBCAAAAABsQQgAAAAAbIEIAAAAAGzBEAAAAABAgAAAFwAIDwAAKgMACADAAAAXAAgPAAAqAwAID0AAKcMACACAAAAXAAgNQAApwwAIAIAAACuCAAgNQAApgwAIBP7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIaAEAgD7BwAhoQQCAPsHACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIasEAQDsBwAhrAQBAOwHACGtBAEA7AcAIa4EAgD7BwAhrwQCAKIIACGwBCAA6gcAIbEEIADqBwAhsgQgAOoHACGzBEAAkAgAIRoDAAC1CAAgDAAAsQgAIBMAALIIACAaAACzCAAgGwAAtAgAIB0AALYIACAeAADZCwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGrBAEA7AcAIawEAQDsBwAhrQQBAOwHACGuBAIA-wcAIa8EAgCiCAAhsAQgAOoHACGxBCAA6gcAIbIEIADqBwAhswRAAJAIACEaAwAA7QoAIAwAAOkKACATAADqCgAgGgAA6woAIBsAAOwKACAdAADuCgAgHgAA7AsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAEDPAAAoQwAMK8FAACiDAAwtAUAAKoIADAAAAAAAAAAAAAAAAAABTwAAJwOACA9AACfDgAgrwUAAJ0OACCwBQAAng4AILQFAAAmACADPAAAnA4AIK8FAACdDgAgtAUAACYAIAAAAAAAAAU8AACXDgAgPQAAmg4AIK8FAACYDgAgsAUAAJkOACC0BQAAlgIAIAM8AACXDgAgrwUAAJgOACC0BQAAlgIAIAAAAAU8AACSDgAgPQAAlQ4AIK8FAACTDgAgsAUAAJQOACC0BQAAlgIAIAM8AACSDgAgrwUAAJMOACC0BQAAlgIAIAAAAAs8AAC0DQAwPQAAuQ0AMK8FAAC1DQAwsAUAALYNADCxBQAAuA0AMLIFAAC4DQAwswUAALgNADC0BQAAuA0AMLUFAAC6DQAwtgUAALsNADC3BQAAtw0AIAc8AACvDQAgPQAAsg0AIK8FAACwDQAgsAUAALENACCyBQAABwAgswUAAAcAILQFAAABACALPAAApg0AMD0AAKoNADCvBQAApw0AMLAFAACoDQAwsQUAAJsIADCyBQAAmwgAMLMFAACbCAAwtAUAAJsIADC1BQAAqw0AMLYFAACeCAAwtwUAAKkNACAHPAAAoQ0AID0AAKQNACCvBQAAog0AILAFAACjDQAgsgUAADsAILMFAAA7ACC0BQAAPQAgCzwAAJgNADA9AACcDQAwrwUAAJkNADCwBQAAmg0AMLEFAADnCQAwsgUAAOcJADCzBQAA5wkAMLQFAADnCQAwtQUAAJ0NADC2BQAA6gkAMLcFAACbDQAgCzwAAIwNADA9AACRDQAwrwUAAI0NADCwBQAAjg0AMLEFAACQDQAwsgUAAJANADCzBQAAkA0AMLQFAACQDQAwtQUAAJINADC2BQAAkw0AMLcFAACPDQAgBzwAAIcNACA9AACKDQAgrwUAAIgNACCwBQAAiQ0AILIFAABaACCzBQAAWgAgtAUAAFwAIAs8AAD7DAAwPQAAgA0AMK8FAAD8DAAwsAUAAP0MADCxBQAA_wwAMLIFAAD_DAAwswUAAP8MADC0BQAA_wwAMLUFAACBDQAwtgUAAIINADC3BQAA_gwAIAs8AADyDAAwPQAA9gwAMK8FAADzDAAwsAUAAPQMADCxBQAA3QgAMLIFAADdCAAwswUAAN0IADC0BQAA3QgAMLUFAAD3DAAwtgUAAOAIADC3BQAA9QwAIAs8AADmDAAwPQAA6wwAMK8FAADnDAAwsAUAAOgMADCxBQAA6gwAMLIFAADqDAAwswUAAOoMADC0BQAA6gwAMLUFAADsDAAwtgUAAO0MADC3BQAA6QwAIAc8AADhDAAgPQAA5AwAIK8FAADiDAAgsAUAAOMMACCyBQAAlwEAILMFAACXAQAgtAUAAI4GACALPAAA1QwAMD0AANoMADCvBQAA1gwAMLAFAADXDAAwsQUAANkMADCyBQAA2QwAMLMFAADZDAAwtAUAANkMADC1BQAA2wwAMLYFAADcDAAwtwUAANgMACAH_wNAAAAAAYsEAQAAAAGPBAEAAAABkAQBAAAAAZEEAgAAAAGSBAEAAAABkwRAAAAAAQIAAACbAQAgPAAA4AwAIAMAAACbAQAgPAAA4AwAID0AAN8MACABNQAAkQ4AMAwDAAC5BgAg-AMAAKIHADD5AwAAmQEAEPoDAACiBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGPBAEAggcAIZAEAQCCBwAhkQQCAMsGACGSBAEAuAYAIZMEQAC3BgAhAgAAAJsBACA1AADfDAAgAgAAAN0MACA1AADeDAAgC_gDAADcDAAw-QMAAN0MABD6AwAA3AwAMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIY8EAQCCBwAhkAQBAIIHACGRBAIAywYAIZIEAQC4BgAhkwRAALcGACEL-AMAANwMADD5AwAA3QwAEPoDAADcDAAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhjwQBAIIHACGQBAEAggcAIZEEAgDLBgAhkgQBALgGACGTBEAAtwYAIQf_A0AA6wcAIYsEAQDtBwAhjwQBAO0HACGQBAEA7QcAIZEEAgD7BwAhkgQBAOwHACGTBEAA6wcAIQf_A0AA6wcAIYsEAQDtBwAhjwQBAO0HACGQBAEA7QcAIZEEAgD7BwAhkgQBAOwHACGTBEAA6wcAIQf_A0AAAAABiwQBAAAAAY8EAQAAAAGQBAEAAAABkQQCAAAAAZIEAQAAAAGTBEAAAAABBPwDIAAAAAH9A0AAAAAB_gMBAAAAAf8DQAAAAAECAAAAjgYAIDwAAOEMACADAAAAlwEAIDwAAOEMACA9AADlDAAgBgAAAJcBACA1AADlDAAg_AMgAOoHACH9A0AA6wcAIf4DAQDsBwAh_wNAAOsHACEE_AMgAOoHACH9A0AA6wcAIf4DAQDsBwAh_wNAAOsHACEH_wNAAAAAAYsEAQAAAAGTBEAAAAAB_ARAAAAAAYYFAQAAAAGHBQEAAAABiAUBAAAAAQIAAACVAQAgPAAA8QwAIAMAAACVAQAgPAAA8QwAID0AAPAMACABNQAAkA4AMAwDAAC5BgAg-AMAAKMHADD5AwAAkwEAEPoDAACjBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIfwEQAC3BgAhhgUBAAAAAYcFAQC4BgAhiAUBALgGACECAAAAlQEAIDUAAPAMACACAAAA7gwAIDUAAO8MACAL-AMAAO0MADD5AwAA7gwAEPoDAADtDAAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACH8BEAAtwYAIYYFAQCCBwAhhwUBALgGACGIBQEAuAYAIQv4AwAA7QwAMPkDAADuDAAQ-gMAAO0MADD7AwEAggcAIf8DQAC3BgAhiwQBAIIHACGTBEAAtwYAIfwEQAC3BgAhhgUBAIIHACGHBQEAuAYAIYgFAQC4BgAhB_8DQADrBwAhiwQBAO0HACGTBEAA6wcAIfwEQADrBwAhhgUBAO0HACGHBQEA7AcAIYgFAQDsBwAhB_8DQADrBwAhiwQBAO0HACGTBEAA6wcAIfwEQADrBwAhhgUBAO0HACGHBQEA7AcAIYgFAQDsBwAhB_8DQAAAAAGLBAEAAAABkwRAAAAAAfwEQAAAAAGGBQEAAAABhwUBAAAAAYgFAQAAAAEFCgAArQsAIBUAAOYIACCLBAEAAAABkwRAAAAAAZQEAQAAAAECAAAAQwAgPAAA-gwAIAMAAABDACA8AAD6DAAgPQAA-QwAIAE1AACPDgAwAgAAAEMAIDUAAPkMACACAAAA4QgAIDUAAPgMACADiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhBQoAAIEIACAVAACDCAAgiwQBAO0HACGTBEAA6wcAIZQEAQDtBwAhBQoAAK0LACAVAADmCAAgiwQBAAAAAZMEQAAAAAGUBAEAAAABCxUAAMoLACD_A0AAAAABiwQBAAAAAZMEQAAAAAGVBAEAAAABlgQBAAAAAZcEAQAAAAGYBAEAAAABmQQIAAAAAZoEAADJCwAgmwQgAAAAAQIAAACQAQAgPAAAhg0AIAMAAACQAQAgPAAAhg0AID0AAIUNACABNQAAjg4AMBADAAC5BgAgFQAApgcAIPgDAACkBwAw-QMAADkAEPoDAACkBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIZUEAQCCBwAhlgQBALgGACGXBAEAuAYAIZgEAQC4BgAhmQQIAKUHACGaBAAAwgYAIJsEIAC2BgAhAgAAAJABACA1AACFDQAgAgAAAIMNACA1AACEDQAgDvgDAACCDQAw-QMAAIMNABD6AwAAgg0AMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAhlQQBAIIHACGWBAEAuAYAIZcEAQC4BgAhmAQBALgGACGZBAgApQcAIZoEAADCBgAgmwQgALYGACEO-AMAAIINADD5AwAAgw0AEPoDAACCDQAw-wMBAIIHACH_A0AAtwYAIYsEAQCCBwAhkwRAALcGACGVBAEAggcAIZYEAQC4BgAhlwQBALgGACGYBAEAuAYAIZkECAClBwAhmgQAAMIGACCbBCAAtgYAIQr_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGVBAEA7QcAIZYEAQDsBwAhlwQBAOwHACGYBAEA7AcAIZkECACOCAAhmgQAALMLACCbBCAA6gcAIQsVAAC0CwAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlQQBAO0HACGWBAEA7AcAIZcEAQDsBwAhmAQBAOwHACGZBAgAjggAIZoEAACzCwAgmwQgAOoHACELFQAAygsAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZUEAQAAAAGWBAEAAAABlwQBAAAAAZgEAQAAAAGZBAgAAAABmgQAAMkLACCbBCAAAAABGQwAAOkKACATAADqCgAgGgAA6woAIBsAAOwKACAdAADuCgAgHgAA7AsAICAAAO8KACD_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAECAAAAXAAgPAAAhw0AIAMAAABaACA8AACHDQAgPQAAiw0AIBsAAABaACAMAACxCAAgEwAAsggAIBoAALMIACAbAAC0CAAgHQAAtggAIB4AANkLACAgAAC3CAAgNQAAiw0AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIaAEAgD7BwAhoQQCAPsHACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIasEAQDsBwAhrAQBAOwHACGtBAEA7AcAIa4EAgD7BwAhrwQCAKIIACGwBCAA6gcAIbEEIADqBwAhsgQgAOoHACGzBEAAkAgAIRkMAACxCAAgEwAAsggAIBoAALMIACAbAAC0CAAgHQAAtggAIB4AANkLACAgAAC3CAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhoAQCAPsHACGhBAIA-wcAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhqwQBAOwHACGsBAEA7AcAIa0EAQDsBwAhrgQCAPsHACGvBAIAoggAIbAEIADqBwAhsQQgAOoHACGyBCAA6gcAIbMEQACQCAAhCwgBAAAAAYsEAQAAAAGOBCAAAAABkwRAAAAAAbUEAAAAtQQCtgQBAAAAAbcEAQAAAAG4BAEAAAABugQAAAC6BAK7BCAAAAABvARAAAAAAQIAAACMAQAgPAAAlw0AIAMAAACMAQAgPAAAlw0AID0AAJYNACABNQAAjQ4AMBADAAC5BgAgCAEAggcAIfgDAACnBwAw-QMAAIoBABD6AwAApwcAMPsDAQCCBwAhiwQBAAAAAY4EIAC2BgAhkwRAALcGACG1BAAAqAe1BCK2BAEAuAYAIbcEAQC4BgAhuAQBALgGACG6BAAAqQe6BCK7BCAAtgYAIbwEQACHBwAhAgAAAIwBACA1AACWDQAgAgAAAJQNACA1AACVDQAgDwgBAIIHACH4AwAAkw0AMPkDAACUDQAQ-gMAAJMNADD7AwEAggcAIYsEAQCCBwAhjgQgALYGACGTBEAAtwYAIbUEAACoB7UEIrYEAQC4BgAhtwQBALgGACG4BAEAuAYAIboEAACpB7oEIrsEIAC2BgAhvARAAIcHACEPCAEAggcAIfgDAACTDQAw-QMAAJQNABD6AwAAkw0AMPsDAQCCBwAhiwQBAIIHACGOBCAAtgYAIZMEQAC3BgAhtQQAAKgHtQQitgQBALgGACG3BAEAuAYAIbgEAQC4BgAhugQAAKkHugQiuwQgALYGACG8BEAAhwcAIQsIAQDtBwAhiwQBAO0HACGOBCAA6gcAIZMEQADrBwAhtQQAAPALtQQitgQBAOwHACG3BAEA7AcAIbgEAQDsBwAhugQAAPELugQiuwQgAOoHACG8BEAAkAgAIQsIAQDtBwAhiwQBAO0HACGOBCAA6gcAIZMEQADrBwAhtQQAAPALtQQitgQBAOwHACG3BAEA7AcAIbgEAQDsBwAhugQAAPELugQiuwQgAOoHACG8BEAAkAgAIQsIAQAAAAGLBAEAAAABjgQgAAAAAZMEQAAAAAG1BAAAALUEArYEAQAAAAG3BAEAAAABuAQBAAAAAboEAAAAugQCuwQgAAAAAbwEQAAAAAEHCAAA-gsAIIsEAQAAAAGTBEAAAAABvQQBAAAAAb4EAQAAAAG_BCAAAAABwAQIAAAAAQIAAAAYACA8AACgDQAgAwAAABgAIDwAAKANACA9AACfDQAgATUAAIwOADACAAAAGAAgNQAAnw0AIAIAAADrCQAgNQAAng0AIAaLBAEA7QcAIZMEQADrBwAhvQQBAO0HACG-BAEA7QcAIb8EIADqBwAhwAQIAI4IACEHCAAA-QsAIIsEAQDtBwAhkwRAAOsHACG9BAEA7QcAIb4EAQDtBwAhvwQgAOoHACHABAgAjggAIQcIAAD6CwAgiwQBAAAAAZMEQAAAAAG9BAEAAAABvgQBAAAAAb8EIAAAAAHABAgAAAABFwwAAKcLACATAACoCwAgFAAAqQsAIBYAAKoLACAXAACsCwAgGAAAyAsAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZkECAAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAEAAAABrgQCAAAAAbIEIAAAAAGzBEAAAAAB3AQAAKYLACDxBAEAAAAB8gQBAAAAAfMEAQAAAAH0BAAApQsAIPUEAQAAAAECAAAAPQAgPAAAoQ0AIAMAAAA7ACA8AAChDQAgPQAApQ0AIBkAAAA7ACAMAACSCAAgEwAAkwgAIBQAAJQIACAWAACVCAAgFwAAlwgAIBgAAL4LACA1AAClDQAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIa4EAgD7BwAhsgQgAOoHACGzBEAAkAgAIdwEAACPCAAg8QQBAOwHACHyBAEA7AcAIfMEAQDsBwAh9AQAAI0IACD1BAEA7AcAIRcMAACSCAAgEwAAkwgAIBQAAJQIACAWAACVCAAgFwAAlwgAIBgAAL4LACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhrgQCAPsHACGyBCAA6gcAIbMEQACQCAAh3AQAAI8IACDxBAEA7AcAIfIEAQDsBwAh8wQBAOwHACH0BAAAjQgAIPUEAQDsBwAhDBUAAOsLACAfAACICwAgJQAAhgsAIP8DQAAAAAGLBAEAAAABkwRAAAAAAbYEAQAAAAGWBQAAAJYFApcFIAAAAAGYBSAAAAABmQUCAAAAAZoFAQAAAAECAAAACwAgPAAArg0AIAMAAAALACA8AACuDQAgPQAArQ0AIAE1AACLDgAwAgAAAAsAIDUAAK0NACACAAAAnwgAIDUAAKwNACAJ_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhtgQBAOwHACGWBQAAoQiWBSKXBSAA6gcAIZgFIADqBwAhmQUCAKIIACGaBQEA7AcAIQwVAADhCwAgHwAApggAICUAAKQIACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACG2BAEA7AcAIZYFAAChCJYFIpcFIADqBwAhmAUgAOoHACGZBQIAoggAIZoFAQDsBwAhDBUAAOsLACAfAACICwAgJQAAhgsAIP8DQAAAAAGLBAEAAAABkwRAAAAAAbYEAQAAAAGWBQAAAJYFApcFIAAAAAGYBSAAAAABmQUCAAAAAZoFAQAAAAEM_wNAAAAAAYsEAQAAAAGTBEAAAAABqAQBAAAAAakEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAABnwUBAAAAAaAFgAAAAAGhBUAAAAABAgAAAAEAIDwAAK8NACADAAAABwAgPAAArw0AID0AALMNACAOAAAABwAgNQAAsw0AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhqQQBAOwHACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIZ8FAQDsBwAhoAWAAAAAAaEFQACQCAAhDP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhqQQBAOwHACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIZ8FAQDsBwAhoAWAAAAAAaEFQACQCAAhDP8DQAAAAAGLBAEAAAABkwRAAAAAAf0EAQAAAAH-BAEAAAAB_wQBAAAAAYAFAQAAAAGBBQEAAAABggVAAAAAAYMFQAAAAAGEBQEAAAABhQUBAAAAAQIAAAAFACA8AAC_DQAgAwAAAAUAIDwAAL8NACA9AAC-DQAgATUAAIoOADARAwAAuQYAIPgDAADlBwAw-QMAAAMAEPoDAADlBwAw-wMBAIIHACH_A0AAtwYAIYsEAQAAAAGTBEAAtwYAIf0EAQCCBwAh_gQBAIIHACH_BAEAuAYAIYAFAQC4BgAhgQUBALgGACGCBUAAhwcAIYMFQACHBwAhhAUBALgGACGFBQEAuAYAIQIAAAAFACA1AAC-DQAgAgAAALwNACA1AAC9DQAgEPgDAAC7DQAw-QMAALwNABD6AwAAuw0AMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAh_QQBAIIHACH-BAEAggcAIf8EAQC4BgAhgAUBALgGACGBBQEAuAYAIYIFQACHBwAhgwVAAIcHACGEBQEAuAYAIYUFAQC4BgAhEPgDAAC7DQAw-QMAALwNABD6AwAAuw0AMPsDAQCCBwAh_wNAALcGACGLBAEAggcAIZMEQAC3BgAh_QQBAIIHACH-BAEAggcAIf8EAQC4BgAhgAUBALgGACGBBQEAuAYAIYIFQACHBwAhgwVAAIcHACGEBQEAuAYAIYUFAQC4BgAhDP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIf0EAQDtBwAh_gQBAO0HACH_BAEA7AcAIYAFAQDsBwAhgQUBAOwHACGCBUAAkAgAIYMFQACQCAAhhAUBAOwHACGFBQEA7AcAIQz_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACH9BAEA7QcAIf4EAQDtBwAh_wQBAOwHACGABQEA7AcAIYEFAQDsBwAhggVAAJAIACGDBUAAkAgAIYQFAQDsBwAhhQUBAOwHACEM_wNAAAAAAYsEAQAAAAGTBEAAAAAB_QQBAAAAAf4EAQAAAAH_BAEAAAABgAUBAAAAAYEFAQAAAAGCBUAAAAABgwVAAAAAAYQFAQAAAAGFBQEAAAABBDwAALQNADCvBQAAtQ0AMLQFAAC4DQAwtwUAALcNACADPAAArw0AIK8FAACwDQAgtAUAAAEAIAQ8AACmDQAwrwUAAKcNADC0BQAAmwgAMLcFAACpDQAgAzwAAKENACCvBQAAog0AILQFAAA9ACAEPAAAmA0AMK8FAACZDQAwtAUAAOcJADC3BQAAmw0AIAQ8AACMDQAwrwUAAI0NADC0BQAAkA0AMLcFAACPDQAgAzwAAIcNACCvBQAAiA0AILQFAABcACAEPAAA-wwAMK8FAAD8DAAwtAUAAP8MADC3BQAA_gwAIAQ8AADyDAAwrwUAAPMMADC0BQAA3QgAMLcFAAD1DAAgBDwAAOYMADCvBQAA5wwAMLQFAADqDAAwtwUAAOkMACADPAAA4QwAIK8FAADiDAAgtAUAAI4GACAEPAAA1QwAMK8FAADWDAAwtAUAANkMADC3BQAA2AwAIAAGAwAA8AcAIKkEAADmBwAgswQAAOYHACCfBQAA5gcAIKAFAADmBwAgoQUAAOYHACAADwMAAPAHACAMAADxDQAgEwAA8g0AIBQAAPMNACAWAAD8DQAgFwAAzg0AIBgAANMNACCZBAAA5gcAIKkEAADmBwAgqgQAAOYHACCzBAAA5gcAIPEEAADmBwAg8gQAAOYHACDzBAAA5gcAIPUEAADmBwAgAAAAAAACAwAA8AcAIP4DAADmBwAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU8AACFDgAgPQAAiA4AIK8FAACGDgAgsAUAAIcOACC0BQAAlgIAIAM8AACFDgAgrwUAAIYOACC0BQAAlgIAIAAJCgAA-w0AIBkAAM8NACAcAADTCwAgJAAA-Q0AICUAAIAOACAnAACBDgAglAQAAOYHACCfBAAA5gcAIMkEAADmBwAgAAAAAAACHAAA0wsAIKUEAADmBwAgAAAAAAYbAAD0DQAgHwAA9w0AILMEAADmBwAg0AQAAOYHACDsBAAA5gcAIO0EAADmBwAgEAsAAPgNACAMAADxDQAgEQAA-Q0AIBMAAPINACAUAADzDQAgHAAA0wsAICIAAPoNACAjAADTDQAgmAQAAOYHACCZBAAA5gcAILMEAADmBwAg0QQAAOYHACDTBAAA5gcAINUEAADmBwAg1gQAAOYHACDdBAAA5gcAIAYDAADwBwAgFQAA7g0AIJYEAADmBwAglwQAAOYHACCYBAAA5gcAIJkEAADmBwAgBwoAAPsNACASAADyDQAgGQAAzw0AIBwAANMLACCZBAAA5gcAIM0EAADmBwAgzgQAAOYHACAKCgAA-w0AIA4AAP8NACAPAADvDQAglAQAAOYHACCZBAAA5gcAIOAEAADmBwAg4QQAAOYHACDiBAAA5gcAIOMEAADmBwAg5AQAAOYHACAAAAAGBwAA8A0AIAkAANANACAmAADvDQAgmQQAAOYHACDFBAAA5gcAIMcEAADmBwAgAAcDAADwBwAgFQAA7g0AIB8AAPcNACAlAACDDgAgtgQAAOYHACCZBQAA5gcAIJoFAADmBwAgFwQAAMANACAVAADDDQAgGAAAyA0AIB8AAMYNACApAADCDQAgKgAAxA0AICsAAMUNACAsAADHDQAgLQAAyQ0AIC4AAMoNACAvAADLDQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABqAQBAAAAAbIEIAAAAAGzBEAAAAABywQBAAAAAesEAQAAAAH3BAEAAAABiQUgAAAAAYoFAQAAAAGLBSAAAAABAgAAAJYCACA8AACFDgAgAwAAAJkCACA8AACFDgAgPQAAiQ4AIBkAAACZAgAgBAAAyQwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACAqAADNDAAgKwAAzgwAICwAANAMACAtAADSDAAgLgAA0wwAIC8AANQMACA1AACJDgAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhqAQBAO0HACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIfcEAQDtBwAhiQUgAOoHACGKBQEA7AcAIYsFIADqBwAhFwQAAMkMACAVAADMDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKgAAzQwAICsAAM4MACAsAADQDAAgLQAA0gwAIC4AANMMACAvAADUDAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhqAQBAO0HACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIfcEAQDtBwAhiQUgAOoHACGKBQEA7AcAIYsFIADqBwAhDP8DQAAAAAGLBAEAAAABkwRAAAAAAf0EAQAAAAH-BAEAAAAB_wQBAAAAAYAFAQAAAAGBBQEAAAABggVAAAAAAYMFQAAAAAGEBQEAAAABhQUBAAAAAQn_A0AAAAABiwQBAAAAAZMEQAAAAAG2BAEAAAABlgUAAACWBQKXBSAAAAABmAUgAAAAAZkFAgAAAAGaBQEAAAABBosEAQAAAAGTBEAAAAABvQQBAAAAAb4EAQAAAAG_BCAAAAABwAQIAAAAAQsIAQAAAAGLBAEAAAABjgQgAAAAAZMEQAAAAAG1BAAAALUEArYEAQAAAAG3BAEAAAABuAQBAAAAAboEAAAAugQCuwQgAAAAAbwEQAAAAAEK_wNAAAAAAYsEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAZkECAAAAAGaBAAAyQsAIJsEIAAAAAEDiwQBAAAAAZMEQAAAAAGUBAEAAAABB_8DQAAAAAGLBAEAAAABkwRAAAAAAfwEQAAAAAGGBQEAAAABhwUBAAAAAYgFAQAAAAEH_wNAAAAAAYsEAQAAAAGPBAEAAAABkAQBAAAAAZEEAgAAAAGSBAEAAAABkwRAAAAAARcEAADADQAgBQAAwQ0AIBUAAMMNACAYAADIDQAgHwAAxg0AICkAAMINACAqAADEDQAgKwAAxQ0AICwAAMcNACAuAADKDQAgLwAAyw0AIP8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAAB9wQBAAAAAYkFIAAAAAGKBQEAAAABiwUgAAAAAQIAAACWAgAgPAAAkg4AIAMAAACZAgAgPAAAkg4AID0AAJYOACAZAAAAmQIAIAQAAMkMACAFAADKDAAgFQAAzAwAIBgAANEMACAfAADPDAAgKQAAywwAICoAAM0MACArAADODAAgLAAA0AwAIC4AANMMACAvAADUDAAgNQAAlg4AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACAqAADNDAAgKwAAzgwAICwAANAMACAuAADTDAAgLwAA1AwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcFAADBDQAgFQAAww0AIBgAAMgNACAfAADGDQAgKQAAwg0AICoAAMQNACArAADFDQAgLAAAxw0AIC0AAMkNACAuAADKDQAgLwAAyw0AIP8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAAB9wQBAAAAAYkFIAAAAAGKBQEAAAABiwUgAAAAAQIAAACWAgAgPAAAlw4AIAMAAACZAgAgPAAAlw4AID0AAJsOACAZAAAAmQIAIAUAAMoMACAVAADMDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKgAAzQwAICsAAM4MACAsAADQDAAgLQAA0gwAIC4AANMMACAvAADUDAAgNQAAmw4AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcFAADKDAAgFQAAzAwAIBgAANEMACAfAADPDAAgKQAAywwAICoAAM0MACArAADODAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIQ4KAACaCgAgDwAAtwkAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABywQAAADgBALeBAEAAAAB4ARAAAAAAeEEQAAAAAHiBEAAAAAB4wQCAAAAAeQEAQAAAAECAAAAJgAgPAAAnA4AIAMAAAAkACA8AACcDgAgPQAAoA4AIBAAAAAkACAKAACYCgAgDwAApwkAIDUAAKAOACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7AcAIZkECACOCAAhywQAAIIJ4AQi3gQBAO0HACHgBEAAkAgAIeEEQACQCAAh4gRAAJAIACHjBAIAoggAIeQEAQDsBwAhDgoAAJgKACAPAACnCQAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAOwHACGZBAgAjggAIcsEAACCCeAEIt4EAQDtBwAh4ARAAJAIACHhBEAAkAgAIeIEQACQCAAh4wQCAKIIACHkBAEA7AcAIR0MAACwCgAgEQAAsQoAIBMAALIKACAUAACzCgAgHAAAtAoAICIAAMgKACAjAAC1CgAg_wNAAAAAAYsEAQAAAAGTBEAAAAABmAQBAAAAAZkECAAAAAGfBAEAAAABsgQgAAAAAbMEQAAAAAG1BAAAANkEArYEAQAAAAHLBAAAANwEAtAEAQAAAAHRBAEAAAAB0gQBAAAAAdMEAQAAAAHUBCAAAAAB1QQCAAAAAdYEAgAAAAHXBAEAAAAB2gQAAADaBALcBAAArgoAIN0EAQAAAAECAAAAUAAgPAAAoQ4AIAMAAAAaACA8AAChDgAgPQAApQ4AIB8AAAAaACAMAADTCAAgEQAA1AgAIBMAANUIACAUAADWCAAgHAAA1wgAICIAAMYKACAjAADYCAAgNQAApQ4AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAzQjZBCK2BAEA7QcAIcsEAADPCNwEItAEAQDtBwAh0QQBAOwHACHSBAEA7QcAIdMEAQDsBwAh1AQgAOoHACHVBAIAoggAIdYEAgCiCAAh1wQBAO0HACHaBAAAzgjaBCLcBAAA0AgAIN0EAQDsBwAhHQwAANMIACARAADUCAAgEwAA1QgAIBQAANYIACAcAADXCAAgIgAAxgoAICMAANgIACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGYBAEA7AcAIZkECACOCAAhnwQBAO0HACGyBCAA6gcAIbMEQACQCAAhtQQAAM0I2QQitgQBAO0HACHLBAAAzwjcBCLQBAEA7QcAIdEEAQDsBwAh0gQBAO0HACHTBAEA7AcAIdQEIADqBwAh1QQCAKIIACHWBAIAoggAIdcEAQDtBwAh2gQAAM4I2gQi3AQAANAIACDdBAEA7AcAIQwKAADnCgAgGQAAnAoAIBwAAJ0KACAkAACeCgAgJwAAoAoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGfBAEAAAAByQQBAAAAAfAEIAAAAAECAAAAIgAgPAAApg4AIAMAAAAgACA8AACmDgAgPQAAqg4AIA4AAAAgACAKAADlCgAgGQAAwwkAIBwAAMQJACAkAADFCQAgJwAAxwkAIDUAAKoOACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7AcAIZ8EAQDsBwAhyQQBAOwHACHwBCAA6gcAIQwKAADlCgAgGQAAwwkAIBwAAMQJACAkAADFCQAgJwAAxwkAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZQEAQDsBwAhnwQBAOwHACHJBAEA7AcAIfAEIADqBwAhDAcAAI4KACAmAACBDAAgiwQBAAAAAYwEAQAAAAGOBCAAAAABkwRAAAAAAZkECAAAAAG1BAAAAMUEAsEEAQAAAAHDBAAAAMMEAsUEAQAAAAHHBAAAAMcEAwIAAAB1ACA8AACrDgAgAwAAAHMAIDwAAKsOACA9AACvDgAgDgAAAHMAIAcAAOEJACAmAACADAAgNQAArw4AIIsEAQDtBwAhjAQBAO0HACGOBCAA6gcAIZMEQADrBwAhmQQIAI4IACG1BAAA3gnFBCLBBAEA7QcAIcMEAACyCcMEIsUEAQDsBwAhxwQAAN8JxwQjDAcAAOEJACAmAACADAAgiwQBAO0HACGMBAEA7QcAIY4EIADqBwAhkwRAAOsHACGZBAgAjggAIbUEAADeCcUEIsEEAQDtBwAhwwQAALIJwwQixQQBAOwHACHHBAAA3wnHBCMXBAAAwA0AIAUAAMENACAVAADDDQAgGAAAyA0AIB8AAMYNACApAADCDQAgKgAAxA0AICwAAMcNACAtAADJDQAgLgAAyg0AIC8AAMsNACD_A0AAAAABiwQBAAAAAZMEQAAAAAGoBAEAAAABsgQgAAAAAbMEQAAAAAHLBAEAAAAB6wQBAAAAAfcEAQAAAAGJBSAAAAABigUBAAAAAYsFIAAAAAECAAAAlgIAIDwAALAOACADAAAAmQIAIDwAALAOACA9AAC0DgAgGQAAAJkCACAEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACAqAADNDAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIDUAALQOACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEXBAAAyQwAIAUAAMoMACAVAADMDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKgAAzQwAICwAANAMACAtAADSDAAgLgAA0wwAIC8AANQMACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEaAwAA7QoAIAwAAOkKACATAADqCgAgGgAA6woAIBsAAOwKACAeAADsCwAgIAAA7woAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAECAAAAXAAgPAAAtQ4AIAMAAABaACA8AAC1DgAgPQAAuQ4AIBwAAABaACADAAC1CAAgDAAAsQgAIBMAALIIACAaAACzCAAgGwAAtAgAIB4AANkLACAgAAC3CAAgNQAAuQ4AIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhoAQCAPsHACGhBAIA-wcAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhqwQBAOwHACGsBAEA7AcAIa0EAQDsBwAhrgQCAPsHACGvBAIAoggAIbAEIADqBwAhsQQgAOoHACGyBCAA6gcAIbMEQACQCAAhGgMAALUIACAMAACxCAAgEwAAsggAIBoAALMIACAbAAC0CAAgHgAA2QsAICAAALcIACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIaAEAgD7BwAhoQQCAPsHACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIasEAQDsBwAhrAQBAOwHACGtBAEA7AcAIa4EAgD7BwAhrwQCAKIIACGwBCAA6gcAIbEEIADqBwAhsgQgAOoHACGzBEAAkAgAIRcEAADADQAgBQAAwQ0AIBUAAMMNACAYAADIDQAgHwAAxg0AICkAAMINACAqAADEDQAgKwAAxQ0AIC0AAMkNACAuAADKDQAgLwAAyw0AIP8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAAB9wQBAAAAAYkFIAAAAAGKBQEAAAABiwUgAAAAAQIAAACWAgAgPAAAug4AIBH7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGuBAIAAAABsgQgAAAAAbMEQAAAAAHcBAAApgsAIPEEAQAAAAHyBAEAAAAB8wQBAAAAAfQEAAClCwAgAwAAAJkCACA8AAC6DgAgPQAAvw4AIBkAAACZAgAgBAAAyQwAIAUAAMoMACAVAADMDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKgAAzQwAICsAAM4MACAtAADSDAAgLgAA0wwAIC8AANQMACA1AAC_DgAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhqAQBAO0HACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIfcEAQDtBwAhiQUgAOoHACGKBQEA7AcAIYsFIADqBwAhFwQAAMkMACAFAADKDAAgFQAAzAwAIBgAANEMACAfAADPDAAgKQAAywwAICoAAM0MACArAADODAAgLQAA0gwAIC4AANMMACAvAADUDAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhqAQBAO0HACGyBCAA6gcAIbMEQACQCAAhywQBAO0HACHrBAEA7QcAIfcEAQDtBwAhiQUgAOoHACGKBQEA7AcAIYsFIADqBwAhHQsAAK8KACAMAACwCgAgEQAAsQoAIBMAALIKACAUAACzCgAgHAAAtAoAICIAAMgKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAg3QQBAAAAAQIAAABQACA8AADADgAgFwQAAMANACAFAADBDQAgGAAAyA0AIB8AAMYNACApAADCDQAgKgAAxA0AICsAAMUNACAsAADHDQAgLQAAyQ0AIC4AAMoNACAvAADLDQAg_wNAAAAAAYsEAQAAAAGTBEAAAAABqAQBAAAAAbIEIAAAAAGzBEAAAAABywQBAAAAAesEAQAAAAH3BAEAAAABiQUgAAAAAYoFAQAAAAGLBSAAAAABAgAAAJYCACA8AADCDgAgDAMAAMsLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAZkECAAAAAGaBAAAyQsAIJsEIAAAAAECAAAAkAEAIDwAAMQOACAG_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAZ8EAQAAAAHwBCAAAAABEv8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHlBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABCv8DQAAAAAGLBAEAAAABlAQBAAAAAZkECAAAAAGfBAEAAAABywQAAADLBALMBAAAjAkAIM0EAQAAAAHOBAEAAAABzwRAAAAAARcEAADADQAgBQAAwQ0AIBUAAMMNACAYAADIDQAgHwAAxg0AICoAAMQNACArAADFDQAgLAAAxw0AIC0AAMkNACAuAADKDQAgLwAAyw0AIP8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAAB9wQBAAAAAYkFIAAAAAGKBQEAAAABiwUgAAAAAQIAAACWAgAgPAAAyQ4AIAwJAACPCgAgJgAAgQwAIIsEAQAAAAGMBAEAAAABjgQgAAAAAZMEQAAAAAGZBAgAAAABtQQAAADFBALBBAEAAAABwwQAAADDBALFBAEAAAABxwQAAADHBAMCAAAAdQAgPAAAyw4AIAMAAABzACA8AADLDgAgPQAAzw4AIA4AAABzACAJAADiCQAgJgAAgAwAIDUAAM8OACCLBAEA7QcAIYwEAQDtBwAhjgQgAOoHACGTBEAA6wcAIZkECACOCAAhtQQAAN4JxQQiwQQBAO0HACHDBAAAsgnDBCLFBAEA7AcAIccEAADfCccEIwwJAADiCQAgJgAAgAwAIIsEAQDtBwAhjAQBAO0HACGOBCAA6gcAIZMEQADrBwAhmQQIAI4IACG1BAAA3gnFBCLBBAEA7QcAIcMEAACyCcMEIsUEAQDsBwAhxwQAAN8JxwQjBosEAQAAAAGQBAEAAAABkwRAAAAAAfcEAAAAnQUCnQUgAAAAAZ4FAQAAAAEXBAAAwA0AIAUAAMENACAVAADDDQAgGAAAyA0AICkAAMINACAqAADEDQAgKwAAxQ0AICwAAMcNACAtAADJDQAgLgAAyg0AIC8AAMsNACD_A0AAAAABiwQBAAAAAZMEQAAAAAGoBAEAAAABsgQgAAAAAbMEQAAAAAHLBAEAAAAB6wQBAAAAAfcEAQAAAAGJBSAAAAABigUBAAAAAYsFIAAAAAECAAAAlgIAIDwAANEOACAdCwAArwoAIBEAALEKACATAACyCgAgFAAAswoAIBwAALQKACAiAADICgAgIwAAtQoAIP8DQAAAAAGLBAEAAAABkwRAAAAAAZgEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADZBAK2BAEAAAABywQAAADcBALQBAEAAAAB0QQBAAAAAdIEAQAAAAHTBAEAAAAB1AQgAAAAAdUEAgAAAAHWBAIAAAAB1wQBAAAAAdoEAAAA2gQC3AQAAK4KACDdBAEAAAABAgAAAFAAIDwAANMOACADAAAAGgAgPAAA0w4AID0AANcOACAfAAAAGgAgCwAA0ggAIBEAANQIACATAADVCAAgFAAA1ggAIBwAANcIACAiAADGCgAgIwAA2AgAIDUAANcOACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGYBAEA7AcAIZkECACOCAAhnwQBAO0HACGyBCAA6gcAIbMEQACQCAAhtQQAAM0I2QQitgQBAO0HACHLBAAAzwjcBCLQBAEA7QcAIdEEAQDsBwAh0gQBAO0HACHTBAEA7AcAIdQEIADqBwAh1QQCAKIIACHWBAIAoggAIdcEAQDtBwAh2gQAAM4I2gQi3AQAANAIACDdBAEA7AcAIR0LAADSCAAgEQAA1AgAIBMAANUIACAUAADWCAAgHAAA1wgAICIAAMYKACAjAADYCAAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmAQBAOwHACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAg3QQBAOwHACEG_wNAAAAAAYsEAQAAAAGTBEAAAAABlAQBAAAAAckEAQAAAAHwBCAAAAABEv8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABsgQgAAAAAbMEQAAAAAG1BAAAAOgEAssEAAAA4AQC4ARAAAAAAeEEQAAAAAHiBEAAAAAB5AQBAAAAAeUEAQAAAAHmBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABHQsAAK8KACAMAACwCgAgEQAAsQoAIBMAALIKACAcAAC0CgAgIgAAyAoAICMAALUKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAg3QQBAAAAAQIAAABQACA8AADaDgAgAwAAABoAIDwAANoOACA9AADeDgAgHwAAABoAIAsAANIIACAMAADTCAAgEQAA1AgAIBMAANUIACAcAADXCAAgIgAAxgoAICMAANgIACA1AADeDgAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmAQBAOwHACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAg3QQBAOwHACEdCwAA0ggAIAwAANMIACARAADUCAAgEwAA1QgAIBwAANcIACAiAADGCgAgIwAA2AgAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAzQjZBCK2BAEA7QcAIcsEAADPCNwEItAEAQDtBwAh0QQBAOwHACHSBAEA7QcAIdMEAQDsBwAh1AQgAOoHACHVBAIAoggAIdYEAgCiCAAh1wQBAO0HACHaBAAAzgjaBCLcBAAA0AgAIN0EAQDsBwAhCv8DQAAAAAGLBAEAAAABlAQBAAAAAZkECAAAAAHJBAEAAAABywQAAADLBALMBAAAjAkAIM0EAQAAAAHOBAEAAAABzwRAAAAAAQ0fAACpDAAg_wNAAAAAAYsEAQAAAAGTBEAAAAABmwQgAAAAAbIEIAAAAAGzBEAAAAAB0AQBAAAAAesEAQAAAAHsBAEAAAAB7QQBAAAAAe4EAgAAAAHvBAIAAAABAgAAAFcAIDwAAOAOACADAAAAVQAgPAAA4A4AID0AAOQOACAPAAAAVQAgHwAAoAwAIDUAAOQOACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGbBCAA6gcAIbIEIADqBwAhswRAAJAIACHQBAEA7AcAIesEAQDtBwAh7AQBAOwHACHtBAEA7AcAIe4EAgD7BwAh7wQCAPsHACENHwAAoAwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZsEIADqBwAhsgQgAOoHACGzBEAAkAgAIdAEAQDsBwAh6wQBAO0HACHsBAEA7AcAIe0EAQDsBwAh7gQCAPsHACHvBAIA-wcAIRX_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAbIEIAAAAAGzBEAAAAABtQQAAADZBAK2BAEAAAABywQAAADcBALQBAEAAAAB0QQBAAAAAdIEAQAAAAHTBAEAAAAB1AQgAAAAAdUEAgAAAAHWBAIAAAAB1wQBAAAAAdoEAAAA2gQC3AQAAK4KACDdBAEAAAABGgMAAO0KACAMAADpCgAgEwAA6goAIBoAAOsKACAdAADuCgAgHgAA7AsAICAAAO8KACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABoAQCAAAAAaEEAgAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAEAAAABqwQBAAAAAawEAQAAAAGtBAEAAAABrgQCAAAAAa8EAgAAAAGwBCAAAAABsQQgAAAAAbIEIAAAAAGzBEAAAAABAgAAAFwAIDwAAOYOACACiwQBAAAAAcgEAQAAAAEaAwAA7QoAIBMAAOoKACAaAADrCgAgGwAA7AoAIB0AAO4KACAeAADsCwAgIAAA7woAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAECAAAAXAAgPAAA6Q4AIBgDAACrCwAgEwAAqAsAIBQAAKkLACAWAACqCwAgFwAArAsAIBgAAMgLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGuBAIAAAABsgQgAAAAAbMEQAAAAAHcBAAApgsAIPEEAQAAAAHyBAEAAAAB8wQBAAAAAfQEAAClCwAg9QQBAAAAAQIAAAA9ACA8AADrDgAgHQsAAK8KACAMAACwCgAgEwAAsgoAIBQAALMKACAcAAC0CgAgIgAAyAoAICMAALUKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAg3QQBAAAAAQIAAABQACA8AADtDgAgAwAAABoAIDwAAO0OACA9AADxDgAgHwAAABoAIAsAANIIACAMAADTCAAgEwAA1QgAIBQAANYIACAcAADXCAAgIgAAxgoAICMAANgIACA1AADxDgAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmAQBAOwHACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAg3QQBAOwHACEdCwAA0ggAIAwAANMIACATAADVCAAgFAAA1ggAIBwAANcIACAiAADGCgAgIwAA2AgAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAzQjZBCK2BAEA7QcAIcsEAADPCNwEItAEAQDtBwAh0QQBAOwHACHSBAEA7QcAIdMEAQDsBwAh1AQgAOoHACHVBAIAoggAIdYEAgCiCAAh1wQBAO0HACHaBAAAzgjaBCLcBAAA0AgAIN0EAQDsBwAhC_8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABywQAAADgBALgBEAAAAAB4QRAAAAAAeIEQAAAAAHjBAIAAAAB5AQBAAAAAQ0DAACHCwAgFQAA6wsAIB8AAIgLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABtgQBAAAAAZYFAAAAlgUClwUgAAAAAZgFIAAAAAGZBQIAAAABmgUBAAAAAQIAAAALACA8AADzDgAgAwAAAAkAIDwAAPMOACA9AAD3DgAgDwAAAAkAIAMAAKUIACAVAADhCwAgHwAApggAIDUAAPcOACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIbYEAQDsBwAhlgUAAKEIlgUilwUgAOoHACGYBSAA6gcAIZkFAgCiCAAhmgUBAOwHACENAwAApQgAIBUAAOELACAfAACmCAAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACG2BAEA7AcAIZYFAAChCJYFIpcFIADqBwAhmAUgAOoHACGZBQIAoggAIZoFAQDsBwAhCosEAQAAAAGTBEAAAAABlQQBAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAY8FAgAAAAGQBSAAAAABkQUgAAAAAZIFIAAAAAEXBAAAwA0AIAUAAMENACAVAADDDQAgGAAAyA0AIB8AAMYNACApAADCDQAgKwAAxQ0AICwAAMcNACAtAADJDQAgLgAAyg0AIC8AAMsNACD_A0AAAAABiwQBAAAAAZMEQAAAAAGoBAEAAAABsgQgAAAAAbMEQAAAAAHLBAEAAAAB6wQBAAAAAfcEAQAAAAGJBSAAAAABigUBAAAAAYsFIAAAAAECAAAAlgIAIDwAAPkOACADAAAAmQIAIDwAAPkOACA9AAD9DgAgGQAAAJkCACAEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACArAADODAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIDUAAP0OACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEXBAAAyQwAIAUAAMoMACAVAADMDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKwAAzgwAICwAANAMACAtAADSDAAgLgAA0wwAIC8AANQMACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEG-wMBAAAAAYsEAQAAAAGTBEAAAAABvgQBAAAAAb8EIAAAAAHABAgAAAABCYsEAQAAAAGOBCAAAAABkwRAAAAAAZkECAAAAAG1BAAAAMUEAsEEAQAAAAHDBAAAAMMEAsUEAQAAAAHHBAAAAMcEAwX7AwEAAAAB_wNAAAAAAYsEAQAAAAGNBCAAAAABjgQgAAAAAQMAAABaACA8AADpDgAgPQAAgw8AIBwAAABaACADAAC1CAAgEwAAsggAIBoAALMIACAbAAC0CAAgHQAAtggAIB4AANkLACAgAAC3CAAgNQAAgw8AIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhoAQCAPsHACGhBAIA-wcAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhqwQBAOwHACGsBAEA7AcAIa0EAQDsBwAhrgQCAPsHACGvBAIAoggAIbAEIADqBwAhsQQgAOoHACGyBCAA6gcAIbMEQACQCAAhGgMAALUIACATAACyCAAgGgAAswgAIBsAALQIACAdAAC2CAAgHgAA2QsAICAAALcIACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIaAEAgD7BwAhoQQCAPsHACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIasEAQDsBwAhrAQBAOwHACGtBAEA7AcAIa4EAgD7BwAhrwQCAKIIACGwBCAA6gcAIbEEIADqBwAhsgQgAOoHACGzBEAAkAgAIQMAAAA7ACA8AADrDgAgPQAAhg8AIBoAAAA7ACADAACWCAAgEwAAkwgAIBQAAJQIACAWAACVCAAgFwAAlwgAIBgAAL4LACA1AACGDwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhrgQCAPsHACGyBCAA6gcAIbMEQACQCAAh3AQAAI8IACDxBAEA7AcAIfIEAQDsBwAh8wQBAOwHACH0BAAAjQgAIPUEAQDsBwAhGAMAAJYIACATAACTCAAgFAAAlAgAIBYAAJUIACAXAACXCAAgGAAAvgsAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmQQIAI4IACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIa4EAgD7BwAhsgQgAOoHACGzBEAAkAgAIdwEAACPCAAg8QQBAOwHACHyBAEA7AcAIfMEAQDsBwAh9AQAAI0IACD1BAEA7AcAIQb_A0AAAAABiwQBAAAAAZMEQAAAAAGfBAEAAAAByQQBAAAAAfAEIAAAAAEMCgAA5woAIBkAAJwKACAcAACdCgAgJQAAnwoAICcAAKAKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABnwQBAAAAAckEAQAAAAHwBCAAAAABAgAAACIAIDwAAIgPACAH-wMBAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAfcEAAAAwwQC-ARAAAAAAfkEQAAAAAEDAAAAIAAgPAAAiA8AID0AAI0PACAOAAAAIAAgCgAA5QoAIBkAAMMJACAcAADECQAgJQAAxgkAICcAAMcJACA1AACNDwAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAOwHACGfBAEA7AcAIckEAQDsBwAh8AQgAOoHACEMCgAA5QoAIBkAAMMJACAcAADECQAgJQAAxgkAICcAAMcJACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7AcAIZ8EAQDsBwAhyQQBAOwHACHwBCAA6gcAIQv_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABywQAAADgBALeBAEAAAAB4ARAAAAAAeEEQAAAAAHiBEAAAAAB4wQCAAAAAeQEAQAAAAEOCgAA0woAIBkAAI4JACAcAACPCQAg_wNAAAAAAYsEAQAAAAGUBAEAAAABmQQIAAAAAZ8EAQAAAAHJBAEAAAABywQAAADLBALMBAAAjAkAIM0EAQAAAAHOBAEAAAABzwRAAAAAAQIAAAA3ACA8AACPDwAgAwAAADUAIDwAAI8PACA9AACTDwAgEAAAADUAIAoAANEKACAZAAD1CAAgHAAA9ggAIDUAAJMPACD_A0AA6wcAIYsEAQDtBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhyQQBAO0HACHLBAAA8QjLBCLMBAAA8ggAIM0EAQDsBwAhzgQBAOwHACHPBEAA6wcAIQ4KAADRCgAgGQAA9QgAIBwAAPYIACD_A0AA6wcAIYsEAQDtBwAhlAQBAO0HACGZBAgAjggAIZ8EAQDtBwAhyQQBAO0HACHLBAAA8QjLBCLMBAAA8ggAIM0EAQDsBwAhzgQBAOwHACHPBEAA6wcAIRL_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHlBAEAAAAB5gQBAAAAAegEAgAAAAHpBAEAAAAB6gQBAAAAARoDAADtCgAgDAAA6QoAIBMAAOoKACAbAADsCgAgHQAA7goAIB4AAOwLACAgAADvCgAg-wMBAAAAAf8DQAAAAAGLBAEAAAABkwRAAAAAAaAEAgAAAAGhBAIAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAasEAQAAAAGsBAEAAAABrQQBAAAAAa4EAgAAAAGvBAIAAAABsAQgAAAAAbEEIAAAAAGyBCAAAAABswRAAAAAAQIAAABcACA8AACVDwAgGAMAAKsLACAMAACnCwAgEwAAqAsAIBYAAKoLACAXAACsCwAgGAAAyAsAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGZBAgAAAABpwQBAAAAAagEAQAAAAGpBAEAAAABqgQBAAAAAa4EAgAAAAGyBCAAAAABswRAAAAAAdwEAACmCwAg8QQBAAAAAfIEAQAAAAHzBAEAAAAB9AQAAKULACD1BAEAAAABAgAAAD0AIDwAAJcPACAaAwAA7QoAIAwAAOkKACAaAADrCgAgGwAA7AoAIB0AAO4KACAeAADsCwAgIAAA7woAIPsDAQAAAAH_A0AAAAABiwQBAAAAAZMEQAAAAAGgBAIAAAABoQQCAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAGuBAIAAAABrwQCAAAAAbAEIAAAAAGxBCAAAAABsgQgAAAAAbMEQAAAAAECAAAAXAAgPAAAmQ8AIBgDAACrCwAgDAAApwsAIBQAAKkLACAWAACqCwAgFwAArAsAIBgAAMgLACD7AwEAAAAB_wNAAAAAAYsEAQAAAAGTBEAAAAABmQQIAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGuBAIAAAABsgQgAAAAAbMEQAAAAAHcBAAApgsAIPEEAQAAAAHyBAEAAAAB8wQBAAAAAfQEAAClCwAg9QQBAAAAAQIAAAA9ACA8AACbDwAgHQsAAK8KACAMAACwCgAgEQAAsQoAIBQAALMKACAcAAC0CgAgIgAAyAoAICMAALUKACD_A0AAAAABiwQBAAAAAZMEQAAAAAGYBAEAAAABmQQIAAAAAZ8EAQAAAAGyBCAAAAABswRAAAAAAbUEAAAA2QQCtgQBAAAAAcsEAAAA3AQC0AQBAAAAAdEEAQAAAAHSBAEAAAAB0wQBAAAAAdQEIAAAAAHVBAIAAAAB1gQCAAAAAdcEAQAAAAHaBAAAANoEAtwEAACuCgAg3QQBAAAAAQIAAABQACA8AACdDwAgAwAAAFoAIDwAAJkPACA9AAChDwAgHAAAAFoAIAMAALUIACAMAACxCAAgGgAAswgAIBsAALQIACAdAAC2CAAgHgAA2QsAICAAALcIACA1AAChDwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGrBAEA7AcAIawEAQDsBwAhrQQBAOwHACGuBAIA-wcAIa8EAgCiCAAhsAQgAOoHACGxBCAA6gcAIbIEIADqBwAhswRAAJAIACEaAwAAtQgAIAwAALEIACAaAACzCAAgGwAAtAgAIB0AALYIACAeAADZCwAgIAAAtwgAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhoAQCAPsHACGhBAIA-wcAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhqwQBAOwHACGsBAEA7AcAIa0EAQDsBwAhrgQCAPsHACGvBAIAoggAIbAEIADqBwAhsQQgAOoHACGyBCAA6gcAIbMEQACQCAAhAwAAADsAIDwAAJsPACA9AACkDwAgGgAAADsAIAMAAJYIACAMAACSCAAgFAAAlAgAIBYAAJUIACAXAACXCAAgGAAAvgsAIDUAAKQPACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGuBAIA-wcAIbIEIADqBwAhswRAAJAIACHcBAAAjwgAIPEEAQDsBwAh8gQBAOwHACHzBAEA7AcAIfQEAACNCAAg9QQBAOwHACEYAwAAlggAIAwAAJIIACAUAACUCAAgFgAAlQgAIBcAAJcIACAYAAC-CwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhrgQCAPsHACGyBCAA6gcAIbMEQACQCAAh3AQAAI8IACDxBAEA7AcAIfIEAQDsBwAh8wQBAOwHACH0BAAAjQgAIPUEAQDsBwAhAwAAABoAIDwAAJ0PACA9AACnDwAgHwAAABoAIAsAANIIACAMAADTCAAgEQAA1AgAIBQAANYIACAcAADXCAAgIgAAxgoAICMAANgIACA1AACnDwAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmAQBAOwHACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAg3QQBAOwHACEdCwAA0ggAIAwAANMIACARAADUCAAgFAAA1ggAIBwAANcIACAiAADGCgAgIwAA2AgAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZgEAQDsBwAhmQQIAI4IACGfBAEA7QcAIbIEIADqBwAhswRAAJAIACG1BAAAzQjZBCK2BAEA7QcAIcsEAADPCNwEItAEAQDtBwAh0QQBAOwHACHSBAEA7QcAIdMEAQDsBwAh1AQgAOoHACHVBAIAoggAIdYEAgCiCAAh1wQBAO0HACHaBAAAzgjaBCLcBAAA0AgAIN0EAQDsBwAhEv8DQAAAAAGLBAEAAAABkwRAAAAAAZQEAQAAAAGZBAgAAAABnwQBAAAAAbIEIAAAAAGzBEAAAAABtQQAAADoBALLBAAAAOAEAuAEQAAAAAHhBEAAAAAB4gRAAAAAAeQEAQAAAAHmBAEAAAAB6AQCAAAAAekEAQAAAAHqBAEAAAABAwAAAFoAIDwAAJUPACA9AACrDwAgHAAAAFoAIAMAALUIACAMAACxCAAgEwAAsggAIBsAALQIACAdAAC2CAAgHgAA2QsAICAAALcIACA1AACrDwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGrBAEA7AcAIawEAQDsBwAhrQQBAOwHACGuBAIA-wcAIa8EAgCiCAAhsAQgAOoHACGxBCAA6gcAIbIEIADqBwAhswRAAJAIACEaAwAAtQgAIAwAALEIACATAACyCAAgGwAAtAgAIB0AALYIACAeAADZCwAgIAAAtwgAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhoAQCAPsHACGhBAIA-wcAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhqwQBAOwHACGsBAEA7AcAIa0EAQDsBwAhrgQCAPsHACGvBAIAoggAIbAEIADqBwAhsQQgAOoHACGyBCAA6gcAIbMEQACQCAAhAwAAADsAIDwAAJcPACA9AACuDwAgGgAAADsAIAMAAJYIACAMAACSCAAgEwAAkwgAIBYAAJUIACAXAACXCAAgGAAAvgsAIDUAAK4PACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIZkECACOCAAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGuBAIA-wcAIbIEIADqBwAhswRAAJAIACHcBAAAjwgAIPEEAQDsBwAh8gQBAOwHACHzBAEA7AcAIfQEAACNCAAg9QQBAOwHACEYAwAAlggAIAwAAJIIACATAACTCAAgFgAAlQgAIBcAAJcIACAYAAC-CwAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGZBAgAjggAIacEAQDtBwAhqAQBAO0HACGpBAEA7AcAIaoEAQDsBwAhrgQCAPsHACGyBCAA6gcAIbMEQACQCAAh3AQAAI8IACDxBAEA7AcAIfIEAQDsBwAh8wQBAOwHACH0BAAAjQgAIPUEAQDsBwAhCv8DQAAAAAGLBAEAAAABmQQIAAAAAZ8EAQAAAAHJBAEAAAABywQAAADLBALMBAAAjAkAIM0EAQAAAAHOBAEAAAABzwRAAAAAARcEAADADQAgBQAAwQ0AIBUAAMMNACAfAADGDQAgKQAAwg0AICoAAMQNACArAADFDQAgLAAAxw0AIC0AAMkNACAuAADKDQAgLwAAyw0AIP8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAAB9wQBAAAAAYkFIAAAAAGKBQEAAAABiwUgAAAAAQIAAACWAgAgPAAAsA8AIAP7AwEAAAABiwQBAAAAAZMEQAAAAAEDAAAAWgAgPAAA5g4AID0AALUPACAcAAAAWgAgAwAAtQgAIAwAALEIACATAACyCAAgGgAAswgAIB0AALYIACAeAADZCwAgIAAAtwgAIDUAALUPACD7AwEA7QcAIf8DQADrBwAhiwQBAO0HACGTBEAA6wcAIaAEAgD7BwAhoQQCAPsHACGnBAEA7QcAIagEAQDtBwAhqQQBAOwHACGqBAEA7AcAIasEAQDsBwAhrAQBAOwHACGtBAEA7AcAIa4EAgD7BwAhrwQCAKIIACGwBCAA6gcAIbEEIADqBwAhsgQgAOoHACGzBEAAkAgAIRoDAAC1CAAgDAAAsQgAIBMAALIIACAaAACzCAAgHQAAtggAIB4AANkLACAgAAC3CAAg-wMBAO0HACH_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGgBAIA-wcAIaEEAgD7BwAhpwQBAO0HACGoBAEA7QcAIakEAQDsBwAhqgQBAOwHACGrBAEA7AcAIawEAQDsBwAhrQQBAOwHACGuBAIA-wcAIa8EAgCiCAAhsAQgAOoHACGxBCAA6gcAIbIEIADqBwAhswRAAJAIACEV_wNAAAAAAYsEAQAAAAGTBEAAAAABmAQBAAAAAZkECAAAAAGfBAEAAAABsgQgAAAAAbMEQAAAAAG1BAAAANkEArYEAQAAAAHLBAAAANwEAtAEAQAAAAHRBAEAAAAB0gQBAAAAAdMEAQAAAAHUBCAAAAAB1QQCAAAAAdYEAgAAAAHXBAEAAAAB2gQAAADaBALcBAAArgoAIAMAAACZAgAgPAAA0Q4AID0AALkPACAZAAAAmQIAIAQAAMkMACAFAADKDAAgFQAAzAwAIBgAANEMACApAADLDAAgKgAAzQwAICsAAM4MACAsAADQDAAgLQAA0gwAIC4AANMMACAvAADUDAAgNQAAuQ8AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgKQAAywwAICoAAM0MACArAADODAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIQMAAACZAgAgPAAAyQ4AID0AALwPACAZAAAAmQIAIAQAAMkMACAFAADKDAAgFQAAzAwAIBgAANEMACAfAADPDAAgKgAAzQwAICsAAM4MACAsAADQDAAgLQAA0gwAIC4AANMMACAvAADUDAAgNQAAvA8AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICoAAM0MACArAADODAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIQMAAACZAgAgPAAAwg4AID0AAL8PACAZAAAAmQIAIAQAAMkMACAFAADKDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKgAAzQwAICsAAM4MACAsAADQDAAgLQAA0gwAIC4AANMMACAvAADUDAAgNQAAvw8AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcEAADJDAAgBQAAygwAIBgAANEMACAfAADPDAAgKQAAywwAICoAAM0MACArAADODAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIQMAAAA5ACA8AADEDgAgPQAAwg8AIA4AAAA5ACADAAC1CwAgNQAAwg8AIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlQQBAO0HACGWBAEA7AcAIZcEAQDsBwAhmAQBAOwHACGZBAgAjggAIZoEAACzCwAgmwQgAOoHACEMAwAAtQsAIPsDAQDtBwAh_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlQQBAO0HACGWBAEA7AcAIZcEAQDsBwAhmAQBAOwHACGZBAgAjggAIZoEAACzCwAgmwQgAOoHACEDAAAAmQIAIDwAALAPACA9AADFDwAgGQAAAJkCACAEAADJDAAgBQAAygwAIBUAAMwMACAfAADPDAAgKQAAywwAICoAAM0MACArAADODAAgLAAA0AwAIC0AANIMACAuAADTDAAgLwAA1AwAIDUAAMUPACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEXBAAAyQwAIAUAAMoMACAVAADMDAAgHwAAzwwAICkAAMsMACAqAADNDAAgKwAAzgwAICwAANAMACAtAADSDAAgLgAA0wwAIC8AANQMACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEDAAAAGgAgPAAAwA4AID0AAMgPACAfAAAAGgAgCwAA0ggAIAwAANMIACARAADUCAAgEwAA1QgAIBQAANYIACAcAADXCAAgIgAAxgoAIDUAAMgPACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGYBAEA7AcAIZkECACOCAAhnwQBAO0HACGyBCAA6gcAIbMEQACQCAAhtQQAAM0I2QQitgQBAO0HACHLBAAAzwjcBCLQBAEA7QcAIdEEAQDsBwAh0gQBAO0HACHTBAEA7AcAIdQEIADqBwAh1QQCAKIIACHWBAIAoggAIdcEAQDtBwAh2gQAAM4I2gQi3AQAANAIACDdBAEA7AcAIR0LAADSCAAgDAAA0wgAIBEAANQIACATAADVCAAgFAAA1ggAIBwAANcIACAiAADGCgAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhmAQBAOwHACGZBAgAjggAIZ8EAQDtBwAhsgQgAOoHACGzBEAAkAgAIbUEAADNCNkEIrYEAQDtBwAhywQAAM8I3AQi0AQBAO0HACHRBAEA7AcAIdIEAQDtBwAh0wQBAOwHACHUBCAA6gcAIdUEAgCiCAAh1gQCAKIIACHXBAEA7QcAIdoEAADOCNoEItwEAADQCAAg3QQBAOwHACEXBAAAwA0AIAUAAMENACAVAADDDQAgGAAAyA0AIB8AAMYNACApAADCDQAgKgAAxA0AICsAAMUNACAsAADHDQAgLQAAyQ0AIC4AAMoNACD_A0AAAAABiwQBAAAAAZMEQAAAAAGoBAEAAAABsgQgAAAAAbMEQAAAAAHLBAEAAAAB6wQBAAAAAfcEAQAAAAGJBSAAAAABigUBAAAAAYsFIAAAAAECAAAAlgIAIDwAAMkPACADAAAAmQIAIDwAAMkPACA9AADNDwAgGQAAAJkCACAEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACAqAADNDAAgKwAAzgwAICwAANAMACAtAADSDAAgLgAA0wwAIDUAAM0PACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEXBAAAyQwAIAUAAMoMACAVAADMDAAgGAAA0QwAIB8AAM8MACApAADLDAAgKgAAzQwAICsAAM4MACAsAADQDAAgLQAA0gwAIC4AANMMACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGoBAEA7QcAIbIEIADqBwAhswRAAJAIACHLBAEA7QcAIesEAQDtBwAh9wQBAO0HACGJBSAA6gcAIYoFAQDsBwAhiwUgAOoHACEMCgAA5woAIBkAAJwKACAcAACdCgAgJAAAngoAICUAAJ8KACD_A0AAAAABiwQBAAAAAZMEQAAAAAGUBAEAAAABnwQBAAAAAckEAQAAAAHwBCAAAAABAgAAACIAIDwAAM4PACADAAAAIAAgPAAAzg8AID0AANIPACAOAAAAIAAgCgAA5QoAIBkAAMMJACAcAADECQAgJAAAxQkAICUAAMYJACA1AADSDwAg_wNAAOsHACGLBAEA7QcAIZMEQADrBwAhlAQBAOwHACGfBAEA7AcAIckEAQDsBwAh8AQgAOoHACEMCgAA5QoAIBkAAMMJACAcAADECQAgJAAAxQkAICUAAMYJACD_A0AA6wcAIYsEAQDtBwAhkwRAAOsHACGUBAEA7AcAIZ8EAQDsBwAhyQQBAOwHACHwBCAA6gcAIRcEAADADQAgBQAAwQ0AIBUAAMMNACAYAADIDQAgHwAAxg0AICkAAMINACAqAADEDQAgKwAAxQ0AICwAAMcNACAtAADJDQAgLwAAyw0AIP8DQAAAAAGLBAEAAAABkwRAAAAAAagEAQAAAAGyBCAAAAABswRAAAAAAcsEAQAAAAHrBAEAAAAB9wQBAAAAAYkFIAAAAAGKBQEAAAABiwUgAAAAAQIAAACWAgAgPAAA0w8AIAMAAACZAgAgPAAA0w8AID0AANcPACAZAAAAmQIAIAQAAMkMACAFAADKDAAgFQAAzAwAIBgAANEMACAfAADPDAAgKQAAywwAICoAAM0MACArAADODAAgLAAA0AwAIC0AANIMACAvAADUDAAgNQAA1w8AIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIRcEAADJDAAgBQAAygwAIBUAAMwMACAYAADRDAAgHwAAzwwAICkAAMsMACAqAADNDAAgKwAAzgwAICwAANAMACAtAADSDAAgLwAA1AwAIP8DQADrBwAhiwQBAO0HACGTBEAA6wcAIagEAQDtBwAhsgQgAOoHACGzBEAAkAgAIcsEAQDtBwAh6wQBAO0HACH3BAEA7QcAIYkFIADqBwAhigUBAOwHACGLBSAA6gcAIQEDAAINBAYDBQgBEAAoFYgBERiSARQfjgEXKQwEKokBCCuNASQskQESLZYBJS6YASYvnAEnAQMAAgUDAAIQACMVgwERH4QBFyUQBQMGAAQHFAYQACIDCAAHEAAhKIABBQQHFQYJGQgQACAmAAkCAwACCAAHBwobChAAHxlwERxxFyRyDCV2Byd6HgkLHwsMIwkQAB0RJwwTMQ8UZxAcABciaBkjaRQBCgAKBAosCg4rDQ8ACRAADgENAAwBDi0ABAoAChkAERwAFyEAEAUKAAoQABwSMg8ZABEcABcIAwACDDMJEAAWEzQPFDgQFjoSF0AEGEQUAwMAAhAAExU-EQEVPwAEAwACCgAKEAAVFUURARVGAAUMRwATSAAUSQAXSgAYSwAJAwACDEwJEAAbE00PGk4QG1EKHVMYHlQEIFgZARwAFwMQABobWQofXRcCG14AH18ABgxgABNhABpiABtjAB5kACBlAAESZgAGC2oADGsAEWwAE20AFG4AI28AASYACQMkewAlfAAnfQACB34ACX8AASiBAQABB4IBAAMVhgEAH4cBACWFAQABAwACAQMAAgEDAAIBAwACCASdAQAYogEAKZ4BACqfAQAroAEALKEBAC2jAQAvpAEAAAEDAAIBAwACAxAALUIALkMALwAAAAMQAC1CAC5DAC8BBgAEAQYABAMQADRCADVDADYAAAADEAA0QgA1QwA2AQMAAgEDAAIFEAA7QgA-QwA_ZAA8ZQA9AAAAAAAFEAA7QgA-QwA_ZAA8ZQA9AAAABRAARUIASEMASWQARmUARwAAAAAABRAARUIASEMASWQARmUARwEIAAcBCAAHBRAATkIAUUMAUmQAT2UAUAAAAAAABRAATkIAUUMAUmQAT2UAUAAAAxAAV0IAWEMAWQAAAAMQAFdCAFhDAFkBAwACAQMAAgMQAF5CAF9DAGAAAAADEABeQgBfQwBgAQMAAgEDAAIDEABlQgBmQwBnAAAAAxAAZUIAZkMAZwAAAAMQAG1CAG5DAG8AAAADEABtQgBuQwBvAQ0ADAENAAwFEAB0QgB3QwB4ZAB1ZQB2AAAAAAAFEAB0QgB3QwB4ZAB1ZQB2AgMAAhaUAxICAwACFpoDEgUQAH1CAIABQwCBAWQAfmUAfwAAAAAABRAAfUIAgAFDAIEBZAB-ZQB_AwqsAwoZrQMRHK4DFwMKtAMKGbUDERy2AxcDEACGAUIAhwFDAIgBAAAAAxAAhgFCAIcBQwCIAQAABRAAjQFCAJABQwCRAWQAjgFlAI8BAAAAAAAFEACNAUIAkAFDAJEBZACOAWUAjwEECgAKGQARHAAXIQAQBAoAChkAERwAFyEAEAUQAJYBQgCZAUMAmgFkAJcBZQCYAQAAAAAABRAAlgFCAJkBQwCaAWQAlwFlAJgBAgr0AwoPAAkCCvoDCg8ACQUQAJ8BQgCiAUMAowFkAKABZQChAQAAAAAABRAAnwFCAKIBQwCjAWQAoAFlAKEBAhwAFyKMBBkCHAAXIpIEGQUQAKgBQgCrAUMArAFkAKkBZQCqAQAAAAAABRAAqAFCAKsBQwCsAWQAqQFlAKoBAwoAChkAERwAFwMKAAoZABEcABcFEACxAUIAtAFDALUBZACyAWUAswEAAAAAAAUQALEBQgC0AUMAtQFkALIBZQCzAQEKAAoBCgAKAxAAugFCALsBQwC8AQAAAAMQALoBQgC7AUMAvAEBJgAJASYACQUQAMEBQgDEAUMAxQFkAMIBZQDDAQAAAAAABRAAwQFCAMQBQwDFAWQAwgFlAMMBAgMAAggABwIDAAIIAAcFEADKAUIAzQFDAM4BZADLAWUAzAEAAAAAAAUQAMoBQgDNAUMAzgFkAMsBZQDMAQEDAAIBAwACAxAA0wFCANQBQwDVAQAAAAMQANMBQgDUAUMA1QEBAwACAQMAAgUQANoBQgDdAUMA3gFkANsBZQDcAQAAAAAABRAA2gFCAN0BQwDeAWQA2wFlANwBARwAFwEcABcFEADjAUIA5gFDAOcBZADkAWUA5QEAAAAAAAUQAOMBQgDmAUMA5wFkAOQBZQDlAQEDAAIBAwACBRAA7AFCAO8BQwDwAWQA7QFlAO4BAAAAAAAFEADsAUIA7wFDAPABZADtAWUA7gECAwACCgAKAgMAAgoACgMQAPUBQgD2AUMA9wEAAAADEAD1AUIA9gFDAPcBAQMAAgEDAAIFEAD8AUIA_wFDAIACZAD9AWUA_gEAAAAAAAUQAPwBQgD_AUMAgAJkAP0BZQD-AQEmAAkBJgAJAxAAhQJCAIYCQwCHAgAAAAMQAIUCQgCGAkMAhwIBAwACAQMAAgMQAIwCQgCNAkMAjgIAAAADEACMAkIAjQJDAI4CMAIBMaUBATKnAQEzqAEBNKkBATarAQE3rQEpOK4BKjmwAQE6sgEpO7MBKz60AQE_tQEBQLYBKUS5ASxFugEwRrsBBUe8AQVIvQEFSb4BBUq_AQVLwQEFTMMBKU3EATFOxgEFT8gBKVDJATJRygEFUssBBVPMASlUzwEzVdABN1bRAQRX0gEEWNMBBFnUAQRa1QEEW9cBBFzZASld2gE4XtwBBF_eASlg3wE5YeABBGLhAQRj4gEpZuUBOmfmAUBo6AFBaekBQWrsAUFr7QFBbO4BQW3wAUFu8gEpb_MBQnD1AUFx9wEpcvgBQ3P5AUF0-gFBdfsBKXb-AUR3_wFKeIACBnmBAgZ6ggIGe4MCBnyEAgZ9hgIGfogCKX-JAkuAAYsCBoEBjQIpggGOAkyDAY8CBoQBkAIGhQGRAimGAZQCTYcBlQJTiAGXAgKJAZgCAooBmwICiwGcAgKMAZ0CAo0BnwICjgGhAimPAaICVJABpAICkQGmAimSAacCVZMBqAIClAGpAgKVAaoCKZYBrQJWlwGuAlqYAa8CJZkBsAIlmgGxAiWbAbICJZwBswIlnQG1AiWeAbcCKZ8BuAJboAG6AiWhAbwCKaIBvQJcowG-AiWkAb8CJaUBwAIppgHDAl2nAcQCYagBxQIDqQHGAgOqAccCA6sByAIDrAHJAgOtAcsCA64BzQIprwHOAmKwAdACA7EB0gIpsgHTAmOzAdQCA7QB1QIDtQHWAim2AdkCZLcB2gJouAHcAmm5Ad0CaboB4AJpuwHhAmm8AeICab0B5AJpvgHmAim_AecCasAB6QJpwQHrAinCAewCa8MB7QJpxAHuAmnFAe8CKcYB8gJsxwHzAnDIAfQCDckB9QINygH2Ag3LAfcCDcwB-AINzQH6Ag3OAfwCKc8B_QJx0AH_Ag3RAYEDKdIBggNy0wGDAw3UAYQDDdUBhQMp1gGIA3PXAYkDedgBigMR2QGLAxHaAYwDEdsBjQMR3AGOAxHdAZADEd4BkgMp3wGTA3rgAZYDEeEBmAMp4gGZA3vjAZsDEeQBnAMR5QGdAynmAaADfOcBoQOCAegBogMJ6QGjAwnqAaQDCesBpQMJ7AGmAwntAagDCe4BqgMp7wGrA4MB8AGwAwnxAbIDKfIBswOEAfMBtwMJ9AG4Awn1AbkDKfYBvAOFAfcBvQOJAfgBvgMZ-QG_Axn6AcADGfsBwQMZ_AHCAxn9AcQDGf4BxgMp_wHHA4oBgALJAxmBAssDKYICzAOLAYMCzQMZhALOAxmFAs8DKYYC0gOMAYcC0wOSAYgC1AMPiQLVAw-KAtYDD4sC1wMPjALYAw-NAtoDD44C3AMpjwLdA5MBkALfAw-RAuEDKZIC4gOUAZMC4wMPlALkAw-VAuUDKZYC6AOVAZcC6QObAZgC6gMMmQLrAwyaAuwDDJsC7QMMnALuAwydAvADDJ4C8gMpnwLzA5wBoAL2AwyhAvgDKaIC-QOdAaMC-wMMpAL8AwylAv0DKaYCgASeAacCgQSkAagCggQKqQKDBAqqAoQECqsChQQKrAKGBAqtAogECq4CigQprwKLBKUBsAKOBAqxApAEKbICkQSmAbMCkwQKtAKUBAq1ApUEKbYCmASnAbcCmQStAbgCmgQQuQKbBBC6ApwEELsCnQQQvAKeBBC9AqAEEL4CogQpvwKjBK4BwAKlBBDBAqcEKcICqASvAcMCqQQQxAKqBBDFAqsEKcYCrgSwAccCrwS2AcgCsAQLyQKxBAvKArIEC8sCswQLzAK0BAvNArYEC84CuAQpzwK5BLcB0AK7BAvRAr0EKdICvgS4AdMCvwQL1ALABAvVAsEEKdYCxAS5AdcCxQS9AdgCxgQH2QLHBAfaAsgEB9sCyQQH3ALKBAfdAswEB94CzgQp3wLPBL4B4ALRBAfhAtMEKeIC1AS_AeMC1QQH5ALWBAflAtcEKeYC2gTAAecC2wTGAegC3AQI6QLdBAjqAt4ECOsC3wQI7ALgBAjtAuIECO4C5AQp7wLlBMcB8ALnBAjxAukEKfIC6gTIAfMC6wQI9ALsBAj1Au0EKfYC8ATJAfcC8QTPAfgC8gQk-QLzBCT6AvQEJPsC9QQk_AL2BCT9AvgEJP4C-gQp_wL7BNABgAP9BCSBA_8EKYIDgAXRAYMDgQUkhAOCBSSFA4MFKYYDhgXSAYcDhwXWAYgDiAUXiQOJBReKA4oFF4sDiwUXjAOMBReNA44FF44DkAUpjwORBdcBkAOTBReRA5UFKZIDlgXYAZMDlwUXlAOYBReVA5kFKZYDnAXZAZcDnQXfAZgDnwUYmQOgBRiaA6IFGJsDowUYnAOkBRidA6YFGJ4DqAUpnwOpBeABoAOrBRihA60FKaIDrgXhAaMDrwUYpAOwBRilA7EFKaYDtAXiAacDtQXoAagDtgUSqQO3BRKqA7gFEqsDuQUSrAO6BRKtA7wFEq4DvgUprwO_BekBsAPBBRKxA8MFKbIDxAXqAbMDxQUStAPGBRK1A8cFKbYDygXrAbcDywXxAbgDzAUUuQPNBRS6A84FFLsDzwUUvAPQBRS9A9IFFL4D1AUpvwPVBfIBwAPXBRTBA9kFKcID2gXzAcMD2wUUxAPcBRTFA90FKcYD4AX0AccD4QX4AcgD4gUnyQPjBSfKA-QFJ8sD5QUnzAPmBSfNA-gFJ84D6gUpzwPrBfkB0APtBSfRA-8FKdID8AX6AdMD8QUn1APyBSfVA_MFKdYD9gX7AdcD9wWBAtgD-AUe2QP5BR7aA_oFHtsD-wUe3AP8BR7dA_4FHt4DgAYp3wOBBoIC4AODBh7hA4UGKeIDhgaDAuMDhwYe5AOIBh7lA4kGKeYDjAaEAucDjQaIAugDjwYm6QOQBibqA5IGJusDkwYm7AOUBibtA5YGJu4DmAYp7wOZBokC8AObBibxA50GKfIDngaKAvMDnwYm9AOgBib1A6EGKfYDpAaLAvcDpQaPAg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AIChatMessageScalarFieldEnum: () => AIChatMessageScalarFieldEnum,
  AIConversationScalarFieldEnum: () => AIConversationScalarFieldEnum,
  AIRecommendationScalarFieldEnum: () => AIRecommendationScalarFieldEnum,
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AdminScalarFieldEnum: () => AdminScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AttachmentScalarFieldEnum: () => AttachmentScalarFieldEnum,
  CallParticipantScalarFieldEnum: () => CallParticipantScalarFieldEnum,
  CandidateScalarFieldEnum: () => CandidateScalarFieldEnum,
  ChatRoomScalarFieldEnum: () => ChatRoomScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  IndustryScalarFieldEnum: () => IndustryScalarFieldEnum,
  InterviewCallScalarFieldEnum: () => InterviewCallScalarFieldEnum,
  InterviewScalarFieldEnum: () => InterviewScalarFieldEnum,
  JobApplicationScalarFieldEnum: () => JobApplicationScalarFieldEnum,
  JobScalarFieldEnum: () => JobScalarFieldEnum,
  JobTagScalarFieldEnum: () => JobTagScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MessageReactionScalarFieldEnum: () => MessageReactionScalarFieldEnum,
  MessageScalarFieldEnum: () => MessageScalarFieldEnum,
  ModelName: () => ModelName,
  NotificationScalarFieldEnum: () => NotificationScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  RecruiterScalarFieldEnum: () => RecruiterScalarFieldEnum,
  RecruiterStatsScalarFieldEnum: () => RecruiterStatsScalarFieldEnum,
  ResumeScalarFieldEnum: () => ResumeScalarFieldEnum,
  SavedJobScalarFieldEnum: () => SavedJobScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TestimonialScalarFieldEnum: () => TestimonialScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TypingStateScalarFieldEnum: () => TypingStateScalarFieldEnum,
  UserPresenceScalarFieldEnum: () => UserPresenceScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  Admin: "Admin",
  AIChatMessage: "AIChatMessage",
  AIConversation: "AIConversation",
  AIRecommendation: "AIRecommendation",
  Attachment: "Attachment",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  CallParticipant: "CallParticipant",
  Candidate: "Candidate",
  ChatRoom: "ChatRoom",
  Industry: "Industry",
  Interview: "Interview",
  InterviewCall: "InterviewCall",
  Job: "Job",
  JobApplication: "JobApplication",
  JobTag: "JobTag",
  Message: "Message",
  MessageReaction: "MessageReaction",
  Notification: "Notification",
  Recruiter: "Recruiter",
  RecruiterStats: "RecruiterStats",
  Resume: "Resume",
  SavedJob: "SavedJob",
  Testimonial: "Testimonial",
  TypingState: "TypingState",
  UserPresence: "UserPresence"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var AdminScalarFieldEnum = {
  id: "id",
  userId: "userId",
  name: "name",
  email: "email",
  profilePhoto: "profilePhoto",
  contactNumber: "contactNumber",
  permissions: "permissions",
  lastLoginAt: "lastLoginAt",
  status: "status",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AIChatMessageScalarFieldEnum = {
  id: "id",
  conversationId: "conversationId",
  role: "role",
  content: "content",
  isVoice: "isVoice",
  audioUrl: "audioUrl",
  createdAt: "createdAt"
};
var AIConversationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  contextType: "contextType",
  title: "title",
  isPinned: "isPinned",
  isArchived: "isArchived",
  totalTokens: "totalTokens",
  lastModel: "lastModel",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AIRecommendationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  type: "type",
  entityId: "entityId",
  score: "score",
  reason: "reason",
  createdAt: "createdAt"
};
var AttachmentScalarFieldEnum = {
  id: "id",
  messageId: "messageId",
  fileUrl: "fileUrl",
  fileName: "fileName",
  fileType: "fileType",
  fileSize: "fileSize",
  isResume: "isResume",
  isPrivate: "isPrivate",
  aiAnalyzed: "aiAnalyzed",
  aiSummary: "aiSummary",
  createdAt: "createdAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CallParticipantScalarFieldEnum = {
  id: "id",
  callId: "callId",
  userId: "userId",
  role: "role",
  joinedAt: "joinedAt",
  leftAt: "leftAt",
  aiScore: "aiScore",
  createdAt: "createdAt"
};
var CandidateScalarFieldEnum = {
  id: "id",
  fullName: "fullName",
  email: "email",
  profilePhoto: "profilePhoto",
  phone: "phone",
  address: "address",
  headline: "headline",
  summary: "summary",
  experience: "experience",
  skills: "skills",
  aiScore: "aiScore",
  aiTags: "aiTags",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  userId: "userId",
  resumeid: "resumeid",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ChatRoomScalarFieldEnum = {
  id: "id",
  jobSeekerId: "jobSeekerId",
  recruiterId: "recruiterId",
  isAIChat: "isAIChat",
  jobId: "jobId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var IndustryScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  icon: "icon",
  slug: "slug",
  isActive: "isActive",
  jobCount: "jobCount",
  userCount: "userCount",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var InterviewScalarFieldEnum = {
  id: "id",
  jobId: "jobId",
  applicationId: "applicationId",
  recruiterId: "recruiterId",
  candidateId: "candidateId",
  type: "type",
  status: "status",
  scheduledAt: "scheduledAt",
  startedAt: "startedAt",
  endedAt: "endedAt",
  durationMinutes: "durationMinutes",
  aiScore: "aiScore",
  aiFeedback: "aiFeedback",
  meetingLink: "meetingLink",
  notes: "notes",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var InterviewCallScalarFieldEnum = {
  id: "id",
  chatRoomId: "chatRoomId",
  jobId: "jobId",
  status: "status",
  scheduledAt: "scheduledAt",
  startedAt: "startedAt",
  endedAt: "endedAt",
  duration: "duration",
  aiScore: "aiScore",
  aiFeedback: "aiFeedback",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var JobScalarFieldEnum = {
  id: "id",
  title: "title",
  description: "description",
  responsibilities: "responsibilities",
  requirements: "requirements",
  location: "location",
  isRemote: "isRemote",
  salaryMin: "salaryMin",
  salaryMax: "salaryMax",
  currency: "currency",
  type: "type",
  experienceLevel: "experienceLevel",
  status: "status",
  aiSummary: "aiSummary",
  aiTags: "aiTags",
  aiScore: "aiScore",
  recruiterId: "recruiterId",
  industryId: "industryId",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var JobApplicationScalarFieldEnum = {
  id: "id",
  jobSeekerId: "jobSeekerId",
  jobId: "jobId",
  recruiterId: "recruiterId",
  status: "status",
  aiScore: "aiScore",
  aiMatchReasons: "aiMatchReasons",
  resumeUrl: "resumeUrl",
  coverLetter: "coverLetter",
  appliedAt: "appliedAt",
  updatedAt: "updatedAt"
};
var JobTagScalarFieldEnum = {
  id: "id",
  jobId: "jobId",
  tag: "tag"
};
var MessageScalarFieldEnum = {
  id: "id",
  roomId: "roomId",
  senderId: "senderId",
  senderRole: "senderRole",
  type: "type",
  text: "text",
  aiIntent: "aiIntent",
  aiScore: "aiScore",
  isAI: "isAI",
  createdAt: "createdAt"
};
var MessageReactionScalarFieldEnum = {
  id: "id",
  messageId: "messageId",
  userId: "userId",
  emoji: "emoji",
  isAIReaction: "isAIReaction",
  sentimentScore: "sentimentScore",
  createdAt: "createdAt"
};
var NotificationScalarFieldEnum = {
  id: "id",
  userId: "userId",
  type: "type",
  title: "title",
  message: "message",
  entityType: "entityType",
  entityId: "entityId",
  isAI: "isAI",
  priority: "priority",
  read: "read",
  readAt: "readAt",
  createdAt: "createdAt"
};
var RecruiterScalarFieldEnum = {
  id: "id",
  userId: "userId",
  fullName: "fullName",
  email: "email",
  profilePhoto: "profilePhoto",
  phone: "phone",
  bio: "bio",
  companyName: "companyName",
  designation: "designation",
  experience: "experience",
  hiringBudget: "hiringBudget",
  verified: "verified",
  totalJobsPosted: "totalJobsPosted",
  activeJobs: "activeJobs",
  isSeeded: "isSeeded",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var RecruiterStatsScalarFieldEnum = {
  id: "id",
  recruiterId: "recruiterId",
  totalJobsPosted: "totalJobsPosted",
  activeJobs: "activeJobs",
  totalApplications: "totalApplications",
  shortlistedCount: "shortlistedCount",
  hiredCount: "hiredCount",
  avgResponseTimeMin: "avgResponseTimeMin",
  ratingScore: "ratingScore",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ResumeScalarFieldEnum = {
  id: "id",
  userId: "userId",
  fileUrl: "fileUrl",
  fileName: "fileName",
  fileType: "fileType",
  aiSummary: "aiSummary",
  aiScore: "aiScore",
  extractedSkills: "extractedSkills",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SavedJobScalarFieldEnum = {
  id: "id",
  userId: "userId",
  jobId: "jobId",
  createdAt: "createdAt"
};
var TestimonialScalarFieldEnum = {
  id: "id",
  userId: "userId",
  userRole: "userRole",
  content: "content",
  rating: "rating",
  meta: "meta",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TypingStateScalarFieldEnum = {
  id: "id",
  roomId: "roomId",
  userId: "userId",
  isTyping: "isTyping",
  isAI: "isAI",
  updatedAt: "updatedAt"
};
var UserPresenceScalarFieldEnum = {
  userId: "userId",
  isOnline: "isOnline",
  lastSeen: "lastSeen",
  lastAction: "lastAction",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = envVars.DATABASE_URL;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var formatConnectionError = (error) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown database connection error";
};
var connectPrismaWithRetry = async ({
  retries = 3,
  retryDelayMs = 1500
} = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;
      const errorMessage = formatConnectionError(error);
      console.error(
        `Prisma connection attempt ${attempt}/${retries} failed: ${errorMessage}`
      );
      if (isLastAttempt) {
        break;
      }
      await sleep(retryDelayMs);
    }
  }
  throw lastError;
};

// src/utilis/email.ts
import nodemailer from "nodemailer";
import status2 from "http-status";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASSWORD
  },
  port: parseInt(envVars.EMAIL_SENDER.SMTP_PORT)
});
var escapeHtml = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var renderOtpTemplate = (data) => {
  const name = escapeHtml(data.name ?? "User");
  const otp = escapeHtml(data.otp ?? "");
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
    <div style="max-width:480px;margin:auto;background:#ffffff;border-radius:8px;padding:24px;">
      <h2 style="margin:0 0 16px;color:#111;">Hello ${name},</h2>
      <p style="color:#333;">Use the verification code below. It expires in 2 minutes.</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:6px;background:#f1f5f9;padding:16px;border-radius:6px;text-align:center;color:#0f172a;">${otp}</div>
      <p style="color:#666;font-size:13px;margin-top:16px;">If you didn't request this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
};
var renderExpertApplicationDecisionTemplate = (data) => {
  const name = escapeHtml(data.name ?? "User");
  const statusText = String(data.status ?? "PENDING").toUpperCase();
  const isApproved = statusText === "APPROVED";
  const notes = data.notes ? escapeHtml(data.notes) : "";
  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background:#f6f8fb; padding:24px;">
    <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:8px;padding:24px;">
      <h2 style="margin:0 0 16px;color:#111;">Hello ${name},</h2>
      <p style="color:#333;line-height:1.6;">
        Your expert application review is now complete.
      </p>
      <div style="margin:16px 0;padding:14px;border-radius:6px;background:${isApproved ? "#ecfdf3" : "#fef2f2"};color:${isApproved ? "#065f46" : "#991b1b"};font-weight:700;">
        Status: ${statusText}
      </div>
      ${notes ? `<p style="color:#374151;line-height:1.6;"><strong>Admin Notes:</strong> ${notes}</p>` : ""}
      <p style="color:#666;font-size:13px;margin-top:16px;">
        If you have questions, please contact support.
      </p>
    </div>
  </body>
</html>`;
};
var templateRegistry = {
  otp: renderOtpTemplate,
  expertApplicationDecision: renderExpertApplicationDecisionTemplate
};
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments
}) => {
  try {
    const renderer = templateRegistry[templateName];
    if (!renderer) {
      throw new AppError_default(
        status2.INTERNAL_SERVER_ERROR,
        `Unknown email template: ${templateName}`
      );
    }
    const html = renderer(templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.fileName,
        content: attachment.context,
        contentType: attachment.contentType
      }))
    });
    console.log(`email sent ${to}: ${info.messageId} `);
  } catch (err) {
    console.log("email sending error", err.message);
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "failed to send");
  }
};

// src/lib/auth.ts
var ignoredBetterAuthMessages = /* @__PURE__ */ new Set([
  "User not found",
  "Invalid password",
  "Credential account not found",
  "Password not found"
]);
var shouldIgnoreBetterAuthLog = (level, message) => {
  return level === "error" && ignoredBetterAuthMessages.has(message);
};
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  logger: {
    level: "warn",
    log(level, message, ...args) {
      if (shouldIgnoreBetterAuthLog(level, message)) {
        return;
      }
      if (level === "error") {
        console.error(message, ...args);
        return;
      }
      if (level === "warn") {
        console.warn(message, ...args);
        return;
      }
      console.log(message, ...args);
    }
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          role: UserRole.CANDIDATE,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.CANDIDATE
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(`User with email ${email} not found. Cannot send verification OTP.`);
            return;
          }
          if (user && user.role === UserRole.ADMIN) {
            console.log(`User with email ${email} is a super admin. Skipping sending verification OTP.`);
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            }).catch((err) => {
              console.error("sendEmail (verify) failed:", err?.message ?? err);
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            }).catch((err) => {
              console.error("sendEmail (forget-password) failed:", err?.message ?? err);
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],
  advanced: {
    // Backend routes call Better Auth APIs server-to-server (no browser Origin header).
    // Keep CORS as the browser boundary and bypass Better Auth's Origin-based CSRF check.
    disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/utilis/seed.ts
var DEMO_CANDIDATE_EMAIL = process.env.DEMO_CANDIDATE_EMAIL || "candidate@hiregpt.demo";
var DEMO_CANDIDATE_PASSWORD = process.env.DEMO_CANDIDATE_PASSWORD || "Demo@12345";
var DEMO_CANDIDATE_NAME = process.env.DEMO_CANDIDATE_NAME || "Demo Candidate";
var DEMO_REQRUITER_EMAIL = process.env.DEMO_REQRUITER_EMAIL || "reqruiter@hiregpt.demo";
var DEMO_REQRUITER_PASSWORD = process.env.DEMO_REQRUITER_PASSWORD || "Demo@12345";
var DEMO_REQRUITER_NAME = process.env.DEMO_REQRUITER_NAME || "Demo Reqruiter";
var DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@consultedge.demo";
var DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Demo@12345";
var DEMO_ADMIN_NAME = process.env.DEMO_ADMIN_NAME || "Demo Admin";
var getDemoCandidateCredentials = () => ({
  email: DEMO_CANDIDATE_EMAIL,
  password: DEMO_CANDIDATE_PASSWORD,
  name: DEMO_CANDIDATE_NAME
});
var getDemoReqruiterCredentials = () => ({
  email: DEMO_REQRUITER_EMAIL,
  password: DEMO_REQRUITER_PASSWORD,
  name: DEMO_REQRUITER_NAME
});
var getDemoAdminCredentials = () => ({
  email: DEMO_ADMIN_EMAIL,
  password: DEMO_ADMIN_PASSWORD,
  name: DEMO_ADMIN_NAME
});
var seedDemoCandidate = async () => {
  const credentials = getDemoCandidateCredentials();
  const existingUser = await prisma.user.findUnique({
    where: {
      email: credentials.email
    },
    select: {
      id: true
    }
  });
  let userId = existingUser?.id;
  if (!userId) {
    const created = await auth.api.signUpEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        role: UserRole.CANDIDATE,
        rememberMe: false
      }
    });
    userId = created.user.id;
  }
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      name: credentials.name,
      role: UserRole.CANDIDATE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null
    }
  });
  await prisma.candidate.upsert({
    where: {
      userId
    },
    create: {
      userId,
      fullName: credentials.name,
      email: credentials.email,
      isDeleted: false
    },
    update: {
      fullName: credentials.name,
      email: credentials.email,
      isDeleted: false,
      deletedAt: null
    }
  });
  return credentials;
};
var seedAdmin = async () => {
  try {
    const isAdminExists = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN
      }
    });
    if (isAdminExists) {
      console.log("Admin seed skipped: admin already exists");
      return;
    }
    const adminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "Admin Saheb",
        role: UserRole.ADMIN,
        rememberMe: false
      }
    });
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: adminUser.user.id
        },
        data: {
          emailVerified: true
        }
      });
      await tx.admin.create({
        data: {
          userId: adminUser.user.id,
          name: " Admin Saheb",
          email: envVars.ADMIN_EMAIL
        }
      });
    });
    const admin = await prisma.admin.findFirst({
      where: {
        email: envVars.ADMIN_EMAIL
      },
      include: {
        user: true
      }
    });
    console.log(" admin created", admin);
  } catch (error) {
    console.error("Error sending  admin", error);
    await prisma.user.delete({
      where: {
        email: envVars.ADMIN_EMAIL
      }
    });
  }
};
var seedDemoReqruiter = async () => {
  const credentials = getDemoReqruiterCredentials();
  let industry = await prisma.industry.findFirst({
    where: { isDeleted: false },
    select: { id: true }
  });
  if (!industry) {
    industry = await prisma.industry.create({
      data: {
        name: "General Recruiting",
        description: "General recruiting and talent acquisition services."
      },
      select: { id: true }
    });
  }
  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true }
  });
  let userId = existingUser?.id;
  if (!userId) {
    const created = await auth.api.signUpEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        role: UserRole.RECRUITER,
        rememberMe: false
      }
    });
    userId = created.user.id;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: credentials.name,
      role: UserRole.RECRUITER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null
    }
  });
  await prisma.recruiter.upsert({
    where: { userId },
    create: {
      userId,
      fullName: credentials.name,
      email: credentials.email,
      title: "Senior Talent Acquisition Specialist",
      bio: "Demo reqruiter profile used for product walkthroughs.",
      experience: 8,
      consultationFee: 120,
      isVerified: true,
      industryId: industry.id,
      isDeleted: false
    },
    update: {
      fullName: credentials.name,
      email: credentials.email,
      isVerified: true,
      isDeleted: false,
      deletedAt: null
    }
  });
  return credentials;
};
var seedDemoAdmin = async () => {
  const credentials = getDemoAdminCredentials();
  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true }
  });
  let userId = existingUser?.id;
  if (!userId) {
    const created = await auth.api.signUpEmail({
      body: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        role: UserRole.ADMIN,
        rememberMe: false
      }
    });
    userId = created.user.id;
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: credentials.name,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      needPasswordChange: false,
      isDeleted: false,
      deletedAt: null
    }
  });
  await prisma.admin.upsert({
    where: { userId },
    create: {
      userId,
      name: credentials.name,
      email: credentials.email
    },
    update: {
      name: credentials.name,
      email: credentials.email
    }
  });
  return credentials;
};

// src/modules/auth/auth.service.ts
var isBetterAuthLikeError = (error) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error;
  return typeof candidate.statusCode === "number" || typeof candidate.status === "string" || typeof candidate.body?.message === "string";
};
var mapBetterAuthError = (error, fallbackMessage) => {
  if (!isBetterAuthLikeError(error)) {
    return null;
  }
  const message = error.body?.message || error.message || fallbackMessage;
  const statusCode = typeof error.statusCode === "number" ? error.statusCode : error.status === "UNAUTHORIZED" ? status3.UNAUTHORIZED : status3.BAD_REQUEST;
  return new AppError_default(statusCode, message);
};
var registerCandidate = async (payload) => {
  const { fullName, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: { name: fullName, email, password }
  });
  if (!data.user) {
    throw new AppError_default(status3.BAD_REQUEST, "Failed to register user");
  }
  await prisma.user.update({
    where: { id: data.user.id },
    data: { role: UserRole.CANDIDATE, status: UserStatus.ACTIVE }
  });
  const candidate = await prisma.$transaction(async (tx) => {
    try {
      const profile = await tx.candidate.create({
        data: {
          userId: data.user.id,
          fullName,
          email
        }
      });
      return profile;
    } catch (err) {
      await tx.user.delete({ where: { id: data.user.id } });
      throw err;
    }
  });
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: UserRole.CANDIDATE,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: UserRole.CANDIDATE,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  console.log(data, accessToken, refreshToken, candidate);
  return {
    ...data,
    accessToken,
    refreshToken,
    candidate
  };
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: { email, password }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(
      error,
      "Invalid email or password"
    );
    if (mappedError) {
      throw mappedError;
    }
    throw error;
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.FORBIDDEN, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
    // user: data.user,
    // token: data.token,        // <-- BetterAuth session token
    // redirect: data.redirect,
    // url: data.url,
    // accessToken,
    // refreshToken
  };
};
var loginDemoCandidate = async () => {
  await seedDemoCandidate();
  const credentials = getDemoCandidateCredentials();
  const data = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password
    }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(
      error,
      "Candidate demo login failed"
    );
    if (mappedError) {
      throw mappedError;
    }
    throw error;
  });
  if (data.user.role !== UserRole.CANDIDATE) {
    throw new AppError_default(status3.FORBIDDEN, "Demo account role is invalid");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.FORBIDDEN, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var loginDemoReqruiter = async () => {
  await seedDemoReqruiter();
  const credentials = getDemoReqruiterCredentials();
  const data = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password
    }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(error, "Reqruiter demo login failed");
    if (mappedError) throw mappedError;
    throw error;
  });
  if (data.user.role !== UserRole.RECRUITER) {
    throw new AppError_default(status3.FORBIDDEN, "Demo account role is invalid");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.FORBIDDEN, "User is deleted");
  }
  const tokenPayload = {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  };
  return {
    ...data,
    accessToken: tokenUtils.getAccessToken(tokenPayload),
    refreshToken: tokenUtils.getRefreshToken(tokenPayload)
  };
};
var loginDemoAdmin = async () => {
  await seedDemoAdmin();
  const credentials = getDemoAdminCredentials();
  const data = await auth.api.signInEmail({
    body: {
      email: credentials.email,
      password: credentials.password
    }
  }).catch((error) => {
    const mappedError = mapBetterAuthError(error, "Admin demo login failed");
    if (mappedError) throw mappedError;
    throw error;
  });
  if (data.user.role !== UserRole.ADMIN) {
    throw new AppError_default(status3.FORBIDDEN, "Demo account role is invalid");
  }
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.FORBIDDEN, "User is Blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status3.FORBIDDEN, "User is deleted");
  }
  const tokenPayload = {
    userId: data.user.id,
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  };
  return {
    ...data,
    accessToken: tokenUtils.getAccessToken(tokenPayload),
    refreshToken: tokenUtils.getRefreshToken(tokenPayload)
  };
};
var getMe = async (user) => {
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.userId },
    include: {
      candidates: true,
      recruiters: {
        include: {
          industries: true,
          interviews: true,
          jobApplications: true,
          jobs: true
        }
      },
      admins: true
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  return isUserExists;
};
var getNewToken = async (refreshToken, sessionToken) => {
  const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);
  if (!verifyRefreshToken.success) {
    throw new AppError_default(status3.UNAUTHORIZED, "invalid refresh token");
  }
  ;
  const data = verifyRefreshToken.data;
  if (!data?.userId) {
    throw new AppError_default(status3.UNAUTHORIZED, "invalid refresh token payload");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: data.userId
    }
  });
  if (!user || user.isDeleted || user.status === UserStatus.DELETED || user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status3.UNAUTHORIZED, "User is not authorized");
  }
  let nextSessionToken = null;
  if (sessionToken) {
    try {
      const betterAuthSession = await auth.api.getSession({
        headers: {
          Cookie: `better-auth.session_token=${sessionToken}`
        }
      });
      if (betterAuthSession?.session && betterAuthSession.user?.id === user.id) {
        await prisma.session.update({
          where: {
            token: betterAuthSession.session.token
          },
          data: {
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1e3),
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).catch(() => null);
        nextSessionToken = sessionToken;
      }
    } catch {
      nextSessionToken = null;
    }
  }
  const newAccessToken = tokenUtils.getAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: nextSessionToken
  };
};
var changePassword = async (payload, authContext) => {
  const { sessionToken, authorizationHeader, cookieHeader, userId } = authContext;
  const buildHeaders = (token) => {
    const headerInit = {};
    if (authorizationHeader) {
      headerInit.Authorization = authorizationHeader;
    } else if (token) {
      headerInit.Authorization = `Bearer ${token}`;
    }
    if (cookieHeader) {
      headerInit.Cookie = cookieHeader;
    } else if (token) {
      headerInit.Cookie = `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`;
    }
    return new Headers(headerInit);
  };
  if (!sessionToken && !authorizationHeader && !cookieHeader && !userId) {
    throw new AppError_default(status3.UNAUTHORIZED, "Session expired. Please login again.");
  }
  let authHeaders = buildHeaders(sessionToken);
  let session = await auth.api.getSession({
    headers: authHeaders
  }).catch(() => null);
  if (!session?.user && userId) {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: /* @__PURE__ */ new Date()
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
    if (activeSession?.token) {
      authHeaders = buildHeaders(activeSession.token);
      session = await auth.api.getSession({
        headers: authHeaders
      }).catch(() => null);
    }
  }
  if (!session?.user) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token. Please login again.");
  }
  const { currentPassword, newPassword } = payload;
  if (currentPassword && currentPassword === newPassword) {
    throw new AppError_default(
      status3.BAD_REQUEST,
      "New password must be different from current password"
    );
  }
  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "credential"
    }
  });
  let result;
  if (credentialAccount?.password) {
    if (!currentPassword) {
      throw new AppError_default(status3.BAD_REQUEST, "Current password is required");
    }
    result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true
      },
      headers: authHeaders
    });
  } else {
    result = await auth.api.setPassword({
      body: {
        newPassword
      },
      headers: authHeaders
    });
  }
  const operationStatus = "status" in result ? result.status : true;
  if (!operationStatus) {
    const errorMessage = typeof result?.message === "string" ? result.message : "Password change failed. Please verify your current password and try again.";
    throw new AppError_default(status3.BAD_REQUEST, errorMessage);
  }
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false }
    });
  }
  const updatedUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  if (!updatedUser) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    status: updatedUser.status,
    isDeleted: updatedUser.isDeleted,
    emailVerified: updatedUser.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    status: updatedUser.status,
    isDeleted: updatedUser.isDeleted,
    emailVerified: updatedUser.emailVerified
  });
  const betterAuthToken = "token" in result ? result.token : null;
  return {
    status: operationStatus,
    token: betterAuthToken,
    user: updatedUser,
    accessToken,
    refreshToken
  };
};
var logOutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  return result;
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email
      },
      data: {
        emailVerified: true
      }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status3.NOT_FOUND, "user not found");
  }
  if (!isUserExists.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "email not verified");
  }
  if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "user not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExists) {
    throw new AppError_default(status3.NOT_FOUND, "user not found");
  }
  if (!isUserExists.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "email not verified");
  }
  if (isUserExists.isDeleted || isUserExists.status === UserStatus.DELETED) {
    throw new AppError_default(status3.NOT_FOUND, "user not found");
  }
  const previousCredentialAccount = await prisma.account.findFirst({
    where: {
      userId: isUserExists.id,
      providerId: "credential"
    },
    select: {
      password: true,
      updatedAt: true
    }
  });
  const result = await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (!result?.success) {
    throw new AppError_default(status3.BAD_REQUEST, "Password reset failed");
  }
  const updatedCredentialAccount = await prisma.account.findFirst({
    where: {
      userId: isUserExists.id,
      providerId: "credential"
    },
    select: {
      password: true,
      updatedAt: true
    }
  });
  if (!updatedCredentialAccount?.password) {
    throw new AppError_default(status3.BAD_REQUEST, "New password was not saved");
  }
  if (previousCredentialAccount && previousCredentialAccount.password === updatedCredentialAccount.password && previousCredentialAccount.updatedAt.getTime() === updatedCredentialAccount.updatedAt.getTime()) {
    throw new AppError_default(status3.BAD_REQUEST, "New password was not saved");
  }
  if (isUserExists.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExists.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExists.id
    }
  });
};
var googleLoginSuccess = async (session) => {
  const isCandidateExists = await prisma.candidate.findUnique({
    where: {
      userId: session.user.id
    }
  });
  if (!isCandidateExists) {
    await prisma.candidate.create({
      data: {
        userId: session.user.id,
        fullName: session.user.name,
        email: session.user.email
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var checkEmailExists = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return !!user;
};
var updateProfile = async (user, payload) => {
  const baseUpdate = {
    name: payload.name,
    email: payload.email,
    image: payload.image
  };
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: baseUpdate
  });
  if (updatedUser.role === "RECRUITER") {
    await prisma.recruiter.update({
      where: { userId: user.userId },
      data: {
        title: payload.title,
        experience: payload.experience,
        industryId: payload.industryId
      }
    });
  }
  if (updatedUser.role === "CANDIDATE") {
    await prisma.candidate.update({
      where: { userId: user.userId },
      data: {
        fullName: payload.fullName
      }
    });
  }
  return updatedUser;
};
var authService = {
  registerCandidate,
  loginUser,
  loginDemoCandidate,
  loginDemoReqruiter,
  loginDemoAdmin,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
  checkEmailExists,
  updateProfile
};

// src/modules/auth/auth.controler.ts
import status4 from "http-status";

// src/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

// src/shared/sendResponsr.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    ...meta ? { meta } : {}
  });
};

// src/modules/auth/auth.controler.ts
var getBetterAuthSessionToken = (req) => req.cookies["better-auth.session_token"] ?? req.cookies["__Secure-better-auth.session_token"];
var registeredUser = catchAsync(
  async (req, res) => {
    const payload = req.body;
    console.log(payload);
    const result = await authService.registerCandidate(payload);
    sendResponse(res, {
      httpStatusCode: status4.CREATED,
      success: true,
      message: "user registered successfully",
      data: result
    });
  }
);
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await authService.loginUser(payload);
  const {
    accessToken,
    refreshToken,
    token,
    // BetterAuth session token
    user,
    // MUST be included
    ...rest
    // role, emailVerified, needPasswordChange, redirect, etc.
  } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "login successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      user,
      // REQUIRED
      ...rest
      // role, emailVerified, needPasswordChange, redirect
    }
  });
});
var candidateDemoLogin = catchAsync(async (_req, res) => {
  const result = await authService.loginDemoCandidate();
  const {
    accessToken,
    refreshToken,
    token,
    user,
    ...rest
  } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "candidate demo login successfully",
    data: {
      accessToken,
      refreshToken,
      token,
      user,
      ...rest
    }
  });
});
var reqruiterDemoLogin = catchAsync(async (_req, res) => {
  const result = await authService.loginDemoReqruiter();
  const { accessToken, refreshToken, token, user, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "reqruiter demo login successfully",
    data: { accessToken, refreshToken, token, user, ...rest }
  });
});
var adminDemoLogin = catchAsync(async (_req, res) => {
  const result = await authService.loginDemoAdmin();
  const { accessToken, refreshToken, token, user, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "admin demo login successfully",
    data: { accessToken, refreshToken, token, user, ...rest }
  });
});
var getMe2 = catchAsync(
  async (req, res) => {
    const user = req.user;
    const result = await authService.getMe(user);
    sendResponse(res, {
      httpStatusCode: status4.OK,
      success: true,
      message: "user profile fetched successfully",
      data: result
    });
  }
);
var getNewToken2 = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = getBetterAuthSessionToken(req);
  if (!refreshToken) {
    throw new AppError_default(status4.UNAUTHORIZED, "refresh token is missing");
  }
  const results = await authService.getNewToken(refreshToken, betterAuthSessionToken);
  const { accessToken, refreshToken: newRefreshToken, sessionToken } = results;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  if (sessionToken) {
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  }
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "new tokens successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken
    }
  });
});
var changePassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const betterAuthSessionToken = getBetterAuthSessionToken(req);
  const result = await authService.changePassword(
    payload,
    {
      sessionToken: betterAuthSessionToken,
      authorizationHeader: req.headers.authorization,
      cookieHeader: req.headers.cookie,
      userId: req.user?.userId
    }
  );
  const { accessToken, refreshToken } = result;
  const betterAuthToken = result.token;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  if (betterAuthToken) {
    tokenUtils.setBetterAuthSessionCookie(res, betterAuthToken);
  }
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var logOutUser2 = catchAsync(async (req, res) => {
  const betterAuthSessionToken = getBetterAuthSessionToken(req);
  const result = await authService.logOutUser(betterAuthSessionToken);
  const cookieNames = [
    "accessToken",
    "refreshToken",
    "better-auth.session_token",
    "__Secure-better-auth.session_token"
  ];
  const clearOptionVariants = [
    { httpOnly: true, secure: true, sameSite: "none", path: "/" },
    { httpOnly: true, secure: false, sameSite: "lax", path: "/" },
    { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    { path: "/" },
    {}
  ];
  for (const name of cookieNames) {
    for (const opts of clearOptionVariants) {
      CookieUtils.clearCookie(res, name, opts);
    }
  }
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "successfully Logout",
    data: result
  });
});
var verifyEmail2 = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyEmail(email, otp);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "email verified successfully"
  });
});
var forgetPassword2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "password reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "password reset successfully"
  });
});
var googleLogin = catchAsync((req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Login</title>
</head>
<body>
    <div><p>Redirecting to Google...</p></div>
    <script>
    (async () => {
        try {
            // Use a relative URL so the request always targets this same backend
            // origin, regardless of how BETTER_AUTH_URL is configured. Avoids
            // mixed-content / cross-origin failures behind a proxy.
            const response = await fetch("/api/auth/sign-in/social", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ provider: "google", callbackURL: ${JSON.stringify(callbackURL)} })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                document.body.innerHTML = '<div><p>Error redirecting to Google. Please try again later.</p></div>';
            }
        } catch (error) {
            document.body.innerHTML = '<div><p>Error redirecting to Google: ' + (error && error.message ? error.message : 'Unknown error') + '</p></div>';
        }
    })();
    </script>
</body>
</html>`;
  res.set("Content-Type", "text/html").send(html);
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/dashboard";
  const sessionToken = getBetterAuthSessionToken(req);
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      "Cookie": `better-auth.session_token=${sessionToken}`
    }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await authService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  const callbackParams = new URLSearchParams({
    accessToken,
    refreshToken,
    sessionToken,
    redirect: finalRedirectPath
  }).toString();
  res.redirect(`${envVars.FRONTEND_URL}/auth/oauth-callback?${callbackParams}`);
});
var handlerOAuthError = catchAsync(async (req, res) => {
  const error = req.query.error || "oauth failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var checkEmailAvailability = catchAsync(async (req, res) => {
  const email = req.query.email;
  const exists = await authService.checkEmailExists(email);
  if (exists) {
    return sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "Email already exists"
    });
  }
  return sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Email available"
  });
});
var updateProfile2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = req.body;
  const result = await authService.updateProfile(user, payload);
  sendResponse(res, {
    httpStatusCode: status4.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var authControler = {
  registeredUser,
  loginUser: loginUser2,
  candidateDemoLogin,
  reqruiterDemoLogin,
  adminDemoLogin,
  getMe: getMe2,
  getNewToken: getNewToken2,
  changePassword: changePassword2,
  logOutUser: logOutUser2,
  verifyEmail: verifyEmail2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  handlerOAuthError,
  checkEmailAvailability,
  updateProfile: updateProfile2
};

// src/middleware/cheackAuth.ts
import status5 from "http-status";
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : void 0;
    const cookieToken = CookieUtils.getCookie(req, "accessToken");
    const accessToken = bearerToken || cookieToken;
    const betterAuthSessionToken = CookieUtils.getCookie(req, "better-auth.session_token") || CookieUtils.getCookie(req, "__Secure-better-auth.session_token");
    let userId = null;
    let betterAuthSession = null;
    if (accessToken) {
      const verified = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
      if (verified.success && verified.data?.userId) {
        userId = String(verified.data.userId);
      }
    }
    if (!userId && (betterAuthSessionToken || authHeader)) {
      const fallbackCookieHeader = req.headers.cookie || [
        betterAuthSessionToken ? `better-auth.session_token=${betterAuthSessionToken}` : "",
        betterAuthSessionToken ? `__Secure-better-auth.session_token=${betterAuthSessionToken}` : ""
      ].filter(Boolean).join("; ");
      betterAuthSession = await auth.api.getSession({
        headers: {
          ...fallbackCookieHeader ? { cookie: fallbackCookieHeader } : {},
          ...authHeader ? { authorization: authHeader } : {}
        }
      }).catch(() => null);
      if (betterAuthSession?.user?.id) {
        userId = betterAuthSession.user.id;
      }
    }
    if (!userId) {
      throw new AppError_default(
        status5.UNAUTHORIZED,
        `Unauthorized! No access token. Route: ${req.method} ${req.originalUrl}. Send cookie or Bearer token.`
      );
    }
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized! User not found.");
    }
    const userRole = user.role;
    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
      throw new AppError_default(status5.UNAUTHORIZED, "Unauthorized! User inactive.");
    }
    if (authRoles.length > 0 && !authRoles.includes(userRole)) {
      throw new AppError_default(
        status5.FORBIDDEN,
        `Forbidden! No permission. Current role: ${userRole}. Allowed roles: ${authRoles.join(", ")}. Route: ${req.method} ${req.originalUrl}`
      );
    }
    if (!cookieToken && betterAuthSession?.user?.id === user.id) {
      const refreshedAccessToken = tokenUtils.getAccessToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        isDeleted: user.isDeleted,
        emailVerified: user.emailVerified
      });
      tokenUtils.setAccessTokenCookie(res, refreshedAccessToken);
    }
    req.user = {
      userId: user.id,
      userRole,
      email: user.email
    };
    if (betterAuthSession?.session && betterAuthSession.user?.id === user.id) {
      const now = /* @__PURE__ */ new Date();
      const expiresAt = new Date(betterAuthSession.session.expiresAt);
      const createdAt = new Date(betterAuthSession.session.createdAt);
      const sessionLifetime = expiresAt.getTime() - createdAt.getTime();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      if (sessionLifetime > 0) {
        const percentRemaining = timeRemaining / sessionLifetime * 100;
        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// src/middleware/validateRequest.ts
var replaceObjectContents = (target, source) => {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
  if (source && typeof source === "object") {
    Object.assign(target, source);
  }
};
var validateRequest = (zodSchema) => {
  return (req, res, next) => {
    try {
      if (typeof req.body?.data === "string") {
        req.body = JSON.parse(req.body.data);
      }
      const normalizedBody = req.body ?? {};
      const requestData = {
        body: normalizedBody,
        query: req.query,
        params: req.params
      };
      const wrappedResult = zodSchema.safeParse(requestData);
      if (wrappedResult.success) {
        const parsedData = wrappedResult.data;
        if (parsedData.body !== void 0) {
          req.body = parsedData.body;
        }
        if (parsedData.query !== void 0) {
          replaceObjectContents(
            req.query,
            parsedData.query
          );
        }
        if (parsedData.params !== void 0) {
          replaceObjectContents(
            req.params,
            parsedData.params
          );
        }
        return next();
      }
      const bodyOnlyResult = zodSchema.safeParse(normalizedBody);
      if (!bodyOnlyResult.success) {
        return next(bodyOnlyResult.error);
      }
      req.body = bodyOnlyResult.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/auth/auth.validation.ts
import { z } from "zod";
var registerZodSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var loginZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});
var candidateDemoLoginZodSchema = z.object({
  mode: z.literal("candidate").optional()
});
var forgotPasswordZodSchema = z.object({
  email: z.string().email("Invalid email")
});
var changePasswordZodSchema = z.object({
  currentPassword: z.string().trim().optional().transform((value) => value || void 0),
  newPassword: z.string().min(8, "Password must be at least 8 characters long").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
});
var updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  image: z.string().url().nullable().optional(),
  // Reqruiter fields
  title: z.string().optional(),
  experience: z.number().optional(),
  industryId: z.string().optional(),
  // Candidate fields
  fullName: z.string().optional()
});

// src/modules/auth/auth.router.ts
var router = Router();
router.post("/register", validateRequest(registerZodSchema), authControler.registeredUser);
router.post("/login", validateRequest(loginZodSchema), authControler.loginUser);
router.post("/demo-login", validateRequest(candidateDemoLoginZodSchema), authControler.candidateDemoLogin);
router.post("/demo-login/reqruiter", authControler.reqruiterDemoLogin);
router.post("/demo-login/admin", authControler.adminDemoLogin);
router.get("/me", checkAuth(), authControler.getMe);
router.post("/refresh-token", authControler.getNewToken);
router.post(
  "/change-password",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(changePasswordZodSchema),
  authControler.changePassword
);
router.post("/logOut", checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER), authControler.logOutUser);
var authRoutes = router;
router.post("/verify-email", authControler.verifyEmail);
router.post("/forget-password", validateRequest(forgotPasswordZodSchema), authControler.forgetPassword);
router.post("/reset-password", authControler.resetPassword);
router.get("/login/google", authControler.googleLogin);
router.get("/google/success", authControler.googleLoginSuccess);
router.get("/oauth/error", authControler.handlerOAuthError);
router.get("/check-email", authControler.checkEmailAvailability);
router.put(
  "/update-profile",
  checkAuth(),
  validateRequest(updateProfileSchema),
  authControler.updateProfile
);

// src/modules/reqruiter/reqruiter.router.ts
import { Router as Router2 } from "express";

// src/modules/reqruiter/reqruiter.controller.ts
import status8 from "http-status";

// src/modules/reqruiter/reqruiter.service.ts
import status6 from "http-status";

// src/utilis/queryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.page = 1;
    this.limit = 10;
    this.skip = 0;
    this.sortBy = "createdAt";
    this.sortOrder = "desc";
    this.selectFields = {};
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  // SEARCH
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map(
        (field) => {
          if (field.includes(".")) {
            const parts = field.split(".");
            if (parts.length === 2) {
              const [relation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  [nestedField]: stringFilter2
                }
              };
            } else if (parts.length === 3) {
              const [relation, nestedRelation, nestedField] = parts;
              const stringFilter2 = {
                contains: searchTerm,
                mode: "insensitive"
              };
              return {
                [relation]: {
                  some: {
                    [nestedRelation]: {
                      [nestedField]: stringFilter2
                    }
                  }
                }
              };
            }
          }
          const stringFilter = {
            contains: searchTerm,
            mode: "insensitive"
          };
          return {
            [field]: stringFilter
          };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  // FILTER
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  //paginate
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  //sort 
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [realation, nestedField] = parts;
        this.query.orderBy = {
          [realation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [realation, nestedRealition, nestedField] = parts;
        this.query.orderBy = {
          [realation]: {
            [nestedField]: {
              [nestedRealition]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    }
    return this;
  }
  //  //fields
  //  fields():this{
  //   const fieldsParams = this.queryParams.fields
  // if(fieldsParams && typeof fieldsParams === 'string'){
  //     const fieldsArray = fieldsParams?.split(',').map(field => field.trim())
  //   this.selectFields = {}
  //   fieldsArray?.forEach(field => {
  //     if(this.selectFields){
  //       this.selectFields[field] = true
  //     }
  //   })
  //   this.query.select = this.selectFields as Record<string, boolean | Record<string, unknown>>
  //   delete this.query.include
  // }
  //   return this
  //  }
  //include
  include(relation) {
    if (Object.keys(this.selectFields).length > 0) return this;
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  //dynamicInclude
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.includes;
    if (includeParam && typeof includeParam === "string") {
      const requestRelations = includeParam.split(",").map((relation) => relation.trim());
      requestRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = { ...this.query.include, ...result };
    return this;
  }
  fields() {
    const fieldsParams = this.queryParams.fields;
    if (fieldsParams && typeof fieldsParams === "string") {
      const fieldsArray = fieldsParams.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray.forEach((field) => {
        this.selectFields[field] = true;
      });
      this.query.select = this.selectFields;
    }
    return this;
  }
  //where
  where(condition) {
    this.query.where = this.deepMerge(this.query.where, condition);
    this.countQuery.where = this.deepMerge(this.countQuery.where, condition);
    return this;
  }
  //excute
  async excute() {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(this.query)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  //count
  async count() {
    return await this.model.count(this.countQuery);
  }
  //debugging purpose method
  getQuery() {
    return this.query;
  }
  //deep merge
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/modules/reqruiter/reqruiter.constant.ts
var reqruiterSearchableFields = [
  "fullName",
  "email",
  "title",
  "bio",
  "phone",
  "industry.name"
];
var reqruiterFilterableFields = [
  "isVerified",
  "industryId",
  "experience",
  "price",
  "isDeleted"
];
var reqruiterIncludeConfig = {
  user: true,
  industry: true,
  schedules: {
    include: { schedule: true }
  },
  consultations: {
    include: {
      candidate: true,
      reqruiterSchedule: true
    }
  },
  testimonials: true,
  verification: true
};

// src/modules/reqruiter/reqruiter.service.ts
var getAllReqruiters = async (query2) => {
  const qb = new QueryBuilder(prisma.recruiter, query2, {
    searchableFields: reqruiterSearchableFields,
    filterableFields: reqruiterFilterableFields
  });
  const result = await qb.search().filter().where({
    isDeleted: false,
    user: { is: { isDeleted: false } }
  }).include({
    user: true
  }).dynamicInclude(reqruiterIncludeConfig).paginate().sort().fields().excute();
  return result;
};
var getReqruiterById = async (id) => {
  const reqruiter = await prisma.recruiter.findFirst({
    where: {
      id,
      isDeleted: false,
      user: { is: { isDeleted: false } }
      // industry: { is: { isDeleted: false } },
    },
    include: {
      user: true,
      schedules: {
        where: {
          isDeleted: false,
          isPublished: true,
          isBooked: false,
          schedule: {
            isDeleted: false,
            endDateTime: { gt: /* @__PURE__ */ new Date() }
          }
        },
        include: { schedule: true },
        orderBy: { schedule: { startDateTime: "asc" } }
      },
      consultations: {
        include: {
          candidate: true,
          reqruiterSchedule: true
        }
      },
      testimonials: true,
      verification: true
    }
  });
  if (!reqruiter) {
    throw new AppError_default(status6.NOT_FOUND, "Reqruiter not found");
  }
  return reqruiter;
};
var updateReqruiter = async (id, payload) => {
  const reqruiter = await prisma.recruiter.findUnique({
    where: { id, isDeleted: false }
  });
  if (!reqruiter) {
    throw new AppError_default(status6.NOT_FOUND, "Reqruiter not found");
  }
  const updated = await prisma.recruiter.update({
    where: { id },
    data: payload
  });
  return updated;
};
var deleteReqruiter = async (id) => {
  const reqruiter = await prisma.recruiter.findUnique({
    where: { id, isDeleted: false }
  });
  if (!reqruiter) {
    throw new AppError_default(status6.NOT_FOUND, "Reqruiter not found");
  }
  const deleted = await prisma.recruiter.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
  return deleted;
};
var reqruiterService = {
  getAllReqruiters,
  getReqruiterById,
  updateReqruiter,
  deleteReqruiter
};

// src/modules/reqruiter/reqruiterApplication.upload.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// src/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status7 from "http-status";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var cloudinaryUpload = cloudinary;

// src/modules/reqruiter/reqruiterApplication.upload.ts
var allowedResumeMimeTypes = /* @__PURE__ */ new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
var allowedImageMimeTypes = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
]);
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "");
    const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileNameWithoutExtension}`;
    let folder = "documents";
    if (file.fieldname === "profilePhoto") {
      folder = "reqruiter-profile-photos";
    } else if (file.fieldname === "resume") {
      folder = extension === "pdf" ? "resumes" : "documents";
    }
    return {
      folder: `hiregpt/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var fileFilter = (_req, file, cb) => {
  if (file.fieldname === "profilePhoto") {
    if (!allowedImageMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid profile photo type. Allowed: JPG, PNG, WEBP, GIF"));
      return;
    }
    cb(null, true);
    return;
  }
  if (file.fieldname === "resume") {
    if (!allowedResumeMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid resume type. Allowed: PDF, DOC, DOCX"));
      return;
    }
    cb(null, true);
    return;
  }
  cb(new Error(`Unexpected file field: ${file.fieldname}`));
};
var reqruiterApplicationUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
var mapUploadedResume = (file) => {
  const cloudinaryFile = file;
  const resumeUrl = cloudinaryFile.path ?? cloudinaryFile.secure_url;
  if (!resumeUrl) {
    throw new Error("Failed to resolve uploaded resume URL from Cloudinary");
  }
  return {
    resumeUrl,
    resumeFileName: file.originalname,
    resumeFileType: file.mimetype,
    resumeFileSize: file.size
  };
};

// src/modules/reqruiter/reqruiter.controller.ts
var getAllReqruiters2 = catchAsync(async (req, res) => {
  const query2 = req.query;
  const result = await reqruiterService.getAllReqruiters(query2);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Reqruiters fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getReqruiterById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const reqruiter = await reqruiterService.getReqruiterById(id);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Reqruiter retrieved successfully",
    data: reqruiter
  });
});
var updateReqruiter2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  const updatedReqruiter = await reqruiterService.updateReqruiter(id, payload);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Reqruiter updated successfully",
    data: updatedReqruiter
  });
});
var deleteReqruiter2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedReqruiter = await reqruiterService.deleteReqruiter(id);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Reqruiter deleted successfully",
    data: deletedReqruiter
  });
});
var applyReqruiter = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const files = req.files;
  const resumeFile = files?.resume?.[0];
  const profilePhotoFile = files?.profilePhoto?.[0];
  const resume = resumeFile ? mapUploadedResume(resumeFile) : void 0;
});
var reqruiterController = {
  getAllReqruiters: getAllReqruiters2,
  getReqruiterById: getReqruiterById2,
  updateReqruiter: updateReqruiter2,
  deleteReqruiter: deleteReqruiter2,
  applyReqruiter
};

// src/modules/reqruiter/reqruiter.validationSchema.ts
import z2 from "zod";
var updateReqruiterValidationSchema = z2.object({
  body: z2.object({
    fullName: z2.string().optional(),
    email: z2.string().email("Invalid email format").optional(),
    profilePhoto: z2.string().url("Invalid URL format").optional(),
    phone: z2.string().optional(),
    bio: z2.string().optional(),
    title: z2.string().optional(),
    experience: z2.number().int().nonnegative().optional(),
    price: z2.number().int().positive("Price must be positive").optional(),
    industryId: z2.string().uuid("Industry ID must be a valid UUID").optional()
  })
});
var applyReqruiterValidation = z2.object({
  fullName: z2.string().min(2),
  email: z2.string().email("Invalid email"),
  phone: z2.string().optional(),
  bio: z2.string().optional(),
  title: z2.string().optional(),
  experience: z2.number().int().min(0).optional(),
  consultationFee: z2.number().int().min(1),
  industryId: z2.string().uuid()
});

// src/modules/reqruiter/reqruiter.router.ts
var router2 = Router2();
router2.get("/", reqruiterController.getAllReqruiters);
router2.get("/:id", reqruiterController.getReqruiterById);
router2.post(
  "/apply",
  reqruiterApplicationUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 }
  ]),
  checkAuth(UserRole.CANDIDATE),
  reqruiterController.applyReqruiter
);
router2.put(
  "/:id",
  validateRequest(updateReqruiterValidationSchema),
  checkAuth(UserRole.ADMIN, UserRole.RECRUITER),
  reqruiterController.updateReqruiter
);
router2.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.RECRUITER),
  reqruiterController.deleteReqruiter
);
var reqruiterRouter = router2;

// src/modules/admin/admin.router.ts
import { Router as Router3 } from "express";

// src/modules/admin/admin.controler.ts
import status10 from "http-status";

// src/modules/admin/admin.service.ts
import status9 from "http-status";

// src/modules/admin/admin.constant.ts
var adminSearchableFields = [
  "name",
  "email",
  "contactNumber",
  "user.role",
  "user.status"
];
var adminFilterableFields = [
  "isDeleted",
  "email",
  "contactNumber",
  "user.role",
  "user.status"
];
var adminIncludeConfig = {
  user: true
};

// src/modules/admin/admin.service.ts
var findActiveAdminById = async (id) => {
  const admin = await prisma.admin.findFirst({
    where: { id, isDeleted: false },
    include: { user: true }
  });
  if (!admin) {
    throw new AppError_default(status9.NOT_FOUND, "Admin not found");
  }
  return admin;
};
var buildAdminUpdatePayload = (payload) => {
  const data = {};
  if (payload.contactNumber !== void 0) {
    data.contactNumber = payload.contactNumber.trim();
  }
  if (payload.profilePhoto !== void 0) {
    data.profilePhoto = payload.profilePhoto.trim();
  }
  return data;
};
var getAllAdmin = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.admin, query2, {
    searchableFields: adminSearchableFields,
    filterableFields: adminFilterableFields
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).include({
    user: true
  }).dynamicInclude(adminIncludeConfig).paginate().sort().fields().excute();
  return result;
};
var getAdminById = async (id) => {
  return findActiveAdminById(id);
};
var updateAdmin = async (id, payload) => {
  const admin = await findActiveAdminById(id);
  const updatePayload = buildAdminUpdatePayload(payload);
  if (Object.keys(updatePayload).length === 0) {
    throw new AppError_default(status9.BAD_REQUEST, "No valid admin fields provided for update");
  }
  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: updatePayload,
    include: {
      user: true
    }
  });
  return updatedAdmin;
};
var markDeleteAdmin = async (id, user) => {
  const admin = await findActiveAdminById(id);
  if (admin.userId === user.userId) {
    throw new AppError_default(status9.BAD_REQUEST, "You cannot delete yourself");
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
    });
    await tx.user.update({
      where: { id: admin.userId },
      data: { isDeleted: true, status: "DELETED" }
    });
    return true;
  });
  return result;
};
var adminService = {
  getAllAdmin,
  updateAdmin,
  getAdminById,
  markDeleteAdmin
};

// src/modules/admin/admin.controler.ts
var getAllAdmin2 = catchAsync(async (req, res) => {
  const admins = await adminService.getAllAdmin(req.query);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Admins retrieved successfully",
    data: admins
  });
});
var getAdminById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const admin = await adminService.getAdminById(id);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "admin retrieved successfully",
    data: admin
  });
});
var updateAdmin2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const updatedAdmin = await adminService.updateAdmin(id, data);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "Admin updated successfully",
    data: updatedAdmin
  });
});
var deleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const adminDoctor = await adminService.markDeleteAdmin(id, user);
  sendResponse(res, {
    httpStatusCode: status10.OK,
    success: true,
    message: "admin deleted successfully",
    data: adminDoctor
  });
});
var adminController = {
  getAllAdmin: getAllAdmin2,
  updateAdmin: updateAdmin2,
  getAdminById: getAdminById2,
  deleteAdmin
};

// src/modules/admin/admin.validation.ts
import z3 from "zod";
var adminIdParamsSchema = z3.object({
  id: z3.string().uuid("Invalid admin id")
});
var updateAdminValidationSchema = z3.object({
  params: adminIdParamsSchema,
  body: z3.object({
    contactNumber: z3.string().trim().min(1, "Contact number cannot be empty").optional(),
    profilePhoto: z3.string().trim().min(1, "Profile photo cannot be empty").optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update"
  })
});
var adminIdValidationSchema = z3.object({
  params: adminIdParamsSchema
});

// src/modules/admin/admin.router.ts
var router3 = Router3();
router3.get("/", checkAuth(UserRole.ADMIN), adminController.getAllAdmin);
router3.get("/:id", checkAuth(UserRole.ADMIN), validateRequest(adminIdValidationSchema), adminController.getAdminById);
router3.put("/:id", checkAuth(UserRole.ADMIN), validateRequest(updateAdminValidationSchema), adminController.updateAdmin);
router3.delete("/:id", checkAuth(UserRole.ADMIN), validateRequest(adminIdValidationSchema), adminController.deleteAdmin);
var adminRouter = router3;

// src/modules/user/user.router.ts
import { Router as Router4 } from "express";

// src/modules/user/user.service.ts
import status11 from "http-status";
var createAdmin = async (payload) => {
  const existsUser = await prisma.user.findUnique({
    where: {
      email: payload.admin.email
    }
  });
  if (existsUser) {
    throw new AppError_default(status11.BAD_REQUEST, "user with same email already exists");
  }
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      name: payload.admin.name,
      role: UserRole.ADMIN,
      needPasswordChange: true
    }
  });
  console.log("User Data from auth:", userData);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.admin
        }
      });
      console.log("Payload admin:", payload.admin);
      console.log("Admin Data from DB:", adminData.id);
      const admin = await tx.admin.findUnique({
        where: {
          id: adminData.id
        },
        select: {
          id: true,
          name: true,
          email: true,
          contactNumber: true,
          profilePhoto: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              emailVerified: true
            }
          }
        }
      });
      console.log("admin:", admin);
      return admin;
    });
    console.log("result:", result);
    return result;
  } catch (error) {
    console.log("transaction error", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id
      }
    });
    throw new AppError_default(status11.INTERNAL_SERVER_ERROR, "Failed to create admin profile");
  }
};
var getAllClients = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.user, query2, {
    searchableFields: ["name", "email"],
    filterableFields: ["name", "email", "isDeleted", "id"]
  });
  const result = await queryBuilder.search().filter().where({
    isDeleted: false
  }).paginate().sort().fields().excute();
  return result;
};
var updateProfile3 = async (userId, payload) => {
  const allowedFields = ["name", "email", "contactNumber", "profilePhoto"];
  const updateData = {};
  for (const key of allowedFields) {
    if (payload[key] !== void 0) updateData[key] = payload[key];
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  return user;
};
var userService = {
  createAdmin,
  getAllClients,
  updateProfile: updateProfile3
};

// src/modules/user/user.controler.ts
import status12 from "http-status";
var createAdmin2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await userService.createAdmin(payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status12.CREATED,
    message: "Admin created successfully",
    data: result
  });
});
var getAllClients2 = catchAsync(async (req, res) => {
  const result = await userService.getAllClients(req.query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status12.OK,
    message: "Clients retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});
var updateProfile4 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await userService.updateProfile(userId, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status12.OK,
    message: "Profile updated successfully",
    data: result
  });
});
var userController = {
  createAdmin: createAdmin2,
  getAllClients: getAllClients2,
  updateProfile: updateProfile4
};

// src/modules/user/user.validation.ts
import z4 from "zod";
var createAdminZodSchema = z4.object({
  password: z4.string("Password is required").min(8, "Password must be at least 8 characters long").max(50, "Password must be less than 100 characters long"),
  admin: z4.object({
    name: z4.string("Name is required").min(5, "Name must be at least 5 characters long").max(20, "Name must be less than 20 characters long"),
    email: z4.email("Invalid email address"),
    contactNumber: z4.string("Contact number is required").min(11, "Contact number must be at least 10 characters long").max(15, "Contact number must be less than 15 characters long").optional(),
    address: z4.string("Address is required").min(10, "Address must be at least 10 characters long").max(100, "Address must be less than 100 characters long").optional(),
    profilePhoto: z4.url({ message: "Profile photo must be a valid URL" }).optional()
  })
});

// src/modules/user/user.router.ts
var router4 = Router4();
router4.put("/profile", checkAuth(), userController.updateProfile);
router4.get("/clients", checkAuth(UserRole.ADMIN), userController.getAllClients);
router4.post("/create-admin", validateRequest(createAdminZodSchema), checkAuth(UserRole.ADMIN), userController.createAdmin);
var userRouter = router4;

// src/modules/industry/industry.router.ts
import { Router as Router5 } from "express";

// src/modules/industry/industry.validation.ts
import z5 from "zod";
var industryBodySchema = z5.object({
  name: z5.string().trim().min(2, "Industry name is too short"),
  description: z5.string().trim().optional(),
  icon: z5.string().trim().url("Invalid icon URL").optional()
});
var industryIdParamsSchema = z5.object({
  id: z5.string().uuid("Invalid industry id")
});
var createIndustryValidation = z5.object({
  body: industryBodySchema
});
var updateIndustryValidation = z5.object({
  params: industryIdParamsSchema,
  body: industryBodySchema.partial()
});
var industryIdValidation = z5.object({
  params: industryIdParamsSchema
});

// src/modules/industry/industry.controler.ts
import status14 from "http-status";

// src/modules/industry/industry.service.ts
import status13 from "http-status";
var findActiveIndustryById = async (id) => {
  const industry = await prisma.industry.findFirst({
    where: { id, isDeleted: false }
  });
  if (!industry) {
    throw new AppError_default(status13.NOT_FOUND, "Industry not found");
  }
  return industry;
};
var ensureIndustryNameAvailable = async (name, excludeIndustryId) => {
  const existingIndustry = await prisma.industry.findUnique({
    where: { name }
  });
  if (existingIndustry && existingIndustry.id !== excludeIndustryId) {
    throw new AppError_default(status13.CONFLICT, "Industry already exists");
  }
};
var buildIndustryPayload = (payload) => {
  const data = {};
  if (payload.name !== void 0) {
    data.name = payload.name.trim();
  }
  if (payload.description !== void 0) {
    data.description = payload.description.trim();
  }
  if (payload.icon !== void 0) {
    data.icon = payload.icon.trim();
  }
  return data;
};
var createIndustry = async (payload) => {
  const data = buildIndustryPayload(payload);
  await ensureIndustryNameAvailable(data.name);
  const industry = await prisma.industry.create({
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon
    }
  });
  return industry;
};
var getAllIndustries = async (query2) => {
  const qb = new QueryBuilder(prisma.industry, query2, {
    searchableFields: ["name", "description"],
    filterableFields: ["name"]
  });
  const result = await qb.search().filter().where({ isDeleted: false }).paginate().sort().fields().excute();
  return result;
};
var getIndustryById = async (id) => {
  const industry = await prisma.industry.findFirst({
    where: { id, isDeleted: false },
    include: { jobs: true, recruiters: true }
  });
  if (!industry) {
    throw new AppError_default(status13.NOT_FOUND, "Industry not found");
  }
  return industry;
};
var updateIndustry = async (id, data) => {
  const existingIndustry = await findActiveIndustryById(id);
  const updateData = buildIndustryPayload(data);
  if (Object.keys(updateData).length === 0) {
    throw new AppError_default(status13.BAD_REQUEST, "No valid industry fields provided for update");
  }
  if (updateData.name !== void 0 && updateData.name !== existingIndustry.name) {
    await ensureIndustryNameAvailable(updateData.name, id);
  }
  const updated = await prisma.industry.update({
    where: { id },
    data: updateData
  });
  return updated;
};
var deleteIndustry = async (id) => {
  await findActiveIndustryById(id);
  const deleted = await prisma.industry.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return deleted;
};
var industryService = {
  createIndustry,
  getAllIndustries,
  getIndustryById,
  updateIndustry,
  deleteIndustry
};

// src/modules/industry/industry.controler.ts
var createIndustry2 = catchAsync(async (req, res) => {
  const { name, description, icon: iconUrl } = req.body;
  const icon = req.file?.path ?? iconUrl;
  const result = await industryService.createIndustry({
    name,
    description,
    icon
  });
  sendResponse(res, {
    httpStatusCode: status14.CREATED,
    success: true,
    message: "Industry created successfully",
    data: result
  });
});
var getAllIndustries2 = catchAsync(async (req, res) => {
  const result = await industryService.getAllIndustries(req.query);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Industries fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getIndustryById2 = catchAsync(async (req, res) => {
  const result = await industryService.getIndustryById(req.params.id);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Industry retrieved successfully",
    data: result
  });
});
var updateIndustry2 = catchAsync(async (req, res) => {
  const { name, description, icon: iconUrl } = req.body;
  const icon = req.file?.path ?? iconUrl;
  const payload = {
    ...name !== void 0 ? { name } : {},
    ...description !== void 0 ? { description } : {},
    ...icon !== void 0 ? { icon } : {}
  };
  const result = await industryService.updateIndustry(
    req.params.id,
    payload
  );
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Industry updated successfully",
    data: result
  });
});
var deleteIndustry2 = catchAsync(async (req, res) => {
  const result = await industryService.deleteIndustry(req.params.id);
  sendResponse(res, {
    httpStatusCode: status14.OK,
    success: true,
    message: "Industry deleted successfully",
    data: result
  });
});
var industryController = {
  createIndustry: createIndustry2,
  getAllIndustries: getAllIndustries2,
  getIndustryById: getIndustryById2,
  updateIndustry: updateIndustry2,
  deleteIndustry: deleteIndustry2
};

// src/config/multer.config.ts
import { CloudinaryStorage as CloudinaryStorage2 } from "multer-storage-cloudinary";
import multer2 from "multer";
var storage2 = new CloudinaryStorage2({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extention = originalName.split(".").pop()?.toLocaleLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLocaleLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "");
    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extention === "pdf" ? "pdfs" : "images";
    return {
      folder: `ph-health-care/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer2({ storage: storage2 });

// src/modules/industry/industry.router.ts
var router5 = Router5();
router5.post(
  "/",
  checkAuth(UserRole.ADMIN),
  multerUpload.single("file"),
  validateRequest(createIndustryValidation),
  industryController.createIndustry
);
router5.get("/", industryController.getAllIndustries);
router5.get("/:id", validateRequest(industryIdValidation), industryController.getIndustryById);
router5.delete(
  "/:id",
  checkAuth(UserRole.ADMIN),
  validateRequest(industryIdValidation),
  industryController.deleteIndustry
);
router5.put(
  "/:id",
  checkAuth(UserRole.ADMIN),
  multerUpload.single("file"),
  validateRequest(updateIndustryValidation),
  industryController.updateIndustry
);
var industryRouter = router5;

// src/modules/stats/stats.router.ts
import express from "express";

// src/modules/stats/stats.controler.ts
import status15 from "http-status";

// src/modules/stats/stats.service.ts
var getAdminStats = async () => {
  const [totalUsers, totalRecruiters, totalCandidates, totalJobs, totalApplications] = await Promise.all([
    prisma.user.count(),
    prisma.recruiter.count(),
    prisma.candidate.count(),
    prisma.job.count(),
    prisma.jobApplication.count()
  ]);
  return {
    totalUsers,
    totalRecruiters,
    totalCandidates,
    totalJobs,
    totalApplications
    // totalRevenue: totalRevenue._sum.amount || 0,
  };
};
var getRecruiterStats = async (user) => {
  const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
  if (!recruiter) return { jobsPosted: 0, applicationsReceived: 0, jobs: [], applicationStatusDistribution: [] };
  const jobs = await prisma.job.findMany({ where: { recruiterId: recruiter.id } });
  const jobIds = jobs.map((j) => j.id);
  const jobsPosted = jobs.length;
  const applicationsReceived = await prisma.jobApplication.count({ where: { jobId: { in: jobIds } } });
  const applicationStatusDistribution = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { jobId: { in: jobIds } },
    _count: { id: true }
  });
  const formattedStatus = applicationStatusDistribution.map((item) => ({
    status: item.status,
    count: item._count.id
  }));
  return {
    jobsPosted,
    applicationsReceived,
    jobs,
    applicationStatusDistribution: formattedStatus
  };
};
var getCandidateStats = async (user) => {
  const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
  if (!candidate) return { applicationsSubmitted: 0, jobsAppliedTo: 0, applicationStatusDistribution: [] };
  const applications = await prisma.jobApplication.findMany({ where: { jobSeekerId: candidate.id } });
  const applicationsSubmitted = applications.length;
  const jobsAppliedTo = new Set(applications.map((a) => a.jobId)).size;
  const applicationStatusDistribution = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { jobSeekerId: candidate.id },
    _count: { id: true }
  });
  const formattedStatus = applicationStatusDistribution.map((item) => ({
    status: item.status,
    count: item._count.id
  }));
  return {
    applicationsSubmitted,
    jobsAppliedTo,
    applicationStatusDistribution: formattedStatus
  };
};
var getDashboardStatsData = async (user) => {
  switch (user.userRole) {
    case UserRole.ADMIN:
      return getAdminStats();
    case UserRole.RECRUITER:
      return getRecruiterStats(user);
    case UserRole.CANDIDATE:
      return getCandidateStats(user);
    default:
      throw new Error("Invalid user role");
  }
};
var StatsService = {
  getDashboardStatsData
};

// src/modules/stats/stats.controler.ts
var getDashboardStatsData2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await StatsService.getDashboardStatsData(user);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Dashboard stats retrieved successfully!",
    data: result
  });
});
var StatsController = {
  getDashboardStatsData: getDashboardStatsData2
};

// src/modules/stats/stats.router.ts
var router6 = express.Router();
router6.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  // Only allow authenticated users with these roles
  StatsController.getDashboardStatsData
);
var StatsRoutes = router6;

// src/modules/notification/notification.route.ts
import { Router as Router6 } from "express";

// src/modules/notification/notification.controler.ts
import status17 from "http-status";

// src/modules/notification/notification.service.ts
import status16 from "http-status";
var getNotificationById = async (id) => {
  const notification = await prisma.notification.findUnique({
    where: { id }
  });
  if (!notification) {
    throw new AppError_default(status16.NOT_FOUND, "Notification not found");
  }
  return notification;
};
var normalizeNotificationPayload = (payload) => ({
  type: payload.type.trim(),
  message: payload.message.trim(),
  userId: payload.userId,
  role: payload.role
});
var createNotification = async (payload) => {
  const { type, message, userId, role } = normalizeNotificationPayload(payload);
  if (!type || !message) {
    throw new AppError_default(status16.BAD_REQUEST, "Type and message are required");
  }
  if (userId && role || !userId && !role) {
    throw new AppError_default(status16.BAD_REQUEST, "Provide exactly one target: userId or role");
  }
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new AppError_default(status16.NOT_FOUND, "Target user not found");
    }
    return prisma.notification.create({
      data: {
        type,
        message,
        userId
      }
    });
  }
  if (role) {
    if (!Object.values(Role).includes(role)) {
      throw new AppError_default(status16.BAD_REQUEST, "Invalid role provided");
    }
    const users = await prisma.user.findMany({
      where: {
        role,
        isDeleted: false,
        status: UserStatus.ACTIVE
      },
      select: { id: true }
    });
    if (!users.length) {
      return { count: 0 };
    }
    const result = await prisma.notification.createMany({
      data: users.map((user) => ({
        type,
        message,
        userId: user.id
      }))
    });
    return result;
  }
  throw new AppError_default(status16.BAD_REQUEST, "Either userId or role is required");
};
var getAllNotifications = async () => {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" }
  });
};
var getMyNotifications = async (user) => {
  return prisma.notification.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" }
  });
};
var getUnreadCount = async (user) => {
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.userId,
      read: false
    }
  });
  return { unreadCount };
};
var markAsRead = async (id, user) => {
  const notification = await getNotificationById(id);
  if (user.role !== UserRole.ADMIN && notification.userId !== user.userId) {
    throw new AppError_default(status16.FORBIDDEN, "Forbidden access to this notification");
  }
  return prisma.notification.update({
    where: { id },
    data: { read: true }
  });
};
var markAllAsRead = async (user) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: user.userId,
      read: false
    },
    data: { read: true }
  });
  return result;
};
var deleteNotification = async (id, user) => {
  const notification = await getNotificationById(id);
  if (user.role !== UserRole.ADMIN && notification.userId !== user.userId) {
    throw new AppError_default(status16.FORBIDDEN, "Forbidden access to this notification");
  }
  await prisma.notification.delete({
    where: { id }
  });
  return null;
};
var notificationService = {
  createNotification,
  getAllNotifications,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

// src/modules/notification/notification.controler.ts
var createNotification2 = catchAsync(async (req, res) => {
  const result = await notificationService.createNotification(req.body);
  sendResponse(res, {
    httpStatusCode: status17.CREATED,
    success: true,
    message: "Notification created successfully",
    data: result
  });
});
var getAllNotifications2 = catchAsync(async (_req, res) => {
  const result = await notificationService.getAllNotifications();
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result
  });
});
var getMyNotifications2 = catchAsync(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "My notifications retrieved successfully",
    data: result
  });
});
var getUnreadCount2 = catchAsync(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Unread notification count retrieved successfully",
    data: result
  });
});
var markAsRead2 = catchAsync(async (req, res) => {
  const result = await notificationService.markAsRead(String(req.params.id), req.user);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Notification marked as read",
    data: result
  });
});
var markAllAsRead2 = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "All notifications marked as read",
    data: result
  });
});
var deleteNotification2 = catchAsync(async (req, res) => {
  await notificationService.deleteNotification(String(req.params.id), req.user);
  sendResponse(res, {
    httpStatusCode: status17.OK,
    success: true,
    message: "Notification deleted successfully",
    data: null
  });
});
var notificationController = {
  createNotification: createNotification2,
  getAllNotifications: getAllNotifications2,
  getMyNotifications: getMyNotifications2,
  getUnreadCount: getUnreadCount2,
  markAsRead: markAsRead2,
  markAllAsRead: markAllAsRead2,
  deleteNotification: deleteNotification2
};

// src/modules/notification/notification.validation.ts
import z6 from "zod";
var notificationIdParamsSchema = z6.object({
  id: z6.string().uuid("Invalid notification id")
});
var createNotificationValidation = z6.object({
  body: z6.object({
    type: z6.string().trim().min(1, "Type is required"),
    message: z6.string().trim().min(1, "Message is required"),
    userId: z6.string().uuid("Invalid user id").optional(),
    role: z6.nativeEnum(UserRole).optional()
  }).superRefine((value, ctx) => {
    if (value.userId && value.role || !value.userId && !value.role) {
      ctx.addIssue({
        code: z6.ZodIssueCode.custom,
        message: "Provide exactly one target: userId or role"
      });
    }
  })
});
var notificationIdValidation = z6.object({
  params: notificationIdParamsSchema
});

// src/modules/notification/notification.route.ts
var router7 = Router6();
router7.get(
  "/my",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  notificationController.getMyNotifications
);
router7.get(
  "/unread-count",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  notificationController.getUnreadCount
);
router7.patch(
  "/read-all",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  notificationController.markAllAsRead
);
router7.patch(
  "/:id/read",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  validateRequest(notificationIdValidation),
  notificationController.markAsRead
);
router7.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.CANDIDATE, UserRole.RECRUITER),
  validateRequest(notificationIdValidation),
  notificationController.deleteNotification
);
router7.post("/", checkAuth(UserRole.ADMIN), validateRequest(createNotificationValidation), notificationController.createNotification);
router7.get("/", checkAuth(UserRole.ADMIN), notificationController.getAllNotifications);
var notificationRouter = router7;

// src/modules/candidate/candidate.router.ts
import { Router as Router7 } from "express";

// src/modules/candidate/candidate.controller.ts
import status19 from "http-status";

// src/modules/candidate/candidate.service.ts
import status18 from "http-status";
var getAllCandidates = async (query2) => {
  const queryBuilder = new QueryBuilder(prisma.candidate, query2, {
    searchableFields: ["fullName", "email", "phone", "address", "user.name", "user.email"],
    filterableFields: ["fullName", "email", "phone", "address", "isDeleted", "userId"]
  });
  const result = await queryBuilder.search().filter().where({ isDeleted: false }).include({ user: true }).paginate().sort().fields().excute();
  console.log("[getAllCandidates] result:", JSON.stringify(result, null, 2));
  return result;
};
var getCandidateById = async (id) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: true,
      testimonials: true
      // Add more valid relations here if needed
    }
  });
  if (!candidate) {
    throw new AppError_default(status18.NOT_FOUND, "Candidate not found");
  }
  return candidate;
};
var getMyProfile = async (userId) => {
  const candidate = await prisma.candidate.findUnique({
    where: { userId, isDeleted: false },
    include: {
      user: true,
      testimonials: true
      // Add more valid relations here if needed
    }
  });
  if (!candidate) {
    throw new AppError_default(status18.NOT_FOUND, "Candidate profile not found");
  }
  return candidate;
};
var updateCandidate = async (id, payload, user) => {
  const existingCandidate = await prisma.candidate.findUnique({
    where: { id, isDeleted: false },
    include: { user: true }
  });
  if (!existingCandidate) {
    throw new AppError_default(status18.NOT_FOUND, "Candidate not found");
  }
  if (user.userRole !== UserRole.ADMIN && existingCandidate.userId !== user.userId) {
    throw new AppError_default(status18.FORBIDDEN, "Forbidden access to update this candidate");
  }
  const result = await prisma.$transaction(async (tx) => {
    if (payload.email && payload.email !== existingCandidate.email) {
      const duplicateUser = await tx.user.findFirst({
        where: {
          email: payload.email,
          NOT: { id: existingCandidate.userId }
        }
      });
      if (duplicateUser) {
        throw new AppError_default(status18.BAD_REQUEST, "User with same email already exists");
      }
    }
    const updated = await tx.candidate.update({
      where: { id },
      data: payload,
      include: { user: true }
    });
    return updated;
  });
  return result;
};
var deleteCandidate = async (id) => {
  const candidate = await prisma.candidate.findUnique({
    where: { id, isDeleted: false }
  });
  if (!candidate) {
    throw new AppError_default(status18.NOT_FOUND, "Candidate not found");
  }
  const result = await prisma.candidate.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
  return result;
};
var candidateService = {
  getAllCandidates,
  getCandidateById,
  getMyProfile,
  updateCandidate,
  deleteCandidate
};

// src/modules/candidate/candidate.controller.ts
var getAllCandidates2 = catchAsync(async (req, res) => {
  const result = await candidateService.getAllCandidates(req.query);
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Candidates fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getCandidateById2 = catchAsync(async (req, res) => {
  const result = await candidateService.getCandidateById(String(req.params.id));
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Candidate retrieved successfully",
    data: result
  });
});
var getMyProfile2 = catchAsync(async (req, res) => {
  const result = await candidateService.getMyProfile(req.user.userId);
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Candidate profile retrieved successfully",
    data: result
  });
});
var updateCandidate2 = catchAsync(async (req, res) => {
  const result = await candidateService.updateCandidate(
    String(req.params.id),
    req.body,
    req.user
  );
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Candidate updated successfully",
    data: result
  });
});
var deleteCandidate2 = catchAsync(async (req, res) => {
  const result = await candidateService.deleteCandidate(String(req.params.id));
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Candidate deleted successfully",
    data: result
  });
});
var candidateController = {
  getAllCandidates: getAllCandidates2,
  getCandidateById: getCandidateById2,
  getMyProfile: getMyProfile2,
  updateCandidate: updateCandidate2,
  deleteCandidate: deleteCandidate2
};

// src/modules/candidate/candidate.router.ts
var router8 = Router7();
router8.get("/", candidateController.getAllCandidates);
router8.get("/me", checkAuth(UserRole.CANDIDATE, UserRole.ADMIN), candidateController.getMyProfile);
router8.get("/:id", candidateController.getCandidateById);
router8.put("/:id", checkAuth(UserRole.ADMIN, UserRole.CANDIDATE), candidateController.updateCandidate);
router8.delete("/:id", checkAuth(UserRole.ADMIN), candidateController.deleteCandidate);
var candidateRouter = router8;

// src/modules/chat/chat.routes.ts
import { Router as Router8 } from "express";

// src/modules/chat/chat.controller.ts
import httpStatus2 from "http-status";

// src/modules/chat/chat.service.ts
import httpStatus from "http-status";
var chatRoomInclude = {
  // candidate and recruiter are not relations in the new schema, so only include messages
  messages: {
    include: {
      attachments: true,
      reactions: { include: { user: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 1
  }
};
var buildParticipants = async (room) => {
  const presenceLookup = await getPresenceLookup([
    room.jobSeekerId,
    room.recruiterId
  ].filter(Boolean));
  const participants = [];
  if (room.jobSeekerId) {
    participants.push({
      userId: room.jobSeekerId,
      role: UserRole.CANDIDATE,
      isOnline: presenceLookup.get(room.jobSeekerId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.jobSeekerId)?.lastSeen ?? null
    });
  }
  if (room.recruiterId) {
    participants.push({
      userId: room.recruiterId,
      role: UserRole.RECRUITER,
      isOnline: presenceLookup.get(room.recruiterId)?.isOnline ?? false,
      lastSeen: presenceLookup.get(room.recruiterId)?.lastSeen ?? null
    });
  }
  return participants;
};
var formatMessage = (message, participants = [], currentUserId) => ({
  ...message,
  sender: participants.find(
    (participant) => participant.userId === message.senderId || participant.id === message.senderId
  ) ?? null,
  attachment: formatAttachment(message.attachment),
  reactions: formatReactions(message.reactions, currentUserId)
});
var messageFullInclude = {
  attachments: true,
  reactions: { include: { user: true } }
};
var getRoomWithParticipants = async (roomId, userId, role) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: chatRoomInclude
  });
  if (!room) {
    throw new AppError_default(httpStatus.NOT_FOUND, "Chat room not found");
  }
  return room;
};
var getPresenceLookup = async (userIds) => {
  const presences = await prisma.userPresence.findMany({
    where: {
      userId: { in: userIds }
    }
  });
  return new Map(presences.map((presence) => [presence.userId, presence]));
};
var formatAttachment = (attachment) => {
  if (!attachment) {
    return null;
  }
  return {
    ...attachment,
    url: attachment.fileUrl,
    mimeType: attachment.fileType,
    size: attachment.fileSize
  };
};
var formatReactions = (reactions, currentUserId) => {
  const grouped = /* @__PURE__ */ new Map();
  for (const reaction of reactions) {
    const existing = grouped.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      existing.reactedByCurrentUser ||= reaction.userId === currentUserId;
      existing.users.push({
        userId: reaction.userId,
        name: reaction.user.name,
        email: reaction.user.email,
        image: reaction.user.image
      });
    } else {
      grouped.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        reactedByCurrentUser: reaction.userId === currentUserId,
        users: [{
          userId: reaction.userId,
          name: reaction.user.name,
          email: reaction.user.email,
          image: reaction.user.image
        }]
      });
    }
  }
  return Array.from(grouped.values());
};
var formatRoom = async (room, currentUserId) => {
  const participants = await buildParticipants(room);
  const latestMessage = room.messages && room.messages[0] ? formatMessage(room.messages[0], participants, currentUserId) : null;
  return {
    ...room,
    participants,
    lastMessage: latestMessage,
    unreadCount: 0
  };
};
var ensureRoomAccess = async (roomId, userId, role) => {
  const room = await getRoomWithParticipants(roomId);
  if (role === UserRole.ADMIN) return room;
  let allowedUserId;
  if (role === UserRole.CANDIDATE) allowedUserId = room.jobSeekerId ?? void 0;
  if (role === UserRole.RECRUITER) allowedUserId = room.recruiterId ?? void 0;
  if (allowedUserId !== userId) {
    throw new AppError_default(httpStatus.FORBIDDEN, "Forbidden access to this chat room");
  }
  return room;
};
var getRecipientUserIdForRoom = (room, senderRole) => senderRole === UserRole.CANDIDATE ? room.recruiterId ?? null : room.jobSeekerId ?? null;
var getRoomRealtimeTargets = async (roomId, senderRole, userId) => {
  const room = await getRoomWithParticipants(roomId);
  return {
    roomId: room.id,
    candidateUserId: room.jobSeekerId ?? null,
    recruiterUserId: room.recruiterId ?? null,
    recipientUserId: senderRole ? getRecipientUserIdForRoom(room, senderRole) : null
  };
};
var getMessageForRoom = async (roomId, messageId) => {
  const message = await prisma.message.findFirst({
    where: { id: messageId, roomId },
    include: messageFullInclude
  });
  if (!message) {
    throw new AppError_default(httpStatus.NOT_FOUND, "Message not found");
  }
  return message;
};
var getRoomMessages = async (roomId, userId, role) => {
  const room = await ensureRoomAccess(roomId, userId, role);
  const participants = await buildParticipants(room);
  const messages = await prisma.message.findMany({
    where: { roomId: room.id },
    include: messageFullInclude,
    orderBy: { createdAt: "asc" }
  });
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messages: messages.map((message) => formatMessage(message, participants, userId))
  };
};
var updateRoomTimestamp = async (roomId) => {
  return prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: /* @__PURE__ */ new Date() }
  });
};
var createTextMessage = async (roomId, senderId, senderRole, text) => {
  if (!text?.trim()) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "Message text is required");
  }
  const room = await ensureRoomAccess(roomId, senderId, senderRole);
  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole,
      type: MessageType.TEXT,
      text: text.trim()
    },
    include: messageFullInclude
  });
  await updateRoomTimestamp(room.id);
  const participants = await buildParticipants(room);
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId)
  };
};
var createFileMessage = async (roomId, senderId, senderRole, attachmentData) => {
  const room = await ensureRoomAccess(roomId, senderId, senderRole);
  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId,
      senderRole,
      type: MessageType.FILE,
      text: attachmentData.fileName,
      attachment: {
        create: {
          fileUrl: attachmentData.fileUrl,
          fileName: attachmentData.fileName,
          fileType: attachmentData.fileType,
          fileSize: attachmentData.fileSize
        }
      }
    },
    include: messageFullInclude
  });
  await updateRoomTimestamp(room.id);
  const participants = await buildParticipants(room);
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    message: formatMessage(message, participants, senderId)
  };
};
var toggleMessageReaction = async (roomId, messageId, userId, role, emoji) => {
  const normalizedEmoji = emoji.trim();
  if (!normalizedEmoji) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "Emoji is required");
  }
  if (normalizedEmoji.length > 32) {
    throw new AppError_default(httpStatus.BAD_REQUEST, "Emoji is too long");
  }
  const room = await ensureRoomAccess(roomId, userId, role);
  const message = await getMessageForRoom(room.id, messageId);
  const existingReaction = await prisma.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji
      }
    }
  });
  if (existingReaction) {
    await prisma.messageReaction.delete({
      where: { id: existingReaction.id }
    });
  } else {
    await prisma.messageReaction.create({
      data: {
        messageId: message.id,
        userId,
        emoji: normalizedEmoji
      }
    });
  }
  const updatedMessage = await getMessageForRoom(room.id, message.id);
  const participants = await buildParticipants(room);
  return {
    roomId: room.id,
    resolvedFromStaleId: room.id !== roomId,
    messageId: message.id,
    emoji: normalizedEmoji,
    action: existingReaction ? "removed" : "added",
    reactions: formatReactions(updatedMessage.reactions, userId),
    message: formatMessage(updatedMessage, participants, userId)
  };
};
var deleteMessage = async (roomId, messageId, userId, role) => {
  await ensureRoomAccess(roomId, userId, role);
  const deleted = await prisma.message.delete({
    where: { id: messageId }
  });
  return deleted;
};
var getUserRooms = async (userId, role, recruiterId) => {
  if (role === UserRole.ADMIN) {
    const where2 = recruiterId ? { recruiterId } : {};
    const rooms2 = await prisma.chatRoom.findMany({
      where: where2,
      include: chatRoomInclude,
      orderBy: { updatedAt: "desc" }
    });
    return Promise.all(rooms2.map((room) => formatRoom(room)));
  }
  const where = role === UserRole.RECRUITER ? { recruiterId: userId } : { jobSeekerId: userId };
  const rooms = await prisma.chatRoom.findMany({
    where,
    include: chatRoomInclude,
    orderBy: { updatedAt: "desc" }
  });
  return Promise.all(rooms.map((room) => formatRoom(room, userId)));
};
var chatService = {
  getRoomMessages,
  createTextMessage,
  createFileMessage,
  toggleMessageReaction,
  updateRoomTimestamp,
  getRoomRealtimeTargets,
  deleteMessage,
  getUserRooms
};

// src/modules/chat/chat.upload.ts
import multer3 from "multer";
import { CloudinaryStorage as CloudinaryStorage3 } from "multer-storage-cloudinary";
var allowedMimeTypes = /* @__PURE__ */ new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);
var storage3 = new CloudinaryStorage3({
  cloudinary: cloudinaryUpload,
  params: async (_req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9/-]/g, "");
    const uniqueName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${fileNameWithoutExtension}`;
    const folder = extension === "pdf" ? "pdfs" : "chat";
    return {
      folder: `consultedge/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var fileFilter2 = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new Error("Invalid file type. Allowed: PDF, PNG, JPG, DOCX"));
    return;
  }
  cb(null, true);
};
var chatUpload = multer3({
  storage: storage3,
  fileFilter: fileFilter2,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
var mapUploadedFileToAttachmentData = (file) => {
  const cloudinaryFile = file;
  const fileUrl = cloudinaryFile.path ?? cloudinaryFile.secure_url;
  if (!fileUrl) {
    throw new Error("Failed to resolve uploaded file URL from Cloudinary");
  }
  return {
    fileUrl,
    fileName: file.originalname,
    fileType: file.mimetype,
    fileSize: file.size
  };
};

// src/lib/ably.ts
import Ably from "ably";
var ablyClient = null;
var getAblyClient = () => {
  if (!envVars.ABLY_API_KEY) {
    return null;
  }
  if (!ablyClient) {
    ablyClient = new Ably.Rest({ key: envVars.ABLY_API_KEY });
  }
  return ablyClient;
};
var roomChannel = (roomId) => `private-room-${roomId}`;
var userChannel = (userId) => `private-user-${userId}`;
var publishToRoom = async (roomId, eventName, payload) => {
  const client = getAblyClient();
  if (!client) return;
  try {
    await client.channels.get(roomChannel(roomId)).publish(eventName, payload);
  } catch (error) {
    console.error("Ably publishToRoom failed:", error);
  }
};
var publishToUser = async (userId, eventName, payload) => {
  const client = getAblyClient();
  if (!client) return;
  try {
    await client.channels.get(userChannel(userId)).publish(eventName, payload);
  } catch (error) {
    console.error("Ably publishToUser failed:", error);
  }
};
var createAblyTokenRequest = async (clientId, capability) => {
  const client = getAblyClient();
  if (!client) {
    throw new Error("Ably is not configured. Set ABLY_API_KEY.");
  }
  return client.auth.createTokenRequest({
    clientId,
    ttl: 60 * 60 * 1e3
  });
};

// src/modules/chat/chat.controller.ts
var emitChatEvent = async (roomId, eventName, payload, senderRole, senderUserId) => {
  const targets = await chatService.getRoomRealtimeTargets(
    roomId,
    senderRole,
    senderUserId
  );
  await publishToRoom(targets.roomId, eventName, payload);
  if (senderRole && targets.recipientUserId) {
    await publishToUser(targets.recipientUserId, eventName, payload);
    return;
  }
  await publishToUser(targets.clientUserId, eventName, payload);
  await publishToUser(targets.expertUserId, eventName, payload);
};
var getSingleString = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }
  return typeof value === "string" ? value : "";
};
var getRooms = catchAsync(async (req, res) => {
  const expertId = getSingleString(req.query.expertId) || void 0;
  const rooms = await chatService.getUserRooms(
    req.user.userId,
    req.user.userRole,
    expertId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.OK,
    success: true,
    message: "Chat rooms fetched successfully",
    data: rooms
  });
});
var createOrGetRoom = catchAsync(async (req, res) => {
  const participantIdentifier = getSingleString(
    req.body?.expertId ?? req.body?.participantId ?? req.body?.userId
  );
  const room = await chatService.createOrGetRoom(
    req.user.userId,
    req.user.role,
    participantIdentifier
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.OK,
    success: true,
    message: "Chat room fetched successfully",
    data: room
  });
});
var getRoomMessages2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  if (!roomId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "roomId is required");
  }
  const result = await chatService.getRoomMessages(
    roomId,
    req.user.userId,
    req.user.role
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.OK,
    success: true,
    message: "Room messages fetched successfully",
    data: result
  });
});
var postTextMessage = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  const text = String(req.body?.text ?? "");
  if (!roomId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "roomId is required");
  }
  const result = await chatService.createTextMessage(
    roomId,
    req.user.userId,
    req.user.role,
    text
  );
  await emitChatEvent(
    result.roomId,
    "receive_message",
    result.message,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result
  });
});
var postAttachmentMessage = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  if (!roomId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "roomId is required");
  }
  if (!req.file) {
    return sendResponse(res, {
      httpStatusCode: httpStatus2.BAD_REQUEST,
      success: false,
      message: "Attachment file is required",
      data: null
    });
  }
  const attachment = mapUploadedFileToAttachmentData(req.file);
  const result = await chatService.createFileMessage(
    roomId,
    req.user.userId,
    req.user.role,
    attachment
  );
  await emitChatEvent(
    result.roomId,
    "receive_message",
    result.message,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.CREATED,
    success: true,
    message: "Attachment message sent successfully",
    data: result
  });
});
var toggleMessageReaction2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  const messageId = getSingleString(req.params.messageId);
  const emoji = getSingleString(req.body?.emoji);
  if (!roomId || !messageId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "roomId and messageId are required");
  }
  const result = await chatService.toggleMessageReaction(
    roomId,
    messageId,
    req.user.userId,
    req.user.role,
    emoji
  );
  await emitChatEvent(
    result.roomId,
    "message_reaction_updated",
    result,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.OK,
    success: true,
    message: `Message reaction ${result.action} successfully`,
    data: result
  });
});
var createCall = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  if (!roomId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "roomId is required");
  }
  const call = await chatService.createCall(roomId, req.user.userId, req.user.role);
  await emitChatEvent(
    roomId,
    "call_started",
    call,
    req.user.role,
    req.user.userId
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.CREATED,
    success: true,
    message: "Call started successfully",
    data: call
  });
});
var updateCallStatus = catchAsync(async (req, res) => {
  const callId = getSingleString(req.params.callId);
  const statusValue = req.body?.status;
  if (!callId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "callId is required");
  }
  if (!Object.values(CallStatus).includes(statusValue)) {
    return sendResponse(res, {
      httpStatusCode: httpStatus2.BAD_REQUEST,
      success: false,
      message: "Invalid call status",
      data: null
    });
  }
  const call = await chatService.updateCallStatus(callId, statusValue);
  await emitChatEvent(
    call.roomId,
    statusValue === CallStatus.ENDED ? "call_ended" : "call_updated",
    call
  );
  sendResponse(res, {
    httpStatusCode: httpStatus2.OK,
    success: true,
    message: "Call status updated successfully",
    data: call
  });
});
var deleteMessage2 = catchAsync(async (req, res) => {
  const roomId = getSingleString(req.params.roomId);
  const messageId = getSingleString(req.params.messageId);
  if (!roomId || !messageId) {
    throw new AppError_default(httpStatus2.BAD_REQUEST, "roomId and messageId are required");
  }
  await chatService.deleteMessage(roomId, messageId, req.user.userId, req.user.role);
  sendResponse(res, {
    httpStatusCode: httpStatus2.OK,
    success: true,
    message: "Message deleted successfully",
    data: { messageId }
  });
});
var chatController = {
  getRooms,
  createOrGetRoom,
  getRoomMessages: getRoomMessages2,
  postTextMessage,
  postAttachmentMessage,
  toggleMessageReaction: toggleMessageReaction2,
  createCall,
  updateCallStatus,
  deleteMessage: deleteMessage2
};

// src/modules/chat/chat.validation.ts
import z7 from "zod";
var toggleMessageReactionValidation = z7.object({
  params: z7.object({
    roomId: z7.string().min(1, "roomId is required"),
    messageId: z7.string().min(1, "messageId is required")
  }),
  body: z7.object({
    emoji: z7.string().trim().min(1, "Emoji is required").max(32, "Emoji is too long")
  })
});

// src/modules/chat/chat.routes.ts
var router9 = Router8();
router9.get("/rooms", checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN), chatController.getRooms);
router9.post("/rooms", checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN), chatController.createOrGetRoom);
router9.get(
  "/rooms/:roomId/messages",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.getRoomMessages
);
router9.post(
  "/rooms/:roomId/messages",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.postTextMessage
);
router9.post(
  "/rooms/:roomId/attachments",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatUpload.single("file"),
  chatController.postAttachmentMessage
);
router9.post(
  "/rooms/:roomId/messages/:messageId/reactions",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(toggleMessageReactionValidation),
  chatController.toggleMessageReaction
);
router9.post(
  "/rooms/:roomId/calls",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.createCall
);
router9.patch(
  "/calls/:callId/status",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.updateCallStatus
);
router9.delete(
  "/rooms/:roomId/messages/:messageId",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  chatController.deleteMessage
);
var chatRoutes = router9;

// src/modules/ai/ai.router.ts
import { Router as Router9 } from "express";

// src/modules/ai/ai.controller.ts
import httpStatus3 from "http-status";

// src/modules/ai/ai.service.ts
import status20 from "http-status";
var SYSTEM_PROMPT = `You are ConsultEdge AI Support for a consultation booking platform.
Your job is to help website visitors with expert discovery, consultation booking, schedules, payments, and account guidance.
Rules:
- Be concise, clear, and friendly.
- Prefer practical next steps.
- If the issue involves refunds, billing disputes, legal issues, or account security, recommend admin/human support.
- Do not invent pricing, policies, or expert availability.
- Keep responses short enough for a homepage support widget.`;
var bookingKeywords = ["book", "booking", "appointment", "consultation", "schedule", "slot"];
var paymentKeywords = ["pay", "payment", "checkout", "card", "refund", "invoice", "billing"];
var expertKeywords = ["expert", "mentor", "consultant", "specialist", "advisor"];
var technicalKeywords = ["bug", "error", "issue", "login", "otp", "password", "not working"];
var escalationKeywords = [
  "human",
  "admin",
  "agent",
  "refund",
  "charged twice",
  "billing issue",
  "legal",
  "complaint",
  "security",
  "hack",
  "urgent"
];
var includesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));
var buildSuggestedActions = (message, context) => {
  const normalized = message.toLowerCase();
  if (context === "payment" || includesAny(normalized, paymentKeywords)) {
    return [
      "Check your payment or booking status in the dashboard",
      "Retry with a valid payment method if checkout failed",
      "Contact admin support for refund or billing review"
    ];
  }
  if (context === "expert" || includesAny(normalized, expertKeywords)) {
    return [
      "Browse verified experts by industry or skill",
      "Open an expert profile to review experience and availability",
      "Start a chat or book a consultation slot"
    ];
  }
  if (context === "technical" || includesAny(normalized, technicalKeywords)) {
    return [
      "Refresh the page and sign in again",
      "Make sure your browser allows cookies for authentication",
      "If the issue continues, contact admin support"
    ];
  }
  return [
    "Browse experts from the homepage",
    "Select a suitable slot and book a consultation",
    "Use dashboard chat for direct communication after booking"
  ];
};
var buildFallbackReply = (message, context) => {
  const normalized = message.toLowerCase();
  if (context === "payment" || includesAny(normalized, paymentKeywords)) {
    return "I can help with payment guidance. Please confirm whether your issue is checkout failure, booking not appearing, or a refund request. For billing disputes or refunds, admin support should review it directly.";
  }
  if (context === "expert" || includesAny(normalized, expertKeywords)) {
    return "You can explore verified experts, compare their profiles, and choose a matching consultation slot. If you want, ask me what kind of expert you need and I\u2019ll guide you.";
  }
  if (context === "technical" || includesAny(normalized, technicalKeywords)) {
    return "It looks like a technical or account issue. Try signing in again, refreshing the page, and checking your connection. If it still fails, please contact admin support for manual help.";
  }
  if (context === "booking" || includesAny(normalized, bookingKeywords)) {
    return "To book a consultation, choose an expert, review the available schedule, and confirm the booking from the platform. If a slot is missing, it may not be published or available yet.";
  }
  return "Hi \u2014 I can help with finding experts, booking consultations, schedules, payments, and general platform guidance. Tell me what you need, and I\u2019ll guide you step by step.";
};
var shouldEscalateToHuman = (message) => {
  const normalized = message.toLowerCase();
  return includesAny(normalized, escalationKeywords);
};
var buildMessages = (payload) => {
  const history = (payload.history ?? []).map((item) => ({
    role: item.role,
    content: item.content
  }));
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: payload.context ? `Context: ${payload.context}
User message: ${payload.message}` : payload.message
    }
  ];
};
var generateOpenAIReply = async (payload) => {
  if (!envVars.OPENAI_API_KEY) {
    return null;
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envVars.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: envVars.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 300,
      messages: buildMessages(payload)
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};
var askSupport = async (payload) => {
  const message = payload.message?.trim();
  if (!message) {
    throw new AppError_default(status20.BAD_REQUEST, "Message is required");
  }
  const suggestedActions = buildSuggestedActions(message, payload.context);
  const escalatedToHuman = shouldEscalateToHuman(message);
  try {
    const aiReply = await generateOpenAIReply({ ...payload, message });
    const reply = aiReply || buildFallbackReply(message, payload.context);
    return {
      reply,
      suggestedActions,
      escalatedToHuman,
      provider: aiReply ? "openai" : "fallback",
      model: aiReply ? envVars.OPENAI_MODEL || "gpt-4o-mini" : "rule-based-support",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    console.error("AI support error:", error);
    return {
      reply: buildFallbackReply(message, payload.context),
      suggestedActions,
      escalatedToHuman,
      provider: "fallback",
      model: "rule-based-support",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var aiService = {
  askSupport
};

// src/lib/openai.ts
import { OpenAI } from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// src/modules/ai/controllers/parseResume.controller.ts
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
var parseResumeController = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No resume file uploaded" });
  let resumeText = "";
  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });
    await parser.parse();
    resumeText = parser.text;
    await parser.destroy();
  } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result2 = await mammoth.extractRawText({ buffer: file.buffer });
    resumeText = result2.value;
  } else {
    return res.status(400).json({ error: "Unsupported file type" });
  }
  const prompt = `
Extract the following from this resume:
- Full Name
- Email
- Phone
- Skills (as array)
- Experience (as array of {company, title, years})
- Education (as array)
Resume:
${resumeText}
Respond in JSON.
`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });
  const result = completion.choices[0].message.content;
  res.json({ parsed: JSON.parse(result || "{}") });
};

// src/modules/ai/controllers/jobRecommendations.controller.ts
var jobRecommendationsController = async (req, res) => {
  const { userProfile, jobList } = req.body;
  const prompt = `
Given this user profile: ${JSON.stringify(userProfile)}
and these jobs: ${JSON.stringify(jobList)},
recommend the top 5 jobs for this user. Respond as a JSON array of job IDs.
`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });
  const result = completion.choices[0].message.content;
  res.json({ recommendations: JSON.parse(result || "[]") });
};

// src/modules/ai/ai.controller.ts
var askSupport2 = catchAsync(async (req, res) => {
  const result = await aiService.askSupport(req.body);
  sendResponse(res, {
    httpStatusCode: httpStatus3.OK,
    success: true,
    message: "AI support response generated successfully",
    data: result
  });
});
var aiController = {
  askSupport: askSupport2,
  parseResumeController,
  jobRecommendationsController
};

// src/modules/ai/utils/aiProvider.ts
import status21 from "http-status";
var resolveProvider = () => {
  const explicit = envVars.AI_PROVIDER;
  if (explicit === "openai" && envVars.OPENAI_API_KEY) return "openai";
  if (explicit === "gemini" && envVars.GEMINI_API_KEY) return "gemini";
  if (envVars.OPENAI_API_KEY) return "openai";
  if (envVars.GEMINI_API_KEY) return "gemini";
  throw new AppError_default(
    status21.SERVICE_UNAVAILABLE,
    "No AI provider configured. Set AI_PROVIDER and the corresponding API key."
  );
};
var callOpenAI = async (opts) => {
  if (!envVars.OPENAI_API_KEY) {
    throw new AppError_default(status21.SERVICE_UNAVAILABLE, "OPENAI_API_KEY missing");
  }
  const model = envVars.OPENAI_MODEL || "gpt-4o-mini";
  const startedAt2 = Date.now();
  const body = {
    model,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 600,
    messages: opts.messages.map((m) => ({ role: m.role, content: m.content }))
  };
  if (opts.jsonMode) {
    body.response_format = { type: "json_object" };
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envVars.OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new AppError_default(
      status21.BAD_GATEWAY,
      `OpenAI request failed: ${response.status} ${errText.slice(0, 300)}`
    );
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return {
    text,
    model,
    provider: "openai",
    tokensUsed: data.usage?.total_tokens ?? 0,
    latencyMs: Date.now() - startedAt2,
    raw: data
  };
};
var callGemini = async (opts) => {
  if (!envVars.GEMINI_API_KEY) {
    throw new AppError_default(status21.SERVICE_UNAVAILABLE, "GEMINI_API_KEY missing");
  }
  const model = envVars.GEMINI_MODEL || "gemini-2.0-flash";
  const startedAt2 = Date.now();
  const systemMessages = opts.messages.filter((m) => m.role === "system");
  const turnMessages = opts.messages.filter((m) => m.role !== "system");
  const body = {
    contents: turnMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 600,
      ...opts.jsonMode ? { responseMimeType: "application/json" } : {}
    }
  };
  if (systemMessages.length > 0) {
    body.systemInstruction = {
      role: "system",
      parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }]
    };
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(envVars.GEMINI_API_KEY)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new AppError_default(
      status21.BAD_GATEWAY,
      `Gemini request failed: ${response.status} ${errText.slice(0, 300)}`
    );
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  return {
    text,
    model,
    provider: "gemini",
    tokensUsed: data.usageMetadata?.totalTokenCount ?? 0,
    latencyMs: Date.now() - startedAt2,
    raw: data
  };
};
var aiProvider = {
  /** Generate a chat completion using the configured provider, with one fallback. */
  async generate(opts) {
    const primary = resolveProvider();
    const hasOpenAI = !!envVars.OPENAI_API_KEY;
    const hasGemini = !!envVars.GEMINI_API_KEY;
    const fallback = primary === "gemini" && hasOpenAI ? "openai" : primary === "openai" && hasGemini ? "gemini" : null;
    try {
      return primary === "openai" ? await callOpenAI(opts) : await callGemini(opts);
    } catch (err) {
      if (!fallback) throw err;
      console.warn(
        `[ai] primary provider "${primary}" failed; retrying with "${fallback}"`,
        err instanceof Error ? err.message : err
      );
      return fallback === "openai" ? callOpenAI(opts) : callGemini(opts);
    }
  },
  /**
   * Generate and parse JSON output. Falls back to wrapping plain text if the
   * provider returns a non-JSON response.
   */
  async generateJSON(opts) {
    const result = await this.generate({ ...opts, jsonMode: true });
    let parsed = null;
    try {
      const cleaned = result.text.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }
    return { data: parsed, meta: result };
  },
  getActiveProvider: resolveProvider,
  /** Non-throwing introspection of which providers have keys configured. */
  getConfiguredProviders() {
    const list = [];
    if (envVars.OPENAI_API_KEY) list.push("openai");
    if (envVars.GEMINI_API_KEY) list.push("gemini");
    return list;
  },
  /** Lightweight reachability probe used by GET /ai/health. */
  async ping() {
    const configured = this.getConfiguredProviders();
    if (configured.length === 0) {
      return { provider: "none", status: "unconfigured", latencyMs: 0 };
    }
    const startedAt2 = Date.now();
    try {
      const result = await this.generate({
        messages: [
          { role: "system", content: "You are a health probe. Reply with the single word: ok." },
          { role: "user", content: "ping" }
        ],
        temperature: 0,
        maxTokens: 5
      });
      return {
        provider: result.provider,
        status: "ok",
        latencyMs: Date.now() - startedAt2,
        model: result.model
      };
    } catch (err) {
      return {
        provider: configured[0],
        status: "down",
        latencyMs: Date.now() - startedAt2,
        error: err instanceof Error ? err.message : "unknown error"
      };
    }
  }
};

// src/modules/ai/prompts/summaryPrompt.ts
var summaryPrompt = (input) => `
You are a professional consulting analyst at ConsultEdge.
Summarize the following text for a ${input.audience || "business"} audience.
Return JSON with this exact shape:
{
  "summary": string,        // 3-5 sentence executive summary
  "keyPoints": string[],    // 3-7 bullet points
  "actionItems": string[]   // 2-5 concrete next steps
}
Text:
"""${input.text}"""
`.trim();

// src/modules/ai/prompts/chatPrompt.ts
var CHAT_SYSTEM_PROMPT = `You are ConsultEdge AI Assistant.
You help users discover experts, plan consultations, and understand the platform.
Rules:
- Be concise, friendly, and practical.
- Never invent expert names, prices, or availability.
- For refunds, billing disputes, or account security, recommend admin/human support.
- Keep replies suitable for a chat widget (1-4 short paragraphs).`;
var buildChatMessages = (input) => {
  const history = (input.history ?? []).map((h) => ({ role: h.role, content: h.content }));
  return [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: input.context ? `Context: ${input.context}
User message: ${input.message}` : input.message
    }
  ];
};

// src/modules/ai/prompts/documentAnalysisPrompt.ts
var documentAnalysisPrompt = (input) => `
You are a senior consulting analyst.
Analyze the following document${input.objective ? ` with this objective: ${input.objective}` : ""}.

Document:
"""${input.text}"""

Return JSON with this exact shape:
{
  "summary": string,
  "topics": string[],
  "entities": { "people": string[], "organizations": string[], "locations": string[] },
  "risks": string[],
  "opportunities": string[],
  "recommendedExperts": string[]   // industry/expertise tags only, not names
}
Rules:
- Be factual; do not invent entities not present in the document.
- Each list has 0-7 items.
`.trim();

// src/modules/ai/utils/sanitize.ts
var CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
var INJECTION_PATTERNS = [
  /ignore (all|previous|above) (instructions|prompts)/gi,
  /you are now/gi,
  /system prompt:/gi
];
var sanitizeText = (input, maxLength = 8e3) => {
  if (typeof input !== "string") return "";
  let text = input.replace(CONTROL_CHARS, " ").replace(/\s+/g, " ").trim();
  for (const pattern of INJECTION_PATTERNS) {
    text = text.replace(pattern, "[filtered]");
  }
  if (text.length > maxLength) text = text.slice(0, maxLength);
  return text;
};
var sanitizeObject = (obj) => {
  const out = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      out[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      out[key] = value.map(
        (v) => typeof v === "string" ? sanitizeText(v) : v && typeof v === "object" ? sanitizeObject(v) : v
      );
    } else if (value && typeof value === "object") {
      out[key] = sanitizeObject(value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

// src/modules/ai/services/aiAdvanced.service.ts
var normalizeList = (items) => {
  if (!Array.isArray(items)) return [];
  return Array.from(
    new Set(
      items.map((item) => sanitizeText(item, 140).trim()).filter((item) => item.length > 0)
    )
  );
};
var normalizeTerm = (value) => value.trim().toLowerCase();
var getWeekStartUtc = () => {
  const now = /* @__PURE__ */ new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
};
var roundScore = (value) => Math.round(Math.max(0, Math.min(100, value)) * 100) / 100;
var buildEmptyStateFallback = (mode, context) => {
  const personalizedReason = context.exploredIndustries[0] ? `Why: Because you explored ${context.exploredIndustries[0]}` : context.viewedExperts[0] ? `Why: Because you viewed ${context.viewedExperts[0]}` : context.searchHistory[0] ? `Why: Because you searched "${context.searchHistory[0]}"` : context.clickedCategories[0] ? `Why: Because you clicked on ${context.clickedCategories[0]}` : "Why: Because you interacted with similar experts";
  return [
    {
      name: "ConsultEdge Growth Advisor",
      title: "Startup Growth Consultant",
      specialization: "Go-to-market and growth strategy",
      description: "Helps early-stage teams shape positioning, channel strategy, and execution plans.",
      experienceYears: 10,
      fee: 120,
      whyReason: mode === "cold-start" ? "Why: Popular among new users" : personalizedReason,
      rankingScore: 86
    },
    {
      name: "ConsultEdge Finance Mentor",
      title: "Finance and Fundraising Specialist",
      specialization: "Fundraising readiness and financial planning",
      description: "Supports founders with investor narratives, runway planning, and capital strategy.",
      experienceYears: 12,
      fee: 140,
      whyReason: mode === "cold-start" ? "Why: Verified specialist" : personalizedReason,
      rankingScore: 82
    },
    {
      name: "ConsultEdge Product Strategist",
      title: "Product and Customer Strategy Expert",
      specialization: "Product-market fit and retention",
      description: "Works with teams to improve customer journeys, retention, and product prioritization.",
      experienceYears: 9,
      fee: 110,
      whyReason: mode === "cold-start" ? "Why: Trending this week" : personalizedReason,
      rankingScore: 79
    }
  ];
};
var buildColdStartReason = (expert) => {
  if (expert.weeklyBookings >= 2) return "Why: Frequently booked by founders";
  if (expert.averageRating >= 4.5) return "Why: High success rate";
  if (expert.isVerified) return "Why: Verified specialist";
  if (expert.totalBookings >= 5) return "Why: Trending this week";
  return "Why: Popular among new users";
};
var buildPersonalizedReason = (expert, context) => {
  const normalizedIndustry = normalizeTerm(expert.industry);
  const explored = context.exploredIndustries.find(
    (industry) => normalizeTerm(industry) === normalizedIndustry
  );
  if (explored) return `Why: Because you explored ${explored}`;
  const viewed = context.viewedExperts.find((item) => {
    const token = normalizeTerm(item);
    return token === normalizeTerm(expert.id) || token === normalizeTerm(expert.name);
  });
  if (viewed) return `Why: Because you viewed ${viewed}`;
  const haystack = `${expert.title} ${expert.description} ${expert.industry}`.toLowerCase();
  const searchedKeyword = context.searchHistory.find(
    (keyword) => haystack.includes(normalizeTerm(keyword))
  );
  if (searchedKeyword) return `Why: Because you searched "${searchedKeyword}"`;
  const clickedCategory = context.clickedCategories.find(
    (category) => haystack.includes(normalizeTerm(category))
  );
  if (clickedCategory) return `Why: Because you clicked on ${clickedCategory}`;
  if (context.viewedIndustrySet.has(normalizedIndustry)) {
    return "Why: Because you interacted with similar experts";
  }
  return "Why: Because you interacted with similar experts";
};
var fetchExpertCandidates = async () => {
  const weekStart = getWeekStartUtc();
  const [experts, ratings, weeklyBookings, totalBookings] = await Promise.all([
    prisma.expert.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        experience: true,
        consultationFee: true,
        isVerified: true,
        industry: { select: { name: true } }
      },
      orderBy: [{ isVerified: "desc" }, { updatedAt: "desc" }],
      take: 120
    }),
    prisma.testimonial.groupBy({
      by: ["expertId"],
      where: { status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { _all: true }
    }),
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: {
        expertId: { not: null },
        createdAt: { gte: weekStart }
      },
      _count: { _all: true }
    }),
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: { expertId: { not: null } },
      _count: { _all: true }
    })
  ]);
  const ratingMap = new Map(
    ratings.map((item) => [
      item.expertId,
      {
        avg: item._avg.rating ?? 0,
        count: item._count._all
      }
    ])
  );
  const weeklyBookingMap = new Map(
    weeklyBookings.filter((item) => !!item.expertId).map((item) => [item.expertId, item._count._all])
  );
  const totalBookingMap = new Map(
    totalBookings.filter((item) => !!item.expertId).map((item) => [item.expertId, item._count._all])
  );
  return experts.map((expert) => {
    const ratingStats = ratingMap.get(expert.id);
    return {
      id: expert.id,
      name: expert.fullName,
      title: expert.title?.trim() || "Business Consultant",
      industry: expert.industry.name,
      description: expert.bio?.trim() || `${expert.fullName} advises teams on ${expert.industry.name.toLowerCase()} priorities.`,
      experienceYears: Math.max(0, expert.experience ?? 0),
      fee: Math.max(0, expert.consultationFee ?? 0),
      isVerified: expert.isVerified,
      averageRating: ratingStats?.avg ?? 0,
      reviewCount: ratingStats?.count ?? 0,
      weeklyBookings: weeklyBookingMap.get(expert.id) ?? 0,
      totalBookings: totalBookingMap.get(expert.id) ?? 0
    };
  });
};
var recommendations = async (input) => {
  try {
    const viewedExperts = normalizeList(input.viewedExperts);
    const exploredIndustries = normalizeList(input.exploredIndustries);
    const searchHistory = normalizeList(input.searchHistory);
    const clickedCategories = normalizeList(input.clickedCategories);
    const activityCount = viewedExperts.length + exploredIndustries.length + searchHistory.length + clickedCategories.length;
    const mode = activityCount === 0 ? "cold-start" : "personalized";
    const candidates = await fetchExpertCandidates();
    if (candidates.length === 0) {
      return {
        data: {
          mode,
          activityCount,
          experts: buildEmptyStateFallback(mode, {
            exploredIndustries,
            viewedExperts,
            searchHistory,
            clickedCategories
          })
        },
        meta: {
          model: "heuristic",
          provider: "fallback",
          tokensUsed: 0,
          latencyMs: 0
        }
      };
    }
    const viewedTokenSet = new Set(viewedExperts.map(normalizeTerm));
    const exploredIndustrySet = new Set(exploredIndustries.map(normalizeTerm));
    const searchTokens = new Set(
      searchHistory.flatMap((query2) => query2.split(/\s+/)).map(normalizeTerm).filter((token) => token.length > 1)
    );
    const clickedCategorySet = new Set(clickedCategories.map(normalizeTerm));
    const viewedMatches = candidates.filter((candidate) => {
      const byId = viewedTokenSet.has(normalizeTerm(candidate.id));
      const byName = viewedTokenSet.has(normalizeTerm(candidate.name));
      return byId || byName;
    });
    const viewedIndustrySet = new Set(viewedMatches.map((item) => normalizeTerm(item.industry)));
    const scored = candidates.map((candidate) => {
      let score = 35;
      if (candidate.isVerified) score += 10;
      if (candidate.averageRating >= 4.7) score += 8;
      else if (candidate.averageRating >= 4.3) score += 5;
      if (candidate.weeklyBookings >= 4) score += 12;
      else if (candidate.weeklyBookings >= 2) score += 8;
      else if (candidate.weeklyBookings >= 1) score += 4;
      score += Math.min(10, candidate.totalBookings * 0.6);
      if (mode === "personalized") {
        const candidateIndustry = normalizeTerm(candidate.industry);
        const haystack = `${candidate.name} ${candidate.title} ${candidate.description} ${candidate.industry}`.toLowerCase();
        const sameIndustry = exploredIndustrySet.has(candidateIndustry);
        if (sameIndustry) score += 24;
        const viewedThisExpert = viewedTokenSet.has(normalizeTerm(candidate.id)) || viewedTokenSet.has(normalizeTerm(candidate.name));
        if (viewedThisExpert) score += 18;
        else if (viewedIndustrySet.has(candidateIndustry)) score += 14;
        const matchedSearch = Array.from(searchTokens).some(
          (token) => token.length > 1 && haystack.includes(token)
        );
        if (matchedSearch) score += 14;
        const matchedCategory = Array.from(clickedCategorySet).some(
          (category) => category.length > 1 && haystack.includes(category)
        );
        if (matchedCategory) score += 12;
      }
      const whyReason = mode === "cold-start" ? buildColdStartReason(candidate) : buildPersonalizedReason(candidate, {
        exploredIndustries,
        viewedExperts,
        searchHistory,
        clickedCategories,
        viewedIndustrySet
      });
      return {
        name: candidate.name,
        title: candidate.title,
        specialization: candidate.industry,
        description: candidate.description,
        experienceYears: candidate.experienceYears,
        fee: candidate.fee,
        whyReason,
        rankingScore: roundScore(score)
      };
    }).sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 8);
    return {
      data: {
        mode,
        activityCount,
        experts: scored.length > 0 ? scored : buildEmptyStateFallback(mode, {
          exploredIndustries,
          viewedExperts,
          searchHistory,
          clickedCategories
        })
      },
      meta: {
        model: "heuristic",
        provider: "fallback",
        tokensUsed: 0,
        latencyMs: 0
      }
    };
  } catch {
    const viewedExperts = normalizeList(input.viewedExperts);
    const exploredIndustries = normalizeList(input.exploredIndustries);
    const searchHistory = normalizeList(input.searchHistory);
    const clickedCategories = normalizeList(input.clickedCategories);
    const activityCount = viewedExperts.length + exploredIndustries.length + searchHistory.length + clickedCategories.length;
    const mode = activityCount === 0 ? "cold-start" : "personalized";
    return {
      data: {
        mode,
        activityCount,
        experts: buildEmptyStateFallback(mode, {
          exploredIndustries,
          viewedExperts,
          searchHistory,
          clickedCategories
        })
      },
      meta: { model: "heuristic", provider: "fallback", tokensUsed: 0, latencyMs: 0 }
    };
  }
};
var ensureIndustryArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => sanitizeText(item, 80)).map((item) => item.trim()).filter((item) => item.length > 0).slice(0, 8);
};
var ensureTaglineLength = (value) => {
  const cleaned = sanitizeText(value, 120);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 5 && words.length <= 7) return words.join(" ");
  return words.slice(0, 7).join(" ") || "Optimize every customer moment better";
};
var buildIndustryFallback = (industryName) => ({
  industryName,
  industryDescription: `${industryName} focuses on designing, measuring, and continuously improving the end-to-end customer journey across channels. It blends service operations, experience strategy, and performance analytics to raise satisfaction, loyalty, and growth.`,
  idealExpertTypes: [
    "Customer experience strategists",
    "Service design and operations consultants",
    "Contact center transformation leaders",
    "Customer success and retention specialists"
  ],
  commonUseCases: [
    "Improve customer satisfaction and retention",
    "Redesign support workflows and SLAs",
    "Scale omnichannel service operations",
    "Reduce churn through journey optimization"
  ],
  shortTagline: "Elevate service quality at scale"
});
var industryCreation = async (input) => {
  const industryName = sanitizeText(input.industryName, 100).trim() || "General Industry";
  try {
    const { data, meta } = await aiProvider.generateJSON({
      messages: [
        {
          role: "system",
          content: "You are the ConsultEdge admin industry content generator. Return strict JSON only."
        },
        {
          role: "user",
          content: [
            "Generate a premium SaaS-grade industry profile.",
            "Output JSON shape:",
            '{ "industryName": string, "industryDescription": string, "idealExpertTypes": string[], "commonUseCases": string[], "shortTagline": string }',
            "Rules:",
            "- industryDescription must be 2-3 concise lines.",
            "- idealExpertTypes and commonUseCases must never be empty.",
            "- shortTagline must be 5-7 words.",
            `Industry name: ${industryName}`
          ].join("\n")
        }
      ],
      temperature: 0.4,
      maxTokens: 550
    });
    if (!data) {
      return {
        data: buildIndustryFallback(industryName),
        meta: {
          model: meta.model,
          provider: meta.provider,
          tokensUsed: meta.tokensUsed,
          latencyMs: meta.latencyMs
        }
      };
    }
    const safe = {
      industryName: sanitizeText(data.industryName, 100).trim() || industryName,
      industryDescription: sanitizeText(data.industryDescription, 500).trim() || buildIndustryFallback(industryName).industryDescription,
      idealExpertTypes: ensureIndustryArray(data.idealExpertTypes),
      commonUseCases: ensureIndustryArray(data.commonUseCases),
      shortTagline: ensureTaglineLength(data.shortTagline || "")
    };
    if (safe.idealExpertTypes.length === 0 || safe.commonUseCases.length === 0) {
      const fallback = buildIndustryFallback(industryName);
      safe.idealExpertTypes = fallback.idealExpertTypes;
      safe.commonUseCases = fallback.commonUseCases;
    }
    return {
      data: safe,
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs
      }
    };
  } catch {
    return {
      data: buildIndustryFallback(industryName),
      meta: {
        model: "heuristic",
        provider: "fallback",
        tokensUsed: 0,
        latencyMs: 0
      }
    };
  }
};
var tokenize = (text) => sanitizeText(text, 500).toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1);
var uniqueStrings = (items, max = 100) => Array.from(new Set(items.map((item) => sanitizeText(item, 160).trim()).filter(Boolean))).slice(0, max);
var clamp01 = (value) => Math.max(0, Math.min(1, value));
var countTokenMatches = (tokens, haystack) => tokens.reduce((sum, token) => haystack.includes(token) ? sum + 1 : sum, 0);
var mapPopularityBoost = (popularity) => Math.min(0.2, popularity * 0.02);
var buildRecentSearches = (query2, history) => {
  const cleanedQuery = sanitizeText(query2, 200).trim();
  const deduped = [cleanedQuery, ...history.filter((item) => item.toLowerCase() !== cleanedQuery.toLowerCase())];
  return uniqueStrings(deduped, 5);
};
var snippet = (text, max = 160) => {
  const clean = sanitizeText(text, 1e3).trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 3)}...`;
};
var normalizeActivity = (activity) => ({
  viewedExperts: uniqueStrings(activity?.viewedExperts ?? [], 100),
  exploredIndustries: uniqueStrings(activity?.exploredIndustries ?? [], 100),
  searchHistory: uniqueStrings(activity?.searchHistory ?? [], 100),
  clickedCategories: uniqueStrings(activity?.clickedCategories ?? [], 100)
});
var aggregateFrequency = (items) => {
  const map = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = item.toLowerCase();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
};
var fetchUniversalSearchData = async (input) => {
  const [bookingCounts, dbExperts, dbIndustries, dbTestimonials] = await Promise.all([
    prisma.consultation.groupBy({
      by: ["expertId"],
      where: { expertId: { not: null } },
      _count: { _all: true }
    }),
    prisma.expert.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        fullName: true,
        title: true,
        bio: true,
        industry: { select: { name: true } }
      },
      take: 300
    }),
    prisma.industry.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, description: true },
      take: 300
    }),
    prisma.testimonial.findMany({
      where: { status: ReviewStatus.APPROVED, comment: { not: null } },
      select: {
        id: true,
        comment: true,
        expert: { select: { fullName: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 500
    })
  ]);
  const bookingMap = new Map(
    bookingCounts.filter((item) => !!item.expertId).map((item) => [item.expertId, item._count._all])
  );
  const sourceExperts = [
    ...dbExperts.map((expert) => ({
      id: expert.id,
      name: expert.fullName,
      title: expert.title?.trim() || "Consulting Expert",
      specialization: expert.industry.name,
      industry: expert.industry.name,
      tags: uniqueStrings([expert.title ?? "", expert.industry.name]),
      description: expert.bio?.trim() || `${expert.fullName} advises teams in ${expert.industry.name.toLowerCase()}.`,
      popularity: bookingMap.get(expert.id) ?? 0
    })),
    ...(input.db?.experts ?? []).map((expert) => ({
      id: sanitizeText(expert.id, 80).trim(),
      name: sanitizeText(expert.name, 200).trim(),
      title: sanitizeText(expert.title ?? "Consulting Expert", 120).trim() || "Consulting Expert",
      specialization: sanitizeText(expert.specialization ?? expert.industry ?? "General Consulting", 120).trim() || "General Consulting",
      industry: sanitizeText(expert.industry ?? "General", 120).trim() || "General",
      tags: uniqueStrings([...expert.tags ?? [], ...expert.expertise ?? []], 12),
      description: sanitizeText(expert.description ?? expert.bio ?? "", 600).trim(),
      popularity: 0
    })) ?? []
  ].filter((expert) => expert.id && expert.name);
  const sourceIndustries = [
    ...dbIndustries.map((industry) => ({
      id: industry.id,
      industryName: industry.name,
      description: industry.description?.trim() || `${industry.name} consulting and strategic advisory.`,
      keywords: uniqueStrings([industry.name, ...industry.description ? tokenize(industry.description).slice(0, 8) : []])
    })),
    ...(input.db?.industries ?? []).map((industry) => ({
      id: sanitizeText(industry.id ?? industry.name ?? industry.industryName ?? "", 80).trim(),
      industryName: sanitizeText(industry.industryName ?? industry.name ?? "", 120).trim() || "General",
      description: sanitizeText(industry.description ?? "", 600).trim(),
      keywords: uniqueStrings(industry.keywords ?? [], 20)
    })) ?? []
  ].filter((industry) => industry.id && industry.industryName);
  const sourceTestimonials = [
    ...dbTestimonials.map((testimonial) => ({
      id: testimonial.id,
      expertName: testimonial.expert.fullName,
      content: testimonial.comment?.trim() ?? "",
      popularity: 1
    })),
    ...(input.db?.testimonials ?? []).map((testimonial) => ({
      id: sanitizeText(testimonial.id ?? "", 80).trim(),
      expertName: sanitizeText(testimonial.expertName ?? "", 200).trim(),
      content: sanitizeText(testimonial.content ?? testimonial.comment ?? "", 1200).trim(),
      popularity: 0
    })) ?? []
  ].filter((testimonial) => testimonial.id && testimonial.expertName && testimonial.content);
  return {
    experts: sourceExperts,
    industries: sourceIndustries,
    testimonials: sourceTestimonials,
    bookingMap
  };
};
var generateAISuggestions = (input) => {
  const intent = sanitizeText(input.query, 120).trim();
  const pool = uniqueStrings(
    [
      `${intent} strategy for founders`,
      input.topIndustries[0] ? `${intent} in ${input.topIndustries[0]}` : "",
      input.topExpertSkills[0] ? `${intent} with ${input.topExpertSkills[0]} experts` : "",
      input.trendingTitles[0] ? `${input.trendingTitles[0]} playbook` : "",
      input.topIndustries[1] ? `${intent} roadmap for ${input.topIndustries[1]}` : "",
      input.topExpertSkills[1] ? `How to execute ${intent} with ${input.topExpertSkills[1]}` : ""
    ],
    5
  );
  return pool.slice(0, 5);
};
var search = async (input) => {
  try {
    const query2 = sanitizeText(input.query, 500).trim();
    const queryTokens = tokenize(query2);
    const activity = normalizeActivity(input.userActivity);
    const viewedFreq = aggregateFrequency(activity.viewedExperts);
    const exploredIndustryFreq = aggregateFrequency(activity.exploredIndustries);
    const clickedCategoryFreq = aggregateFrequency(activity.clickedCategories);
    const sources = await fetchUniversalSearchData(input);
    const experts = sources.experts.map((expert) => {
      const haystack = [
        expert.name,
        expert.title,
        expert.specialization,
        expert.industry,
        expert.tags.join(" "),
        expert.description
      ].join(" ").toLowerCase();
      const textScore = queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
      const viewedBoost = (viewedFreq.get(expert.name.toLowerCase()) ?? 0) > 0 || (viewedFreq.get(expert.id.toLowerCase()) ?? 0) > 0 ? 0.12 : 0;
      const industryBoost = (exploredIndustryFreq.get(expert.industry.toLowerCase()) ?? 0) > 0 ? 0.1 : 0;
      const categoryBoost = (clickedCategoryFreq.get(expert.specialization.toLowerCase()) ?? 0) > 0 ? 0.08 : 0;
      const popularityBoost = mapPopularityBoost(expert.popularity);
      const finalScore = clamp01(textScore * 0.65 + viewedBoost + industryBoost + categoryBoost + popularityBoost);
      return {
        type: "expert",
        id: expert.id,
        name: expert.name,
        title: expert.title,
        specialization: expert.specialization,
        industry: expert.industry,
        matchScore: Math.round(finalScore * 1e3) / 1e3
      };
    }).filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 12);
    const industries = sources.industries.map((industry) => {
      const haystack = `${industry.industryName} ${industry.description} ${industry.keywords.join(" ")}`.toLowerCase();
      const textScore = queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
      const activityBoost = (exploredIndustryFreq.get(industry.industryName.toLowerCase()) ?? 0) > 0 ? 0.15 : 0;
      const finalScore = clamp01(textScore * 0.8 + activityBoost);
      return {
        type: "industry",
        id: industry.id,
        industryName: industry.industryName,
        description: snippet(industry.description, 180),
        matchScore: Math.round(finalScore * 1e3) / 1e3
      };
    }).filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    const testimonials = sources.testimonials.map((testimonial) => {
      const haystack = `${testimonial.expertName} ${testimonial.content}`.toLowerCase();
      const textScore = queryTokens.length === 0 ? 0 : countTokenMatches(queryTokens, haystack) / queryTokens.length;
      const finalScore = clamp01(textScore * 0.9 + mapPopularityBoost(testimonial.popularity));
      return {
        type: "testimonial",
        id: testimonial.id,
        expertName: testimonial.expertName,
        contentSnippet: snippet(testimonial.content),
        matchScore: Math.round(finalScore * 1e3) / 1e3
      };
    }).filter((item) => item.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    const mostBookedExperts = sources.experts.map((expert) => ({
      title: expert.name,
      category: "most-booked-experts",
      reason: `Booked ${expert.popularity} consultations`,
      score: expert.popularity
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    const mostSearched = Array.from(aggregateFrequency(activity.searchHistory).entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([title, count]) => ({
      title,
      category: "most-searched-queries",
      reason: `Searched ${count} time${count > 1 ? "s" : ""}`,
      score: count
    }));
    const mostViewed = Array.from(viewedFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([title, count]) => ({
      title,
      category: "most-viewed-experts",
      reason: `Viewed ${count} time${count > 1 ? "s" : ""}`,
      score: count
    }));
    const mostExploredIndustries = Array.from(exploredIndustryFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([title, count]) => ({
      title,
      category: "most-explored-industries",
      reason: `Explored ${count} time${count > 1 ? "s" : ""}`,
      score: count
    }));
    const incomingTrending = (input.db?.trending ?? []).map((item) => ({
      title: sanitizeText(item.title ?? "", 120).trim(),
      category: sanitizeText(item.category ?? "trending", 80).trim() || "trending",
      reason: sanitizeText(item.reason ?? "Popular this week", 200).trim() || "Popular this week",
      score: 1
    })).filter((item) => item.title);
    const trending = [
      ...incomingTrending,
      ...mostSearched,
      ...mostViewed,
      ...mostExploredIndustries,
      ...mostBookedExperts
    ].sort((a, b) => b.score - a.score).slice(0, 8).map((item) => ({
      type: "trending",
      title: item.title,
      category: item.category,
      reason: item.reason
    }));
    const topExpertScore = experts[0]?.matchScore ?? 0;
    const topIndustryScore = industries[0]?.matchScore ?? 0;
    const weakResults = experts.length + industries.length + testimonials.length < 4 || Math.max(topExpertScore, topIndustryScore) < 0.45;
    const aiSuggestions = weakResults ? generateAISuggestions({
      query: query2,
      topIndustries: industries.map((item) => item.industryName),
      topExpertSkills: experts.map((item) => item.specialization),
      trendingTitles: trending.map((item) => item.title)
    }) : [];
    const recentSearches = buildRecentSearches(query2, activity.searchHistory);
    return {
      data: {
        experts,
        industries,
        testimonials,
        trending,
        aiSuggestions,
        recentSearches
      },
      meta: {
        model: "heuristic",
        provider: "fallback",
        tokensUsed: 0,
        latencyMs: 0
      }
    };
  } catch {
    const activity = normalizeActivity(input.userActivity);
    const query2 = sanitizeText(input.query, 500).trim();
    const fallbackExperts = (input.db?.experts ?? []).map((expert) => ({
      type: "expert",
      id: sanitizeText(expert.id, 80).trim(),
      name: sanitizeText(expert.name, 200).trim(),
      title: sanitizeText(expert.title ?? "Consulting Expert", 120).trim() || "Consulting Expert",
      specialization: sanitizeText(expert.specialization ?? expert.industry ?? "General Consulting", 120).trim() || "General Consulting",
      industry: sanitizeText(expert.industry ?? "General", 120).trim() || "General",
      matchScore: 0.3
    })).filter((item) => item.id && item.name).slice(0, 5);
    const fallbackIndustries = (input.db?.industries ?? []).map((industry) => ({
      type: "industry",
      id: sanitizeText(industry.id ?? industry.name ?? industry.industryName ?? "", 80).trim(),
      industryName: sanitizeText(industry.industryName ?? industry.name ?? "", 120).trim() || "General",
      description: snippet(industry.description ?? "", 180),
      matchScore: 0.3
    })).filter((item) => item.id && item.industryName).slice(0, 5);
    const fallbackTestimonials = (input.db?.testimonials ?? []).map((testimonial) => ({
      type: "testimonial",
      id: sanitizeText(testimonial.id ?? "", 80).trim(),
      expertName: sanitizeText(testimonial.expertName ?? "", 200).trim(),
      contentSnippet: snippet(testimonial.content ?? testimonial.comment ?? ""),
      matchScore: 0.25
    })).filter((item) => item.id && item.expertName && item.contentSnippet).slice(0, 5);
    const fallbackTrending = (input.db?.trending ?? []).map((item) => ({
      type: "trending",
      title: sanitizeText(item.title ?? "", 120).trim(),
      category: sanitizeText(item.category ?? "trending", 80).trim() || "trending",
      reason: sanitizeText(item.reason ?? "Popular this week", 200).trim() || "Popular this week"
    })).filter((item) => item.title).slice(0, 5);
    return {
      data: {
        experts: fallbackExperts,
        industries: fallbackIndustries,
        testimonials: fallbackTestimonials,
        trending: fallbackTrending,
        aiSuggestions: generateAISuggestions({
          query: query2,
          topIndustries: fallbackIndustries.map((item) => item.industryName),
          topExpertSkills: fallbackExperts.map((item) => item.specialization),
          trendingTitles: fallbackTrending.map((item) => item.title)
        }),
        recentSearches: buildRecentSearches(query2, activity.searchHistory)
      },
      meta: { model: "heuristic", provider: "fallback", tokensUsed: 0, latencyMs: 0 }
    };
  }
};
var summary = async (input) => {
  const { data, meta } = await aiProvider.generateJSON({
    messages: [
      { role: "system", content: "You are a consulting analyst. Always return strict JSON." },
      { role: "user", content: summaryPrompt(input) }
    ],
    temperature: 0.3,
    maxTokens: 700
  });
  const safe = {
    summary: data?.summary ?? input.text.slice(0, 280),
    keyPoints: data?.keyPoints ?? [],
    actionItems: data?.actionItems ?? []
  };
  return {
    data: safe,
    meta: {
      model: meta.model,
      provider: meta.provider,
      tokensUsed: meta.tokensUsed,
      latencyMs: meta.latencyMs
    }
  };
};
var chat = async (input) => {
  const messages = buildChatMessages(input);
  const result = await aiProvider.generate({
    messages,
    temperature: 0.5,
    maxTokens: 500
  });
  return {
    data: { reply: result.text || "I'm here to help. Could you share a bit more detail?" },
    meta: {
      model: result.model,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
      latencyMs: result.latencyMs
    }
  };
};
var documentAnalysis = async (input) => {
  const cleanText = sanitizeText(input.text, 16e3);
  const { data, meta } = await aiProvider.generateJSON({
    messages: [
      { role: "system", content: "You are a consulting document analyst. Always return strict JSON." },
      {
        role: "user",
        content: documentAnalysisPrompt({ text: cleanText, objective: input.objective })
      }
    ],
    temperature: 0.2,
    maxTokens: 1200
  });
  const safe = {
    summary: data?.summary ?? "",
    topics: data?.topics ?? [],
    entities: {
      people: data?.entities?.people ?? [],
      organizations: data?.entities?.organizations ?? [],
      locations: data?.entities?.locations ?? []
    },
    risks: data?.risks ?? [],
    opportunities: data?.opportunities ?? [],
    recommendedExperts: data?.recommendedExperts ?? []
  };
  return {
    data: safe,
    meta: {
      model: meta.model,
      provider: meta.provider,
      tokensUsed: meta.tokensUsed,
      latencyMs: meta.latencyMs
    }
  };
};
var aiAdvancedService = {
  recommendations,
  industryCreation,
  search,
  summary,
  chat,
  documentAnalysis
};

// src/modules/ai/utils/response.ts
var sendAIResponse = (res, data, meta, statusCode = 200) => {
  res.locals.aiMeta = meta;
  return res.status(statusCode).json({ success: true, data, meta });
};

// src/modules/ai/controllers/aiAdvanced.controller.ts
var recommendations2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  const { data, meta } = await aiAdvancedService.recommendations(payload);
  sendAIResponse(res, data, meta);
});
var industryCreation2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  payload.industryName = sanitizeText(payload.industryName, 100);
  const { data, meta } = await aiAdvancedService.industryCreation(payload);
  sendAIResponse(res, data, meta);
});
var search2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  payload.query = sanitizeText(payload.query, 500);
  const { data, meta } = await aiAdvancedService.search(payload);
  sendAIResponse(res, data, meta);
});
var summary2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const { data, meta } = await aiAdvancedService.summary({
    text: sanitizeText(payload.text, 16e3),
    audience: payload.audience ? sanitizeText(payload.audience, 100) : void 0
  });
  sendAIResponse(res, data, meta);
});
var chat2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  payload.message = sanitizeText(payload.message, 4e3);
  const { data, meta } = await aiAdvancedService.chat(payload);
  sendAIResponse(res, data, meta);
});
var documentAnalysis2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const { data, meta } = await aiAdvancedService.documentAnalysis({
    text: sanitizeText(payload.text, 32e3),
    objective: payload.objective ? sanitizeText(payload.objective, 500) : void 0
  });
  sendAIResponse(res, data, meta);
});
var aiAdvancedController = {
  recommendations: recommendations2,
  industryCreation: industryCreation2,
  search: search2,
  summary: summary2,
  chat: chat2,
  documentAnalysis: documentAnalysis2
};

// src/modules/ai/controllers/aiChat.controller.ts
import httpStatus5 from "http-status";

// src/modules/ai/services/aiChat.service.ts
import httpStatus4 from "http-status";
var MAX_HISTORY_MESSAGES = 20;
var aiMessageSelect = {
  id: true,
  role: true,
  content: true,
  model: true,
  provider: true,
  tokensUsed: true,
  latencyMs: true,
  feedback: true,
  createdAt: true
};
var formatRole = (role) => {
  if (role === AIChatMessageRole.USER) return "user";
  if (role === AIChatMessageRole.ASSISTANT) return "assistant";
  return "system";
};
var formatMessage2 = (message) => ({
  id: message.id,
  role: formatRole(message.role),
  content: message.content,
  feedback: message.feedback,
  model: message.model ?? null,
  provider: message.provider ?? null,
  tokensUsed: message.tokensUsed ?? 0,
  latencyMs: message.latencyMs ?? 0,
  createdAt: message.createdAt
});
var buildConversationTitle = (message) => {
  const compact = sanitizeText(message, 160).replace(/\s+/g, " ").trim();
  if (compact.length <= 60) return compact;
  return `${compact.slice(0, 57).trimEnd()}...`;
};
var ensureConversationOwner = async (conversationId, userId) => {
  const conversation = await prisma.aIConversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userId: true, title: true, createdAt: true, updatedAt: true }
  });
  if (!conversation || conversation.userId !== userId) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "AI conversation not found");
  }
  return conversation;
};
var getOrCreateConversation = async (userId, conversationId, message) => {
  if (conversationId) {
    return ensureConversationOwner(conversationId, userId);
  }
  return prisma.aIConversation.create({
    data: {
      userId,
      title: buildConversationTitle(message) || "New chat"
    },
    select: { id: true, userId: true, title: true, createdAt: true, updatedAt: true }
  });
};
var sendMessage = async (userId, input) => {
  const cleanMessage = sanitizeText(input.message, 4e3).trim();
  const cleanContext = input.context ? sanitizeText(input.context, 500).trim() : void 0;
  if (!cleanMessage) {
    throw new AppError_default(httpStatus4.BAD_REQUEST, "Message is required");
  }
  const conversation = await getOrCreateConversation(userId, input.conversationId, cleanMessage);
  const historyRows = await prisma.aIChatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY_MESSAGES,
    select: aiMessageSelect
  });
  const history = historyRows.reverse().filter((item) => item.role !== AIChatMessageRole.SYSTEM).map((item) => ({ role: formatRole(item.role), content: item.content })).filter(
    (item) => item.role === "user" || item.role === "assistant"
  );
  const providerResult = await aiProvider.generate({
    messages: buildChatMessages({
      message: cleanMessage,
      context: cleanContext || void 0,
      history
    }),
    temperature: 0.5,
    maxTokens: 500
  });
  const safeReply = providerResult.text?.trim() || "I'm here to help. Could you share a bit more detail?";
  const { userMessage, assistantMessage, updatedConversation } = await prisma.$transaction(
    async (tx) => {
      const createdUserMessage = await tx.aIChatMessage.create({
        data: {
          conversationId: conversation.id,
          role: AIChatMessageRole.USER,
          content: cleanMessage
        },
        select: aiMessageSelect
      });
      const createdAssistantMessage = await tx.aIChatMessage.create({
        data: {
          conversationId: conversation.id,
          role: AIChatMessageRole.ASSISTANT,
          content: safeReply,
          model: providerResult.model,
          provider: providerResult.provider,
          tokensUsed: providerResult.tokensUsed,
          latencyMs: providerResult.latencyMs
        },
        select: aiMessageSelect
      });
      const refreshedConversation = await tx.aIConversation.update({
        where: { id: conversation.id },
        data: {
          title: conversation.title === "New chat" || !input.conversationId ? buildConversationTitle(cleanMessage) || conversation.title : void 0
        },
        select: { id: true, title: true, createdAt: true, updatedAt: true }
      });
      return {
        userMessage: createdUserMessage,
        assistantMessage: createdAssistantMessage,
        updatedConversation: refreshedConversation
      };
    }
  );
  return {
    data: {
      conversation: updatedConversation,
      userMessage: formatMessage2(userMessage),
      assistantMessage: formatMessage2(assistantMessage)
    },
    meta: {
      model: providerResult.model,
      provider: providerResult.provider,
      tokensUsed: providerResult.tokensUsed,
      latencyMs: providerResult.latencyMs
    }
  };
};
var listConversations = async (userId) => {
  const conversations = await prisma.aIConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true
        }
      }
    }
  });
  return conversations.map((conversation) => ({
    id: conversation.id,
    title: conversation.title,
    preview: conversation.messages[0]?.content ?? "",
    lastMessageRole: conversation.messages[0] ? formatRole(conversation.messages[0].role) : null,
    lastMessageAt: conversation.messages[0]?.createdAt ?? conversation.updatedAt,
    messageCount: conversation._count.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  }));
};
var getConversation = async (userId, conversationId) => {
  const conversation = await ensureConversationOwner(conversationId, userId);
  const messages = await prisma.aIChatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    select: aiMessageSelect
  });
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: messages.map(formatMessage2)
  };
};
var updateMessageFeedback = async (userId, conversationId, messageId, feedback) => {
  await ensureConversationOwner(conversationId, userId);
  const message = await prisma.aIChatMessage.findFirst({
    where: {
      id: messageId,
      conversationId
    },
    select: aiMessageSelect
  });
  if (!message) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "AI message not found");
  }
  if (message.role !== AIChatMessageRole.ASSISTANT) {
    throw new AppError_default(httpStatus4.BAD_REQUEST, "Only assistant messages can be rated");
  }
  const updated = await prisma.aIChatMessage.update({
    where: { id: messageId },
    data: { feedback },
    select: aiMessageSelect
  });
  return formatMessage2(updated);
};
var aiChatService = {
  sendMessage,
  listConversations,
  getConversation,
  updateMessageFeedback
};

// src/modules/ai/controllers/aiChat.controller.ts
var sendMessage2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  const { data, meta } = await aiChatService.sendMessage(req.user.userId, {
    message: sanitizeText(payload.message, 4e3),
    context: payload.context ? sanitizeText(payload.context, 500) : void 0,
    conversationId: payload.conversationId
  });
  sendAIResponse(res, data, meta, httpStatus5.CREATED);
});
var listConversations2 = catchAsync(async (req, res) => {
  const data = await aiChatService.listConversations(req.user.userId);
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "AI conversations fetched successfully",
    data
  });
});
var getConversation2 = catchAsync(async (req, res) => {
  const data = await aiChatService.getConversation(
    req.user.userId,
    String(req.params.conversationId)
  );
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "AI conversation fetched successfully",
    data
  });
});
var updateMessageFeedback2 = catchAsync(async (req, res) => {
  const payload = sanitizeObject(req.body);
  const data = await aiChatService.updateMessageFeedback(
    req.user.userId,
    String(req.params.conversationId),
    String(req.params.messageId),
    payload.feedback ?? null
  );
  sendResponse(res, {
    httpStatusCode: httpStatus5.OK,
    success: true,
    message: "AI message feedback updated successfully",
    data
  });
});
var aiChatController = {
  sendMessage: sendMessage2,
  listConversations: listConversations2,
  getConversation: getConversation2,
  updateMessageFeedback: updateMessageFeedback2
};

// src/modules/ai/utils/metrics.ts
var stats = /* @__PURE__ */ new Map();
var startedAt = Date.now();
var getOrCreate = (endpoint) => {
  let s = stats.get(endpoint);
  if (!s) {
    s = {
      count: 0,
      errorCount: 0,
      totalLatencyMs: 0,
      totalTokens: 0,
      lastError: null,
      lastCallAt: null
    };
    stats.set(endpoint, s);
  }
  return s;
};
var aiMetrics = {
  recordSuccess(endpoint, latencyMs, tokensUsed = 0) {
    const s = getOrCreate(endpoint);
    s.count += 1;
    s.totalLatencyMs += latencyMs;
    s.totalTokens += tokensUsed;
    s.lastCallAt = (/* @__PURE__ */ new Date()).toISOString();
  },
  recordError(endpoint, latencyMs, message) {
    const s = getOrCreate(endpoint);
    s.count += 1;
    s.errorCount += 1;
    s.totalLatencyMs += latencyMs;
    s.lastError = { message, at: (/* @__PURE__ */ new Date()).toISOString() };
    s.lastCallAt = (/* @__PURE__ */ new Date()).toISOString();
  },
  snapshot() {
    const endpoints = {};
    for (const [key, s] of stats) {
      endpoints[key] = {
        count: s.count,
        errorCount: s.errorCount,
        avgLatencyMs: s.count > 0 ? Math.round(s.totalLatencyMs / s.count) : 0,
        totalTokens: s.totalTokens,
        lastError: s.lastError,
        lastCallAt: s.lastCallAt
      };
    }
    return {
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1e3),
      endpoints
    };
  }
};

// src/modules/ai/controllers/aiOps.controller.ts
var health = catchAsync(async (_req, res) => {
  const probe = await aiProvider.ping();
  const httpStatus7 = probe.status === "ok" ? 200 : probe.status === "unconfigured" ? 503 : 503;
  res.status(httpStatus7).json({
    success: probe.status === "ok",
    data: probe
  });
});
var metrics = catchAsync(async (_req, res) => {
  res.status(200).json({
    success: true,
    data: aiMetrics.snapshot()
  });
});
var aiOpsController = { health, metrics };

// src/modules/ai/schemas/ragOutput.schema.ts
import { z as z8 } from "zod";
var ragSourceSchema = z8.object({
  source_id: z8.string().min(1),
  evidence: z8.string().min(1)
});
var ragResponseSchema = z8.object({
  answer: z8.string().min(1),
  reasoning: z8.string().min(1),
  sources: z8.array(ragSourceSchema),
  suggestions: z8.array(z8.string().min(1)).max(5)
});

// src/modules/ai/utils/ragRanker.ts
var tokenize2 = (value) => value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1);
var normalize = (value) => value.trim().toLowerCase();
var parseDateScore = (createdAtValue) => {
  if (typeof createdAtValue !== "string") return 0;
  const parsed = new Date(createdAtValue);
  if (Number.isNaN(parsed.valueOf())) return 0;
  const ageDays = Math.max(0, (Date.now() - parsed.valueOf()) / (1e3 * 60 * 60 * 24));
  if (ageDays <= 7) return 0.08;
  if (ageDays <= 30) return 0.05;
  if (ageDays <= 90) return 0.03;
  return 0;
};
var qualityScore = (metadata) => {
  if (!metadata) return 0;
  const rating = Number(metadata.rating ?? 0);
  const totalReviews = Number(metadata.totalReviews ?? 0);
  let score = 0;
  if (Number.isFinite(rating) && rating >= 4.5) score += 0.06;
  else if (Number.isFinite(rating) && rating >= 4) score += 0.03;
  if (Number.isFinite(totalReviews) && totalReviews >= 100) score += 0.05;
  else if (Number.isFinite(totalReviews) && totalReviews >= 20) score += 0.03;
  score += parseDateScore(metadata.createdAt);
  return Math.min(0.15, score);
};
var rankRagContext = (query2, context, topK = 6) => {
  const normalizedQuery = normalize(query2);
  const queryTokens = tokenize2(query2);
  const tokenSet = new Set(queryTokens);
  const ranked = context.filter((item) => item.source_id?.trim() && item.content?.trim()).map((item) => {
    const text = normalize(item.content);
    const textTokens = tokenize2(text);
    const textTokenSet = new Set(textTokens);
    const exactPhraseMatch = normalizedQuery.length > 2 && text.includes(normalizedQuery) ? 1 : 0;
    let overlapCount = 0;
    for (const token of tokenSet) {
      if (textTokenSet.has(token)) overlapCount += 1;
    }
    const overlapScore = tokenSet.size > 0 ? overlapCount / tokenSet.size : 0;
    const lengthPenalty = text.length > 4e3 ? 0.05 : 0;
    const score = exactPhraseMatch * 0.6 + overlapScore * 0.4 + qualityScore(item.metadata) - lengthPenalty;
    return {
      ...item,
      score: Math.max(0, Math.min(1, Number(score.toFixed(4))))
    };
  }).sort((a, b) => b.score - a.score).slice(0, Math.max(1, topK));
  return ranked;
};

// src/modules/ai/services/aiRag.service.ts
var NO_MATCH = "No matching data found in the system.";
var buildPrompt = (query2, context) => {
  return [
    "You are the RAG engine for ConsultEdge.",
    "Answer ONLY using the data provided below.",
    "Never hallucinate or invent experts, industries, reviews, or policies.",
    `If answer not present, answer must be exactly: "${NO_MATCH}".`,
    "Rules:",
    "1) Use only retrieved context.",
    "2) Do not guess missing information.",
    "3) If multiple experts match, rank by relevance.",
    "4) If user intent is unclear, ask a clarifying question in suggestions.",
    "5) Keep answer clear and professional.",
    "6) Include why this answer in reasoning.",
    "7) Include citations using source_id values from context.",
    "Output JSON with shape:",
    '{"answer":"...","reasoning":"...","sources":[{"source_id":"...","evidence":"..."}],"suggestions":["..."]}',
    "Context:",
    JSON.stringify(context),
    "Query:",
    query2
  ].join("\n");
};
var aiRagService = {
  async query(input) {
    const ranked = rankRagContext(input.query, input.context, input.topK ?? 6);
    if (ranked.length === 0 || ranked[0].score < 0.08) {
      return {
        data: {
          answer: NO_MATCH,
          reasoning: "No relevant evidence matched the query in retrieved context.",
          sources: [],
          suggestions: [
            "Try refining the query with specific industry, expert name, or title.",
            "Increase retrieval depth and rerun the query."
          ]
        },
        meta: {
          model: "heuristic",
          provider: "fallback",
          tokensUsed: 0,
          latencyMs: 0
        }
      };
    }
    const { data, meta } = await aiProvider.generateJSON({
      messages: [
        {
          role: "system",
          content: "You are a strict retrieval-grounded JSON API. Never output non-JSON."
        },
        {
          role: "user",
          content: buildPrompt(input.query, ranked)
        }
      ],
      temperature: 0.1,
      maxTokens: 900
    });
    const parsed = ragResponseSchema.safeParse(data);
    if (!parsed.success) {
      return {
        data: {
          answer: NO_MATCH,
          reasoning: "Model response was invalid against RAG schema.",
          sources: [],
          suggestions: [
            "Retry query with narrower intent.",
            "Check retrieved context quality and source_id fields."
          ]
        },
        meta: {
          model: meta.model,
          provider: meta.provider,
          tokensUsed: meta.tokensUsed,
          latencyMs: meta.latencyMs
        }
      };
    }
    return {
      data: parsed.data,
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs
      }
    };
  }
};

// src/modules/ai/controllers/aiRag.controller.ts
var query = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await aiRagService.query(payload);
  sendAIResponse(res, result.data, result.meta);
});
var aiRagController = {
  query
};

// src/modules/ai/ai.validation.ts
import { z as z9 } from "zod";
var historyItemSchema = z9.object({
  role: z9.enum(["user", "assistant"]),
  content: z9.string().trim().min(1).max(4e3)
});
var askSupport3 = z9.object({
  body: z9.object({
    message: z9.string().trim().min(1, "Message is required").max(4e3),
    context: z9.enum(["general", "homepage", "booking", "expert", "payment", "technical"]).optional(),
    history: z9.array(historyItemSchema).max(12).optional()
  })
});
var expertItem = z9.object({
  id: z9.string().min(1),
  name: z9.string().min(1).max(200),
  industry: z9.string().max(120).optional(),
  expertise: z9.array(z9.string().max(80)).max(20).optional(),
  bio: z9.string().max(2e3).optional(),
  rating: z9.number().min(0).max(5).optional()
});
var recommendations3 = z9.object({
  body: z9.object({
    viewedExperts: z9.array(z9.string().max(200)).max(100).optional(),
    exploredIndustries: z9.array(z9.string().max(120)).max(100).optional(),
    searchHistory: z9.array(z9.string().max(200)).max(100).optional(),
    clickedCategories: z9.array(z9.string().max(120)).max(100).optional()
  })
});
var industryCreation3 = z9.object({
  body: z9.object({
    industryName: z9.string().trim().min(2).max(100)
  })
});
var search3 = z9.object({
  body: z9.object({
    query: z9.string().trim().min(1).max(500),
    userActivity: z9.object({
      viewedExperts: z9.array(z9.string().max(200)).max(100).optional(),
      exploredIndustries: z9.array(z9.string().max(120)).max(100).optional(),
      searchHistory: z9.array(z9.string().max(200)).max(100).optional(),
      clickedCategories: z9.array(z9.string().max(120)).max(100).optional()
    }).optional(),
    db: z9.object({
      experts: z9.array(expertItem).max(300).optional(),
      industries: z9.array(z9.record(z9.string(), z9.unknown())).max(300).optional(),
      testimonials: z9.array(z9.record(z9.string(), z9.unknown())).max(500).optional(),
      trending: z9.array(z9.record(z9.string(), z9.unknown())).max(200).optional()
    }).optional()
  })
});
var summary3 = z9.object({
  body: z9.object({
    text: z9.string().trim().min(20).max(2e4),
    audience: z9.string().max(100).optional()
  })
});
var chat3 = z9.object({
  body: z9.object({
    message: z9.string().trim().min(1).max(4e3),
    context: z9.string().max(500).optional(),
    history: z9.array(historyItemSchema).max(20).optional()
  })
});
var persistedChatMessage = z9.object({
  body: z9.object({
    message: z9.string().trim().min(1).max(4e3),
    context: z9.string().max(500).optional(),
    conversationId: z9.string().uuid().optional()
  })
});
var conversationParams = z9.object({
  params: z9.object({
    conversationId: z9.string().uuid()
  })
});
var messageFeedback = z9.object({
  params: z9.object({
    conversationId: z9.string().uuid(),
    messageId: z9.string().uuid()
  }),
  body: z9.object({
    feedback: z9.enum(["LIKE", "DISLIKE"]).nullable()
  })
});
var ragQuery = z9.object({
  body: z9.object({
    query: z9.string().trim().min(1).max(1e3),
    topK: z9.coerce.number().int().min(1).max(20).optional(),
    context: z9.array(
      z9.object({
        source_id: z9.string().trim().min(1).max(200),
        content: z9.string().trim().min(1).max(12e3),
        metadata: z9.record(z9.string(), z9.unknown()).optional()
      })
    ).min(1).max(100)
  })
});
var documentAnalysis3 = z9.object({
  body: z9.object({
    text: z9.string().trim().min(50).max(4e4),
    objective: z9.string().max(500).optional()
  })
});
var aiValidation = {
  askSupport: askSupport3,
  recommendations: recommendations3,
  industryCreation: industryCreation3,
  search: search3,
  summary: summary3,
  chat: chat3,
  persistedChatMessage,
  conversationParams,
  messageFeedback,
  ragQuery,
  documentAnalysis: documentAnalysis3
};

// src/modules/ai/utils/aiLogger.ts
var aiLogger = (req, res, next) => {
  const startedAt2 = Date.now();
  const endpoint = req.path || req.originalUrl;
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt2;
    const meta = res.locals.aiMeta ?? null;
    const ok = res.statusCode < 400;
    if (ok) {
      aiMetrics.recordSuccess(endpoint, durationMs, meta?.tokensUsed ?? 0);
    } else {
      aiMetrics.recordError(endpoint, durationMs, `HTTP ${res.statusCode}`);
    }
    console.log(
      JSON.stringify({
        scope: "ai",
        endpoint,
        method: req.method,
        status: res.statusCode,
        durationMs,
        provider: meta?.provider ?? null,
        model: meta?.model ?? null,
        tokensUsed: meta?.tokensUsed ?? 0,
        modelLatencyMs: meta?.latencyMs ?? null,
        at: (/* @__PURE__ */ new Date()).toISOString()
      })
    );
  });
  next();
};

// src/modules/ai/utils/rateLimiter.ts
var buckets = /* @__PURE__ */ new Map();
var getClientKey = (req) => {
  const userId = req.user?.id;
  if (userId) return `u:${userId}`;
  const xff = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(xff) ? xff[0] : xff?.split(",")[0]?.trim()) || req.ip || "unknown";
  return `ip:${ip}`;
};
var rateLimit = (options) => {
  const { windowMs, max, keyPrefix = "ai" } = options;
  return (req, res, next) => {
    const key = `${keyPrefix}:${getClientKey(req)}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      return next();
    }
    if (bucket.count >= max) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1e3));
      res.setHeader("Retry-After", String(retryAfterSec));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded",
        retryAfter: retryAfterSec
      });
    }
    bucket.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(max - bucket.count));
    next();
  };
};
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}, 6e4).unref?.();

// src/modules/ai/utils/aiErrorHandler.ts
import status22 from "http-status";
var aiErrorHandler = (err, _req, res, next) => {
  if (err instanceof AppError_default && err.statusCode === status22.SERVICE_UNAVAILABLE) {
    return res.status(503).json({
      success: false,
      message: "AI provider unavailable",
      detail: err.message
    });
  }
  if (err instanceof AppError_default && err.statusCode === status22.BAD_GATEWAY) {
    return res.status(503).json({
      success: false,
      message: "AI provider unavailable",
      detail: err.message
    });
  }
  return next(err);
};

// src/modules/ai/ai.router.ts
var router10 = Router9();
router10.use(aiLogger);
var recommendationsLimiter = rateLimit({ windowMs: 6e4, max: 10, keyPrefix: "ai-rec" });
var industryCreationLimiter = rateLimit({ windowMs: 6e4, max: 10, keyPrefix: "ai-industry" });
var searchLimiter = rateLimit({ windowMs: 6e4, max: 15, keyPrefix: "ai-search" });
var summaryLimiter = rateLimit({ windowMs: 6e4, max: 5, keyPrefix: "ai-summary" });
var chatLimiter = rateLimit({ windowMs: 6e4, max: 20, keyPrefix: "ai-chat" });
var docLimiter = rateLimit({ windowMs: 6e4, max: 3, keyPrefix: "ai-doc" });
var supportLimiter = rateLimit({ windowMs: 6e4, max: 30, keyPrefix: "ai-support" });
router10.get("/health", aiOpsController.health);
router10.get("/metrics", aiOpsController.metrics);
router10.post(
  "/support",
  supportLimiter,
  validateRequest(aiValidation.askSupport),
  aiController.askSupport
);
router10.post(
  "/recommendations",
  recommendationsLimiter,
  validateRequest(aiValidation.recommendations),
  aiAdvancedController.recommendations
);
router10.post(
  "/industry-creation",
  industryCreationLimiter,
  validateRequest(aiValidation.industryCreation),
  aiAdvancedController.industryCreation
);
router10.post(
  "/search",
  searchLimiter,
  validateRequest(aiValidation.search),
  aiAdvancedController.search
);
router10.post(
  "/summary",
  summaryLimiter,
  validateRequest(aiValidation.summary),
  aiAdvancedController.summary
);
router10.post(
  "/chat",
  chatLimiter,
  validateRequest(aiValidation.chat),
  aiAdvancedController.chat
);
router10.post(
  "/chat/messages",
  chatLimiter,
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(aiValidation.persistedChatMessage),
  aiChatController.sendMessage
);
router10.get(
  "/chat/conversations",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  aiChatController.listConversations
);
router10.get(
  "/chat/conversations/:conversationId",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(aiValidation.conversationParams),
  aiChatController.getConversation
);
router10.patch(
  "/chat/conversations/:conversationId/messages/:messageId/feedback",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  validateRequest(aiValidation.messageFeedback),
  aiChatController.updateMessageFeedback
);
router10.post(
  "/document-analysis",
  docLimiter,
  validateRequest(aiValidation.documentAnalysis),
  aiAdvancedController.documentAnalysis
);
router10.post(
  "/rag/query",
  searchLimiter,
  validateRequest(aiValidation.ragQuery),
  aiRagController.query
);
router10.use(aiErrorHandler);
router10.post(
  "/parse-resume",
  multerUpload.single("resume"),
  parseResumeController
);
router10.post(
  "/job-recommendations",
  validateRequest(
    z9.object({
      body: z9.object({
        userProfile: z9.any(),
        jobList: z9.array(z9.any())
      })
    })
  ),
  jobRecommendationsController
);
var aiRoutes = router10;

// src/modules/job/job.router.ts
import { Router as Router11 } from "express";

// src/modules/job/job.service.ts
var JobService = class {
  async createJob(data) {
    const { tags = [], ...jobData } = data;
    const job = await prisma.job.create({
      data: jobData
    });
    if (tags.length > 0) {
      await prisma.jobTag.createMany({
        data: tags.map((tag) => ({ jobId: job.id, tag })),
        skipDuplicates: true
      });
    }
    await notificationService.createNotification({
      type: "NEW_JOB_POST",
      message: `A new job "${job.title}" was posted by recruiter.`,
      role: UserRole.ADMIN
    });
    return { ...job, tags };
  }
  async getAllJobs() {
    const jobs = await prisma.job.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" }
    });
    const jobIds = jobs.map((j) => j.id);
    const tags = await prisma.jobTag.findMany({ where: { jobId: { in: jobIds } } });
    const tagMap = /* @__PURE__ */ new Map();
    for (const tag of tags) {
      if (!tagMap.has(tag.jobId)) tagMap.set(tag.jobId, []);
      tagMap.get(tag.jobId).push(tag.tag);
    }
    return jobs.map((j) => ({ ...j, tags: tagMap.get(j.id) || [] }));
  }
  async getJobById(id) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return null;
    const tags = await prisma.jobTag.findMany({ where: { jobId: id } });
    return { ...job, tags: tags.map((t) => t.tag) };
  }
  async updateJob(id, data) {
    const { tags, ...jobData } = data;
    const job = await prisma.job.update({
      where: { id },
      data: jobData
    });
    if (tags) {
      await prisma.jobTag.deleteMany({
        where: { jobId: id, tag: { notIn: tags } }
      });
      for (const tag of tags) {
        await prisma.jobTag.upsert({
          where: { jobId_tag: { jobId: id, tag } },
          update: {},
          create: { jobId: id, tag }
        });
      }
    }
    const tagRecords = await prisma.jobTag.findMany({ where: { jobId: id } });
    return { ...job, tags: tagRecords.map((t) => t.tag) };
  }
  async deleteJob(id) {
    await prisma.job.update({
      where: { id },
      data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
    });
    return true;
  }
};

// src/modules/job/job.validation.ts
import { z as z10 } from "zod";
var createJobSchema = z10.object({
  title: z10.string().min(2),
  description: z10.string().min(10),
  company: z10.string().min(2),
  location: z10.string().min(2),
  salary: z10.number().optional(),
  category: z10.string().optional(),
  tags: z10.array(z10.string().min(1)).optional()
});
var updateJobSchema = createJobSchema.partial();

// src/modules/job/job.controller.ts
var jobService = new JobService();
var JobController = class {
  async createJob(req, res) {
    const parse = createJobSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error });
    const job = await jobService.createJob(parse.data);
    res.status(201).json(job);
  }
  async getAllJobs(_req, res) {
    const jobs = await jobService.getAllJobs();
    res.json({ data: jobs });
  }
  async getJobById(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const job = await jobService.getJobById(id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  }
  async updateJob(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parse = updateJobSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error });
    const job = await jobService.updateJob(id, parse.data);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  }
  async deleteJob(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await jobService.deleteJob(id);
    if (!deleted) return res.status(404).json({ error: "Job not found" });
    res.status(204).send();
  }
};

// src/modules/job/jobApplication.router.ts
import { Router as Router10 } from "express";

// src/modules/job/jobApplication.service.ts
var JobApplicationService = class {
  // Create a new job application and notify recruiter
  async applyToJob({ jobId, jobSeekerId, recruiterId, resumeUrl, coverLetter }) {
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId,
        recruiterId,
        resumeUrl,
        coverLetter,
        status: ApplicationStatus.PENDING
      }
    });
    await notificationService.createNotification({
      type: "NEW_APPLICATION",
      message: `A new candidate has applied to your job posting.`,
      userId: recruiterId
    });
    return application;
  }
  // Update application status and notify candidate
  async updateApplicationStatus({ applicationId, status: status24 }) {
    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: status24 }
    });
    await notificationService.createNotification({
      type: "APPLICATION_STATUS_UPDATE",
      message: `Your application status was updated to: ${status24}.`,
      userId: application.jobSeekerId
    });
    return application;
  }
  // Candidate: get applied jobs
  async getAppliedJobs(jobSeekerId) {
    return prisma.jobApplication.findMany({
      where: { jobSeekerId },
      include: { job: true }
      // Removed orderBy: { createdAt: 'desc' } as createdAt is not a valid field for ordering
    });
  }
  // Candidate: get saved jobs (assumes a SavedJob model exists)
  async getSavedJobs(candidateId) {
    return prisma.savedJob.findMany({
      where: { candidates: { some: { id: candidateId } } },
      include: { job: true }
      // Remove orderBy if createdAt does not exist on SavedJob
    });
  }
  // Recruiter: get applicants for a job (with resume)
  async getApplicantsForJob(recruiterId, jobId) {
    return prisma.jobApplication.findMany({
      where: { recruiterId, jobId },
      include: {
        candidate: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            resume: true,
            // Use 'resume' if that's the correct field/relation
            profilePhoto: true
          }
        }
      }
      // Remove orderBy if createdAt does not exist on JobApplication
    });
  }
};

// src/modules/job/jobApplication.controller.ts
var jobApplicationService = new JobApplicationService();
var JobApplicationController = class {
  async applyToJob(req, res) {
    let { jobId, jobSeekerId, recruiterId, resumeUrl, coverLetter } = req.body;
    if (Array.isArray(jobId)) jobId = jobId[0];
    if (Array.isArray(jobSeekerId)) jobSeekerId = jobSeekerId[0];
    if (Array.isArray(recruiterId)) recruiterId = recruiterId[0];
    if (!resumeUrl) {
      return res.status(400).json({ error: "Resume is required (resumeUrl)" });
    }
    const application = await jobApplicationService.applyToJob({ jobId, jobSeekerId, recruiterId, resumeUrl, coverLetter });
    res.status(201).json(application);
  }
  async updateApplicationStatus(req, res) {
    const { applicationId, status: status24 } = req.body;
    if (!Object.values(ApplicationStatus).includes(status24)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const application = await jobApplicationService.updateApplicationStatus({ applicationId, status: status24 });
    res.json(application);
  }
  // Candidate: get applied jobs
  async getAppliedJobs(req, res) {
    let jobSeekerId = req.user.userId;
    if (Array.isArray(jobSeekerId)) jobSeekerId = jobSeekerId[0];
    const jobs = await jobApplicationService.getAppliedJobs(jobSeekerId);
    res.json(jobs);
  }
  // Candidate: get saved jobs
  async getSavedJobs(req, res) {
    let jobSeekerId = req.user.userId;
    if (Array.isArray(jobSeekerId)) jobSeekerId = jobSeekerId[0];
    const jobs = await jobApplicationService.getSavedJobs(jobSeekerId);
    res.json(jobs);
  }
  // Recruiter: get applicants for a job
  async getApplicantsForJob(req, res) {
    let recruiterId = req.user.userId;
    let jobId = req.params.jobId;
    if (Array.isArray(recruiterId)) recruiterId = recruiterId[0];
    if (Array.isArray(jobId)) jobId = jobId[0];
    const applicants = await jobApplicationService.getApplicantsForJob(recruiterId, jobId);
    res.json(applicants);
  }
};

// src/modules/job/jobApplication.router.ts
var router11 = Router10();
var controller = new JobApplicationController();
router11.post("/upload-resume", multerUpload.single("resume"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ url: req.file.path });
});
router11.post("/apply", (req, res) => controller.applyToJob(req, res));
router11.put("/status", (req, res) => controller.updateApplicationStatus(req, res));
router11.get("/applied", (req, res) => controller.getAppliedJobs(req, res));
router11.get("/saved", (req, res) => controller.getSavedJobs(req, res));
router11.get("/applicants/:jobId", (req, res) => controller.getApplicantsForJob(req, res));
var jobApplication_router_default = router11;

// src/modules/job/job.router.ts
var router12 = Router11();
var controller2 = new JobController();
router12.post("/", (req, res) => controller2.createJob(req, res));
router12.get("/", (req, res) => controller2.getAllJobs(req, res));
router12.get("/:id", (req, res) => controller2.getJobById(req, res));
router12.put("/:id", (req, res) => controller2.updateJob(req, res));
router12.delete("/:id", (req, res) => controller2.deleteJob(req, res));
router12.use("/applications", jobApplication_router_default);
var job_router_default = router12;

// src/modules/conversations/conservations.router.ts
import { Router as Router12 } from "express";

// src/modules/conversations/conversations.controler.ts
import httpStatus6 from "http-status";

// src/modules/conversations/conversations.service.ts
var getAllConversationsForAdmin = async (recruiterId) => {
  return chatService.getUserRooms("", UserRole.ADMIN, recruiterId);
};
var conversationsService = {
  getAllConversationsForAdmin
};

// src/modules/conversations/conversations.controler.ts
var getSingleString2 = (value) => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }
  return typeof value === "string" ? value : "";
};
var getAllConversationsForAdmin2 = catchAsync(
  async (req, res) => {
    const expertId = getSingleString2(req.query.expertId) || void 0;
    const conversations = await conversationsService.getAllConversationsForAdmin(
      expertId
    );
    sendResponse(res, {
      httpStatusCode: httpStatus6.OK,
      success: true,
      message: "Conversations fetched successfully",
      data: conversations
    });
  }
);
var conversationsController = {
  getAllConversationsForAdmin: getAllConversationsForAdmin2
};

// src/modules/conversations/conservations.router.ts
var router13 = Router12();
router13.get(
  "/admin",
  checkAuth(UserRole.ADMIN),
  conversationsController.getAllConversationsForAdmin
);
var conversationsRoutes = router13;

// src/modules/realtime/realtime.routes.ts
import { Router as Router13 } from "express";
import status23 from "http-status";
var router14 = Router13();
router14.get(
  "/token",
  checkAuth(UserRole.CANDIDATE, UserRole.RECRUITER, UserRole.ADMIN),
  catchAsync(async (req, res) => {
    if (!envVars.ABLY_API_KEY) {
      throw new AppError_default(
        status23.SERVICE_UNAVAILABLE,
        "Realtime service is not configured. Set ABLY_API_KEY on the server."
      );
    }
    const userId = req.user.userId;
    const capability = {
      "private-room-*": ["subscribe", "publish", "presence", "history"],
      [userChannel(userId)]: ["subscribe"]
    };
    const tokenRequest = await createAblyTokenRequest(userId, capability);
    sendResponse(res, {
      httpStatusCode: status23.OK,
      success: true,
      message: "Ably token issued",
      data: tokenRequest
    });
  })
);
var realtimeRoutes = router14;

// src/modules/testimonials/testimonial.router.ts
import { Router as Router14 } from "express";

// src/modules/testimonials/testimonial.service.ts
var testimonialService = {
  async createTestimonial(data) {
    return prisma.testimonial.create({ data });
  },
  async getAllTestimonials() {
    return prisma.testimonial.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
  },
  async getTestimonialById(id) {
    return prisma.testimonial.findUnique({
      where: { id },
      include: { user: true }
    });
  },
  async updateTestimonial(id, data) {
    return prisma.testimonial.update({
      where: { id },
      data
    });
  },
  async deleteTestimonial(id) {
    return prisma.testimonial.delete({ where: { id } });
  }
};

// src/modules/testimonials/testimonial.controler.ts
var testimonialController = {
  create: catchAsync(async (req, res) => {
    const testimonial = await testimonialService.createTestimonial(req.body);
    sendResponse(res, {
      httpStatusCode: 201,
      success: true,
      message: "Testimonial created successfully",
      data: testimonial
    });
  }),
  getAll: catchAsync(async (_req, res) => {
    const testimonials = await testimonialService.getAllTestimonials();
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Testimonials fetched successfully",
      data: testimonials
    });
  }),
  getById: catchAsync(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const testimonial = await testimonialService.getTestimonialById(id);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Testimonial fetched successfully",
      data: testimonial
    });
  }),
  update: catchAsync(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const testimonial = await testimonialService.updateTestimonial(id, req.body);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial
    });
  }),
  delete: catchAsync(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await testimonialService.deleteTestimonial(id);
    sendResponse(res, {
      httpStatusCode: 200,
      success: true,
      message: "Testimonial deleted successfully"
    });
  })
};

// src/modules/testimonials/testimonial.validation.ts
import { z as z11 } from "zod";
var createTestimonialSchema = z11.object({
  body: z11.object({
    userId: z11.string().uuid(),
    userRole: z11.enum(["CANDIDATE", "RECRUITER"]),
    content: z11.string().min(1),
    rating: z11.number().int().min(1).max(5),
    meta: z11.string().optional()
  })
});
var updateTestimonialSchema = z11.object({
  params: z11.object({
    id: z11.string().uuid()
  }),
  body: z11.object({
    content: z11.string().min(1).optional(),
    rating: z11.number().int().min(1).max(5).optional(),
    meta: z11.string().optional()
  })
});
var testimonialIdSchema = z11.object({
  params: z11.object({
    id: z11.string().uuid()
  })
});

// src/modules/testimonials/testimonial.router.ts
var router15 = Router14();
router15.post(
  "/",
  validateRequest(createTestimonialSchema),
  testimonialController.create
);
router15.get("/", testimonialController.getAll);
router15.get(
  "/:id",
  validateRequest(testimonialIdSchema),
  testimonialController.getById
);
router15.put(
  "/:id",
  validateRequest(updateTestimonialSchema),
  testimonialController.update
);
router15.delete(
  "/:id",
  validateRequest(testimonialIdSchema),
  testimonialController.delete
);
var testimonialRouter = router15;

// src/index.ts
var router16 = Router15();
router16.use("/jobs", job_router_default);
router16.use("/auth", authRoutes);
router16.use("/users", userRouter);
router16.use("/reqruiters", reqruiterRouter);
router16.use("/candidates", candidateRouter);
router16.use("/testimonials", testimonialRouter);
router16.use("/admin", adminRouter);
router16.use("/stats", StatsRoutes);
router16.use("/notifications", notificationRouter);
router16.use("/chat", chatRoutes);
router16.use("/conversations", conversationsRoutes);
router16.use("/ai", aiRoutes);
router16.use("/realtime", realtimeRoutes);
router16.use("/industries", industryRouter);
var indexRoutes = router16;

export {
  AppError_default,
  envVars,
  prismaNamespace_exports,
  prisma,
  connectPrismaWithRetry,
  auth,
  seedDemoCandidate,
  seedAdmin,
  authRoutes,
  indexRoutes
};
